"use client";

import type { TopicSuggestion } from "@/lib/types/workflow";

interface TopicSelectorProps {
  topics: TopicSuggestion[];
  selectedTopic: TopicSuggestion | null;
  isLoading: boolean;
  onSelect: (topic: TopicSuggestion) => void;
  onConfirm: (notes?: string) => void;
  onRegenerate: () => void;
}

export default function TopicSelector({
  topics,
  selectedTopic,
  isLoading,
  onSelect,
  onConfirm,
  onRegenerate,
}: TopicSelectorProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 text-primary mb-1">
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lightbulb
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest">
            选题方向
          </span>
        </div>
        <p className="text-xs text-on-surface-variant">
          AI 为你生成了 {topics.length} 个选题方向，选择一个继续创作
        </p>
      </div>

      {/* Topic Cards */}
      <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4 scrollbar-hide">
        {topics.map((topic) => {
          const isSelected = selectedTopic?.id === topic.id;

          return (
            <button
              key={topic.id}
              onClick={() => onSelect(topic)}
              className={`
                w-full text-left p-4 rounded-xl border transition-all duration-300 group
                ${
                  isSelected
                    ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(153,247,255,0.08)]"
                    : "bg-surface-container-low border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container-high"
                }
              `}
            >
              {/* Title Row */}
              <div className="flex items-start justify-between mb-2">
                <h3
                  className={`font-headline font-bold text-sm ${
                    isSelected ? "text-primary" : "text-on-surface"
                  }`}
                >
                  {topic.title}
                </h3>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 mt-0.5 transition-all ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-outline-variant/30"
                  }`}
                >
                  {isSelected && (
                    <span className="material-symbols-outlined text-on-primary text-xs">
                      check
                    </span>
                  )}
                </div>
              </div>

              {/* Angle */}
              <p className="text-[11px] text-on-surface-variant mb-2">
                <span className="text-secondary/70 font-bold">切入角度：</span>
                {topic.angle}
              </p>

              {/* Hook Line */}
              <div className="bg-surface-container-lowest/60 rounded-lg p-2.5 mb-2 border border-outline-variant/5">
                <p className="text-[10px] text-on-surface-variant/50 uppercase font-bold tracking-wider mb-1">
                  开篇 Hook
                </p>
                <p className="text-xs text-on-surface italic leading-relaxed">
                  「{topic.hookLine}」
                </p>
              </div>

              {/* Key Points */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {topic.keyPoints.map((point, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-surface-container-highest/50 rounded text-[9px] text-on-surface-variant"
                  >
                    {point}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-[9px] text-on-surface-variant/50 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">
                    group
                  </span>
                  {topic.targetAudience}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">
                    timer
                  </span>
                  {topic.estimatedDuration}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="p-4 border-t border-outline-variant/10 bg-surface-container-low/50 flex items-center gap-3">
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-lg bg-surface-container-highest border border-outline-variant/20 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all disabled:opacity-40 flex items-center gap-1.5"
        >
          <span className={`material-symbols-outlined text-sm ${isLoading ? "animate-spin" : ""}`}>
            {isLoading ? "sync" : "refresh"}
          </span>
          重新生成
        </button>
        <button
          onClick={() => onConfirm()}
          disabled={!selectedTopic || isLoading}
          className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest hover:bg-primary-dim transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
          生成文案
        </button>
      </div>
    </div>
  );
}
