// ─── 图片布局类型 ───
export type SlideImagePosition = "background" | "side" | "top" | "overlay";

// ─── 通用图片字段 ───
export interface SlideImageFields {
  imageUrl?: string;              // Unsplash 图片 URL
  imageKeyword?: string;          // 图片搜索关键词（AI 生成，英文）
  imagePosition?: SlideImagePosition;
  imageCredit?: string;           // 图片来源归属
}

export interface CardVideoData {
  meta: {
    title: string;
    category: string;
    style: "dark-tech" | "minimal-light" | "gradient-purple";
    templateId?: string;
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

export interface TitleSlide extends SlideImageFields {
  type: "title";
  category: string;
  heading: string;
  subtitle: string;
  highlightWords?: string[];
}

export interface NumberedListSlide extends SlideImageFields {
  type: "numbered_list";
  heading?: string;
  items: {
    text: string;
    detail?: string;
  }[];
  tags?: string[];
}

export interface ComparisonSlide extends SlideImageFields {
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

export interface StepsSlide extends SlideImageFields {
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

export interface QuoteSlide extends SlideImageFields {
  type: "quote";
  heading?: string;
  quote: string;
  source?: string;
  summary?: string;
  discussionPrompts?: string[];
}

export interface EndingSlide extends SlideImageFields {
  type: "ending";
  authorName: string;
  authorAvatar?: string;
  callToAction: string;
  tags?: string[];
}
