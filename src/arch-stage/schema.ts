import { z } from "zod";
import { stagePackagingSchema } from "@/code-stage/packaging";
import { audioManifestSchema } from "@/code-stage/schema";

export const stageThemeSchema = z.enum([
  "dracula",
  "tokyo-night",
  "github-dark",
  "catppuccin-mocha",
  "one-dark-pro",
]);

export const archNodeKindSchema = z.enum([
  "client",
  "gateway",
  "service",
  "cache",
  "database",
  "queue",
  "browser",
  "runtime",
  "llm",
  "external",
]);

export type ArchNodeKind = z.infer<typeof archNodeKindSchema>;

export const archNodeSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1).max(28),
  sublabel: z.string().trim().max(36).optional(),
  kind: archNodeKindSchema.default("service"),
  col: z.number().int().min(0).max(4),
  row: z.number().int().min(0).max(3),
  badge: z.string().trim().max(18).optional(),
}).strict();

export type ArchNode = z.infer<typeof archNodeSchema>;

export const archEdgeSchema = z.object({
  id: z.string().trim().min(1),
  from: z.string().trim().min(1),
  to: z.string().trim().min(1),
  label: z.string().trim().max(24).optional(),
  style: z.enum(["solid", "dashed"]).default("solid"),
}).strict();

export type ArchEdge = z.infer<typeof archEdgeSchema>;

export const archPacketSchema = z.object({
  edgeId: z.string().trim().min(1),
  label: z.string().trim().min(1).max(22),
  tone: z.enum(["primary", "success", "warn", "danger"]).default("primary"),
  reverse: z.boolean().optional(),
}).strict();

export type ArchPacket = z.infer<typeof archPacketSchema>;

export const archMetricSchema = z.object({
  label: z.string().trim().min(1).max(20),
  value: z.string().trim().min(1).max(24),
  tone: z.enum(["default", "primary", "success", "warn", "danger"]).default("default"),
}).strict();

export const archStepSchema = z.object({
  id: z.string().trim().min(1),
  badge: z.string().trim().min(1).max(24),
  headline: z.string().trim().min(1).max(48),
  start: z.number().finite().min(0),
  duration: z.number().finite().positive(),
  activeNodes: z.array(z.string().trim().min(1)).default([]),
  activeEdges: z.array(z.string().trim().min(1)).default([]),
  packets: z.array(archPacketSchema).max(4).default([]),
  nodeStates: z.record(z.string(), z.string().max(28)).optional(),
  metrics: z.array(archMetricSchema).max(4).optional(),
  callout: z.object({
    title: z.string().trim().min(1).max(28),
    body: z.string().trim().min(1).max(110),
  }).strict().optional(),
  narration: z.string().trim().min(1),
}).strict();

export type ArchStep = z.infer<typeof archStepSchema>;

export const archStageMetaSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  subtitle: z.string().trim().optional(),
  domain: z.string().trim().default("SYSTEM ARCH"),
  theme: stageThemeSchema.default("dracula"),
  width: z.number().int().positive().default(1920),
  height: z.number().int().positive().default(1080),
  fps: z.number().int().positive().default(30),
}).strict();

export const archStageSpecSchema = z.object({
  engine: z.literal("arch-stage").default("arch-stage"),
  meta: archStageMetaSchema,
  nodes: z.array(archNodeSchema).min(2).max(10),
  edges: z.array(archEdgeSchema).min(1).max(14),
  steps: z.array(archStepSchema).min(2).max(8),
  audio: audioManifestSchema.optional(),
  packaging: stagePackagingSchema.optional(),
}).strict();

export type ArchStageSpec = z.infer<typeof archStageSpecSchema>;

export interface ArchValidationIssue {
  gate: string;
  message: string;
}

export function validateArchSpecSemantics(spec: ArchStageSpec): ArchValidationIssue[] {
  const issues: ArchValidationIssue[] = [];
  const nodeIds = new Set<string>();
  const coordMap = new Map<string, string>();

  for (const node of spec.nodes) {
    if (nodeIds.has(node.id)) {
      issues.push({ gate: "topology", message: `重复的节点 id: ${node.id}` });
    }
    nodeIds.add(node.id);
    const key = `${node.col},${node.row}`;
    if (coordMap.has(key)) {
      issues.push({
        gate: "topology",
        message: `节点 ${node.id} 与 ${coordMap.get(key)} 网格坐标冲突 (${key})，请调整 col/row 避免重叠`,
      });
    } else {
      coordMap.set(key, node.id);
    }
  }

  const edgeIds = new Set<string>();
  for (const edge of spec.edges) {
    if (edgeIds.has(edge.id)) {
      issues.push({ gate: "topology", message: `重复的连线 id: ${edge.id}` });
    }
    edgeIds.add(edge.id);
    if (!nodeIds.has(edge.from)) {
      issues.push({ gate: "topology", message: `连线 ${edge.id} 的起点 ${edge.from} 不存在` });
    }
    if (!nodeIds.has(edge.to)) {
      issues.push({ gate: "topology", message: `连线 ${edge.id} 的终点 ${edge.to} 不存在` });
    }
    if (edge.from === edge.to) {
      issues.push({ gate: "topology", message: `连线 ${edge.id} 不能自环 (${edge.from})` });
    }
  }

  for (const step of spec.steps) {
    for (const nid of step.activeNodes) {
      if (!nodeIds.has(nid)) {
        issues.push({ gate: "step-ref", message: `步骤 ${step.id} 引用了不存在的节点 ${nid}` });
      }
    }
    for (const eid of step.activeEdges) {
      if (!edgeIds.has(eid)) {
        issues.push({ gate: "step-ref", message: `步骤 ${step.id} 引用了不存在的连线 ${eid}` });
      }
    }
    for (const pkt of step.packets) {
      if (!edgeIds.has(pkt.edgeId)) {
        issues.push({ gate: "step-ref", message: `步骤 ${step.id} 的数据包引用了不存在的连线 ${pkt.edgeId}` });
      }
    }
  }

  return issues;
}
