// ─── 图片布局类型 ───
export type SlideImagePosition = "background" | "side" | "top" | "overlay";

// ─── 通用图片字段 ───
export interface SlideImageFields {
  imageUrl?: string;              // Unsplash 图片 URL
  imageKeyword?: string;          // 图片搜索关键词（AI 生成，英文）
  imagePosition?: SlideImagePosition;
  imageCredit?: string;           // 图片来源归属
}

// ─── AI 美术指导：Slide 级设计指令 ───
export interface SlideDesignHints {
  /** 布局变体名称 */
  layoutVariant?: string;
  /** 启用的装饰组件名（如 "circuit", "wave", "spotlight"） */
  decorations?: string[];
  /** 本页强调色 (hex) */
  colorAccent?: string;
  /** 图标风格 */
  iconStyle?: "emoji" | "material";
}

// ─── AI 美术指导：全局设计指令 ───
export interface DesignDirectives {
  colorPalette?: {
    accent: string;            // 主强调色 (hex)
    accentSecondary?: string;  // 辅助强调色
  };
  mood?: "energetic" | "calm" | "professional" | "playful" | "dramatic";
  decorationDensity?: "minimal" | "moderate" | "rich";
  backgroundPattern?: "circuit" | "wave" | "hexagon" | "dots-grid" | "none";
}

export interface CardVideoData {
  meta: {
    title: string;
    category: string;
    style: "dark-tech" | "minimal-light" | "gradient-purple";
    templateId?: string;
    aspectRatio: "9:16";
    bgmTrack?: string;
    designDirectives?: DesignDirectives;
  };
  slides: Slide[];
}

export type Slide =
  | TitleSlide
  | NumberedListSlide
  | ComparisonSlide
  | StepsSlide
  | QuoteSlide
  | EndingSlide
  | StatsSlide
  | TimelineSlide
  | HighlightSlide;

export interface TitleSlide extends SlideImageFields, SlideDesignHints {
  type: "title";
  category: string;
  heading: string;
  subtitle: string;
  highlightWords?: string[];
}

export interface NumberedListSlide extends SlideImageFields, SlideDesignHints {
  type: "numbered_list";
  heading?: string;
  items: {
    text: string;
    detail?: string;
  }[];
  tags?: string[];
}

export interface ComparisonSlide extends SlideImageFields, SlideDesignHints {
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

export interface StepsSlide extends SlideImageFields, SlideDesignHints {
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

export interface QuoteSlide extends SlideImageFields, SlideDesignHints {
  type: "quote";
  heading?: string;
  quote: string;
  source?: string;
  summary?: string;
  discussionPrompts?: string[];
}

export interface EndingSlide extends SlideImageFields, SlideDesignHints {
  type: "ending";
  authorName: string;
  authorAvatar?: string;
  callToAction: string;
  tags?: string[];
}

// ─── 新增：数据统计展示页 ───
export interface StatsSlide extends SlideImageFields, SlideDesignHints {
  type: "stats";
  heading?: string;
  stats: {
    value: number;
    suffix?: string;        // "%" | "K" | "M" | "+"
    label: string;
    color?: string;         // 自定义颜色
    showProgress?: boolean; // 显示进度环
  }[];
}

// ─── 新增：时间线/过程展示页 ───
export interface TimelineSlide extends SlideImageFields, SlideDesignHints {
  type: "timeline";
  heading: string;
  events: {
    time: string;           // "2024" | "Q1" | "第一步"
    title: string;
    detail?: string;
    icon?: string;          // emoji
  }[];
}

// ─── 新增：核心亮点强调页 ───
export interface HighlightSlide extends SlideImageFields, SlideDesignHints {
  type: "highlight";
  text: string;              // 核心观点（大字居中）
  subtext?: string;          // 补充说明
  decoration?: "spotlight" | "wave" | "pattern";
}
