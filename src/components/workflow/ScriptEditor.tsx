"use client";

import { useState } from "react";
import type { VideoScript, ScriptSlide } from "@/lib/types/workflow";

interface ScriptEditorProps {
  script: VideoScript;
  isLoading: boolean;
  onUpdate: (script: VideoScript) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export default function ScriptEditor({
  script,
  isLoading,
  onUpdate,
  onConfirm,
  onBack,
}: ScriptEditorProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const currentSlide = script.slides[activeSlide];

  const updateSlide = (index: number, updates: Partial<ScriptSlide>) => {
    const newSlides = [...script.slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    onUpdate({ ...script, slides: newSlides });
  };

  const updateTitle = (title: string) => {
    onUpdate({ ...script, title });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 text-secondary mb-1">
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            edit_note
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest">
            文案编辑
          </span>
        </div>
        <p className="text-xs text-on-surface-variant">
          审核并编辑每页的内容和旁白，确认后生成视频
        </p>
      </div>

      {/* Title Editor */}
      <div className="px-5 mb-3">
        <label className="text-[9px] text-on-surface-variant/50 uppercase font-bold tracking-wider mb-1 block">
          视频标题
        </label>
        <input
          className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2 text-sm font-headline font-bold text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
          value={script.title}
          onChange={(e) => updateTitle(e.target.value)}
        />
      </div>

      {/* Slide Tabs */}
      <div className="px-5 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {script.slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`
              px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0
              ${
                activeSlide === i
                  ? "bg-secondary/15 text-secondary border border-secondary/30"
                  : "bg-surface-container-high text-on-surface-variant/50 hover:text-on-surface"
              }
            `}
          >
            {i === 0
              ? "标题页"
              : i === script.slides.length - 1
              ? "结尾页"
              : `第${i}页`}
          </button>
        ))}
      </div>

      {/* Active Slide Editor */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 scrollbar-hide">
        {currentSlide && (
          <>
            {/* Heading */}
            <div>
              <label className="text-[9px] text-on-surface-variant/50 uppercase font-bold tracking-wider mb-1 block">
                页面标题
              </label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-secondary/50 transition-colors"
                value={currentSlide.heading}
                onChange={(e) =>
                  updateSlide(activeSlide, { heading: e.target.value })
                }
              />
            </div>

            {/* Body Text */}
            <div>
              <label className="text-[9px] text-on-surface-variant/50 uppercase font-bold tracking-wider mb-1 block">
                正文内容
              </label>
              <textarea
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-secondary/50 transition-colors resize-none h-20"
                value={currentSlide.bodyText}
                onChange={(e) =>
                  updateSlide(activeSlide, { bodyText: e.target.value })
                }
              />
            </div>

            {/* Narration */}
            <div>
              <label className="text-[9px] text-on-surface-variant/50 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[11px] text-tertiary">
                  mic
                </span>
                旁白文本
              </label>
              <textarea
                className="w-full bg-tertiary/5 border border-tertiary/15 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-tertiary/50 transition-colors resize-none h-24 italic"
                value={currentSlide.narration}
                onChange={(e) =>
                  updateSlide(activeSlide, { narration: e.target.value })
                }
                placeholder="这段旁白会被合成为语音..."
              />
              <p className="text-[9px] text-on-surface-variant/30 mt-1">
                约 {Math.ceil(currentSlide.narration.length / 4)} 秒 ·{" "}
                {currentSlide.narration.length} 字
              </p>
            </div>

            {/* Visual Note */}
            {currentSlide.visualNote !== undefined && (
              <div>
                <label className="text-[9px] text-on-surface-variant/50 uppercase font-bold tracking-wider mb-1 block">
                  视觉备注（可选）
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg px-3 py-2 text-xs text-on-surface-variant focus:outline-none focus:border-outline-variant/30 transition-colors"
                  value={currentSlide.visualNote || ""}
                  onChange={(e) =>
                    updateSlide(activeSlide, { visualNote: e.target.value })
                  }
                  placeholder="给设计参考的备注..."
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Slide Navigation */}
      <div className="px-5 py-2 flex items-center justify-between border-t border-outline-variant/5">
        <button
          onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
          disabled={activeSlide === 0}
          className="text-on-surface-variant/50 hover:text-primary disabled:opacity-20 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">
            chevron_left
          </span>
        </button>
        <span className="text-[10px] text-on-surface-variant/40 font-bold">
          {activeSlide + 1} / {script.slides.length}
        </span>
        <button
          onClick={() =>
            setActiveSlide(Math.min(script.slides.length - 1, activeSlide + 1))
          }
          disabled={activeSlide === script.slides.length - 1}
          className="text-on-surface-variant/50 hover:text-primary disabled:opacity-20 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">
            chevron_right
          </span>
        </button>
      </div>

      {/* Action Bar */}
      <div className="p-4 border-t border-outline-variant/10 bg-surface-container-low/50 flex items-center gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-lg bg-surface-container-highest border border-outline-variant/20 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">
            arrow_back
          </span>
          返回选题
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest hover:bg-primary-dim transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <span
            className={`material-symbols-outlined text-sm ${isLoading ? "animate-spin" : ""}`}
          >
            {isLoading ? "sync" : "movie_creation"}
          </span>
          {isLoading ? "生成中..." : "确认文案，生成视频"}
        </button>
      </div>
    </div>
  );
}
