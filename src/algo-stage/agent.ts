import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createDefaultLlmClient, extractJsonFromText, type LlmTextClient } from "../code-stage/agent";
import { freezeBgmAsset } from "../code-stage/packaging";
import { runHyperFramesGate } from "../code-stage/validator";
import { buildAlgoStage, type AlgoStageBundle } from "./builder";
import {
  algoBlueprintSchema,
  ALGO_STAGE_SYSTEM_PROMPT,
  buildAlgoRepairPrompt,
  buildAlgoUserPrompt,
  type AlgoBlueprint,
  type AlgoStagePromptRequest,
} from "./prompt";
import { runAlgorithmInSandbox } from "./sandbox";
import { algoStageSpecSchema, type AlgoStageSpec } from "./schema";

export interface AlgoValidationIssue {
  gate: "blueprint" | "sandbox" | "trace-schema" | "hyperframes-lint" | "hyperframes-inspect";
  message: string;
}

export interface AlgoAgentRoundTrace {
  round: number;
  phase: "generate" | "repair";
  status: "passed" | "failed";
  frameCount?: number;
  issues: AlgoValidationIssue[];
  durationMs: number;
}

export interface AlgoStageAgentOptions {
  request: AlgoStagePromptRequest;
  outDir: string;
  maxRounds?: number;
  minFrames?: number;
  maxFrames?: number;
  runHyperFramesLint?: boolean;
  runHyperFramesInspect?: boolean;
  llmClient?: LlmTextClient;
  cwd?: string;
  onProgress?: (event: { round: number; step: string; detail?: string }) => void;
}

export interface AlgoStageAgentResult {
  blueprint: AlgoBlueprint;
  spec: AlgoStageSpec;
  bundle: AlgoStageBundle;
  outDir: string;
  rounds: number;
  trace: AlgoAgentRoundTrace[];
}

export function writeAlgoStageProject(
  outDir: string,
  spec: AlgoStageSpec,
  bundle: AlgoStageBundle,
  cwd = process.cwd(),
): void {
  const absOut = resolve(outDir);
  rmSync(absOut, { recursive: true, force: true });
  mkdirSync(join(absOut, "assets/vendor"), { recursive: true });
  mkdirSync(join(absOut, "assets/fonts"), { recursive: true });

  for (const [relPath, content] of Object.entries(bundle.files)) {
    const filePath = join(absOut, relPath);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content, "utf8");
  }
  writeFileSync(join(absOut, "spec.json"), `${JSON.stringify(spec, null, 2)}\n`, "utf8");

  const gsapSrc = [
    join(cwd, "node_modules/gsap/dist/gsap.min.js"),
    join(cwd, ".worktrees/hyperframes-knowledge-poc/node_modules/gsap/dist/gsap.min.js"),
  ].find((p) => existsSync(p));
  if (!gsapSrc) throw new Error("未找到本地 gsap.min.js");
  copyFileSync(gsapSrc, join(absOut, "assets/vendor/gsap.min.js"));

  const fontSrc = join(
    cwd,
    "node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff2",
  );
  if (!existsSync(fontSrc)) throw new Error("未找到本地 noto-sans-sc 字体");
  copyFileSync(fontSrc, join(absOut, "assets/fonts/noto-sans-sc.woff2"));
  freezeBgmAsset(absOut, spec.packaging?.bgmFile, cwd);
}

function validateBlueprintBudget(blueprint: AlgoBlueprint): AlgoValidationIssue[] {
  const issues: AlgoValidationIssue[] = [];
  const lines = blueprint.code.split("\n");
  if (lines.length > 24) {
    issues.push({
      gate: "blueprint",
      message: `左侧展示代码共 ${lines.length} 行，超出上限 24 行，请精简代码`,
    });
  }
  lines.forEach((line, idx) => {
    if (line.length > 68) {
      issues.push({
        gate: "blueprint",
        message: `展示代码第 ${idx + 1} 行长度 ${line.length} 字符，超出上限 68 字符，请折行防裁切`,
      });
    }
  });
  return issues;
}

/**
 * AlgoStage Agent Loop（Code-Execution-Grounded）：
 * LLM 写蓝图(code + runnerCode) → 沙箱真实运行产出 Trace → Trace Schema 校验 → 编译 → HyperFrames 门禁 → 失败自动修复
 */
