"use client";

import React, { useState } from "react";
import type { TemplateConfigState } from "@/hooks/useTemplateConfig";
import type {
  TemplateThemeAnimation,
  TemplateThemeDecoration,
  TemplateThemeElementAnimation,
  TemplateThemeEffects,
  TemplateThemeLayout,
} from "@/remotion/template-theme";

// ────────────────────────────────────────────
// Props
// ────────────────────────────────────────────

interface TemplateConfigPanelProps {
  config: TemplateConfigState;
  isOpen: boolean;
  onClose: () => void;
}

// ────────────────────────────────────────────
// Tab 定义
// ────────────────────────────────────────────

type TabId = "colors" | "typography" | "animation" | "elements" | "effects" | "decoration";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "colors", label: "配色", icon: "palette" },
  { id: "typography", label: "排版", icon: "text_fields" },
  { id: "animation", label: "动画", icon: "animation" },
  { id: "elements", label: "元素", icon: "interests" },
  { id: "effects", label: "特效", icon: "blur_on" },
  { id: "decoration", label: "装饰", icon: "auto_awesome" },
];

// ────────────────────────────────────────────
// 预设列表
// ────────────────────────────────────────────

const PRESETS = [
  {
    id: "dark-tech",
    name: "暗黑科技",
    gradient: "linear-gradient(135deg, #0b0e14 0%, #161a21 50%, #99f7ff 200%)",
    accent: "#99f7ff",
  },
  {
    id: "minimal-white",
    name: "极简白",
    gradient: "linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #3b82f6 200%)",
    accent: "#3b82f6",
  },
];

// ────────────────────────────────────────────
// 小组件：颜色选择器
// ────────────────────────────────────────────

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 group">
      <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-on-surface-variant/60 font-mono uppercase">
          {value}
        </span>
        <label className="relative cursor-pointer">
          <div
            className="w-7 h-7 rounded-lg border border-outline-variant/40 shadow-sm hover:shadow-md hover:scale-110 transition-all"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// 小组件：滑块
