import { createHighlighter, type Highlighter, type BundledTheme, type BundledLanguage } from "shiki";

export interface HighlightedToken {
  content: string;
  color: string;
  italic?: boolean;
  bold?: boolean;
}

export interface HighlightedCode {
  bg: string;
  fg: string;
  lines: HighlightedToken[][];
}

const highlighterCache = new Map<string, Promise<Highlighter>>();

async function getCachedHighlighter(theme: BundledTheme, lang: BundledLanguage): Promise<Highlighter> {
  const key = `${theme}::${lang}`;
  let pending = highlighterCache.get(key);
  if (!pending) {
    pending = createHighlighter({
      themes: [theme],
      langs: [lang],
    });
    highlighterCache.set(key, pending);
  }
  return pending;
}

/**
 * 构建期 Shiki 语法高亮：将源码确定性地转为逐行带颜色 Token 数组，
 * 渲染期零运行时脚本依赖、零外网请求。
 */
export async function highlightCode(
  code: string,
  language: string,
  theme: BundledTheme = "dracula",
): Promise<HighlightedCode> {
  const lang = language.toLowerCase() as BundledLanguage;
  const highlighter = await getCachedHighlighter(theme, lang);
  const result = highlighter.codeToTokens(code, {
    lang,
    theme,
  });

  const fg = result.fg || "#c0caf5";
  const bg = result.bg || "#1a1b26";

  const lines: HighlightedToken[][] = result.tokens.map((lineTokens) =>
    lineTokens.map((token) => ({
      content: token.content,
      color: token.color || fg,
      italic: token.fontStyle !== undefined ? (token.fontStyle & 1) !== 0 : false,
      bold: token.fontStyle !== undefined ? (token.fontStyle & 2) !== 0 : false,
    })),
  );

  return { bg, fg, lines };
}
