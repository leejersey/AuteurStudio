// src/remotion/template-registry.ts — 视频模板注册表
// 所有模板通过此注册表注册和查找

import type React from "react";

// ─── 复用现有类型 ───

import type { VideoType } from "@/lib/renderer";

// ─── Slide 渲染器 Props 接口 ───
// 各模板需要实现的组件签名（与现有组件 props 保持一致）

import type {
  TitleSlide,
  NumberedListSlide,
  ComparisonSlide,
  StepsSlide,
  QuoteSlide,
  EndingSlide,
} from "@/lib/types/card-video";
import type { NarrationSegment, CellState } from "@/lib/types/algo-video";
import type { CodeTheme } from "@/lib/types/markdown-video";

// ─── 模板元数据 ───

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // CSS gradient 用于 UI 预览
  videoTypes: VideoType[];
  author?: string;
}

// ─── Card 视频 Slide 渲染器 (9:16) ───

type CardStyle = "dark-tech" | "minimal-light" | "gradient-purple";

export interface CardSlideRenderers {
  TitleSlide: React.FC<{ data: TitleSlide; style?: CardStyle }>;
  NumberedListSlide: React.FC<{ data: NumberedListSlide; style?: CardStyle }>;
  ComparisonSlide: React.FC<{ data: ComparisonSlide; style?: CardStyle }>;
  StepsSlide: React.FC<{ data: StepsSlide; style?: CardStyle }>;
  QuoteSlide: React.FC<{ data: QuoteSlide; style?: CardStyle }>;
  EndingSlide: React.FC<{ data: EndingSlide; style?: CardStyle }>;
}

// ─── Knowledge 视频 Slide 渲染器 (16:9) ───

export interface KnowledgeSlideRenderers {
  LandscapeTitleSlide: React.FC<{
    heading: string;
    subtitle: string;
    tags?: string[];
  }>;
  LandscapeContentSlide: React.FC<{
    heading: string;
    points: { icon?: string; text: string; detail?: string }[];
  }>;
  LandscapeDiagramSlide: React.FC<{
    heading: string;
    diagramType: "flow" | "layers" | "compare";
    nodes: { label: string; icon?: string; description?: string }[];
    connections?: string[];
  }>;
  LandscapeEndingSlide: React.FC<{
    heading: string;
    summary: string;
    keyTakeaways?: string[];
    callToAction?: string;
  }>;
}

// ─── Markdown 视频 Slide 渲染器 (16:9) ───

export interface MarkdownSlideRenderers {
  MarkdownTitleSlide: React.FC<{
    heading: string;
    subtitle?: string;
    tags?: string[];
  }>;
  MarkdownContentSlide: React.FC<{
    heading: string;
    points: { text: string; detail?: string }[];
  }>;
  MarkdownCodeSlide: React.FC<{
    heading: string;
    language: string;
    lines: string[];
    highlightLines?: number[];
    theme: CodeTheme;
    durationInFrames: number;
  }>;
  MarkdownEndingSlide: React.FC<{
    heading: string;
    summary?: string;
    callToAction?: string;
  }>;
}

// ─── Algo 视频 Slide 渲染器 (16:9) ───

export interface AlgoSlideRenderers {
  GridBoard: React.FC<{
    grid: CellState[][];
    highlights?: [number, number][];
  }>;
  StepIndicator: React.FC<{
    currentStep: number;
    totalSteps: number;
    annotation?: string;
    description: string;
  }>;
  CodeHighlight: React.FC<Record<string, unknown>>;
}

// ─── 完整的模板定义 ───

export interface VideoTemplate {
  info: TemplateInfo;
  card?: CardSlideRenderers;
  knowledge?: KnowledgeSlideRenderers;
  markdown?: MarkdownSlideRenderers;
  algo?: AlgoSlideRenderers;
}

// ─── 注册表 ───

const templates = new Map<string, VideoTemplate>();

export function registerTemplate(template: VideoTemplate): void {
  templates.set(template.info.id, template);
}

export function getTemplate(id: string): VideoTemplate | undefined {
  return templates.get(id);
}

export function getTemplatesForType(type: VideoType): TemplateInfo[] {
  const result: TemplateInfo[] = [];
  templates.forEach((t) => {
    if (t.info.videoTypes.includes(type)) {
      result.push(t.info);
    }
  });
  return result;
}

export function getAllTemplates(): TemplateInfo[] {
  return Array.from(templates.values()).map((t) => t.info);
}

export function getDefaultTemplateId(): string {
  return "dark-tech";
}

// ─── 自动导入所有模板包 ───
// 各模板包在自己的 index.ts 中调用 registerTemplate()

export function initTemplates(): void {
  // 通过 side-effect import 触发注册
  // 见 template-packs/dark-tech/index.ts 和 template-packs/minimal-white/index.ts
}
