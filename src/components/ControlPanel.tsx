"use client";

import { useState } from "react";
import Link from "next/link";

interface ControlPanelProps {
  onExport?: () => Promise<void>;
  hasVideoData?: boolean;
}

export default function ControlPanel({
  onExport,
  hasVideoData,
}: ControlPanelProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!onExport || isExporting) return;
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside className="w-16 flex flex-col items-center gap-4 py-8 border-l border-outline-variant/10 bg-surface-container-low/30">
      {/* 导出成品 */}
      <div className="group relative">
        <button
          onClick={handleExport}
          disabled={!hasVideoData || isExporting}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
            hasVideoData
              ? "bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(153,247,255,0.15)]"
              : "bg-surface-container-high border border-outline-variant/20 text-on-surface-variant/40 cursor-not-allowed"
          }`}
        >
          <span
            className={`material-symbols-outlined ${isExporting ? "animate-spin" : ""}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isExporting ? "sync" : "movie_creation"}
          </span>
        </button>
        <div className="absolute right-14 top-0 px-2 py-1 bg-surface-container-highest text-[10px] font-bold text-primary border border-primary/20 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {isExporting ? "正在导出..." : "导出成品"}
        </div>
      </div>

      {/* 查看历史记录 */}
      <div className="group relative">
        <Link href="/library">
          <button className="w-10 h-10 rounded-xl bg-surface-container-highest border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(153,247,255,0.15)] transition-all active:scale-90">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              history
            </span>
          </button>
        </Link>
        <div className="absolute right-14 top-0 px-2 py-1 bg-surface-container-highest text-[10px] font-bold text-primary border border-primary/20 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          查看历史记录
        </div>
      </div>

      {/* 模板中心 */}
      <div className="group relative">
        <Link href="/templates">
          <button className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all active:scale-90">
            <span className="material-symbols-outlined">style</span>
          </button>
        </Link>
        <div className="absolute right-14 top-0 px-2 py-1 bg-surface-container-highest text-[10px] font-bold text-primary border border-primary/20 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          模板中心
        </div>
      </div>

      {/* 配音设置 */}
      <div className="group relative">
        <button className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-secondary hover:border-secondary/40 transition-all active:scale-90">
          <span className="material-symbols-outlined">settings_voice</span>
        </button>
        <div className="absolute right-14 top-0 px-2 py-1 bg-surface-container-highest text-[10px] font-bold text-secondary border border-secondary/20 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          配音设置
        </div>
      </div>

      {/* BGM 库 */}
      <div className="group relative">
        <button className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-tertiary hover:border-tertiary/40 transition-all active:scale-90">
          <span className="material-symbols-outlined">library_music</span>
        </button>
        <div className="absolute right-14 top-0 px-2 py-1 bg-surface-container-highest text-[10px] font-bold text-tertiary border border-tertiary/20 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          BGM 库
        </div>
      </div>

      {/* 设置 */}
      <div className="group relative">
        <button className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-white hover:border-white/40 transition-all active:scale-90">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="absolute right-14 top-0 px-2 py-1 bg-surface-container-highest text-[10px] font-bold text-on-surface border border-outline-variant/20 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          设置
        </div>
      </div>

      {/* 帮助 */}
      <div className="mt-auto">
        <button className="w-10 h-10 rounded-xl text-on-surface-variant hover:text-on-surface transition-all active:scale-90">
          <span className="material-symbols-outlined">help</span>
        </button>
      </div>
    </aside>
  );
}
