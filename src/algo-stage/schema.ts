import { z } from "zod";
import { computePackagingMetrics, stagePackagingSchema } from "../code-stage/packaging";
import { audioManifestSchema } from "../code-stage/schema";

const idSchema = z.string().regex(/^[a-z][a-z0-9-]*$/, "ID 必须以小写字母开头，仅含小写字母、数字和连字符");
const nonEmpty = z.string().trim().min(1);

export const nodeVisualStateSchema = z.enum([
  "default",
  "active",
  "comparing",
  "swapped",
  "sorted",
  "pivot",
  "found",
  "dim",
]);

export const arrayPointerSchema = z.object({
  name: nonEmpty,
  index: z.number().int().nonnegative(),
  color: z.string().optional(),
}).strict();

export const arrayStructureSchema = z.object({
  type: z.literal("array"),
  label: nonEmpty.optional(),
  items: z.array(
    z.object({
      value: z.union([z.number(), z.string()]),
      state: nodeVisualStateSchema.default("default"),
    }).strict(),
  ).min(1).max(16),
  pointers: z.array(arrayPointerSchema).default([]),
  swappedPair: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]).optional(),
}).strict();

export const linkedListStructureSchema = z.object({
  type: z.literal("linked-list"),
  label: nonEmpty.optional(),
  nodes: z.array(
    z.object({
      id: nonEmpty,
      value: z.union([z.number(), z.string()]),
      state: nodeVisualStateSchema.default("default"),
    }).strict(),
  ).min(1).max(10),
  edges: z.array(
    z.object({
      from: nonEmpty,
      to: nonEmpty,
      state: z.enum(["default", "active", "reversed"]).default("default"),
    }).strict(),
  ).default([]),
  pointers: z.array(
    z.object({
      name: nonEmpty,
      nodeId: nonEmpty.nullable(),
      color: z.string().optional(),
    }).strict(),
  ).default([]),
}).strict();

export const treeStructureSchema = z.object({
  type: z.literal("tree"),
  label: nonEmpty.optional(),
  nodes: z.array(
    z.object({
      id: nonEmpty,
      value: z.union([z.number(), z.string()]),
      parentId: nonEmpty.nullable().default(null),
      side: z.enum(["left", "right"]).optional(),
      state: nodeVisualStateSchema.default("default"),
    }).strict(),
  ).min(1).max(15),
  pointers: z.array(
    z.object({
      name: nonEmpty,
      nodeId: nonEmpty,
      color: z.string().optional(),
    }).strict(),
  ).default([]),
}).strict();

export const matrixStructureSchema = z.object({
  type: z.literal("matrix"),
  label: nonEmpty.optional(),
  rows: z.array(
    z.array(
      z.object({
        value: z.union([z.number(), z.string()]),
        state: nodeVisualStateSchema.default("default"),
      }).strict(),
    ).min(1).max(10),
  ).min(1).max(8),
  rowLabels: z.array(z.string()).optional(),
  colLabels: z.array(z.string()).optional(),
  activeCell: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]).optional(),
  fromCells: z.array(z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()])).optional(),
}).strict();

export const stackQueueStructureSchema = z.object({
  type: z.literal("stack-queue"),
  variant: z.enum(["stack", "queue", "call-stack"]).default("stack"),
  label: nonEmpty.optional(),
  items: z.array(
    z.object({
      id: nonEmpty,
      label: z.union([z.number(), z.string()]),
      detail: z.string().optional(),
      state: nodeVisualStateSchema.default("default"),
    }).strict(),
  ).max(10),
  action: z.enum(["push", "pop", "peek", "idle"]).default("idle"),
}).strict();

export const algoStructureSchema = z.discriminatedUnion("type", [
  arrayStructureSchema,
  linkedListStructureSchema,
  treeStructureSchema,
  matrixStructureSchema,
  stackQueueStructureSchema,
]);

export const algoTraceFrameSchema = z.object({
  id: idSchema,
  start: z.number().finite().nonnegative(),
  duration: z.number().finite().positive(),
  line: z.number().int().positive(),
  event: z.enum(["init", "compare", "swap", "move", "update", "found", "done"]).default("update"),
  note: nonEmpty,
  narration: nonEmpty,
  vars: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
  structure: algoStructureSchema,
}).strict();

export const algoStageSpecSchema = z.object({
  version: z.literal(1),
  meta: z.object({
    id: idSchema,
    title: nonEmpty,
    algorithm: nonEmpty,
    language: nonEmpty,
    filename: nonEmpty,
    shikiTheme: z.enum(["dracula", "tokyo-night", "github-dark", "catppuccin-mocha", "one-dark-pro"]).default("dracula"),
    complexity: z.object({
      time: nonEmpty,
      space: nonEmpty,
    }).strict().optional(),
    width: z.union([z.literal(1920), z.literal(1080)]).default(1920),
    height: z.union([z.literal(1080), z.literal(1920)]).default(1080),
    fps: z.literal(30).default(30),
  }).strict(),
  code: z.string().min(1),
  frames: z.array(algoTraceFrameSchema).min(1),
  audio: audioManifestSchema.optional(),
  packaging: stagePackagingSchema.optional(),
}).strict().superRefine((spec, ctx) => {
  const tolerance = 1e-6;
  const totalCodeLines = spec.code.split("\n").length;
  const seen = new Set<string>();

  for (let i = 0; i < spec.frames.length; i++) {
    const frame = spec.frames[i];
    if (seen.has(frame.id)) {
      ctx.addIssue({ code: "custom", path: ["frames", i, "id"], message: `帧 ID 重复: ${frame.id}` });
    }
    seen.add(frame.id);

    if (frame.line > totalCodeLines) {
      ctx.addIssue({
        code: "custom",
        path: ["frames", i, "line"],
        message: `帧 ${frame.id} 的代码行号 ${frame.line} 超出源码总行数 ${totalCodeLines}`,
      });
    }

    if (i > 0) {
      const prev = spec.frames[i - 1];
      const prevEnd = prev.start + prev.duration;
      if (frame.start + tolerance < prevEnd) {
        ctx.addIssue({
          code: "custom",
          path: ["frames", i, "start"],
          message: `帧 ${frame.id} 的开始时间 (${frame.start}) 早于上一帧结束时间 (${prevEnd})`,
        });
      }
    }
  }
});

export type NodeVisualState = z.infer<typeof nodeVisualStateSchema>;
export type ArrayStructure = z.infer<typeof arrayStructureSchema>;
export type LinkedListStructure = z.infer<typeof linkedListStructureSchema>;
export type TreeStructure = z.infer<typeof treeStructureSchema>;
export type MatrixStructure = z.infer<typeof matrixStructureSchema>;
export type StackQueueStructure = z.infer<typeof stackQueueStructureSchema>;
export type AlgoStructure = z.infer<typeof algoStructureSchema>;
export type AlgoTraceFrame = z.infer<typeof algoTraceFrameSchema>;
export type AlgoStageSpec = z.infer<typeof algoStageSpecSchema>;

export function getAlgoTotalDuration(spec: AlgoStageSpec): number {
  const last = spec.frames[spec.frames.length - 1];
  const framesEnd = last.start + last.duration;
  const raw = spec.audio ? Math.max(framesEnd, spec.audio.duration) : framesEnd;
  return computePackagingMetrics(raw, spec.packaging).totalDuration;
}
