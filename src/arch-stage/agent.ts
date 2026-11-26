import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { loadEnvValue } from "@/code-stage/env";
import { freezeBgmAsset } from "@/code-stage/packaging";
import type { StageThemeId } from "@/code-stage/stage-themes";
import { runHyperFramesGate } from "@/code-stage/validator";
import { buildArchStage, type BuiltArchStageBundle } from "./builder";
import {
  ARCH_STAGE_SYSTEM_PROMPT,
  buildArchStageRepairPrompt,
  buildArchStageUserPrompt,
} from "./prompt";
import {
  archStageSpecSchema,
  validateArchSpecSemantics,
  type ArchStageSpec,
  type ArchValidationIssue,
} from "./schema";

export interface ArchAgentRoundTrace {
  round: number;
  phase: "generate" | "repair";
  status: "passed" | "failed";
  durationMs: number;
  issues: ArchValidationIssue[];
}

export interface ArchAgentOptions {
  topic: string;
  outDir: string;
  domain?: string;
  theme?: StageThemeId;
  targetSteps?: number;
  referenceNotes?: string;
  maxRounds?: number;
  runCliVerify?: boolean;
  llmCall?: (messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) => Promise<string>;
}

export interface ArchAgentResult {
  success: boolean;
  spec?: ArchStageSpec;
  bundle?: BuiltArchStageBundle;
  outDir: string;
  rounds: ArchAgentRoundTrace[];
  finalIssues: ArchValidationIssue[];
}

function copyStaticAssets(outDir: string, cwd = process.cwd()): void {
  const gsapSrc = resolve(cwd, "node_modules/gsap/dist/gsap.min.js");
  const vendorDir = join(outDir, "assets/vendor");
  mkdirSync(vendorDir, { recursive: true });
  if (existsSync(gsapSrc)) {
    copyFileSync(gsapSrc, join(vendorDir, "gsap.min.js"));
  }

  const fontDir = join(outDir, "assets/fonts");
  mkdirSync(fontDir, { recursive: true });
  const fontBase = resolve(cwd, "node_modules/@fontsource/noto-sans-sc/files");
  for (const name of [
    "noto-sans-sc-chinese-simplified-400-normal.woff2",
    "noto-sans-sc-chinese-simplified-700-normal.woff2",
  ]) {
    const src = join(fontBase, name);
    if (existsSync(src)) {
      copyFileSync(src, join(fontDir, name));
    }
  }
}

export function writeArchStageProject(
  outDir: string,
  spec: ArchStageSpec,
  bundle: BuiltArchStageBundle,
): void {
  mkdirSync(outDir, { recursive: true });
  copyStaticAssets(outDir);
  freezeBgmAsset(outDir, spec.packaging?.bgmFile);
  writeFileSync(join(outDir, "index.html"), bundle.indexHtml, "utf8");
  writeFileSync(join(outDir, "styles.css"), bundle.stylesCss, "utf8");
  writeFileSync(join(outDir, "spec.json"), JSON.stringify(spec, null, 2), "utf8");
}

function extractJsonObject(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = fenced ? fenced[1].trim() : raw.trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) {
    return text.slice(first, last + 1);
  }
  return text;
}

async function defaultLlmCall(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
): Promise<string> {
  const deepseekKey = loadEnvValue("DEEPSEEK_API_KEY");
  const openaiKey = loadEnvValue("OPENAI_API_KEY");
  const apiKey = deepseekKey || openaiKey;
  if (!apiKey) {
    throw new Error("未检测到 DEEPSEEK_API_KEY 或 OPENAI_API_KEY，请在 .env.local 中配置后重试");
  }
  const baseURL =
    loadEnvValue("OPENAI_BASE_URL") || (deepseekKey ? "https://api.deepseek.com/v1" : undefined);
  const modelName =
    loadEnvValue("OPENAI_MODEL") || (deepseekKey ? "deepseek-chat" : "gpt-4o-mini");

  const provider = createOpenAI({ apiKey, baseURL });
  const { text } = await generateText({
    model: provider.chat(modelName),
    messages,
    temperature: 0.35,
  });
  return text;
}

export async function runArchStageAgent(options: ArchAgentOptions): Promise<ArchAgentResult> {
  const maxRounds = Math.max(1, Math.min(4, options.maxRounds ?? 3));
  const llm = options.llmCall ?? defaultLlmCall;
  const runCliVerify = options.runCliVerify ?? true;

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: ARCH_STAGE_SYSTEM_PROMPT },
    {
      role: "user",
      content: buildArchStageUserPrompt({
        topic: options.topic,
        domain: options.domain,
        theme: options.theme ?? "dracula",
        targetSteps: options.targetSteps,
        referenceNotes: options.referenceNotes,
      }),
    },
  ];

  const rounds: ArchAgentRoundTrace[] = [];
  let finalIssues: ArchValidationIssue[] = [];

  for (let round = 1; round <= maxRounds; round += 1) {
    const t0 = Date.now();
    const phase = round === 1 ? "generate" : "repair";
    const issues: ArchValidationIssue[] = [];

    let rawResponse = "";
    try {
      rawResponse = await llm(messages);
    } catch (err) {
      issues.push({ gate: "llm", message: err instanceof Error ? err.message : String(err) });
      rounds.push({ round, phase, status: "failed", durationMs: Date.now() - t0, issues });
      finalIssues = issues;
      break;
    }

    const jsonText = extractJsonObject(rawResponse);
    let parsedObj: unknown;
    try {
      parsedObj = JSON.parse(jsonText);
    } catch (err) {
      issues.push({
        gate: "json-parse",
        message: `返回内容不是合法 JSON: ${err instanceof Error ? err.message : String(err)}`,
      });
    }

    let spec: ArchStageSpec | undefined;
    if (issues.length === 0) {
      const checked = archStageSpecSchema.safeParse(parsedObj);
      if (!checked.success) {
        for (const zErr of checked.error.issues.slice(0, 6)) {
          issues.push({
            gate: "schema",
            message: `${zErr.path.join(".") || "root"}: ${zErr.message}`,
          });
        }
      } else {
        spec = checked.data;
        if (options.theme) {
          spec = { ...spec, meta: { ...spec.meta, theme: options.theme } };
        }
      }
    }

    if (spec && issues.length === 0) {
      const semIssues = validateArchSpecSemantics(spec);
      issues.push(...semIssues);
    }

    let bundle: BuiltArchStageBundle | undefined;
    if (spec && issues.length === 0) {
      try {
        bundle = await buildArchStage(spec);
        writeArchStageProject(options.outDir, spec, bundle);
      } catch (err) {
        issues.push({
          gate: "build",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (spec && bundle && issues.length === 0 && runCliVerify) {
      const gateIssues = runHyperFramesGate(options.outDir);
      for (const err of gateIssues.slice(0, 5)) {
        issues.push({ gate: err.gate, message: err.message });
      }
    }

    const passed = issues.length === 0 && Boolean(spec && bundle);
    rounds.push({
      round,
      phase,
      status: passed ? "passed" : "failed",
      durationMs: Date.now() - t0,
      issues,
    });
    finalIssues = issues;

    if (passed && spec && bundle) {
      return { success: true, spec, bundle, outDir: options.outDir, rounds, finalIssues: [] };
    }

    messages.push({ role: "assistant", content: rawResponse });
    messages.push({ role: "user", content: buildArchStageRepairPrompt(jsonText, issues) });
  }

  return { success: false, outDir: options.outDir, rounds, finalIssues };
}