// ────────────────────────────────────────────

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-on-surface-variant">{label}</span>
        <span className="text-[10px] text-primary font-mono font-bold tabular-nums">
          {value}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3.5
            [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(153,247,255,0.4)]
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-primary/60
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-125
            [&::-webkit-slider-thumb]:relative
            [&::-webkit-slider-thumb]:z-10"
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--color-outline-variant) ${percentage}%, var(--color-outline-variant) 100%)`,
          }}
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// 小组件：下拉选择
// ────────────────────────────────────────────

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-on-surface-variant">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-surface-container-high border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ────────────────────────────────────────────
// 小组件：开关
// ────────────────────────────────────────────

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-on-surface-variant">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-9 h-5 rounded-full transition-all duration-200 ${
          value
            ? "bg-primary/30 border-primary/50"
            : "bg-surface-container-high border-outline-variant/40"
        } border`}
      >
        <div
          className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-200 ${
            value
              ? "left-[18px] bg-primary shadow-[0_0_6px_rgba(153,247,255,0.4)]"
              : "left-0.5 bg-on-surface-variant/60"
          }`}
        />
      </button>
    </div>
  );
}

// ────────────────────────────────────────────
// 分割线
// ────────────────────────────────────────────

function Divider({ label, icon }: { label?: string; icon?: string }) {
  if (label) {
    return (
      <div className="flex items-center gap-2 my-4">
        <div className="flex-1 h-px bg-outline-variant/20" />
        {icon && (
          <span
            className="material-symbols-outlined text-primary/50"
            style={{ fontSize: 13, fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        )}
        <span className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider font-bold">
          {label}
        </span>
        <div className="flex-1 h-px bg-outline-variant/20" />
      </div>
    );
  }
  return <div className="h-px bg-outline-variant/20 my-3" />;
}

// ────────────────────────────────────────────
// 配色 Tab
// ────────────────────────────────────────────

function ColorsTab({ config }: { config: TemplateConfigState }) {
  const { mergedTheme, updateColor, switchPreset, templateId } = config;

  return (
    <div className="space-y-3">
      {/* 快速预设 */}
      <Divider label="快速预设" icon="style" />
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => switchPreset(preset.id)}
            className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
              templateId === preset.id
                ? "border-primary/50 bg-primary/5 shadow-[0_0_12px_rgba(153,247,255,0.08)]"
                : "border-outline-variant/20 bg-surface-container-high/50 hover:border-outline-variant/40 hover:bg-surface-container-high"
            }`}
          >
            <div
              className="w-5 h-5 rounded-md border border-white/10 shrink-0"
              style={{ background: preset.gradient }}
            />
            <span className="text-[11px] font-medium text-on-surface truncate">
              {preset.name}
            </span>
            {templateId === preset.id && (
              <span className="material-symbols-outlined text-primary text-sm ml-auto" style={{ fontSize: 14 }}>
                check_circle
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 主要配色 */}
      <Divider label="主题色" icon="colorize" />
      <div className="space-y-3">
        <ColorField
          label="主强调色"
          value={mergedTheme.colors.primary}
          onChange={(v) => updateColor("primary", v)}
        />
        <ColorField
          label="辅助色"
          value={mergedTheme.colors.secondary}
          onChange={(v) => updateColor("secondary", v)}
        />
        <ColorField
          label="第三色"
          value={mergedTheme.colors.tertiary}
          onChange={(v) => updateColor("tertiary", v)}
        />
      </div>

      {/* 背景与文字 */}
      <Divider label="背景与文字" icon="format_paint" />
      <div className="space-y-3">
        <ColorField
          label="背景色"
          value={mergedTheme.colors.background}
          onChange={(v) => updateColor("background", v)}
        />
        <ColorField
          label="表面色"
          value={mergedTheme.colors.surface}
          onChange={(v) => updateColor("surface", v)}
        />
        <ColorField
          label="主文字色"
          value={mergedTheme.colors.text}
          onChange={(v) => updateColor("text", v)}
        />
        <ColorField
          label="次要文字色"
          value={mergedTheme.colors.textMuted}
          onChange={(v) => updateColor("textMuted", v)}
        />
        <ColorField
          label="边框色"
          value={mergedTheme.colors.border}
          onChange={(v) => updateColor("border", v)}
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// 排版 Tab
// ────────────────────────────────────────────

function TypographyTab({ config }: { config: TemplateConfigState }) {
  const { mergedTheme, updateTypography } = config;

  return (
    <div className="space-y-3">
      <Divider label="字号" icon="format_size" />
      <SliderField
        label="标题字号"
        value={mergedTheme.typography.headingSize}
        min={48}
        max={120}
        unit="px"
        onChange={(v) => updateTypography("headingSize", v)}
      />
      <SliderField
        label="副标题字号"
        value={mergedTheme.typography.subheadingSize}
        min={24}
        max={72}
        unit="px"
        onChange={(v) => updateTypography("subheadingSize", v)}
      />
      <SliderField
        label="正文字号"
        value={mergedTheme.typography.bodySize}
        min={16}
        max={48}
        unit="px"
        onChange={(v) => updateTypography("bodySize", v)}
      />
      <SliderField
        label="细节字号"
        value={mergedTheme.typography.detailSize}
        min={12}
        max={32}
        unit="px"
        onChange={(v) => updateTypography("detailSize", v)}
      />

      <Divider label="行距" icon="format_line_spacing" />
      <SliderField
        label="行高"
        value={mergedTheme.typography.lineHeight}
        min={1.0}
        max={2.0}
        step={0.05}
        onChange={(v) => updateTypography("lineHeight", v)}
      />

      <Divider label="间距" icon="space_bar" />
      <SliderField
        label="页面水平内边距"
        value={mergedTheme.spacing.pagePaddingX}
        min={20}
        max={120}
        unit="px"
        onChange={(v) => config.updateSpacing({ pagePaddingX: v })}
      />
      <SliderField
        label="页面垂直内边距"
        value={mergedTheme.spacing.pagePaddingY}
        min={20}
        max={120}
        unit="px"
        onChange={(v) => config.updateSpacing({ pagePaddingY: v })}
      />
      <SliderField
        label="元素间距"
        value={mergedTheme.spacing.itemGap}
        min={8}
        max={60}
        unit="px"
        onChange={(v) => config.updateSpacing({ itemGap: v })}
      />
    </div>
  );
}

// ────────────────────────────────────────────
// 动画 Tab
// ────────────────────────────────────────────

function AnimationTab({ config }: { config: TemplateConfigState }) {
  const { mergedTheme, updateAnimation } = config;

  return (
    <div className="space-y-3">
      <Divider label="入场效果" icon="motion_photos_on" />
      <SelectField<TemplateThemeAnimation["entryEffect"]>
        label="入场动画"
        value={mergedTheme.animation.entryEffect}
        options={[
          { value: "fadeIn", label: "淡入" },
          { value: "slideUp", label: "滑入" },
          { value: "scaleIn", label: "缩放" },
          { value: "typewriter", label: "打字机" },
        ]}
        onChange={(v) => updateAnimation({ entryEffect: v })}
      />
      <SelectField<TemplateThemeAnimation["transitionType"]>
        label="转场类型"
        value={mergedTheme.animation.transitionType}
        options={[
          { value: "slide", label: "滑动" },
          { value: "fade", label: "淡化" },
          { value: "zoom", label: "缩放" },
        ]}
        onChange={(v) => updateAnimation({ transitionType: v })}
      />

      <Divider label="速度与节奏" icon="speed" />
      <SliderField
        label="转场帧数"
        value={mergedTheme.animation.transitionFrames}
        min={5}
        max={45}
        unit="帧"
        onChange={(v) => updateAnimation({ transitionFrames: v })}
      />
      <SliderField
        label="列表交错延迟"
        value={mergedTheme.animation.staggerDelay}
        min={2}
        max={20}
        unit="帧"
        onChange={(v) => updateAnimation({ staggerDelay: v })}
      />

      <Divider label="弹簧参数" icon="fitness_center" />
      <SliderField
        label="阻尼 (damping)"
        value={mergedTheme.animation.springConfig.damping}
        min={5}
        max={40}
        onChange={(v) =>
          updateAnimation({
            springConfig: { ...mergedTheme.animation.springConfig, damping: v },
          })
        }
      />
      <SliderField
        label="质量 (mass)"
        value={mergedTheme.animation.springConfig.mass}
        min={0.2}
        max={3}
        step={0.1}
        onChange={(v) =>
          updateAnimation({
            springConfig: { ...mergedTheme.animation.springConfig, mass: v },
          })
        }
      />
      <SliderField
        label="刚度 (stiffness)"
        value={mergedTheme.animation.springConfig.stiffness}
        min={20}
        max={200}
        onChange={(v) =>
          updateAnimation({
            springConfig: { ...mergedTheme.animation.springConfig, stiffness: v },
          })
        }
      />
    </div>
  );
}

// ────────────────────────────────────────────
// 装饰 Tab
// ────────────────────────────────────────────

function DecorationTab({ config }: { config: TemplateConfigState }) {
  const { mergedTheme, updateDecoration } = config;

  return (
    <div className="space-y-3">
      <Divider label="背景" icon="wallpaper" />
      <SelectField<TemplateThemeDecoration["backgroundStyle"]>
        label="背景样式"
        value={mergedTheme.decoration.backgroundStyle}
        options={[
          { value: "dark-radial", label: "暗黑径向" },
          { value: "light-flat", label: "浅色平铺" },
          { value: "gradient", label: "渐变" },
        ]}
        onChange={(v) => updateDecoration({ backgroundStyle: v })}
      />

      <Divider label="网格纹理" icon="grid_4x4" />
      <ToggleField
        label="显示网格"
        value={mergedTheme.decoration.showGrid}
        onChange={(v) => updateDecoration({ showGrid: v })}
      />
      {mergedTheme.decoration.showGrid && (
        <SliderField
          label="网格透明度"
          value={mergedTheme.decoration.gridOpacity}
          min={0}
          max={0.15}
          step={0.005}
          onChange={(v) => updateDecoration({ gridOpacity: v })}
        />
      )}

      <Divider label="光晕效果" icon="flare" />
      <ToggleField
        label="标题光晕"
        value={mergedTheme.decoration.showGlow}
        onChange={(v) => updateDecoration({ showGlow: v })}
      />
      {mergedTheme.decoration.showGlow && (
        <SliderField
          label="光晕强度"
          value={mergedTheme.decoration.glowIntensity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => updateDecoration({ glowIntensity: v })}
        />
      )}

      <Divider label="元素样式" icon="shapes" />
      <SelectField<TemplateThemeDecoration["separatorStyle"]>
        label="分隔线"
        value={mergedTheme.decoration.separatorStyle}
        options={[
          { value: "gradient-line", label: "渐变线" },
          { value: "solid-line", label: "实线" },
          { value: "dots", label: "圆点" },
          { value: "none", label: "无" },
        ]}
        onChange={(v) => updateDecoration({ separatorStyle: v })}
      />
      <SelectField<TemplateThemeDecoration["badgeStyle"]>
        label="编号样式"
        value={mergedTheme.decoration.badgeStyle}
        options={[
          { value: "circle", label: "圆形" },
          { value: "square", label: "方形" },
          { value: "pill", label: "药丸" },
        ]}
        onChange={(v) => updateDecoration({ badgeStyle: v })}
      />
      <SelectField<TemplateThemeDecoration["tagStyle"]>
        label="标签样式"
        value={mergedTheme.decoration.tagStyle}
        options={[
          { value: "outlined", label: "描边" },
          { value: "filled", label: "填充" },
          { value: "ghost", label: "幽灵" },
        ]}
        onChange={(v) => updateDecoration({ tagStyle: v })}
      />

      <Divider label="布局微调" icon="dashboard_customize" />
      <SliderField
        label="卡片圆角"
        value={mergedTheme.layout.borderRadius}
        min={0}
        max={32}
        step={2}
        unit="px"
        onChange={(v) => config.updateLayout({ borderRadius: v })}
      />
      <SelectField<TemplateThemeLayout["contentAlign"]>
        label="内容对齐"
        value={mergedTheme.layout.contentAlign}
        options={[
          { value: "left", label: "左对齐" },
          { value: "center", label: "居中" },
          { value: "right", label: "右对齐" },
        ]}
        onChange={(v) => config.updateLayout({ contentAlign: v })}
      />
    </div>
  );
}

// ════════════════════════════════════════════
// Tab: 元素动画
// ════════════════════════════════════════════

function ElementAnimationTab({ config }: { config: TemplateConfigState }) {
  const { mergedTheme, updateElementAnimation } = config;
  const ea = mergedTheme.elementAnimation;

  return (
    <div className="space-y-4">
      <Divider label="文字揭示" icon="text_rotation_none" />
      <SelectField<TemplateThemeElementAnimation["textReveal"]>
        label="揭示效果"
        value={ea.textReveal}
        options={[
          { value: "none", label: "无" },
          { value: "typewriter", label: "打字机" },
          { value: "charByChar", label: "逐字" },
          { value: "wordByWord", label: "逐词" },
          { value: "lineSlide", label: "整行滑入" },
        ]}
        onChange={(v) => updateElementAnimation({ textReveal: v })}
      />
      <SliderField
        label="揭示速度"
        value={ea.textRevealSpeed}
        min={0.3}
        max={3}
        step={0.1}
        unit="x"
        onChange={(v) => updateElementAnimation({ textRevealSpeed: v })}
      />

      <Divider label="数字动画" icon="123" />
      <ToggleField
        label="数字滚动效果"
        value={ea.numberCounter}
        onChange={(v) => updateElementAnimation({ numberCounter: v })}
      />
      {ea.numberCounter && (
        <SliderField
          label="滚动速度"
          value={ea.numberCounterSpeed}
          min={5}
          max={60}
          step={5}
          unit="帧"
          onChange={(v) => updateElementAnimation({ numberCounterSpeed: v })}
        />
      )}

      <Divider label="列表交错" icon="format_list_numbered" />
      <SelectField<TemplateThemeElementAnimation["listStaggerDirection"]>
        label="交错方向"
        value={ea.listStaggerDirection}
        options={[
          { value: "down", label: "从上到下" },
          { value: "up", label: "从下到上" },
          { value: "alternate", label: "交替" },
        ]}
        onChange={(v) => updateElementAnimation({ listStaggerDirection: v })}
      />
      <SliderField
        label="列表间隔"
        value={ea.listStaggerOffset}
        min={2}
        max={20}
        step={1}
        unit="帧"
        onChange={(v) => updateElementAnimation({ listStaggerOffset: v })}
      />

      <Divider label="图标动画" icon="emoji_objects" />
      <SelectField<TemplateThemeElementAnimation["iconAnimation"]>
        label="图标效果"
        value={ea.iconAnimation}
        options={[
          { value: "none", label: "无" },
          { value: "bounce", label: "弹跳" },
          { value: "rotate", label: "旋转" },
          { value: "flip", label: "翻转" },
          { value: "pulse", label: "脉冲" },
          { value: "scaleIn", label: "缩放" },
        ]}
        onChange={(v) => updateElementAnimation({ iconAnimation: v })}
      />
      {ea.iconAnimation !== "none" && (
        <SliderField
          label="图标延迟"
          value={ea.iconAnimationDelay}
          min={0}
          max={30}
          step={1}
          unit="帧"
          onChange={(v) => updateElementAnimation({ iconAnimationDelay: v })}
        />
      )}

      <Divider label="标题特效" icon="title" />
      <SelectField<TemplateThemeElementAnimation["titleEffect"]>
        label="标题效果"
        value={ea.titleEffect}
        options={[
          { value: "none", label: "无" },
          { value: "gradientText", label: "渐变文字" },
          { value: "stroke", label: "描边" },
          { value: "glowPulse", label: "发光脉冲" },
          { value: "shadow", label: "立体阴影" },
        ]}
        onChange={(v) => updateElementAnimation({ titleEffect: v })}
      />
      {ea.titleEffect === "gradientText" && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-on-surface-variant">渐变色</span>
          <div className="flex items-center gap-1.5">
            <label className="relative cursor-pointer">
              <div
                className="w-6 h-6 rounded-md border border-outline-variant/40"
                style={{ backgroundColor: ea.titleGradientColors[0] || "#99f7ff" }}
              />
              <input
                type="color"
                value={ea.titleGradientColors[0] || "#99f7ff"}
                onChange={(e) =>
                  updateElementAnimation({
                    titleGradientColors: [e.target.value, ea.titleGradientColors[1] || "#ac8aff"],
                  })
                }
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <span className="text-on-surface-variant/30 text-[10px]">→</span>
            <label className="relative cursor-pointer">
              <div
                className="w-6 h-6 rounded-md border border-outline-variant/40"
                style={{ backgroundColor: ea.titleGradientColors[1] || "#ac8aff" }}
              />
              <input
                type="color"
                value={ea.titleGradientColors[1] || "#ac8aff"}
                onChange={(e) =>
                  updateElementAnimation({
                    titleGradientColors: [ea.titleGradientColors[0] || "#99f7ff", e.target.value],
                  })
                }
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      <Divider label="退出动画" icon="logout" />
      <SelectField<TemplateThemeElementAnimation["exitAnimation"]>
        label="退出效果"
        value={ea.exitAnimation}
        options={[
          { value: "none", label: "无" },
          { value: "fadeOut", label: "淡出" },
          { value: "scaleDown", label: "缩小" },
          { value: "slideOut", label: "滑出" },
          { value: "blur", label: "模糊消散" },
        ]}
        onChange={(v) => updateElementAnimation({ exitAnimation: v })}
      />
      {ea.exitAnimation !== "none" && (
        <SliderField
          label="退出时长"
          value={ea.exitDuration}
          min={3}
          max={30}
          step={1}
          unit="帧"
          onChange={(v) => updateElementAnimation({ exitDuration: v })}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// Tab: 视觉特效
// ════════════════════════════════════════════

function EffectsTab({ config }: { config: TemplateConfigState }) {
  const { mergedTheme, updateEffects } = config;
  const fx = mergedTheme.effects;

  return (
    <div className="space-y-4">
      <Divider label="粒子效果" icon="bubble_chart" />
      <SelectField<TemplateThemeEffects["particles"]>
        label="粒子类型"
        value={fx.particles}
        options={[
          { value: "none", label: "无" },
          { value: "dots", label: "浮动光点" },
          { value: "snow", label: "雪花" },
          { value: "stars", label: "星空" },
          { value: "confetti", label: "彩纸" },
        ]}
        onChange={(v) => updateEffects({ particles: v })}
      />
      {fx.particles !== "none" && (
        <>
          <SliderField
            label="粒子密度"
            value={fx.particleDensity}
            min={0.05}
            max={1}
            step={0.05}
            onChange={(v) => updateEffects({ particleDensity: v })}
          />
          <SliderField
            label="粒子速度"
            value={fx.particleSpeed}
            min={0.3}
            max={3}
            step={0.1}
            unit="x"
            onChange={(v) => updateEffects({ particleSpeed: v })}
          />
        </>
      )}

      <Divider label="背景效果" icon="gradient" />
      <ToggleField
        label="渐变流动"
        value={fx.gradientAnimation}
        onChange={(v) => updateEffects({ gradientAnimation: v })}
      />
      {fx.gradientAnimation && (
        <SliderField
          label="流动速度"
          value={fx.gradientSpeed}
          min={0.3}
          max={3}
          step={0.1}
          unit="x"
          onChange={(v) => updateEffects({ gradientSpeed: v })}
        />
      )}
      <SliderField
        label="背景模糊"
        value={fx.backgroundBlur}
        min={0}
        max={20}
        step={1}
        unit="px"
        onChange={(v) => updateEffects({ backgroundBlur: v })}
      />

      <Divider label="边框动画" icon="border_style" />
      <SelectField<TemplateThemeEffects["borderAnimation"]>
        label="边框效果"
        value={fx.borderAnimation}
        options={[
          { value: "none", label: "无" },
          { value: "glowPulse", label: "发光脉冲" },
          { value: "gradientFlow", label: "渐变流动" },
          { value: "dashRotate", label: "虚线旋转" },
        ]}
        onChange={(v) => updateEffects({ borderAnimation: v })}
      />
      <SliderField
        label="边框宽度"
        value={fx.borderWidth}
        min={0}
        max={4}
        step={0.5}
        unit="px"
        onChange={(v) => updateEffects({ borderWidth: v })}
      />

      <Divider label="阴影" icon="ev_shadow" />
      <SliderField
        label="阴影深度"
        value={fx.shadowDepth}
        min={0}
        max={40}
        step={2}
        unit="px"
        onChange={(v) => updateEffects({ shadowDepth: v })}
      />
      <ColorField
        label="阴影颜色"
        value={fx.shadowColor.startsWith("rgba") ? "#000000" : fx.shadowColor}
        onChange={(v) => updateEffects({ shadowColor: v })}
      />

      <Divider label="毛玻璃" icon="blur_on" />
      <ToggleField
        label="毛玻璃效果"
        value={fx.glassmorphism}
        onChange={(v) => updateEffects({ glassmorphism: v })}
      />
      {fx.glassmorphism && (
        <SliderField
          label="模糊强度"
          value={fx.glassmorphismBlur}
          min={2}
          max={30}
          step={1}
          unit="px"
          onChange={(v) => updateEffects({ glassmorphismBlur: v })}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// 主面板组件
// ════════════════════════════════════════════

export default function TemplateConfigPanel({
  config,
  isOpen,
  onClose,
}: TemplateConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("colors");

  return (
    <>
      {/* 遮罩层 — 关闭面板 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}

      {/* 面板 — 绝对定位在 ControlPanel 左侧 */}
      <div
        className={`absolute top-0 bottom-0 right-16 w-80 z-50 flex flex-col
          bg-surface-container/95 backdrop-blur-xl
          border-l border-r border-outline-variant/15
          shadow-[-8px_0_32px_rgba(0,0,0,0.4)]
          transition-all duration-300 ease-out
          ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/15">
          <div className="flex items-center gap-2.5">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
            >
              tune
            </span>
            <h3 className="text-sm font-bold text-on-surface tracking-wide">
              模板设置
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high
              transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              close
            </span>
          </button>
        </div>

        {/* Tab 栏 */}
        <div className="flex border-b border-outline-variant/15">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 relative transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 18,
                  fontVariationSettings:
                    activeTab === tab.id ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {tab.icon}
              </span>
              <span className="text-[10px] font-bold tracking-wider">
                {tab.label}
              </span>
              {/* 底部指示条 */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* 内容区 — 可滚动 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
          {activeTab === "colors" && <ColorsTab config={config} />}
          {activeTab === "typography" && <TypographyTab config={config} />}
          {activeTab === "animation" && <AnimationTab config={config} />}
          {activeTab === "elements" && <ElementAnimationTab config={config} />}
          {activeTab === "effects" && <EffectsTab config={config} />}
          {activeTab === "decoration" && <DecorationTab config={config} />}
        </div>

        {/* 底部操作栏 */}
        <div className="px-5 py-4 border-t border-outline-variant/15 flex items-center gap-2">
          <button
            onClick={config.resetToDefault}
            disabled={!config.hasOverrides}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
              text-xs font-bold transition-all duration-200
              ${
                config.hasOverrides
                  ? "bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-error hover:border-error/30 hover:bg-error/5"
                  : "bg-surface-container-high/50 border border-outline-variant/10 text-on-surface-variant/30 cursor-not-allowed"
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              restart_alt
            </span>
            重置
          </button>
          {/* 未来迭代四：保存为预设 */}
          {/*
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 text-xs font-bold transition-all">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bookmark_add</span>
            保存预设
          </button>
          */}
        </div>

        {/* 覆盖状态提示 */}
        {config.hasOverrides && (
          <div className="px-5 pb-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/15">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: 14 }}
              >
                info
              </span>
              <span className="text-[10px] text-primary/80">
                已自定义主题参数，预览中实时生效
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
