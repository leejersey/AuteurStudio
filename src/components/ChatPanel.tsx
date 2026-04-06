"use client";

import { useState } from "react";
import WorkflowStepper from "./workflow/WorkflowStepper";
import TopicSelector from "./workflow/TopicSelector";
import ScriptEditor from "./workflow/ScriptEditor";
import VideoGenerator from "./workflow/VideoGenerator";
import MarkdownInput from "./workflow/MarkdownInput";
import TemplateSelector from "./workflow/TemplateSelector";
import type {
  WorkflowStage,
  TopicSuggestion,
  VideoScript,
} from "@/lib/types/workflow";
import type { CodeTheme } from "@/lib/types/markdown-video";

interface ChatPanelProps {
  // 工作流状态
  stage: WorkflowStage;
  isLoading: boolean;
  error: string | null;

  // 阶段 1: 选题
  topics: TopicSuggestion[];
  selectedTopic: TopicSuggestion | null;
  videoType: "card" | "landscape" | "markdown";

  // 阶段 2: 文案
  script: VideoScript | null;

  // 工作流操作
  onGenerateTopics: (intent: string, videoType: "card" | "landscape" | "markdown") => void;
  onSelectTopic: (topic: TopicSuggestion) => void;
  onRegenerateTopics: () => void;
  onGenerateScript: (notes?: string) => void;
  onUpdateScript: (script: VideoScript) => void;
  onConfirmAndGenerate: () => void;
  onGoBack: () => void;
  onReset: () => void;

  // Markdown 模式
  onGenerateFromMarkdown: (markdown: string, theme: CodeTheme) => void;

  // 模板
  templateId: string;
  onTemplateChange: (id: string) => void;
}

