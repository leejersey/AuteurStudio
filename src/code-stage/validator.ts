import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { diffCodeLines } from "./diff";
import type { CodeStageSpec } from "./schema";

export interface ValidationIssue {
  gate: "schema" | "semantics" | "hyperframes-lint" | "hyperframes-inspect";
  message: string;
}

export interface SemanticLimits {
  minSteps?: number;
  maxSteps?: number;
  maxCodeLines?: number;
  maxLineChars?: number;
  maxCharsPerSecond?: number;
}

const DEFAULT_LIMITS: Required<SemanticLimits> = {
  minSteps: 2,
  maxSteps: 6,
  maxCodeLines: 22,
  maxLineChars: 76,
  maxCharsPerSecond: 7.5,
};

/**
 * 教学内容与版面预算语义门禁：在编译前拦截必然导致溢出、节奏失衡或无演进的 Spec。
 */
export function validateCodeStageSemantics(
  spec: CodeStageSpec,
  customLimits?: SemanticLimits,
): ValidationIssue[] {
  const limits = { ...DEFAULT_LIMITS, ...customLimits };
  const issues: ValidationIssue[] = [];

  if (spec.steps.length < limits.minSteps || spec.steps.length > limits.maxSteps) {
    issues.push({
      gate: "semantics",
      message: `步骤数量为 ${spec.steps.length}，应在 ${limits.minSteps}~${limits.maxSteps} 步之间`,
    });
  }

  for (let i = 0; i < spec.steps.length; i++) {
    const step = spec.steps[i];
    const lines = step.code.split("\n");

    if (lines.length > limits.maxCodeLines) {
      issues.push({
        gate: "semantics",
        message: `步骤 ${step.id} 代码共 ${lines.length} 行，超出上限 ${limits.maxCodeLines} 行，请精简代码防止画面拥挤`,
      });
    }

    lines.forEach((line, lIdx) => {
      if (line.length > limits.maxLineChars) {
        issues.push({
          gate: "semantics",
          message: `步骤 ${step.id} 第 ${lIdx + 1} 行长度 ${line.length} 字符，超出上限 ${limits.maxLineChars} 字符，请折行或缩短命名防止横向裁切`,
        });
      }
    });

    // 检查旁白语速是否过快导致读不完
    const cps = step.narration.length / step.duration;
    if (cps > limits.maxCharsPerSecond) {
      const suggested = Math.ceil(step.narration.length / 4.2);
      issues.push({
        gate: "semantics",
        message: `步骤 ${step.id} 旁白 ${step.narration.length} 字但时长仅 ${step.duration}s（${cps.toFixed(1)} 字/秒，过快），建议延长 duration 至约 ${suggested}s 或精简旁白`,
      });
    }

    // 检查相邻两步是否有实质变化（代码变更或聚焦行变更）
    if (i > 0) {
      const prev = spec.steps[i - 1];
      const diff = diffCodeLines(prev.code, step.code);
      const sameFocus = JSON.stringify(prev.focusLines ?? []) === JSON.stringify(step.focusLines ?? []);
      if (!diff.hasChanges && sameFocus) {
        issues.push({
          gate: "semantics",
          message: `步骤 ${step.id} 与上一步 ${prev.id} 的代码和 focusLines 完全相同，缺少视觉演进`,
        });
      }
    }
  }

  return issues;
}

function resolveHyperFramesBin(cwd = process.cwd()): string | null {
  const candidates = [
    join(cwd, "node_modules/.bin/hyperframes"),
    join(cwd, ".worktrees/hyperframes-knowledge-poc/node_modules/.bin/hyperframes"),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

/**
 * 调用本地 HyperFrames CLI 对生成的工程执行 lint（及可选 inspect）确定性门禁。
 */
export function runHyperFramesGate(
  projectDir: string,
  options: { runInspect?: boolean; cwd?: string } = {},
): ValidationIssue[] {
  const bin = resolveHyperFramesBin(options.cwd);
  if (!bin) {
    return [{ gate: "hyperframes-lint", message: "未找到本地 hyperframes CLI，请先安装 hyperframes 依赖" }];
  }

  const issues: ValidationIssue[] = [];

  try {
    execFileSync(bin, ["lint", projectDir], { encoding: "utf8", stdio: "pipe" });
  } catch (err) {
    const output = extractExecOutput(err);
    issues.push({
      gate: "hyperframes-lint",
      message: `hyperframes lint 失败:\n${output.slice(0, 1200)}`,
    });
  }

  if (options.runInspect && issues.length === 0) {
    try {
      const stdout = execFileSync(bin, ["inspect", projectDir], { encoding: "utf8", stdio: "pipe" });
      if (/overflow/i.test(stdout)) {
        issues.push({
          gate: "hyperframes-inspect",
          message: `hyperframes inspect 检测到元素溢出:\n${stdout.slice(0, 1200)}`,
        });
      }
    } catch (err) {
      const output = extractExecOutput(err);
      issues.push({
        gate: "hyperframes-inspect",
        message: `hyperframes inspect 失败:\n${output.slice(0, 1200)}`,
      });
    }
  }

  return issues;
}

function extractExecOutput(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { stdout?: string | Buffer; stderr?: string | Buffer; message?: string };
    const out = [e.stdout, e.stderr]
      .filter(Boolean)
      .map((v) => (Buffer.isBuffer(v) ? v.toString("utf8") : String(v)))
      .join("\n")
      .trim();
    if (out) return out;
    if (e.message) return e.message;
  }
  return String(err);
}
