// 字体加载配置
// 使用 @remotion/google-fonts 自动处理中文字体加载
// Noto Sans SC 的 chinese-simplified 使用分片加载，不需要手动指定 subset

import { loadFont, getInfo } from "@remotion/google-fonts/NotoSansSC";

// 加载 Noto Sans SC（中文字体）— 加载所有分片
const { fontFamily: notoSansSC } = loadFont();

export { notoSansSC };

// 用于 Remotion Composition 内部的字体配置
export const REMOTION_FONTS = {
  headline: `"Space Grotesk", ${notoSansSC}, sans-serif`,
  body: `"Inter", ${notoSansSC}, sans-serif`,
  mono: `"JetBrains Mono", monospace`,
} as const;