export default function ChatPanel({
  stage,
  isLoading,
  error,
  topics,
  selectedTopic,
  videoType: initialVideoType,
  script,
  onGenerateTopics,
  onSelectTopic,
  onRegenerateTopics,
  onGenerateScript,
  onUpdateScript,
  onConfirmAndGenerate,
  onGoBack,
  onReset,
  onGenerateFromMarkdown,
  templateId,
  onTemplateChange,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [videoType, setVideoType] = useState<"card" | "landscape" | "markdown">(
    initialVideoType || "card"
  );

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onGenerateTopics(input.trim(), videoType);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="w-[35%] flex flex-col bg-surface-container-low/80 backdrop-blur-2xl border-r border-white/5 min-w-[320px] min-h-0 overflow-hidden shadow-[4px_0_32px_rgba(0,0,0,0.2)]">
      {/* Top Bar */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-lg">
              psychology
            </span>
          </div>
          <div>
            <h2 className="text-sm font-bold font-headline tracking-tight text-on-surface">
              DeepSeek AI
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary primary-glow animate-pulse"></span>
              <span className="text-[10px] text-primary/70 uppercase font-bold tracking-tighter">
                {isLoading ? "思考中" : "就绪"}
              </span>
            </div>
          </div>
        </div>

        {/* 重新开始按钮 (仅在非 idle 阶段显示) */}
        {stage !== "idle" && (
          <button
            onClick={onReset}
            className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-error rounded-md hover:bg-error/5 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">
              restart_alt
            </span>
            重新开始
          </button>
        )}
      </div>

      {/* Stepper (仅在非 idle 阶段显示) */}
      {stage !== "idle" && <WorkflowStepper currentStage={stage} />}

      {/* ─── 阶段内容区 ─── */}

      {/* Idle: 初始输入 */}
      {stage === "idle" && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Markdown 模式 */}
          {videoType === "markdown" ? (
            <>
              {/* 视频类型切换器 — 固定在顶部 */}
              <div className="px-8 pt-6 pb-3 flex justify-center">
                <VideoTypeSelector videoType={videoType} onChange={setVideoType} />
              </div>
              <MarkdownInput
                isLoading={isLoading}
                onSubmit={onGenerateFromMarkdown}
              />
            </>
          ) : (
            <>
              {/* 普通模式 */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-5xl text-primary/30 mb-4">
                    auto_awesome
                  </span>
                  <p className="text-sm text-on-surface-variant mb-1">
                    描述你想创作的视频方向
                  </p>
                  <p className="text-xs text-on-surface-variant/50 mb-6">
                    AI 会先帮你生成几个选题方向，你选择后再深入创作
                  </p>

                  {/* 视频类型切换 */}
                  <VideoTypeSelector videoType={videoType} onChange={setVideoType} />

                  {/* 模板选择器 */}
                  <div className="w-full max-w-xs mt-4">
                    <TemplateSelector
                      selectedId={templateId}
                      onSelect={onTemplateChange}
                    />
                  </div>

                  {/* 快捷示例 */}
                  <div className="space-y-2 w-full max-w-xs mt-6">
                    {[
                      "做一个关于 AI Agent 的科普视频",
                      "新能源汽车行业趋势分析",
                      "用最简单的方式讲解 RAG",
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => {
                          setInput(example);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-on-surface-variant/60 hover:text-primary bg-surface-container-high/30 hover:bg-primary/5 rounded-lg transition-all border border-transparent hover:border-primary/20"
                      >
                        💡 {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input Area — 固定在底部 */}
              <div className="p-4 border-t border-white/5 shrink-0 bg-transparent">
                <div className="relative">
                  <textarea
                    className="w-full bg-surface-container-highest/50 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none h-24 shadow-inner"
                    placeholder="描述你想要的视频方向..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                  <button
                    className="absolute bottom-4 right-4 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-40 shadow-[0_0_20px_rgba(153,247,255,0.3)] hover:shadow-[0_0_30px_rgba(153,247,255,0.6)]"
                    onClick={handleSubmit}
                    disabled={!input.trim() || isLoading}
                  >
                    <span className={`material-symbols-outlined text-sm ${isLoading ? "animate-spin" : ""}`}>
                      {isLoading ? "sync" : "send"}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Topics: 选题阶段 */}
      {stage === "topics" && (
        <TopicSelector
          topics={topics}
          selectedTopic={selectedTopic}
          isLoading={isLoading}
          onSelect={onSelectTopic}
          onConfirm={() => onGenerateScript()}
          onRegenerate={onRegenerateTopics}
        />
      )}

      {/* Script: 文案编辑阶段 */}
      {stage === "script" && script && (
        <ScriptEditor
          script={script}
          isLoading={isLoading}
          onUpdate={onUpdateScript}
          onConfirm={onConfirmAndGenerate}
          onBack={onGoBack}
        />
      )}

      {/* Video: 视频生成阶段 */}
      {stage === "video" && (
        <VideoGenerator
          isLoading={isLoading}
          error={error}
          onBack={onGoBack}
        />
      )}

      {/* Done: 完成 */}
      {stage === "done" && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span
              className="material-symbols-outlined text-primary text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
            视频已生成 🎉
          </h3>
          <p className="text-xs text-on-surface-variant mb-6 max-w-xs">
            视频数据已生成并保存到项目库，你可以在右侧预览面板查看效果。
          </p>
          <button
            onClick={onReset}
            className="px-6 py-2.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2 border border-primary/20"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            创建新视频
          </button>
        </div>
      )}
    </section>
  );
}

// ─── 视频类型选择器 ───

function VideoTypeSelector({
  videoType,
  onChange,
}: {
  videoType: "card" | "landscape" | "markdown";
  onChange: (type: "card" | "landscape" | "markdown") => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-surface-container-highest rounded-lg p-0.5">
      <button
        onClick={() => onChange("card")}
        className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
          videoType === "card"
            ? "bg-primary text-on-primary-fixed"
            : "text-on-surface-variant hover:text-primary"
        }`}
      >
        9:16 图文
      </button>
      <button
        onClick={() => onChange("landscape")}
        className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
          videoType === "landscape"
            ? "bg-secondary text-on-secondary"
            : "text-on-surface-variant hover:text-secondary"
        }`}
      >
        16:9 横屏
      </button>
      <button
        onClick={() => onChange("markdown")}
        className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
          videoType === "markdown"
            ? "bg-tertiary text-white"
            : "text-on-surface-variant hover:text-tertiary"
        }`}
      >
        📝 Markdown
      </button>
    </div>
  );
}
