"use client";

import React from "react";

// ─── 模板信息（客户端硬编码，避免导入 Remotion 模块） ───

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
}

const ALL_TEMPLATES: TemplateOption[] = [
  {
    id: "dark-tech",
    name: "暗黑科技",
    description: "深色背景 + 科技感光效 + 网格纹理",
    thumbnail: "linear-gradient(135deg, #0b0e14 0%, #161a21 40%, #00e2ee22 100%)",
  },
  {
    id: "minimal-white",
    name: "极简白色",
    description: "白色背景 + 衬线标题 + 卡片式排版",
    thumbnail: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 50%, #3b82f615 100%)",
  },
];

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function TemplateSelector({ selectedId, onSelect }: TemplateSelectorProps) {
  return (
    <div className="template-selector" id="template-selector">
      <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-wider mb-3">
        选择视频模板
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {ALL_TEMPLATES.map((tpl) => {
          const isSelected = tpl.id === selectedId;
          return (
            <button
              key={tpl.id}
              id={`template-option-${tpl.id}`}
              onClick={() => onSelect(tpl.id)}
              className={`flex-shrink-0 w-[140px] rounded-xl border-2 transition-all duration-200 text-left overflow-hidden ${
                isSelected
                  ? "border-primary shadow-lg shadow-primary/15 scale-[1.02]"
                  : "border-outline-variant/20 hover:border-outline-variant/40"
              }`}
              style={{ outline: "none" }}
            >
              {/* 缩略图预览 */}
              <div
                className="h-[80px] w-full rounded-t-[10px]"
                style={{ background: tpl.thumbnail }}
              >
                {/* 模拟视频排版预览 */}
                <div className="w-full h-full flex flex-col justify-center items-center p-3 gap-1">
                  {tpl.id === "dark-tech" ? (
                    <>
                      <div className="w-10 h-1 rounded bg-white/20" />
                      <div className="w-16 h-2 rounded bg-white/30" />
                      <div className="w-12 h-1 rounded bg-white/15 mt-1" />
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-2 rounded bg-gray-900/20 self-start ml-2" />
                      <div className="w-8 h-0.5 rounded bg-blue-500/30 self-start ml-2 mt-0.5" />
                      <div className="w-16 h-1 rounded bg-gray-900/10 self-start ml-2 mt-1" />
                    </>
                  )}
                </div>
              </div>

              {/* 名称 */}
              <div className="px-3 py-2.5">
                <p className={`text-xs font-bold ${isSelected ? "text-primary" : "text-on-surface"}`}>
                  {tpl.name}
                </p>
                <p className="text-[10px] text-on-surface-variant/60 mt-0.5 leading-snug line-clamp-2">
                  {tpl.description}
                </p>
              </div>

              {/* 选中标记 */}
              {isSelected && (
                <div className="px-3 pb-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    已选择
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
