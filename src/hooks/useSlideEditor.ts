"use client";

import { useState, useCallback, useMemo } from "react";
import type { CardVideoData, Slide } from "@/lib/types/card-video";
import type { KnowledgeVideoData, LandscapeSlide } from "@/lib/types/landscape-video";
import type { MarkdownVideoData, MarkdownSlide } from "@/lib/types/markdown-video";

// ─── 统一 Slide 信息描述 ───

export interface SlideInfo {
  index: number;
  type: string;
  label: string;       // 简短显示名
  icon: string;        // Material icon
  heading?: string;    // 标题文本（用于缩略图）
  imageUrl?: string;   // 图片 URL
  imageCredit?: string; // 图片来源
}

// Slide 类型 → 显示信息
const SLIDE_META: Record<string, { label: string; icon: string }> = {
  // Card
  title: { label: "标题", icon: "title" },
  numbered_list: { label: "列表", icon: "format_list_numbered" },
  comparison: { label: "对比", icon: "compare_arrows" },
  steps: { label: "步骤", icon: "format_list_bulleted" },
  quote: { label: "引言", icon: "format_quote" },
  ending: { label: "结尾", icon: "flag" },
  // Knowledge
  landscape_title: { label: "标题", icon: "title" },
  landscape_content: { label: "内容", icon: "article" },
  landscape_diagram: { label: "图表", icon: "schema" },
  landscape_ending: { label: "结尾", icon: "flag" },
  // Markdown
  md_title: { label: "标题", icon: "title" },
  md_content: { label: "内容", icon: "article" },
  md_code: { label: "代码", icon: "code" },
  md_ending: { label: "结尾", icon: "flag" },
};

// 可添加的 Slide 类型模板
export interface AddableSlideType {
  type: string;
  label: string;
  icon: string;
}

const CARD_ADDABLE: AddableSlideType[] = [
  { type: "numbered_list", label: "列表页", icon: "format_list_numbered" },
  { type: "comparison", label: "对比页", icon: "compare_arrows" },
  { type: "steps", label: "步骤页", icon: "format_list_bulleted" },
  { type: "quote", label: "引言页", icon: "format_quote" },
];

const KNOWLEDGE_ADDABLE: AddableSlideType[] = [
  { type: "landscape_content", label: "内容页", icon: "article" },
  { type: "landscape_diagram", label: "图表页", icon: "schema" },
];

const MARKDOWN_ADDABLE: AddableSlideType[] = [
  { type: "md_content", label: "内容页", icon: "article" },
  { type: "md_code", label: "代码页", icon: "code" },
];

// ─── 创建空白 Slide 模板 ───

function createBlankSlide(type: string, narrationIndex: number): Slide | LandscapeSlide | MarkdownSlide {
  switch (type) {
    case "numbered_list":
      return { type: "numbered_list", heading: "新列表", items: [{ text: "项目 1" }, { text: "项目 2" }] };
    case "comparison":
      return {
        type: "comparison", heading: "新对比",
        left: { title: "方案 A", items: [{ text: "优势 1", positive: true }] },
        right: { title: "方案 B", items: [{ text: "优势 1", positive: true }] },
      };
    case "steps":
      return { type: "steps", heading: "新步骤", steps: [{ action: "步骤 1" }, { action: "步骤 2" }] };
    case "quote":
      return { type: "quote", quote: "在此输入引言文本", source: "来源" };
    case "landscape_content":
      return { type: "landscape_content", heading: "新内容", points: [{ text: "要点 1" }], narrationIndex };
    case "landscape_diagram":
      return { type: "landscape_diagram", heading: "新图表", diagramType: "flow" as const, nodes: [{ label: "节点 1" }], narrationIndex };
    case "md_content":
      return { type: "md_content", heading: "新内容", points: [{ text: "要点 1" }], narrationIndex };
    case "md_code":
      return { type: "md_code", heading: "代码示例", language: "javascript", code: "// 新代码", lines: ["// 新代码"], narrationIndex };
    default:
      return { type: "numbered_list", heading: "新页面", items: [{ text: "内容" }] };
  }
}

// ─── 从 Slide 数据提取标题 ───

function getSlideHeading(slide: Record<string, unknown>): string | undefined {
  return (slide.heading as string) || (slide.quote as string) || (slide.authorName as string) || undefined;
}

// ─── Hook 主体 ───

type VideoData = CardVideoData | KnowledgeVideoData | MarkdownVideoData;

