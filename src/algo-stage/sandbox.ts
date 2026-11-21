import vm from "node:vm";
import type { AlgoStructure, AlgoTraceFrame } from "./schema";

export interface RawTraceStep {
  line: number;
  event?: AlgoTraceFrame["event"];
  note: string;
  narration?: string;
  vars?: Record<string, string | number | boolean | null>;
  structure: AlgoStructure;
  durationSec?: number;
}

export interface SandboxExecutionOptions {
  /** 要在沙箱中执行的 JavaScript 埋点算法脚本（通过全局 tracer.step(...) 上报状态） */
  runnerCode: string;
  /** 最大执行超时（毫秒），默认 1500ms */
  timeoutMs?: number;
  /** 最大允许收集的步数，防止死循环爆内存，默认 80 步 */
  maxSteps?: number;
  /** 未指定 durationSec 时的默认单步时长估算（秒） */
  defaultStepDurationSec?: number;
}

export interface SandboxExecutionResult {
  frames: AlgoTraceFrame[];
  totalDuration: number;
  stdout: string[];
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function estimateNarrationDuration(narration: string, fallbackSec: number): number {
  const sec = Math.max(fallbackSec, Math.ceil((narration.length / 4.2) * 10) / 10 + 0.6);
  return Number(Math.min(8.5, sec).toFixed(2));
}

/**
 * 在隔离的 Node vm 上下文中真实执行算法代码并收集确定性 Execution Trace。
 * 彻底杜绝 LLM "脑算" 算法状态导致的索引错误与逻辑幻觉。
 */
export function runAlgorithmInSandbox(options: SandboxExecutionOptions): SandboxExecutionResult {
  const timeoutMs = options.timeoutMs ?? 1500;
  const maxSteps = options.maxSteps ?? 80;
  const defaultStepDurationSec = options.defaultStepDurationSec ?? 2.8;

  const collected: RawTraceStep[] = [];
  const stdout: string[] = [];

  const tracer = {
    step(raw: RawTraceStep) {
      if (collected.length >= maxSteps) {
        throw new Error(`算法执行步数超过上限 (${maxSteps})，可能存在死循环`);
      }
      if (!raw || typeof raw.line !== "number" || !raw.structure) {
        throw new Error("tracer.step 必须提供有效的 line 和 structure");
      }
      collected.push(deepClone(raw));
    },
  };

  const sandboxConsole = {
    log: (...args: unknown[]) => {
      stdout.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "));
    },
  };

  // 无 process / require / fs / fetch 的最小安全上下文
  const context = vm.createContext({
    tracer,
    console: sandboxConsole,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    Map,
    Set,
  });

  const script = new vm.Script(`"use strict";\n${options.runnerCode}`);
  script.runInContext(context, { timeout: timeoutMs });

  if (collected.length === 0) {
    throw new Error("算法代码已执行完毕，但未通过 tracer.step() 上报任何步骤");
  }

  let cursor = 0;
  const frames: AlgoTraceFrame[] = collected.map((raw, idx) => {
    const narration = raw.narration?.trim() || raw.note;
    const duration =
      raw.durationSec && raw.durationSec > 0
        ? Number(raw.durationSec.toFixed(2))
        : estimateNarrationDuration(narration, defaultStepDurationSec);
    const frame: AlgoTraceFrame = {
      id: `frame-${idx + 1}`,
      start: Number(cursor.toFixed(3)),
      duration,
      line: raw.line,
      event: raw.event ?? "update",
      note: raw.note,
      narration,
      vars: raw.vars ?? {},
      structure: raw.structure,
    };
    cursor += duration;
    return frame;
  });

  return {
    frames,
    totalDuration: Number(cursor.toFixed(3)),
    stdout,
  };
}
