import { z } from "zod";
import { computePackagingMetrics, stagePackagingSchema } from "./packaging";

const idSchema = z.string().regex(/^[a-z][a-z0-9-]*$/, "ID 必须以小写字母开头，仅含小写字母、数字和连字符");
const nonEmpty = z.string().trim().min(1);

export const timedWordSchema = z.object({
  text: nonEmpty,
  start: z.number().finite().nonnegative(),
  end: z.number().finite().positive(),
}).strict();

export const audioSegmentSchema = z.object({
  id: idSchema,
  file: nonEmpty.refine(
    (file) => !file.includes("\\") && !file.startsWith("/") && !file.split("/").includes("..") && !/^[a-z][a-z0-9+.-]*:/i.test(file),
    "音频路径必须是本地相对路径",
  ),
  start: z.number().finite().nonnegative(),
  duration: z.number().finite().positive(),
  words: z.array(timedWordSchema).min(1),
}).strict();

export const audioManifestSchema = z.object({
  version: z.literal(1),
  duration: z.number().finite().positive(),
  segments: z.array(audioSegmentSchema).min(1),
}).strict();

export const calloutSchema = z.object({
  line: z.number().int().positive(),
  title: nonEmpty,
  body: nonEmpty,
  tone: z.enum(["info", "warn", "success"]).default("info"),
}).strict();

export const terminalLineSchema = z.object({
  text: z.string(),
  tone: z.enum(["stdout", "success", "warn", "error", "dim"]).default("stdout"),
}).strict();

export const terminalSchema = z.object({
  title: nonEmpty.default("Terminal"),
  command: nonEmpty.optional(),
  lines: z.array(terminalLineSchema).min(1),
}).strict();

export const codeStepSchema = z.object({
  id: idSchema,
  start: z.number().finite().nonnegative(),
  duration: z.number().finite().positive(),
  badge: nonEmpty.optional(),
  headline: nonEmpty,
  subtitle: z.string().optional(),
  filename: nonEmpty,
  code: z.string().min(1),
  focusLines: z.array(z.number().int().positive()).optional(),
  callout: calloutSchema.optional(),
  terminal: terminalSchema.optional(),
  narration: nonEmpty,
  segmentId: idSchema.optional(),
}).strict();

export const codeStageMetaSchema = z.object({
  id: idSchema,
  title: nonEmpty,
  subtitle: nonEmpty.optional(),
  language: nonEmpty,
  shikiTheme: z.enum(["dracula", "tokyo-night", "github-dark", "catppuccin-mocha", "one-dark-pro"]).default("dracula"),
  width: z.union([z.literal(1920), z.literal(1080)]).default(1920),
  height: z.union([z.literal(1080), z.literal(1920)]).default(1080),
  fps: z.literal(30).default(30),
}).strict();

export const codeStageSpecSchema = z.object({
  version: z.literal(1),
  meta: codeStageMetaSchema,
  steps: z.array(codeStepSchema).min(1),
  audio: audioManifestSchema.optional(),
  packaging: stagePackagingSchema.optional(),
}).strict().superRefine((spec, ctx) => {
  const tolerance = 1e-6;
  const stepIds = new Set<string>();

  for (let i = 0; i < spec.steps.length; i++) {
    const step = spec.steps[i];
    if (stepIds.has(step.id)) {
      ctx.addIssue({
        code: "custom",
        path: ["steps", i, "id"],
        message: `步骤 ID 重复: ${step.id}`,
      });
    }
    stepIds.add(step.id);

    if (i > 0) {
      const prev = spec.steps[i - 1];
      const prevEnd = prev.start + prev.duration;
      if (step.start + tolerance < prevEnd) {
        ctx.addIssue({
          code: "custom",
          path: ["steps", i, "start"],
          message: `步骤 ${step.id} 的开始时间 (${step.start}) 早于上一步结束时间 (${prevEnd})`,
        });
      }
    }

    const lineCount = step.code.split("\n").length;
    if (step.focusLines) {
      for (const line of step.focusLines) {
        if (line > lineCount) {
          ctx.addIssue({
            code: "custom",
            path: ["steps", i, "focusLines"],
            message: `focusLines 行号 ${line} 超出代码总行数 ${lineCount}`,
          });
        }
      }
    }
    if (step.callout && step.callout.line > lineCount) {
      ctx.addIssue({
        code: "custom",
        path: ["steps", i, "callout", "line"],
        message: `callout 行号 ${step.callout.line} 超出代码总行数 ${lineCount}`,
      });
    }
  }

  if (spec.audio) {
    const segIds = new Set(spec.audio.segments.map((s) => s.id));
    if (segIds.size !== spec.audio.segments.length) {
      ctx.addIssue({
        code: "custom",
        path: ["audio", "segments"],
        message: "音频分段 ID 必须唯一",
      });
    }
    for (let i = 0; i < spec.steps.length; i++) {
      const segId = spec.steps[i].segmentId;
      if (segId && !segIds.has(segId)) {
        ctx.addIssue({
          code: "custom",
          path: ["steps", i, "segmentId"],
          message: `步骤引用的音频分段不存在: ${segId}`,
        });
      }
    }
  }
});

export type TimedWord = z.infer<typeof timedWordSchema>;
export type AudioSegment = z.infer<typeof audioSegmentSchema>;
export type AudioManifest = z.infer<typeof audioManifestSchema>;
export type Callout = z.infer<typeof calloutSchema>;
export type TerminalSpec = z.infer<typeof terminalSchema>;
export type CodeStep = z.infer<typeof codeStepSchema>;
export type CodeStageSpec = z.infer<typeof codeStageSpecSchema>;

export function getTotalDuration(spec: CodeStageSpec): number {
  const lastStep = spec.steps[spec.steps.length - 1];
  const stepsEnd = lastStep.start + lastStep.duration;
  const raw = spec.audio ? Math.max(stepsEnd, spec.audio.duration) : stepsEnd;
  return computePackagingMetrics(raw, spec.packaging).totalDuration;
}