export interface SlideEditorState {
  /** 当前所有 Slide 的信息描述 */
  slides: SlideInfo[];
  /** 当前选中的 Slide 索引（-1 = 无选中） */
  selectedIndex: number;
  /** 可添加的 Slide 类型列表 */
  addableTypes: AddableSlideType[];
  /** 是否有数据 */
  hasData: boolean;

  // ── 操作 ──
  selectSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  deleteSlide: (index: number) => void;
  addSlide: (type: string, afterIndex?: number) => void;
}

export function useSlideEditor(
  videoData: VideoData | null,
  videoType: "card" | "algo" | "knowledge" | "markdown",
  onDataChange: (newData: unknown) => void
): SlideEditorState {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 算法视频不支持 Slide 编排
  const isSupported = videoType !== "algo" && videoData !== null;

  // 提取 Slide 信息
  const slides: SlideInfo[] = useMemo(() => {
    if (!isSupported || !videoData) return [];
    const rawSlides = "slides" in videoData ? (videoData.slides as unknown as Record<string, unknown>[]) : [];
    return rawSlides.map((slide, index) => {
      const type = slide.type as string;
      const meta = SLIDE_META[type] || { label: type, icon: "help" };
      return {
        index,
        type,
        label: meta.label,
        icon: meta.icon,
        heading: getSlideHeading(slide),
        imageUrl: slide.imageUrl as string | undefined,
        imageCredit: slide.imageCredit as string | undefined,
      };
    });
  }, [videoData, isSupported]);

  // 可添加的类型
  const addableTypes = useMemo(() => {
    if (videoType === "card") return CARD_ADDABLE;
    if (videoType === "knowledge") return KNOWLEDGE_ADDABLE;
    if (videoType === "markdown") return MARKDOWN_ADDABLE;
    return [];
  }, [videoType]);

  // ── 选中 ──
  const selectSlide = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  // ── 排序 ──
  const reorderSlides = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!videoData || !("slides" in videoData) || fromIndex === toIndex) return;
      const cloned = JSON.parse(JSON.stringify(videoData));
      const [moved] = cloned.slides.splice(fromIndex, 1);
      cloned.slides.splice(toIndex, 0, moved);

      // 如果有 narration 数组且 slide 有 narrationIndex，也需要更新
      // 但 narrationIndex 是指向全局 narration 数组的索引，排序 Slide 不影响它
      onDataChange(cloned);

      // 更新选中索引
      if (selectedIndex === fromIndex) {
        setSelectedIndex(toIndex);
      } else if (fromIndex < selectedIndex && toIndex >= selectedIndex) {
        setSelectedIndex(selectedIndex - 1);
      } else if (fromIndex > selectedIndex && toIndex <= selectedIndex) {
        setSelectedIndex(selectedIndex + 1);
      }
    },
    [videoData, selectedIndex, onDataChange]
  );

  // ── 删除 ──
  const deleteSlide = useCallback(
    (index: number) => {
      if (!videoData || !("slides" in videoData)) return;
      const cloned = JSON.parse(JSON.stringify(videoData));
      if (cloned.slides.length <= 1) return; // 至少保留 1 个
      cloned.slides.splice(index, 1);
      onDataChange(cloned);

      if (selectedIndex >= cloned.slides.length) {
        setSelectedIndex(cloned.slides.length - 1);
      } else if (selectedIndex === index) {
        setSelectedIndex(-1);
      }
    },
    [videoData, selectedIndex, onDataChange]
  );

  // ── 添加 ──
  const addSlide = useCallback(
    (type: string, afterIndex?: number) => {
      if (!videoData || !("slides" in videoData)) return;
      const cloned = JSON.parse(JSON.stringify(videoData));
      const narrationLen = "narration" in cloned ? (cloned.narration as unknown[]).length : 0;
      const newSlide = createBlankSlide(type, narrationLen);

      const insertAt = afterIndex !== undefined ? afterIndex + 1 : cloned.slides.length;
      cloned.slides.splice(insertAt, 0, newSlide);

      // 对有 narration 的类型，添加一条空白旁白
      if ("narration" in cloned && "narrationIndex" in newSlide) {
        (cloned.narration as unknown[]).push({ text: "新内容旁白", durationMs: 4000 });
      }

      onDataChange(cloned);
      setSelectedIndex(insertAt);
    },
    [videoData, onDataChange]
  );

  return {
    slides,
    selectedIndex,
    addableTypes,
    hasData: isSupported,
    selectSlide,
    reorderSlides,
    deleteSlide,
    addSlide,
  };
}
