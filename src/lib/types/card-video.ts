// src/lib/types/card-video.ts — 图文卡片视频完整类型定义

export interface CardVideoData {
  meta: {
    title: string;
    category: string; // "AI资讯" | "技术解读" | ...
    style: "dark-tech" | "minimal-light" | "gradient-purple";
    templateId?: string; // 模板 ID，默认 "dark-tech"
    aspectRatio: "9:16";
    bgmTrack?: string;
  };
  slides: Slide[];
}

export type Slide =
  | TitleSlide
  | NumberedListSlide
  | ComparisonSlide
  | StepsSlide
  | QuoteSlide
  | EndingSlide;

export interface TitleSlide {
  type: "title";
  category: string;
  heading: string;
  subtitle: string;
  highlightWords?: string[];
}

export interface NumberedListSlide {
  type: "numbered_list";
  heading?: string;
  items: {
    text: string;
    detail?: string;
  }[];
  tags?: string[];
}

export interface ComparisonSlide {
  type: "comparison";
  heading: string;
  left: {
    title: string;
    subtitle?: string;
    items: { text: string; positive?: boolean }[];
  };
  right: {
    title: string;
    subtitle?: string;
    items: { text: string; positive?: boolean }[];
  };
}

export interface StepsSlide {
  type: "steps";
  heading: string;
  subheading?: string;
  steps: {
    action: string;
    note?: string;
  }[];
  linkCard?: {
    title: string;
    url: string;
  };
}

export interface QuoteSlide {
  type: "quote";
  heading?: string;
  quote: string;
  source?: string;
  summary?: string;
  discussionPrompts?: string[];
}

export interface EndingSlide {
  type: "ending";
  authorName: string;
  authorAvatar?: string;
  callToAction: string;
  tags?: string[];
}
