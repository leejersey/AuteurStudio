// src/lib/types/landscape-video.ts — 16:9 横屏视频统一类型

import type { AlgoVideoData, NarrationSegment } from "./algo-video";
import type { SlideImageFields } from "./card-video";

// ─── 知识讲解视频数据 ───

export interface KnowledgeVideoData {
  meta: {
    title: string;
    category: string;
    style: "dark-tech" | "minimal-light" | "gradient-purple";
    templateId?: string; // 模板 ID，默认 "dark-tech"
    aspectRatio: "16:9";
    contentType: "knowledge"; // 判别字段
  };
  narration: NarrationSegment[]; // 复用算法视频的旁白类型
  slides: LandscapeSlide[];
}

// ─── 横屏 Slide 类型（4 种） ───

export type LandscapeSlide =
  | LandscapeTitleSlide
  | LandscapeContentSlide
  | LandscapeDiagramSlide
  | LandscapeEndingSlide;

export interface LandscapeTitleSlide extends SlideImageFields {
  type: "landscape_title";
  heading: string;            // 大标题
  subtitle: string;           // 副标题/一句话概括
  tags?: string[];            // 标签 ["AI", "RAG", "技术"]
  narrationIndex: number;
}

export interface LandscapeContentSlide extends SlideImageFields {
  type: "landscape_content";
  heading: string;            // 小标题
  points: {
    icon?: string;            // emoji 图标
    text: string;             // 要点文本
    detail?: string;          // 补充说明
  }[];
  narrationIndex: number;
}

export interface LandscapeDiagramSlide extends SlideImageFields {
  type: "landscape_diagram";
  heading: string;
  diagramType: "flow" | "layers" | "compare"; // 流程图 | 分层架构 | 对比
  nodes: {
    label: string;
    icon?: string;
    description?: string;
  }[];
  connections?: string[];     // 描述连接关系 "A → B"
  narrationIndex: number;
}

export interface LandscapeEndingSlide extends SlideImageFields {
  type: "landscape_ending";
  heading: string;            // 总结标题
  summary: string;            // 一句话总结
  keyTakeaways?: string[];    // 关键要点回顾
  callToAction?: string;
  narrationIndex: number;
}

// ─── 联合类型 ───

export type LandscapeVideoData = AlgoVideoData | KnowledgeVideoData;

// ─── 类型守卫 ───

export function isKnowledgeVideo(
  data: LandscapeVideoData
): data is KnowledgeVideoData {
  return "slides" in data && "narration" in data && !("steps" in data);
}

export function isAlgoVideo(
  data: LandscapeVideoData
): data is AlgoVideoData {
  return "steps" in data;
}