export async function runAlgoStageAgentLoop(options: AlgoStageAgentOptions): Promise<AlgoStageAgentResult> {
  const cwd = options.cwd ?? process.cwd();
  const maxRounds = Math.max(1, options.maxRounds ?? 3);
  const minFrames = options.minFrames ?? 3;
  const maxFrames = options.maxFrames ?? 24;
  const runLint = options.runHyperFramesLint ?? true;
  const runInspect = options.runHyperFramesInspect ?? false;
  const llm = options.llmClient ?? createDefaultLlmClient(cwd);

  const trace: AlgoAgentRoundTrace[] = [];
  let lastRawJson = "";
  let lastIssues: AlgoValidationIssue[] = [];

  for (let round = 1; round <= maxRounds; round++) {
    const roundStart = Date.now();
    const phase = round === 1 ? "generate" : "repair";
    options.onProgress?.({
      round,
      step: phase,
      detail: phase === "generate" ? `正在为「${options.request.topic}」编写展示代码与沙箱埋点代码...` : `根据 ${lastIssues.length} 条错误诊断自动修复...`,
    });

    const prompt =
      phase === "generate"
        ? buildAlgoUserPrompt(options.request)
        : buildAlgoRepairPrompt(
            lastRawJson,
            lastIssues.map((i) => `[${i.gate}] ${i.message}`),
          );

    const rawText = await llm.generate({
      system: ALGO_STAGE_SYSTEM_PROMPT,
      prompt,
      temperature: phase === "generate" ? 0.35 : 0.15,
    });

    const jsonStr = extractJsonFromText(rawText);
    lastRawJson = jsonStr;

    // 1. Blueprint JSON & 预算门禁
    let blueprint: AlgoBlueprint;
    try {
      blueprint = algoBlueprintSchema.parse(JSON.parse(jsonStr));
    } catch (err) {
      lastIssues = [{ gate: "blueprint", message: err instanceof Error ? err.message : String(err) }];
      trace.push({ round, phase, status: "failed", issues: lastIssues, durationMs: Date.now() - roundStart });
      continue;
    }

    const budgetIssues = validateBlueprintBudget(blueprint);
    if (budgetIssues.length > 0) {
      lastIssues = budgetIssues;
      trace.push({ round, phase, status: "failed", issues: lastIssues, durationMs: Date.now() - roundStart });
      continue;
    }

    // 2. 隔离沙箱真实执行 runnerCode
    options.onProgress?.({ round, step: "sandbox", detail: "正在隔离沙箱中真实运行算法代码并收集 Trace..." });
    let execFrames;
    try {
      const exec = runAlgorithmInSandbox({
        runnerCode: blueprint.runnerCode,
        timeoutMs: 1500,
        maxSteps: maxFrames + 5,
      });
      execFrames = exec.frames;
    } catch (err) {
      lastIssues = [{ gate: "sandbox", message: `沙箱执行失败: ${err instanceof Error ? err.message : String(err)}` }];
      trace.push({ round, phase, status: "failed", issues: lastIssues, durationMs: Date.now() - roundStart });
      continue;
    }

    if (execFrames.length < minFrames || execFrames.length > maxFrames) {
      lastIssues = [
        {
          gate: "sandbox",
          message: `沙箱收集到 ${execFrames.length} 步，要求在 ${minFrames}~${maxFrames} 步之间，请调整示例输入规模或 tracer.step 埋点密度`,
        },
      ];
      trace.push({
        round,
        phase,
        status: "failed",
        frameCount: execFrames.length,
        issues: lastIssues,
        durationMs: Date.now() - roundStart,
      });
      continue;
    }

    // 3. 组装并校验完整的 AlgoStageSpec（行号不越界、数据结构合法、时间单调）
    let spec: AlgoStageSpec;
    try {
      spec = algoStageSpecSchema.parse({
        version: 1,
        meta: {
          ...blueprint.meta,
          width: 1920,
          height: 1080,
          fps: 30,
        },
        code: blueprint.code,
        frames: execFrames,
      });
    } catch (err) {
      lastIssues = [{ gate: "trace-schema", message: err instanceof Error ? err.message : String(err) }];
      trace.push({
        round,
        phase,
        status: "failed",
        frameCount: execFrames.length,
        issues: lastIssues,
        durationMs: Date.now() - roundStart,
      });
      continue;
    }

    // 4. 编译并运行 HyperFrames 确定性门禁
    options.onProgress?.({ round, step: "build", detail: `编译 ${spec.frames.length} 帧三屏联动 HyperFrames 工程...` });
    const bundle = await buildAlgoStage(spec);
    writeAlgoStageProject(options.outDir, spec, bundle, cwd);

    if (runLint || runInspect) {
      options.onProgress?.({ round, step: "verify", detail: "执行 HyperFrames 静态/布局校验..." });
      const hfIssues = runHyperFramesGate(options.outDir, { runInspect, cwd });
      if (hfIssues.length > 0) {
        lastIssues = hfIssues.map((i) => ({
          gate: i.gate === "hyperframes-inspect" ? "hyperframes-inspect" : "hyperframes-lint",
          message: i.message,
        }));
        trace.push({
          round,
          phase,
          status: "failed",
          frameCount: spec.frames.length,
          issues: lastIssues,
          durationMs: Date.now() - roundStart,
        });
        continue;
      }
    }

    trace.push({
      round,
      phase,
      status: "passed",
      frameCount: spec.frames.length,
      issues: [],
      durationMs: Date.now() - roundStart,
    });
    return {
      blueprint,
      spec,
      bundle,
      outDir: resolve(options.outDir),
      rounds: round,
      trace,
    };
  }

  const summary = lastIssues.map((i) => `[${i.gate}] ${i.message}`).join("; ");
  throw new Error(`AlgoStage Agent Loop 在 ${maxRounds} 轮后仍未通过校验门禁: ${summary}`);
}
