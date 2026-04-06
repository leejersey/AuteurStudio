"use client";

import React, { useState, useRef, useCallback } from "react";
import type { SlideEditorState, AddableSlideType } from "@/hooks/useSlideEditor";

interface SlideEditorProps {
  editor: SlideEditorState;
}

// ────────────────────────────────────────────
// Slide 缩略卡
// ────────────────────────────────────────────

function SlideThumbnail({
  slide,
  isSelected,
  onSelect,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  slideCount,
}: {
  slide: { index: number; type: string; label: string; icon: string; heading?: string };
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  slideCount: number;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
        onDragOver(e);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false);
        onDrop(e);
      }}
      onClick={onSelect}
      className={`group relative flex-shrink-0 cursor-pointer select-none transition-all duration-200
        ${isDragOver ? "scale-105" : ""}
        ${isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"}`}
    >
      {/* 卡片主体 */}
      <div
        className={`relative w-28 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-200 overflow-hidden
          ${
            isSelected
              ? "border-primary bg-primary/10 shadow-[0_0_16px_rgba(153,247,255,0.12)]"
              : isDragOver
              ? "border-primary/40 bg-primary/5"
              : "border-outline-variant/25 bg-surface-container-high/60 hover:border-outline-variant/50 hover:bg-surface-container-high"
          }`}
      >
        {/* 拖拽手柄 */}
        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 12 }}>
            drag_indicator
          </span>
        </div>

        {/* 序号 */}
        <div
          className={`absolute top-1 right-1.5 text-[9px] font-bold tabular-nums rounded-full w-4 h-4 flex items-center justify-center
            ${isSelected ? "bg-primary/20 text-primary" : "bg-surface-container-highest text-on-surface-variant/60"}`}
        >
          {slide.index + 1}
        </div>

        {/* 图标 */}
        <span
          className={`material-symbols-outlined transition-colors ${
            isSelected ? "text-primary" : "text-on-surface-variant/70"
          }`}
          style={{
            fontSize: 22,
            fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          {slide.icon}
        </span>

        {/* 标签 */}
        <span
          className={`text-[10px] font-bold tracking-wide ${
            isSelected ? "text-primary" : "text-on-surface-variant/60"
          }`}
        >
          {slide.label}
        </span>

        {/* 标题预览 */}
        {slide.heading && (
          <span className="text-[8px] text-on-surface-variant/40 truncate max-w-[90%] px-1">
            {slide.heading.length > 12 ? slide.heading.slice(0, 12) + "…" : slide.heading}
          </span>
        )}

        {/* 删除按钮 — hover 显示 */}
        {slideCount > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-error/90 text-white flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md z-10"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
              close
            </span>
          </button>
        )}
      </div>

      {/* 选中指示器 */}
      {isSelected && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// 添加 Slide 菜单
// ────────────────────────────────────────────

function AddSlideMenu({
  types,
  onAdd,
  isOpen,
  onClose,
}: {
  types: AddableSlideType[];
  onAdd: (type: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute bottom-full mb-2 right-0 z-40
        bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/20
        rounded-xl shadow-[0_-8px_32px_rgba(0,0,0,0.3)] p-2 min-w-44
        animate-in slide-in-from-bottom-2 fade-in duration-200"
      >
        <div className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-wider px-2 py-1">
          选择页面类型
        </div>
        {types.map((t) => (
          <button
            key={t.type}
            onClick={() => {
              onAdd(t.type);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {t.icon}
            </span>
            <span className="text-xs font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════════
// 主组件
// ════════════════════════════════════════════

export default function SlideEditor({ editor }: SlideEditorProps) {
  const { slides, selectedIndex, addableTypes, hasData, selectSlide, reorderSlides, deleteSlide, addSlide } = editor;
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 拖拽排序
  const handleDragStart = useCallback((index: number) => (e: React.DragEvent) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
    // 设置拖拽图像为透明（避免默认的大缩略图）
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);
  }, []);

  const handleDragOver = useCallback(() => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndexRef.current !== null && dragIndexRef.current !== toIndex) {
      reorderSlides(dragIndexRef.current, toIndex);
    }
    dragIndexRef.current = null;
  }, [reorderSlides]);

  if (!hasData || slides.length === 0) {
    return null; // 没有数据时不显示
  }

  return (
    <div className="border-t border-outline-variant/10 bg-surface-container-low/40">
      {/* Slide 导航条 */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Slide 标签 */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="material-symbols-outlined text-on-surface-variant/50"
            style={{ fontSize: 16 }}
          >
            view_carousel
          </span>
          <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider">
            Slides
          </span>
          <span className="text-[10px] text-on-surface-variant/30 font-mono">
            ({slides.length})
          </span>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-8 bg-outline-variant/15 shrink-0" />

        {/* 缩略图滚动区 */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-1 px-1"
        >
          {slides.map((slide) => (
            <SlideThumbnail
              key={`${slide.type}-${slide.index}`}
              slide={slide}
              isSelected={selectedIndex === slide.index}
              onSelect={() => selectSlide(slide.index)}
              onDelete={() => deleteSlide(slide.index)}
              onDragStart={handleDragStart(slide.index)}
              onDragOver={handleDragOver()}
              onDrop={handleDrop(slide.index)}
              slideCount={slides.length}
            />
          ))}
        </div>

        {/* 分隔线 */}
        <div className="w-px h-8 bg-outline-variant/15 shrink-0" />

        {/* 添加按钮 */}
        <div className="relative shrink-0">
          <button
            onClick={() => setAddMenuOpen(!addMenuOpen)}
            className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all
              ${
                addMenuOpen
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-outline-variant/25 text-on-surface-variant/40 hover:border-primary/30 hover:text-primary/70 hover:bg-primary/5"
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              add
            </span>
            <span className="text-[9px] font-bold tracking-wide">添加</span>
          </button>

          <AddSlideMenu
            types={addableTypes}
            onAdd={(type) => addSlide(type, selectedIndex >= 0 ? selectedIndex : undefined)}
            isOpen={addMenuOpen}
            onClose={() => setAddMenuOpen(false)}
          />
        </div>
      </div>

      {/* 选中 Slide 信息栏 */}
      {selectedIndex >= 0 && selectedIndex < slides.length && (
        <div className="flex items-center gap-3 px-6 py-2 border-t border-outline-variant/10 bg-surface-container/30">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
          >
            {slides[selectedIndex].icon}
          </span>
          <span className="text-xs font-bold text-on-surface">
            Slide {selectedIndex + 1}
          </span>
          <span className="text-[10px] text-on-surface-variant/60">
            {slides[selectedIndex].label}
          </span>
          {slides[selectedIndex].heading && (
            <>
              <span className="text-on-surface-variant/20">•</span>
              <span className="text-[10px] text-on-surface-variant/50 truncate max-w-[200px]">
                {slides[selectedIndex].heading}
              </span>
            </>
          )}

          {/* 图片信息 */}
          {slides[selectedIndex].imageUrl && (
            <>
              <span className="text-on-surface-variant/20">•</span>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-5 rounded overflow-hidden border border-outline-variant/20 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slides[selectedIndex].imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="material-symbols-outlined text-primary/60" style={{ fontSize: 12 }}>
                  image
                </span>
                {slides[selectedIndex].imageCredit && (
                  <span className="text-[9px] text-on-surface-variant/40">
                    📷 {slides[selectedIndex].imageCredit}
                  </span>
                )}
              </div>
            </>
          )}

          {/* 快捷操作 */}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => {
                if (selectedIndex > 0) reorderSlides(selectedIndex, selectedIndex - 1);
              }}
              disabled={selectedIndex <= 0}
              className="w-6 h-6 rounded-md flex items-center justify-center text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                chevron_left
              </span>
            </button>
            <button
              onClick={() => {
                if (selectedIndex < slides.length - 1) reorderSlides(selectedIndex, selectedIndex + 1);
              }}
              disabled={selectedIndex >= slides.length - 1}
              className="w-6 h-6 rounded-md flex items-center justify-center text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                chevron_right
              </span>
            </button>
            <div className="w-px h-4 bg-outline-variant/15 mx-1" />
            <button
              onClick={() => deleteSlide(selectedIndex)}
              disabled={slides.length <= 1}
              className="w-6 h-6 rounded-md flex items-center justify-center text-on-surface-variant/50 hover:text-error hover:bg-error/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                delete
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
