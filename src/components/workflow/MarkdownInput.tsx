"use client";

import { useState, useRef } from "react";
import type { CodeTheme } from "@/lib/types/markdown-video";

const THEME_OPTIONS: { id: CodeTheme; name: string; color: string; bg: string }[] = [
  { id: "dracula", name: "Dracula", color: "#ff79c6", bg: "#282a36" },
  { id: "github-light", name: "GitHub", color: "#d73a49", bg: "#ffffff" },
  { id: "one-dark", name: "One Dark", color: "#c678dd", bg: "#282c34" },
  { id: "monokai", name: "Monokai", color: "#f92672", bg: "#272822" },
];

const EXAMPLE_MD = `# Python 装饰器完全指南

装饰器是 Python 最强大的特性之一，它可以在不修改函数代码的情况下扩展功能。

## 什么是装饰器

装饰器本质上是一个接受函数作为参数的函数，返回一个新函数。

\`\`\`python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("函数执行前")
        result = func(*args, **kwargs)
        print("函数执行后")
        return result
    return wrapper

@my_decorator
def hello():
    print("Hello, World!")
\`\`\`

## 实际应用场景

- 计时装饰器：测量函数执行时间
- 缓存装饰器：避免重复计算
- 权限校验：API 接口鉴权
- 日志记录：自动记录调用信息

## 带参数的装饰器

\`\`\`python
def repeat(n):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello, {name}!")
\`\`\`
`;

interface MarkdownInputProps {
  isLoading: boolean;
  onSubmit: (markdown: string, theme: CodeTheme) => void;
}

export default function MarkdownInput({
  isLoading,
  onSubmit,
}: MarkdownInputProps) {
  const [markdown, setMarkdown] = useState("");
  const [theme, setTheme] = useState<CodeTheme>("dracula");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") {
        setMarkdown(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!markdown.trim() || isLoading) return;
    onSubmit(markdown, theme);
  };

  const lineCount = markdown.split("\n").length;
  const codeBlockCount = (markdown.match(/```/g) || []).length / 2;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* 工具栏 */}
      <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between gap-2">
        {/* 模式切换 */}
        <div className="flex items-center gap-1 bg-surface-container-highest rounded-md p-0.5">
          <button
            onClick={() => setMode("edit")}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${
              mode === "edit"
                ? "bg-primary text-on-primary-fixed"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            编辑
          </button>
          <button
            onClick={() => setMode("preview")}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${
              mode === "preview"
                ? "bg-primary text-on-primary-fixed"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            预览
          </button>
        </div>

        {/* 上传 + 示例 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMarkdown(EXAMPLE_MD)}
            className="px-2 py-1 text-[10px] font-bold text-on-surface-variant hover:text-secondary rounded hover:bg-secondary/5 transition-all"
          >
            💡 示例
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 text-[10px] font-bold text-on-surface-variant hover:text-primary rounded hover:bg-primary/5 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">
              upload_file
            </span>
            上传 .md
          </button>
        </div>
      </div>

      {/* 编辑器 / 预览 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {mode === "edit" ? (
          <textarea
            className="w-full h-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/30 p-4 text-sm font-mono resize-none focus:outline-none leading-relaxed"
            placeholder={`粘贴 Markdown 内容...\n\n# 标题\n## 章节\n\n正文内容\n\n\`\`\`python\nprint("代码块")\n\`\`\``}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            disabled={isLoading}
            spellCheck={false}
          />
        ) : (
          <div className="w-full h-full overflow-auto p-4 text-sm text-on-surface-variant">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
              {markdown || "（空）"}
            </pre>
          </div>
        )}
      </div>

      {/* 统计 */}
      {markdown && (
        <div className="px-4 py-2 border-t border-outline-variant/10 flex items-center gap-4 text-[10px] text-on-surface-variant/60 font-mono">
          <span>{lineCount} 行</span>
          <span>{markdown.length} 字符</span>
          <span>{Math.floor(codeBlockCount)} 个代码块</span>
        </div>
      )}

      {/* 主题选择 + 提交 */}
      <div className="p-4 border-t border-outline-variant/10 space-y-3">
        {/* 代码主题 */}
        <div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            代码主题
          </p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                  theme === opt.id
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-outline-variant/20 hover:border-outline-variant/40"
                }`}
                style={{
                  background: opt.bg,
                  color: opt.color,
                }}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={!markdown.trim() || isLoading}
          className="w-full py-3 rounded-xl bg-primary text-on-primary-fixed text-sm font-bold uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-lg animate-spin">
                sync
              </span>
              解析中...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">
                play_arrow
              </span>
              解析并生成旁白
            </>
          )}
        </button>
      </div>
    </div>
  );
}
