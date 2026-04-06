"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  TemplateTheme,
  TemplateThemeColors,
  TemplateThemeTypography,
  TemplateThemeAnimation,
  TemplateThemeDecoration,
  TemplateThemeSpacing,
  TemplateThemeElementAnimation,
  TemplateThemeEffects,
  TemplateThemeLayout,
  DeepPartial,
} from "@/remotion/template-theme";
import { mergeTheme } from "@/remotion/template-theme";
import { DARK_TECH_THEME, MINIMAL_WHITE_THEME } from "@/remotion/default-themes";
import { getTemplate } from "@/remotion/template-registry";

// 预设映射
const PRESET_THEMES: Record<string, TemplateTheme> = {
  "dark-tech": DARK_TECH_THEME,
  "minimal-white": MINIMAL_WHITE_THEME,
};

export interface TemplateConfigState {
  /** 合并后的最终 theme（base + overrides） */
  mergedTheme: TemplateTheme;
  /** 用户覆盖值（仅包含被修改的字段） */
  overrides: DeepPartial<TemplateTheme>;
  /** 当前选中的模板 ID */
  templateId: string;
  /** 是否有任何覆盖 */
  hasOverrides: boolean;

  // ── 更新方法 ──
  updateColor: (key: keyof TemplateThemeColors, value: string) => void;
  updateTypography: (key: keyof TemplateThemeTypography, value: number | string) => void;
  updateAnimation: (updates: Partial<TemplateThemeAnimation>) => void;
  updateDecoration: (updates: Partial<TemplateThemeDecoration>) => void;
  updateSpacing: (updates: Partial<TemplateThemeSpacing>) => void;
  updateElementAnimation: (updates: Partial<TemplateThemeElementAnimation>) => void;
  updateEffects: (updates: Partial<TemplateThemeEffects>) => void;
  updateLayout: (updates: Partial<TemplateThemeLayout>) => void;
  switchPreset: (presetId: string) => void;
  resetToDefault: () => void;
  setTemplateId: (id: string) => void;
}

export function useTemplateConfig(initialTemplateId: string = "dark-tech"): TemplateConfigState {
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [overrides, setOverrides] = useState<DeepPartial<TemplateTheme>>({});

  // 获取基础 theme
  const baseTheme = useMemo(() => {
    const template = getTemplate(templateId);
    return template?.theme ?? PRESET_THEMES[templateId] ?? DARK_TECH_THEME;
  }, [templateId]);

  // 合并 base + overrides
  const mergedTheme = useMemo(() => {
    if (Object.keys(overrides).length === 0) return baseTheme;
    return mergeTheme(baseTheme, overrides);
  }, [baseTheme, overrides]);

  const hasOverrides = Object.keys(overrides).length > 0;

  // ── 颜色更新 ──
  const updateColor = useCallback(
    (key: keyof TemplateThemeColors, value: string) => {
      setOverrides((prev) => ({
        ...prev,
        colors: { ...prev.colors, [key]: value },
      }));
    },
    []
  );

  // ── 排版更新 ──
  const updateTypography = useCallback(
    (key: keyof TemplateThemeTypography, value: number | string) => {
      setOverrides((prev) => ({
        ...prev,
        typography: { ...prev.typography, [key]: value },
      }));
    },
    []
  );

  // ── 动画更新 ──
  const updateAnimation = useCallback(
    (updates: Partial<TemplateThemeAnimation>) => {
      setOverrides((prev) => ({
        ...prev,
        animation: { ...prev.animation, ...updates },
      }));
    },
    []
  );

  // ── 装饰更新 ──
  const updateDecoration = useCallback(
    (updates: Partial<TemplateThemeDecoration>) => {
      setOverrides((prev) => ({
        ...prev,
        decoration: { ...prev.decoration, ...updates },
      }));
    },
    []
  );

  // ── 间距更新 ──
  const updateSpacing = useCallback(
    (updates: Partial<TemplateThemeSpacing>) => {
      setOverrides((prev) => ({
        ...prev,
        spacing: { ...prev.spacing, ...updates },
      }));
    },
    []
  );

  // ── 元素动画更新 ──
  const updateElementAnimation = useCallback(
    (updates: Partial<TemplateThemeElementAnimation>) => {
      setOverrides((prev) => ({
        ...prev,
        elementAnimation: { ...prev.elementAnimation, ...updates },
      }));
    },
    []
  );

  // ── 特效更新 ──
  const updateEffects = useCallback(
    (updates: Partial<TemplateThemeEffects>) => {
      setOverrides((prev) => ({
        ...prev,
        effects: { ...prev.effects, ...updates },
      }));
    },
    []
  );

  // ── 布局更新 ──
  const updateLayout = useCallback(
    (updates: Partial<TemplateThemeLayout>) => {
      setOverrides((prev) => ({
        ...prev,
        layout: { ...prev.layout, ...updates },
      }));
    },
    []
  );

  // ── 切换预设 ──
  const switchPreset = useCallback(
    (presetId: string) => {
      setTemplateId(presetId);
      setOverrides({}); // 切换预设时清空覆盖
    },
    []
  );

  // ── 重置 ──
  const resetToDefault = useCallback(() => {
    setOverrides({});
  }, []);

  return {
    mergedTheme,
    overrides,
    templateId,
    hasOverrides,
    updateColor,
    updateTypography,
    updateAnimation,
    updateDecoration,
    updateSpacing,
    updateElementAnimation,
    updateEffects,
    updateLayout,
    switchPreset,
    resetToDefault,
    setTemplateId,
  };
}
