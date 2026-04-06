// src/remotion/template-theme.ts — 模板主题配置协议
// 定义所有 Slide 组件可读取的统一视觉参数接口

export interface TemplateThemeColors {
  background: string;       // 页面背景主色
  surface: string;          // 卡片/容器表面色
  surfaceHigh: string;      // 高亮表面色
  primary: string;          // 主强调色
  primaryDim: string;       // 主强调色暗调
  secondary: string;        // 辅助色
  secondaryDim: string;     // 辅助色暗调
  tertiary: string;         // 第三色
  text: string;             // 主文本色
  textMuted: string;        // 次要文本色
  border: string;           // 边框色
  borderSubtle: string;     // 淡边框色
  onPrimary: string;        // 主色上的文字色
}

export interface TemplateThemeTypography {
  headingFont: string;      // 标题字体
  bodyFont: string;         // 正文字体
  monoFont: string;         // 等宽字体
  headingSize: number;      // 标题字号（基准）
  subheadingSize: number;   // 副标题字号
  bodySize: number;         // 正文字号
  detailSize: number;       // 细节文字字号
  tagSize: number;          // 标签字号
  lineHeight: number;       // 基准行高
}

export interface TemplateThemeAnimation {
  entryEffect: "fadeIn" | "slideUp" | "scaleIn" | "typewriter";
  transitionType: "slide" | "fade" | "zoom";
  transitionFrames: number; // 转场帧数
  staggerDelay: number;     // 列表项交错延迟（帧）
  springConfig: {
    damping: number;
    mass: number;
    stiffness: number;
  };
}

export interface TemplateThemeDecoration {
  backgroundStyle: "dark-radial" | "light-flat" | "gradient";
  showGrid: boolean;
  gridOpacity: number;
  gridSize: number;
  showGlow: boolean;
  glowIntensity: number;    // 0-1
  separatorStyle: "gradient-line" | "solid-line" | "dots" | "none";
  badgeStyle: "circle" | "square" | "pill";
  tagStyle: "outlined" | "filled" | "ghost";
}

export interface TemplateThemeSpacing {
  pagePaddingX: number;     // 水平内边距
  pagePaddingY: number;     // 垂直内边距
  sectionGap: number;       // 章节间距
  itemGap: number;          // 列表项间距
}

// ─── 元素级动画 ───

export interface TemplateThemeElementAnimation {
  textReveal: "none" | "typewriter" | "charByChar" | "wordByWord" | "lineSlide";
  textRevealSpeed: number;        // 0.5-3 倍速
  numberCounter: boolean;         // 数字滚动动画
  numberCounterSpeed: number;     // 帧数
  listStaggerDirection: "down" | "up" | "alternate";
  listStaggerOffset: number;      // 每项延迟帧数
  iconAnimation: "none" | "bounce" | "rotate" | "flip" | "pulse" | "scaleIn";
  iconAnimationDelay: number;     // 图标动画延迟帧
  titleEffect: "none" | "gradientText" | "stroke" | "glowPulse" | "shadow";
  titleGradientColors: string[];  // 标题渐变色 [start, end]
  exitAnimation: "none" | "fadeOut" | "scaleDown" | "slideOut" | "blur";
  exitDuration: number;           // 退出动画帧数
}

// ─── 视觉特效 ───

export interface TemplateThemeEffects {
  particles: "none" | "dots" | "snow" | "stars" | "confetti";
  particleDensity: number;        // 0-1
  particleSpeed: number;          // 0.5-3
  gradientAnimation: boolean;     // 背景渐变流动
  gradientSpeed: number;          // 流动速度 0.5-3
  backgroundBlur: number;         // 背景模糊 0-20
  borderAnimation: "none" | "glowPulse" | "gradientFlow" | "dashRotate";
  borderWidth: number;            // 边框宽度 0-4
  shadowDepth: number;            // 阴影深度 0-40
  shadowColor: string;            // 阴影颜色
  glassmorphism: boolean;         // 毛玻璃效果
  glassmorphismBlur: number;      // 毛玻璃模糊度 0-30
}

// ─── 布局微调 ───

export interface TemplateThemeLayout {
  borderRadius: number;           // 卡片圆角 0-32
  contentAlign: "left" | "center" | "right";
}

export interface TemplateTheme {
  colors: TemplateThemeColors;
  typography: TemplateThemeTypography;
  animation: TemplateThemeAnimation;
  decoration: TemplateThemeDecoration;
  spacing: TemplateThemeSpacing;
  elementAnimation: TemplateThemeElementAnimation;
  effects: TemplateThemeEffects;
  layout: TemplateThemeLayout;
}

// 深度合并工具：用户覆盖值与默认 theme 合并
export function mergeTheme(
  base: TemplateTheme,
  overrides: DeepPartial<TemplateTheme>
): TemplateTheme {
  return deepMerge(base, overrides) as TemplateTheme;
}

// ─── 工具类型 ───

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function deepMerge(target: unknown, source: unknown): unknown {
  if (!source) return target;
  if (!target) return source;

  if (
    typeof target === "object" &&
    typeof source === "object" &&
    !Array.isArray(target) &&
    !Array.isArray(source)
  ) {
    const result = { ...(target as Record<string, unknown>) };
    for (const key of Object.keys(source as Record<string, unknown>)) {
      result[key] = deepMerge(
        (target as Record<string, unknown>)[key],
        (source as Record<string, unknown>)[key]
      );
    }
    return result;
  }

  return source;
}
