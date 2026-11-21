import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { buildCodeStage, type CodeStageBundle } from "./builder";
import { loadEnvValue } from "./env";
import { buildRepairPrompt, buildUserPrompt, CODE_STAGE_SYSTEM_PROMPT, type CodeStagePromptRequest } from "./prompt";
import { codeStageSpecSchema, type CodeStageSpec } from "./schema";
import { runHyperFramesGate, validateCodeStageSemantics, type ValidationIssue } from "./validator";

export interface LlmTextClient {
  generate(params: { system: string; prompt: string; temperature?: number }): Promise<string>;
}

export interface AgentRoundTrace {
  round: number;
  phase: "generate" | "repair";
  status: "passed" | "failed";
  issues: ValidationIssue[];
  durationMs: number;
}

export interface CodeStageAgentOptions {
  request: CodeStagePromptRequest;
  outDir: string;
  maxRounds?: number;
  runHyperFramesLint?: boolean;
  runHyperFramesInspect?: boolean;
  llmClient?: LlmTextClient;
  cwd?: string;
  onProgress?: (event: { round: number; step: string; detail?: string }) => void;
}

export interface CodeStageAgentResult {
  spec: CodeStageSpec;
  bundle: CodeStageBundle;
  outDir: string;
  rounds: number;
  trace: AgentRoundTrace[];
}

export function extractJsonFromText(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const braced = text.match(/\{[\s\S]*\}/);
  if (braced) return braced[0].trim();
  return text.trim();
}

export function createDefaultLlmClient(cwd = process.cwd()): LlmTextClient {
  const deepseekKey = loadEnvValue("DEEPSEEK_API_KEY", cwd);
  const openaiKey = loadEnvValue("OPENAI_API_KEY", cwd);
  const apiKey = deepseekKey || openaiKey;

  if (!apiKey || apiKey === "your_deepseek_api_key_here") {
    throw new Error("未配置 DEEPSEEK_API_KEY（或 OPENAI_API_KEY），请在 .env.local 中配置后再运行生成");
  }

  const baseURL = deepseekKey
    ? loadEnvValue("DEEPSEEK_BASE_URL", cwd) || "https://api.deepseek.com"
    : loadEnvValue("OPENAI_BASE_URL", cwd) || undefined;
  const modelName = deepseekKey
    ? loadEnvValue("DEEPSEEK_MODEL", cwd) || "deepseek-chat"
    : loadEnvValue("OPENAI_MODEL", cwd) || "gpt-4o-mini";

  const provider = createOpenAI({ baseURL, apiKey });

  return {
    async generate({ system, prompt, temperature = 0.4 }) {
      const { text } = await generateText({
        model: provider.chat(modelName),
        system,
        prompt,
        temperature,
        maxOutputTokens: 8192,
      });
      return text;
    },
  };
}

export function writeCodeStageProject(
  outDir: string,
  spec: CodeStageSpec,
  bundle: CodeStageBundle,
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
}

/**
 * CodeStage Agent Loop：
 * Generate → Schema Gate → Semantics Gate → Build → HyperFrames Gate → (按具体诊断自动 Repair，最多 maxRounds 轮)
 */
export async function runCodeStageAgentLoop(options: CodeStageAgentOptions): Promise<CodeStageAgentResult> {
  const cwd = options.cwd ?? process.cwd();
  const maxRounds = Math.max(1, options.maxRounds ?? 3);
  const runLint = options.runHyperFramesLint ?? true;
  const runInspect = options.runHyperFramesInspect ?? false;
  const llm = options.llmClient ?? createDefaultLlmClient(cwd);

  const trace: AgentRoundTrace[] = [];
  let lastRawJson = "";
  let lastIssues: ValidationIssue[] = [];

  for (let round = 1; round <= maxRounds; round++) {
    const roundStart = Date.now();
    const phase = round === 1 ? "generate" : "repair";
    options.onProgress?.({
      round,
      step: phase,
      detail: phase === "generate" ? `正在生成「${options.request.topic}」代码演进脚本...` : `根据 ${lastIssues.length} 条诊断自动修复...`,
    });

    const prompt =
      phase === "generate"
        ? buildUserPrompt(options.request)
        : buildRepairPrompt(
            lastRawJson,
            lastIssues.map((i) => `[${i.gate}] ${i.message}`),
          );

    const rawText = await llm.generate({
      system: CODE_STAGE_SYSTEM_PROMPT,
      prompt,
      temperature: phase === "generate" ? 0.45 : 0.2,
    });

    const jsonStr = extractJsonFromText(rawText);
    lastRawJson = jsonStr;

    // 1. JSON + Zod Schema 门禁
    let spec: CodeStageSpec;
    try {
      const parsed = JSON.parse(jsonStr);
      spec = codeStageSpecSchema.parse(parsed);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      lastIssues = [{ gate: "schema", message: msg }];
      trace.push({ round, phase, status: "failed", issues: lastIssues, durationMs: Date.now() - roundStart });
      continue;
    }

    // 2. 语义与版面预算门禁
    const semanticIssues = validateCodeStageSemantics(spec);
    if (semanticIssues.length > 0) {
      lastIssues = semanticIssues;
      trace.push({ round, phase, status: "failed", issues: lastIssues, durationMs: Date.now() - roundStart });
      continue;
    }

    // 3. 编译为离线 HyperFrames 工程
    options.onProgress?.({ round, step: "build", detail: "Shiki 高亮与 HyperFrames 工程编译..." });
    const bundle = await buildCodeStage(spec);
    writeCodeStageProject(options.outDir, spec, bundle, cwd);

    // 4. HyperFrames 静态/运行时门禁
    if (runLint || runInspect) {
      options.onProgress?.({ round, step: "verify", detail: "执行 HyperFrames 确定性校验..." });
      const hfIssues = runHyperFramesGate(options.outDir, { runInspect, cwd });
      if (hfIssues.length > 0) {
        lastIssues = hfIssues;
        trace.push({ round, phase, status: "failed", issues: lastIssues, durationMs: Date.now() - roundStart });
        continue;
      }
    }

    trace.push({ round, phase, status: "passed", issues: [], durationMs: Date.now() - roundStart });
    return {
      spec,
      bundle,
      outDir: resolve(options.outDir),
      rounds: round,
      trace,
    };
  }

  const summary = lastIssues.map((i) => `[${i.gate}] ${i.message}`).join("; ");
  throw new Error(`CodeStage Agent Loop 在 ${maxRounds} 轮后仍未通过校验门禁: ${summary}`);
}
