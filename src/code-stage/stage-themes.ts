export type StageThemeId = "dracula" | "tokyo-night" | "github-dark" | "catppuccin-mocha" | "one-dark-pro";

export interface StagePalette {
  canvasBg: string;
  canvasBgEnd: string;
  glow1: string;
  glow2: string;
  gridDot: string;
  panelBg: string;
  barBg: string;
  border: string;
  primary: string;
  secondary: string;
  success: string;
  warn: string;
  danger: string;
  text: string;
  muted: string;
  lineNum: string;
  focusBg: string;
  addedBg: string;
  captionBg: string;
}

export const STAGE_PALETTES: Record<StageThemeId, StagePalette> = {
  dracula: {
    canvasBg: "#1e1f29",
    canvasBgEnd: "#171822",
    glow1: "rgba(189, 147, 249, 0.22)",
    glow2: "rgba(255, 121, 198, 0.18)",
    gridDot: "rgba(189, 147, 249, 0.16)",
    panelBg: "#282a36",
    barBg: "#21222c",
    border: "rgba(98, 114, 164, 0.45)",
    primary: "#bd93f9",
    secondary: "#ff79c6",
    success: "#50fa7b",
    warn: "#f1fa8c",
    danger: "#ff5555",
    text: "#f8f8f2",
    muted: "#b6c0e4",
    lineNum: "#8b97c2",
    focusBg: "rgba(189, 147, 249, 0.18)",
    addedBg: "rgba(80, 250, 123, 0.11)",
    captionBg: "rgba(33, 34, 44, 0.92)",
  },
  "tokyo-night": {
    canvasBg: "#0b101b",
    canvasBgEnd: "#090d16",
    glow1: "rgba(56, 189, 248, 0.12)",
    glow2: "rgba(129, 140, 248, 0.14)",
    gridDot: "rgba(148, 163, 184, 0.12)",
    panelBg: "#1a1b26",
    barBg: "rgba(15, 23, 42, 0.85)",
    border: "rgba(148, 163, 184, 0.2)",
    primary: "#38bdf8",
    secondary: "#818cf8",
    success: "#4ade80",
    warn: "#fbbf24",
    danger: "#f87171",
    text: "#f8fafc",
    muted: "#94a3b8",
    lineNum: "#7c8ba1",
    focusBg: "rgba(56, 189, 248, 0.14)",
    addedBg: "rgba(74, 222, 128, 0.08)",
    captionBg: "rgba(9, 13, 22, 0.88)",
  },
  "github-dark": {
    canvasBg: "#0d1117",
    canvasBgEnd: "#090c10",
    glow1: "rgba(88, 166, 255, 0.14)",
    glow2: "rgba(63, 185, 80, 0.11)",
    gridDot: "rgba(139, 148, 158, 0.14)",
    panelBg: "#161b22",
    barBg: "#0d1117",
    border: "rgba(139, 148, 158, 0.28)",
    primary: "#58a6ff",
    secondary: "#d2a8ff",
    success: "#3fb950",
    warn: "#d29922",
    danger: "#f85149",
    text: "#f0f6fc",
    muted: "#9ba3ae",
    lineNum: "#7d8590",
    focusBg: "rgba(88, 166, 255, 0.15)",
    addedBg: "rgba(63, 185, 80, 0.1)",
    captionBg: "rgba(13, 17, 23, 0.9)",
  },
  "catppuccin-mocha": {
    canvasBg: "#181825",
    canvasBgEnd: "#11111b",
    glow1: "rgba(203, 166, 247, 0.18)",
    glow2: "rgba(137, 180, 250, 0.15)",
    gridDot: "rgba(180, 190, 254, 0.14)",
    panelBg: "#1e1e2e",
    barBg: "#181825",
    border: "rgba(147, 153, 178, 0.3)",
    primary: "#cba6f7",
    secondary: "#89b4fa",
    success: "#a6e3a1",
    warn: "#f9e2af",
    danger: "#f38ba8",
    text: "#cdd6f4",
    muted: "#a6adc8",
    lineNum: "#7f849c",
    focusBg: "rgba(203, 166, 247, 0.16)",
    addedBg: "rgba(166, 227, 161, 0.1)",
    captionBg: "rgba(17, 17, 27, 0.9)",
  },
  "one-dark-pro": {
    canvasBg: "#21252b",
    canvasBgEnd: "#1b1e24",
    glow1: "rgba(97, 175, 239, 0.15)",
    glow2: "rgba(198, 120, 221, 0.15)",
    gridDot: "rgba(171, 178, 191, 0.12)",
    panelBg: "#282c34",
    barBg: "#21252b",
    border: "rgba(171, 178, 191, 0.22)",
    primary: "#61afef",
    secondary: "#c678dd",
    success: "#98c379",
    warn: "#e5c07b",
    danger: "#e06c75",
    text: "#eef1f7",
    muted: "#abb2bf",
    lineNum: "#7f8899",
    focusBg: "rgba(97, 175, 239, 0.15)",
    addedBg: "rgba(152, 195, 121, 0.1)",
    captionBg: "rgba(27, 30, 36, 0.9)",
  },
};

export function getStagePalette(themeId: string): StagePalette {
  return STAGE_PALETTES[(themeId as StageThemeId) in STAGE_PALETTES ? (themeId as StageThemeId) : "dracula"];
}
