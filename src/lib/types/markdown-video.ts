// src/lib/types/markdown-video.ts — Markdown 视频数据类型定义

import type { NarrationSegment } from "./algo-video";

// ─── 代码主题 ───

export type CodeTheme = "dracula" | "github-light" | "one-dark" | "monokai";

// ─── Markdown Slide 类型 ───

export interface MdTitleSlide {
  type: "md_title";
  heading: string;
  subtitle?: string;
  tags?: string[];
  narrationIndex: number;
}

export interface MdContentSlide {
  type: "md_content";
  heading: string;
  points: {
    text: string;
    detail?: string;
  }[];
  narrationIndex: number;
}

export interface MdCodeSlide {
  type: "md_code";
  heading: string;
  language: string;
  code: string;           // 完整代码文本
  lines: string[];         // 分行后的代码行
  highlightLines?: number[]; // 高亮行号
  narrationIndex: number;
}

export interface MdEndingSlide {
  type: "md_ending";
  heading: string;
  summary?: string;
  callToAction?: string;
  narrationIndex: number;
}

export type MarkdownSlide =
  | MdTitleSlide
  | MdContentSlide
  | MdCodeSlide
  | MdEndingSlide;

// ─── Markdown 视频完整数据 ───

export interface MarkdownVideoData {
  meta: {
    title: string;
    category: string;
    templateId?: string; // 模板 ID，默认 "dark-tech"
    aspectRatio: "16:9";
    codeTheme: CodeTheme;
  };
  slides: MarkdownSlide[];
  narration: NarrationSegment[];
}

// ─── 类型守卫 ───

export function isMarkdownVideo(
  data: unknown
): data is MarkdownVideoData {
  return (
    typeof data === "object" &&
    data !== null &&
    "slides" in data &&
    "meta" in data &&
    (data as MarkdownVideoData).meta?.aspectRatio === "16:9" &&
    "codeTheme" in (data as MarkdownVideoData).meta
  );
}
