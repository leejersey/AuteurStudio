// src/lib/markdown-parser.ts — Markdown → 分页 Slide 结构解析器（v2 鲁棒版）

import { unified } from "unified";
import remarkParse from "remark-parse";
import type { MarkdownSlide } from "./types/markdown-video";

interface MdNode {
  type: string;
  depth?: number;
  value?: string;
  lang?: string;
  children?: MdNode[];
  ordered?: boolean;
}

// 每页 points 数量上限（超出自动分页）
const MAX_POINTS_PER_SLIDE = 6;

/**
 * 将 Markdown 文本解析为 MarkdownSlide[] 分页结构
 *
 * 分页规则：
 * - `#` 一级标题 → md_title（标题页）
 * - 无 `#` 时，使用第一个 `##` 作为文档标题
 * - `##` 二级标题 → 开始新的 md_content 页
 * - `###` 三级标题 → 也开始新页（作为子节）
 * - 代码块 → md_code 页（独立成页）
 * - 段落/列表 → 合并到当前 md_content 页
 * - `---` 分割线 → 强制分页
 * - 单页 points 超过 MAX_POINTS_PER_SLIDE 自动拆分
 * - 最后自动追加 md_ending 页
 */
export function parseMarkdown(markdown: string): MarkdownSlide[] {
  const tree = unified().use(remarkParse).parse(markdown) as MdNode;

  const slides: MarkdownSlide[] = [];
  let narrationIndex = 0;
  let docTitle = "";
  const introTexts: string[] = []; // 收集标题前的所有段落
  let foundFirstHeading = false; // 追踪是否已遇到第一个 heading

  // 临时缓冲：收集当前 section 的文本内容
  let currentHeading = "";
  let currentPoints: { text: string; detail?: string }[] = [];

  function flushContent() {
    if (currentPoints.length > 0) {
      // 如果没有 heading，生成一个
      const heading = currentHeading || "内容";

      // 自动拆分过长的页面
      for (let start = 0; start < currentPoints.length; start += MAX_POINTS_PER_SLIDE) {
        const chunk = currentPoints.slice(start, start + MAX_POINTS_PER_SLIDE);
        const suffix =
          start > 0
            ? ` (${Math.floor(start / MAX_POINTS_PER_SLIDE) + 1})`
            : "";
        slides.push({
          type: "md_content",
          heading: heading + suffix,
          points: chunk,
          narrationIndex: narrationIndex++,
        });
      }
      currentPoints = [];
    }
    // 重置 heading 防止复用
    currentHeading = "";
  }

  function extractText(node: MdNode): string {
    if (node.value) return node.value;
    if (node.children) return node.children.map(extractText).join("");
    return "";
  }

  function extractListItems(node: MdNode): string[] {
    const items: string[] = [];
    for (const item of node.children || []) {
      const text = extractText(item).trim();
      if (text) items.push(text);
    }
    return items;
  }

  for (const node of tree.children || []) {
    switch (node.type) {
      case "heading": {
        const text = extractText(node).trim();
        const depth = node.depth || 1;

        if (depth === 1) {
          // `#` 一级标题 → 文档标题
          flushContent();
          if (!docTitle) {
            docTitle = text;
          } else {
            // 第二个 # 标题作为副标题？不，作为新 section
            flushContent();
            currentHeading = text;
          }
        } else if (depth === 2 && !foundFirstHeading && !docTitle) {
          // 没有 # 标题时，第一个 ## 作为文档标题
          flushContent();
          foundFirstHeading = true;
          docTitle = text;
        } else {
          // 二级及以下标题 → 开始新页
          flushContent();
          currentHeading = text;
          foundFirstHeading = true;
        }
        break;
      }

      case "code": {
        // 代码块 → 独立成页
        flushContent();

        const code = node.value || "";
        const lines = code.split("\n");
        const lang = node.lang || "text";

        slides.push({
          type: "md_code",
          heading: currentHeading || `${lang} 代码`,
          language: lang,
          code,
          lines,
          narrationIndex: narrationIndex++,
        });
        // 代码块后清空 heading，防止下一个代码块复用同一标题
        currentHeading = "";
        break;
      }

      case "paragraph": {
        const text = extractText(node).trim();
        if (!text) break;

        if (!foundFirstHeading) {
          // 标题前的段落 → 收集为介绍文本
          introTexts.push(text);
        } else {
          currentPoints.push({ text });
        }
        break;
      }

      case "list": {
        const items = extractListItems(node);
        for (const item of items) {
          currentPoints.push({ text: item });
        }
        break;
      }

      case "blockquote": {
        const text = extractText(node).trim();
        if (text) {
          currentPoints.push({ text: `💡 ${text}` });
        }
        break;
      }

      case "thematicBreak": {
        // 分割线 → 强制分页并重置 heading
        flushContent();
        currentHeading = "";
        break;
      }

      default:
        break;
    }
  }

  // 刷新剩余内容
  flushContent();

  // 兜底：如果全文无标题
  if (!docTitle) {
    docTitle = introTexts.length > 0 ? introTexts[0].slice(0, 30) : "技术分享";
  }

  // 构建副标题：使用所有 intro 段落合并（最多 2 段）
  const subtitle =
    introTexts.length > 0
      ? introTexts.slice(0, 2).join("。").slice(0, 120)
      : undefined;

  // 将 intro 段落中剩余的内容（第 3 段起）作为独立内容页
  if (introTexts.length > 2) {
    const remainingIntro = introTexts.slice(2).map((t) => ({ text: t }));
    slides.unshift({
      type: "md_content",
      heading: "背景",
      points: remainingIntro,
      narrationIndex: narrationIndex++,
    });
  }

  // 插入标题页到最前面
  slides.unshift({
    type: "md_title",
    heading: docTitle,
    subtitle,
    narrationIndex: narrationIndex++,
  });

  // 追加结尾页
  slides.push({
    type: "md_ending",
    heading: "总结",
    summary: `以上就是关于「${docTitle}」的完整内容`,
    callToAction: "关注获取更多技术内容 🔔",
    narrationIndex: narrationIndex++,
  });

  // 重新排列 narrationIndex（确保连续）
  slides.forEach((slide, i) => {
    slide.narrationIndex = i;
  });

  return slides;
}

/**
 * 从 slides 中提取纯文本用于 AI 旁白生成
 */
export function slidesToTextForNarration(slides: MarkdownSlide[]): string[] {
  return slides.map((slide) => {
    switch (slide.type) {
      case "md_title":
        return `这是关于「${slide.heading}」的技术分享。${slide.subtitle || ""}`;
      case "md_content":
        return `${slide.heading}。${slide.points.map((p) => p.text).join("。")}`;
      case "md_code":
        return `接下来看一段 ${slide.language} 代码。${slide.heading}`;
      case "md_ending":
        return slide.summary || `以上就是全部内容。${slide.callToAction || ""}`;
      default:
        return "";
    }
  });
}
