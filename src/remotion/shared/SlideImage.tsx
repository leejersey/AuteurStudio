// src/remotion/shared/SlideImage.tsx — 可复用的 Slide 图片组件
// 支持 4 种布局模式 + Ken Burns 动画效果

import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Img,
} from "remotion";

export type ImageLayout = "background" | "side" | "top" | "overlay";

interface SlideImageProps {
  src: string;
  layout?: ImageLayout;
  credit?: string;
  /** 图片在 side 模式下的位置 */
  sidePosition?: "left" | "right";
  /** 图片宽度比例 (side 模式)，默认 0.4 = 40% */
  sideRatio?: number;
  /** 背景遮罩暗度 0-1，默认 0.5 */
  overlayDarkness?: number;
  /** Ken Burns 动画强度，默认 0.05 (5% 缩放) */
  kenBurnsIntensity?: number;
  /** 子内容（仅 background/overlay 模式） */
  children?: React.ReactNode;
}

export const SlideImage: React.FC<SlideImageProps> = ({
  src,
  layout = "background",
  credit,
  sidePosition = "left",
  sideRatio = 0.4,
  overlayDarkness = 0.55,
  kenBurnsIntensity = 0.05,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // ─── 淡入动画 ───
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ─── Ken Burns 效果：缓慢缩放 + 平移 ───
  const progress = frame / durationInFrames;
  const scale = 1 + progress * kenBurnsIntensity;
  const translateX = progress * 1.5; // 微平移
  const translateY = progress * -0.8;

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
    transition: "opacity 0.3s ease",
  };

  // ─── 信用归属标注 ───
  const creditBadge = credit && (
    <div
      style={{
        position: "absolute",
        bottom: 8,
        right: 12,
        fontSize: 10,
        color: "rgba(255,255,255,0.4)",
        fontFamily: "Inter, system-ui, sans-serif",
        letterSpacing: 0.5,
        zIndex: 10,
      }}
    >
      📷 {credit}
    </div>
  );

  // ════════════════════════════════════════
  // 布局模式：全屏背景
  // ════════════════════════════════════════
  if (layout === "background") {
    return (
      <div style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity }}>
          <Img src={src} style={imageStyle} />
        </div>
        {/* 暗化遮罩 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, rgba(0,0,0,${overlayDarkness * 0.8}) 0%, rgba(0,0,0,${overlayDarkness}) 50%, rgba(0,0,0,${overlayDarkness * 0.9}) 100%)`,
            zIndex: 1,
          }}
        />
        {/* 内容 */}
        <div style={{ position: "relative", zIndex: 2, height: "100%" }}>
          {children}
        </div>
        {creditBadge}
      </div>
    );
  }

  // ════════════════════════════════════════
  // 布局模式：侧边图 (左图右文 or 右图左文)
  // ════════════════════════════════════════
  if (layout === "side") {
    const imageWidth = `${sideRatio * 100}%`;
    const contentWidth = `${(1 - sideRatio) * 100}%`;

    const imageBlock = (
      <div
        style={{
          width: imageWidth,
          height: "100%",
          position: "relative",
          overflow: "hidden",
          opacity,
        }}
      >
        <Img src={src} style={imageStyle} />
        {/* 边缘渐变融合 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              sidePosition === "left"
                ? "linear-gradient(to right, transparent 60%, rgba(8,14,20,1) 100%)"
                : "linear-gradient(to left, transparent 60%, rgba(8,14,20,1) 100%)",
          }}
        />
        {creditBadge}
      </div>
    );

    const contentBlock = (
      <div style={{ width: contentWidth, height: "100%", position: "relative" }}>
        {children}
      </div>
    );

    return (
      <div
        style={{
          display: "flex",
          flexDirection: sidePosition === "left" ? "row" : "row-reverse",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
      >
        {imageBlock}
        {contentBlock}
      </div>
    );
  }

  // ════════════════════════════════════════
  // 布局模式：顶部图片
  // ════════════════════════════════════════
  if (layout === "top") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
      >
        <div
          style={{
            height: "40%",
            position: "relative",
            overflow: "hidden",
            opacity,
          }}
        >
          <Img src={src} style={imageStyle} />
          {/* 底部渐变融合 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(8,14,20,1) 0%, transparent 40%)",
            }}
          />
          {creditBadge}
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          {children}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // 布局模式：半透明叠加
  // ════════════════════════════════════════
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          opacity: opacity * 0.3, // 更低透明度
        }}
      >
        <Img src={src} style={imageStyle} />
      </div>
      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
        {children}
      </div>
      {creditBadge}
    </div>
  );
};
