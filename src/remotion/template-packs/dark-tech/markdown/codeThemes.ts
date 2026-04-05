// src/remotion/markdown/codeThemes.ts — 4 套代码主题颜色定义

export interface CodeThemeColors {
  name: string;
  background: string;
  foreground: string;
  lineNumber: string;
  lineNumberActive: string;
  cursor: string;
  selection: string;
  // 语法高亮
  keyword: string;     // if, for, return, function, const ...
  string: string;      // "hello", 'world'
  comment: string;     // // ..., /* ... */
  number: string;      // 123, 0xff
  operator: string;    // =, +, -, >, <
  function: string;    // functionName(
  className: string;   // ClassName, TypeName
  // 装饰
  headerBg: string;
  headerText: string;
  headerDot1: string;
  headerDot2: string;
  headerDot3: string;
}

export const CODE_THEMES: Record<string, CodeThemeColors> = {
  dracula: {
    name: "Dracula",
    background: "#282a36",
    foreground: "#f8f8f2",
    lineNumber: "#6272a4",
    lineNumberActive: "#f8f8f2",
    cursor: "#f8f8f2",
    selection: "#44475a",
    keyword: "#ff79c6",
    string: "#f1fa8c",
    comment: "#6272a4",
    number: "#bd93f9",
    operator: "#ff79c6",
    function: "#50fa7b",
    className: "#8be9fd",
    headerBg: "#21222c",
    headerText: "#6272a4",
    headerDot1: "#ff5555",
    headerDot2: "#f1fa8c",
    headerDot3: "#50fa7b",
  },

  "github-light": {
    name: "GitHub Light",
    background: "#ffffff",
    foreground: "#24292e",
    lineNumber: "#babbbd",
    lineNumberActive: "#24292e",
    cursor: "#24292e",
    selection: "#c8e1ff",
    keyword: "#d73a49",
    string: "#032f62",
    comment: "#6a737d",
    number: "#005cc5",
    operator: "#d73a49",
    function: "#6f42c1",
    className: "#005cc5",
    headerBg: "#f6f8fa",
    headerText: "#586069",
    headerDot1: "#ff5f57",
    headerDot2: "#febc2e",
    headerDot3: "#28c840",
  },

  "one-dark": {
    name: "One Dark",
    background: "#282c34",
    foreground: "#abb2bf",
    lineNumber: "#495162",
    lineNumberActive: "#abb2bf",
    cursor: "#528bff",
    selection: "#3e4451",
    keyword: "#c678dd",
    string: "#98c379",
    comment: "#5c6370",
    number: "#d19a66",
    operator: "#56b6c2",
    function: "#61afef",
    className: "#e5c07b",
    headerBg: "#21252b",
    headerText: "#5c6370",
    headerDot1: "#e06c75",
    headerDot2: "#e5c07b",
    headerDot3: "#98c379",
  },

  monokai: {
    name: "Monokai",
    background: "#272822",
    foreground: "#f8f8f2",
    lineNumber: "#75715e",
    lineNumberActive: "#f8f8f2",
    cursor: "#f8f8f0",
    selection: "#49483e",
    keyword: "#f92672",
    string: "#e6db74",
    comment: "#75715e",
    number: "#ae81ff",
    operator: "#f92672",
    function: "#a6e22e",
    className: "#66d9ef",
    headerBg: "#1e1f1c",
    headerText: "#75715e",
    headerDot1: "#ff5f57",
    headerDot2: "#febc2e",
    headerDot3: "#28c840",
  },
};

/**
 * 轻量级语法高亮 — 将代码行拆分为带颜色的 token
 */
export interface CodeToken {
  text: string;
  color: string;
}

export function tokenizeLine(
  line: string,
  theme: CodeThemeColors
): CodeToken[] {
  const tokens: CodeToken[] = [];
  let remaining = line;

  // 简单的正则规则
  const rules: [RegExp, string][] = [
    // 注释
    [/^(\/\/.*)/, theme.comment],
    [/^(#.*)/, theme.comment],
    // 字符串
    [/^("(?:[^"\\]|\\.)*")/, theme.string],
    [/^('(?:[^'\\]|\\.)*')/, theme.string],
    [/^(`(?:[^`\\]|\\.)*`)/, theme.string],
    // 数字
    [/^(\b\d+\.?\d*\b)/, theme.number],
    // 关键词
    [
      /^(\b(?:const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|typeof|interface|type|def|self|print|True|False|None|in|not|and|or|with|as|yield|lambda|raise|finally|pass|break|continue|elif|except|pub|fn|struct|impl|use|mod|match|enum|mut|loop|ref|static|super|extends|implements|abstract|final|public|private|protected|void|int|float|double|char|boolean|string|null|undefined|true|false|package|require)\b)/,
      theme.keyword,
    ],
    // 函数名 (identifier followed by parenthesis)
    [/^(\b[a-zA-Z_]\w*(?=\s*\())/, theme.function],
    // 类名 (PascalCase)
    [/^(\b[A-Z][a-zA-Z0-9]*\b)/, theme.className],
    // 操作符
    [/^([=+\-*/<>!&|^~%?:]+)/, theme.operator],
    // 普通文本
    [/^(\s+)/, theme.foreground],
    [/^([a-zA-Z_]\w*)/, theme.foreground],
    [/^(.)/, theme.foreground],
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const [regex, color] of rules) {
      const match = remaining.match(regex);
      if (match) {
        tokens.push({ text: match[1], color });
        remaining = remaining.slice(match[1].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ text: remaining[0], color: theme.foreground });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}
