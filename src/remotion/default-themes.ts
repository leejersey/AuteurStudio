// src/remotion/default-themes.ts — 预置模板主题配置
// 从现有硬编码值精确提取，确保视觉无变化

import type { TemplateTheme } from "./template-theme";
import { REMOTION_FONTS } from "./styles/fonts";

// ─── 暗黑科技 ───

export const DARK_TECH_THEME: TemplateTheme = {
  colors: {
    background: "#0b0e14",
    surface: "#161a21",
    surfaceHigh: "#1c2028",
    primary: "#99f7ff",
    primaryDim: "#00e2ee",
    secondary: "#ac8aff",
    secondaryDim: "#8455ef",
    tertiary: "#ff6ff7",
    text: "#ecedf6",
    textMuted: "#a9abb3",
    border: "#73757d",
    borderSubtle: "#45484f",
    onPrimary: "#005f64",
  },

  typography: {
    headingFont: REMOTION_FONTS.headline,
    bodyFont: REMOTION_FONTS.body,
    monoFont: REMOTION_FONTS.mono,
    headingSize: 80,
    subheadingSize: 42,
    bodySize: 32,
    detailSize: 22,
    tagSize: 16,
    lineHeight: 1.3,
  },

  animation: {
    entryEffect: "slideUp",
    transitionType: "slide",
    transitionFrames: 15,
    staggerDelay: 8,
    springConfig: { damping: 15, mass: 1, stiffness: 80 },
  },

  decoration: {
    backgroundStyle: "dark-radial",
    showGrid: true,
    gridOpacity: 0.03,
    gridSize: 60,
    showGlow: true,
    glowIntensity: 0.5,
    separatorStyle: "gradient-line",
    badgeStyle: "circle",
    tagStyle: "outlined",
  },

  spacing: {
    pagePaddingX: 60,
    pagePaddingY: 80,
    sectionGap: 50,
    itemGap: 30,
  },

  elementAnimation: {
    textReveal: "lineSlide",
    textRevealSpeed: 1,
    numberCounter: true,
    numberCounterSpeed: 20,
    listStaggerDirection: "down",
    listStaggerOffset: 6,
    iconAnimation: "scaleIn",
    iconAnimationDelay: 5,
    titleEffect: "glowPulse",
    titleGradientColors: ["#99f7ff", "#ac8aff"],
    exitAnimation: "fadeOut",
    exitDuration: 10,
  },

  effects: {
    particles: "dots",
    particleDensity: 0.3,
    particleSpeed: 1,
    gradientAnimation: true,
    gradientSpeed: 1,
    backgroundBlur: 0,
    borderAnimation: "glowPulse",
    borderWidth: 1,
    shadowDepth: 16,
    shadowColor: "rgba(153,247,255,0.08)",
    glassmorphism: false,
    glassmorphismBlur: 10,
  },

  layout: {
    borderRadius: 16,
    contentAlign: "left",
  },
};

// ─── 极简白色 ───

export const MINIMAL_WHITE_THEME: TemplateTheme = {
  colors: {
    background: "#fafafa",
    surface: "#ffffff",
    surfaceHigh: "#f5f5f5",
    primary: "#3b82f6",
    primaryDim: "#2563eb",
    secondary: "#8b5cf6",
    secondaryDim: "#7c3aed",
    tertiary: "#ec4899",
    text: "#1a1a1a",
    textMuted: "#666666",
    border: "#e5e7eb",
    borderSubtle: "#f0f0f0",
    onPrimary: "#ffffff",
  },

  typography: {
    headingFont: "'Noto Serif SC', serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: REMOTION_FONTS.mono,
    headingSize: 84,
    subheadingSize: 48,
    bodySize: 26,
    detailSize: 20,
    tagSize: 16,
    lineHeight: 1.4,
  },

  animation: {
    entryEffect: "fadeIn",
    transitionType: "fade",
    transitionFrames: 15,
    staggerDelay: 8,
    springConfig: { damping: 20, mass: 0.8, stiffness: 100 },
  },

  decoration: {
    backgroundStyle: "light-flat",
    showGrid: false,
    gridOpacity: 0,
    gridSize: 60,
    showGlow: false,
    glowIntensity: 0,
    separatorStyle: "solid-line",
    badgeStyle: "circle",
    tagStyle: "outlined",
  },

  spacing: {
    pagePaddingX: 70,
    pagePaddingY: 80,
    sectionGap: 50,
    itemGap: 20,
  },

  elementAnimation: {
    textReveal: "wordByWord",
    textRevealSpeed: 1.2,
    numberCounter: false,
    numberCounterSpeed: 25,
    listStaggerDirection: "down",
    listStaggerOffset: 8,
    iconAnimation: "none",
    iconAnimationDelay: 0,
    titleEffect: "none",
    titleGradientColors: ["#3b82f6", "#8b5cf6"],
    exitAnimation: "fadeOut",
    exitDuration: 12,
  },

  effects: {
    particles: "none",
    particleDensity: 0,
    particleSpeed: 1,
    gradientAnimation: false,
    gradientSpeed: 1,
    backgroundBlur: 0,
    borderAnimation: "none",
    borderWidth: 1,
    shadowDepth: 8,
    shadowColor: "rgba(0,0,0,0.08)",
    glassmorphism: false,
    glassmorphismBlur: 8,
  },

  layout: {
    borderRadius: 12,
    contentAlign: "left",
  },
};
