import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface SlideTransitionProps {
  children: React.ReactNode;
  durationInFrames: number;
  direction?: "left" | "right" | "up" | "down";
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  durationInFrames,
  direction = "left",
}) => {
  const frame = useCurrentFrame();

  // 入场动画（前 15 帧）
  const enterProgress = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  // 出场动画（最后 15 帧）
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const getTransform = () => {
    const enterOffset = (1 - enterProgress) * 100;
    const exitOffset = exitProgress * -100;
    const offset = enterOffset + exitOffset;

    switch (direction) {
      case "left":
        return `translateX(${offset}px)`;
      case "right":
        return `translateX(${-offset}px)`;
      case "up":
        return `translateY(${offset}px)`;
      case "down":
        return `translateY(${-offset}px)`;
    }
  };

  const opacity = interpolate(enterProgress, [0, 1], [0, 1]) *
    interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        transform: getTransform(),
        opacity,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
