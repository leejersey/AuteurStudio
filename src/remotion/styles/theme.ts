// Remotion 视频内部的设计 token
// 与 Web UI 的暗色系保持一致

import { REMOTION_FONTS } from "./fonts";

export { notoSansSC } from "./fonts";

export const COLORS = {
  background: "#0b0e14",
  surface: "#161a21",
  surfaceHigh: "#1c2028",
  surfaceHighest: "#22262f",
  surfaceContainer: "#1a1e27",

  primary: "#99f7ff",
  primaryDim: "#00e2ee",
  primaryContainer: "#00f1fe",
  onPrimary: "#005f64",

  secondary: "#ac8aff",
  secondaryDim: "#8455ef",
  secondaryContainer: "#5516be",

  tertiary: "#ff6ff7",
  tertiaryDim: "#ff51fa",

  error: "#ff716c",

  onSurface: "#ecedf6",
  onSurfaceVariant: "#a9abb3",
  outline: "#73757d",
  outlineVariant: "#45484f",
} as const;

export const FONTS = REMOTION_FONTS;

export const SIZES = {
  // 9:16 竖屏（图文卡片）
  card: { width: 1080, height: 1920 },
  // 16:9 横屏（算法可视化）
  algo: { width: 1920, height: 1080 },
} as const;

export const TIMING = {
  fps: 30,
  slideDurationSec: 4,
  transitionDurationFrames: 15,
} as const;
