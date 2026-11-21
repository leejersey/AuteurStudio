import { diffCodeLines, type CodeStepDiff } from "./diff";
import { highlightCode, type HighlightedCode } from "./highlighter";
import { codeStageSpecSchema, getTotalDuration, type CodeStageSpec, type CodeStep, type AudioSegment } from "./schema";
import { getStagePalette, type StagePalette } from "./stage-themes";

export interface CodeStageBundle {
  files: Record<string, string>;
  duration: number;
  width: number;
  height: number;
  fps: number;
}

const DEFAULT_LINE_HEIGHT_PX = 42;

function computeCodeMetrics(
  steps: CodeStep[],
  isPortrait: boolean,
): { lineHeight: number; fontSize: number; lineNumSize: number } {
  const maxLines = Math.max(...steps.map((s) => s.code.split("\n").length), 1);
  const hasSide = steps.some((s) => Boolean(s.callout || s.terminal));
  const viewportBudget = isPortrait ? (hasSide ? 840 : 1280) : 710;
  const lineHeight = Math.min(DEFAULT_LINE_HEIGHT_PX, Math.max(28, Math.floor(viewportBudget / maxLines)));
  const fontSize = Math.min(isPortrait ? 21 : 23, Math.max(16, Math.round(lineHeight * 0.56)));
  const lineNumSize = Math.max(14, fontSize - 4);
  return { lineHeight, fontSize, lineNumSize };
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]!);

const fmtNum = (value: number): string => Number(value.toFixed(4)).toString();

function renderTokens(tokens: HighlightedCode["lines"][number]): string {
  if (tokens.length === 0) return "&#8203;";
  return tokens
    .map((token) => {
      const styles = [`color:${token.color}`];
      if (token.italic) styles.push("font-style:italic");
      if (token.bold) styles.push("font-weight:700");
      return `<span style="${styles.join(";")}">${escapeHtml(token.content)}</span>`;
    })
    .join("");
}

function renderStepSection(
  step: CodeStep,
  stepIndex: number,
  totalSteps: number,
  highlighted: HighlightedCode,
  diff: CodeStepDiff,
  language: string,
): string {
  const hasSidePanel = Boolean(step.callout || step.terminal);
  const focusSet = new Set(step.focusLines ?? []);
  const addedCount = stepIndex === 0 ? 0 : diff.lines.filter((l) => l.kind === "added").length;
  const removedCount = stepIndex === 0 ? 0 : diff.removedPrevIndices.length;

  const dotsHtml = Array.from({ length: totalSteps }, (_, idx) => {
    const cls = idx === stepIndex ? "step-dot active" : idx < stepIndex ? "step-dot done" : "step-dot";
    return `<span class="${cls}"></span>`;
  }).join("");

  const diffStatHtml =
    stepIndex > 0 && (addedCount > 0 || removedCount > 0)
      ? `<div class="diff-stats">${addedCount > 0 ? `<span class="diff-add">+${addedCount}</span>` : ""}${removedCount > 0 ? `<span class="diff-del">-${removedCount}</span>` : ""}</div>`
      : "";

  const codeRowsHtml = diff.lines
    .map((entry, idx) => {
      const lineNumber = idx + 1;
      const isFocused = focusSet.has(lineNumber);
      const isAdded = stepIndex > 0 && entry.kind === "added";
      const rowClasses = [
        "code-line",
        isAdded ? "is-added" : "is-unchanged",
        isFocused ? "is-focused" : focusSet.size > 0 ? "is-dimmed" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const gutterSign = isAdded ? "+" : "";
      const lineTokens = highlighted.lines[idx] ?? [];
      return `<div class="${rowClasses}" id="${step.id}-line-${lineNumber}" data-line="${lineNumber}"><span class="line-accent" id="${step.id}-accent-${lineNumber}"></span><span class="line-gutter">${gutterSign}</span><span class="line-num">${lineNumber}</span><code class="line-code">${renderTokens(lineTokens)}</code></div>`;
    })
    .join("");

  const calloutHtml = step.callout
    ? `<aside class="callout-card tone-${step.callout.tone}" id="${step.id}-callout"><div class="callout-meta"><span class="callout-line-tag">LINE ${step.callout.line}</span><span class="callout-title">${escapeHtml(step.callout.title)}</span></div><p class="callout-body">${escapeHtml(step.callout.body)}</p></aside>`
    : "";

  const terminalHtml = step.terminal
    ? `<div class="terminal-window" id="${step.id}-terminal"><div class="window-bar terminal-bar"><span class="mac-dot red"></span><span class="mac-dot yellow"></span><span class="mac-dot green"></span><span class="window-title">${escapeHtml(step.terminal.title)}</span></div><div class="terminal-body">${
        step.terminal.command
          ? `<div class="term-line term-cmd" id="${step.id}-term-cmd"><span class="term-prompt">$</span><span>${escapeHtml(step.terminal.command)}</span></div>`
          : ""
      }${step.terminal.lines
        .map(
          (line, lIdx) =>
            `<div class="term-line tone-${line.tone}" id="${step.id}-term-line-${lIdx}">${escapeHtml(line.text)}</div>`,
        )
        .join("")}</div></div>`
    : "";

  const sidePanelHtml = hasSidePanel
    ? `<div class="side-panel">${calloutHtml}${terminalHtml}</div>`
    : "";

  return `<section class="clip step-scene" id="${step.id}" data-start="${fmtNum(step.start)}" data-duration="${fmtNum(step.duration)}" data-track-index="1">
  <header class="stage-header" id="${step.id}-header">
    <div class="header-left">
      ${step.badge ? `<span class="step-badge" id="${step.id}-badge">${escapeHtml(step.badge)}</span>` : ""}
      <h1 class="step-headline" id="${step.id}-headline">${escapeHtml(step.headline)}</h1>
    </div>
    <div class="header-right">
      <span class="lang-pill">${escapeHtml(language.toUpperCase())}</span>
      <div class="step-dots">${dotsHtml}</div>
      <span class="step-counter">${stepIndex + 1} / ${totalSteps}</span>
    </div>
  </header>
  <main class="stage-main ${hasSidePanel ? "layout-split" : "layout-center"}">
    <div class="editor-window" id="${step.id}-editor" style="--code-bg:${highlighted.bg};--code-fg:${highlighted.fg};">
      <div class="window-bar">
        <span class="mac-dot red"></span>
        <span class="mac-dot yellow"></span>
        <span class="mac-dot green"></span>
        <span class="window-filename">${escapeHtml(step.filename)}</span>
        ${diffStatHtml}
      </div>
      <div class="code-viewport">${codeRowsHtml}</div>
    </div>
    ${sidePanelHtml}
  </main>
</section>`;
}

function renderCaptionsHtml(spec: CodeStageSpec): string {
  if (spec.audio) {
    // 基于火山 V3 字级时间戳渲染同步字幕片段
    return spec.audio.segments
      .map((seg, sIdx) => {
        const wordsHtml = seg.words
          .map((w, wIdx) => `<span class="cap-word" id="cap-w-${sIdx}-${wIdx}">${escapeHtml(w.text)}</span>`)
          .join("");
        return `<div class="clip caption-clip" id="caption-seg-${seg.id}" data-start="${fmtNum(seg.start)}" data-duration="${fmtNum(seg.duration)}" data-track-index="2"><div class="caption-pill">${wordsHtml}</div></div>`;
      })
      .join("\n");
  }

  // 无音频时按步骤展示旁白字幕
  return spec.steps
    .map(
      (step) =>
        `<div class="clip caption-clip" id="caption-step-${step.id}" data-start="${fmtNum(step.start)}" data-duration="${fmtNum(step.duration)}" data-track-index="2"><div class="caption-pill"><span class="cap-static">${escapeHtml(step.narration)}</span></div></div>`,
    )
    .join("\n");
}

function renderAudioClipsHtml(segments: AudioSegment[] | undefined): string {
  if (!segments || segments.length === 0) return "";
  return segments
    .map(
      (seg) =>
        `<audio id="audio-${seg.id}" class="clip" src="${escapeHtml(seg.file)}" data-start="${fmtNum(seg.start)}" data-duration="${fmtNum(seg.duration)}" data-track-index="0" preload="auto"></audio>`,
    )
    .join("\n");
}

function buildTimelineScript(
  spec: CodeStageSpec,
  diffs: CodeStepDiff[],
  lineHeightPx: number,
): string {
  const lines: string[] = [
    '"use strict";',
    "window.__timelines = window.__timelines || {};",
    "const tl = gsap.timeline({ paused: true });",
  ];

  spec.steps.forEach((step, stepIndex) => {
    const t0 = step.start;
    const diff = diffs[stepIndex];
    const focusSet = new Set(step.focusLines ?? []);

    // 1. Header 入场
    lines.push(
      `tl.fromTo("#${step.id}-header", { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.42, ease: "power3.out" }, ${fmtNum(t0)});`,
    );

    // 2. Editor 窗口（首步缩放淡入，后续步骤保持稳态避免闪烁）
    if (stepIndex === 0) {
      lines.push(
        `tl.fromTo("#${step.id}-editor", { opacity: 0, y: 22, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.52, ease: "power3.out" }, ${fmtNum(t0 + 0.05)});`,
      );
      // 首步代码逐行轻量 stagger 入场
      diff.lines.forEach((_, idx) => {
        const lineNum = idx + 1;
        const delay = Math.min(idx * 0.035, 0.7);
        lines.push(
          `tl.fromTo("#${step.id}-line-${lineNum}", { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.28, ease: "power2.out" }, ${fmtNum(t0 + 0.2 + delay)});`,
        );
      });
    } else {
      // Magic Move: unchanged 行从上一步的垂直位置平滑位移到当前行位
      diff.lines.forEach((entry, idx) => {
        const lineNum = idx + 1;
        if (entry.kind === "unchanged" && entry.prevIndex !== null) {
          const deltaY = (entry.prevIndex - entry.currIndex) * lineHeightPx;
          if (deltaY !== 0) {
            lines.push(
              `tl.fromTo("#${step.id}-line-${lineNum}", { y: ${deltaY}, opacity: 1 }, { y: 0, opacity: 1, duration: 0.58, ease: "power3.inOut" }, ${fmtNum(t0 + 0.04)});`,
            );
          }
        } else {
          // 新增行：在旧行腾出空间后平滑滑入
          const staggerOffset = Math.min(idx * 0.025, 0.35);
          lines.push(
            `tl.fromTo("#${step.id}-line-${lineNum}", { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.36, ease: "power3.out" }, ${fmtNum(t0 + 0.32 + staggerOffset)});`,
          );
        }
      });
    }

    // 3. 聚焦聚光灯（focusLines）：严格晚于所有行入场完毕后启动，零 tween 重叠
    if (focusSet.size > 0) {
      const focusAt = t0 + (stepIndex === 0 ? 1.25 : 1.12);
      diff.lines.forEach((_, idx) => {
        const lineNum = idx + 1;
        if (focusSet.has(lineNum)) {
          lines.push(
            `tl.fromTo("#${step.id}-accent-${lineNum}", { opacity: 0, scaleY: 0.2 }, { opacity: 1, scaleY: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, ${fmtNum(focusAt)});`,
          );
        } else {
          lines.push(
            `tl.fromTo("#${step.id}-line-${lineNum}", { opacity: 1 }, { opacity: 0.32, duration: 0.42, ease: "power2.inOut", immediateRender: false }, ${fmtNum(focusAt)});`,
          );
        }
      });
    }

    // 4. Callout 批注卡片入场
    if (step.callout) {
      const calloutAt = t0 + (stepIndex === 0 ? 1.0 : 1.05);
      lines.push(
        `tl.fromTo("#${step.id}-callout", { opacity: 0, x: 28, y: 8 }, { opacity: 1, x: 0, y: 0, duration: 0.48, ease: "power3.out" }, ${fmtNum(calloutAt)});`,
      );
    }

    // 5. 模拟终端窗口 + 逐行输出
    if (step.terminal) {
      const termAt = t0 + Math.min(1.35, step.duration * 0.25);
      lines.push(
        `tl.fromTo("#${step.id}-terminal", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, ${fmtNum(termAt)});`,
      );
      if (step.terminal.command) {
        lines.push(
          `tl.fromTo("#${step.id}-term-cmd", { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.26, ease: "power2.out" }, ${fmtNum(termAt + 0.25)});`,
        );
      }
      const lineStepGap = Math.min(0.32, Math.max(0.14, (step.duration * 0.45) / Math.max(step.terminal.lines.length, 1)));
      step.terminal.lines.forEach((_, lIdx) => {
        const at = termAt + 0.55 + lIdx * lineStepGap;
        lines.push(
          `tl.fromTo("#${step.id}-term-line-${lIdx}", { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.24, ease: "power2.out" }, ${fmtNum(at)});`,
        );
      });
    }
  });

  // 6. 若有火山 V3 字级时间戳，注册逐词高亮动画
  if (spec.audio) {
    spec.audio.segments.forEach((seg, sIdx) => {
      seg.words.forEach((word, wIdx) => {
        const dur = Math.max(0.05, word.end - word.start);
        lines.push(
          `tl.fromTo("#cap-w-${sIdx}-${wIdx}", { color: "#94a3b8" }, { color: "#f8fafc", duration: ${fmtNum(Math.min(0.12, dur))}, ease: "none", immediateRender: false }, ${fmtNum(word.start)});`,
        );
      });
    });
  }

  lines.push(`window.__timelines["${spec.meta.id}"] = tl;`);
  return lines.join("\n");
}

function buildStylesCss(
  width: number,
  height: number,
  metrics: { lineHeight: number; fontSize: number; lineNumSize: number },
  p: StagePalette,
): string {
  return `@font-face {
  font-family: "NotoSansSC";
  src: url("./assets/fonts/noto-sans-sc.woff2") format("woff2");
  font-weight: 400 900;
  font-style: normal;
  font-display: block;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: ${width}px;
  height: ${height}px;
  overflow: hidden;
  background: ${p.canvasBg};
  font-family: "NotoSansSC", sans-serif;
  color: ${p.text};
  -webkit-font-smoothing: antialiased;
}

.stage-root {
  position: relative;
  width: ${width}px;
  height: ${height}px;
  overflow: hidden;
}

.stage-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(960px 580px at 16% 12%, ${p.glow1}, transparent 65%),
    radial-gradient(900px 560px at 85% 88%, ${p.glow2}, transparent 65%),
    linear-gradient(180deg, ${p.canvasBg} 0%, ${p.canvasBgEnd} 100%);
  z-index: 0;
}

.stage-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(${p.gridDot} 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.6;
  z-index: 0;
}

.step-scene {
  position: absolute;
  inset: 0;
  width: ${width}px;
  height: ${height}px;
  padding: 44px 72px 118px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  z-index: 1;
}

.stage-header {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${p.border};
  padding-bottom: 18px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.step-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 999px;
  background: ${p.focusBg};
  border: 1px solid ${p.primary};
  color: ${p.primary};
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.step-headline {
  font-size: 34px;
  font-weight: 800;
  color: ${p.text};
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-shrink: 0;
}

.lang-pill {
  padding: 5px 12px;
  border-radius: 8px;
  background: ${p.barBg};
  border: 1px solid ${p.secondary};
  color: ${p.secondary};
  font-family: ui-monospace, monospace;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.step-dots {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${p.border};
}

.step-dot.done {
  background: ${p.secondary};
}

.step-dot.active {
  width: 28px;
  background: ${p.primary};
}

.step-counter {
  font-family: ui-monospace, monospace;
  font-size: 16px;
  color: ${p.muted};
  font-weight: 600;
}

.stage-main {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  gap: 32px;
}

.stage-main.layout-center {
  justify-content: center;
}

.stage-main.layout-center .editor-window {
  width: 1420px;
}

.stage-main.layout-split .editor-window {
  width: 1120px;
  flex-shrink: 0;
}

.editor-window {
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  background: var(--code-bg, ${p.panelBg});
  border: 1px solid ${p.border};
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  overflow: hidden;
}

.window-bar {
  height: 48px;
  padding: 0 20px;
  background: ${p.barBg};
  border-bottom: 1px solid ${p.border};
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
}

.mac-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.mac-dot.red { background: #ff5555; }
.mac-dot.yellow { background: #f1fa8c; }
.mac-dot.green { background: #50fa7b; }

.window-filename,
.window-title {
  margin-left: 10px;
  font-family: ui-monospace, monospace;
  font-size: 16px;
  color: ${p.muted};
  font-weight: 600;
}

.diff-stats {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: ui-monospace, monospace;
  font-size: 15px;
  font-weight: 700;
}

.diff-add { color: ${p.success}; }
.diff-del { color: ${p.danger}; }

.code-viewport {
  flex: 1;
  padding: 16px 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.code-line {
  position: relative;
  height: ${metrics.lineHeight}px;
  display: flex;
  align-items: center;
  padding: 0 24px 0 0;
  font-family: ui-monospace, monospace;
  font-size: ${metrics.fontSize}px;
  line-height: ${metrics.lineHeight}px;
  white-space: pre;
}

.code-line.is-added {
  background: ${p.addedBg};
}

.code-line.is-focused {
  background: ${p.focusBg};
}

.line-accent {
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: ${p.secondary};
  opacity: 0;
}

.line-gutter {
  width: 24px;
  text-align: center;
  color: ${p.success};
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.line-num {
  width: 48px;
  padding-right: 16px;
  text-align: right;
  color: ${p.lineNum};
  font-size: ${metrics.lineNumSize}px;
  user-select: none;
  flex-shrink: 0;
}

.code-line.is-focused .line-num {
  color: ${p.secondary};
  font-weight: 700;
}

.line-code {
  font-family: inherit;
  font-size: inherit;
  white-space: pre;
}

.side-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: flex-start;
}

.callout-card {
  padding: 24px 26px;
  border-radius: 16px;
  background: ${p.panelBg};
  border: 1px solid ${p.primary};
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.callout-card.tone-warn {
  border-color: ${p.warn};
}

.callout-card.tone-success {
  border-color: ${p.success};
}

.callout-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.callout-line-tag {
  padding: 3px 10px;
  border-radius: 6px;
  background: ${p.barBg};
  color: ${p.primary};
  font-family: ui-monospace, monospace;
  font-size: 14px;
  font-weight: 700;
}

.callout-card.tone-warn .callout-line-tag {
  color: ${p.warn};
}

.callout-card.tone-success .callout-line-tag {
  color: ${p.success};
}

.callout-title {
  font-size: 22px;
  font-weight: 700;
  color: ${p.text};
}

.callout-body {
  font-size: 19px;
  line-height: 1.6;
  color: ${p.muted};
}

.terminal-window {
  flex: 1;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: ${p.barBg};
  border: 1px solid ${p.border};
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.terminal-body {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: ui-monospace, monospace;
  font-size: 19px;
  line-height: 1.5;
}

.term-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: ${p.text};
  white-space: pre-wrap;
}

.term-prompt {
  color: ${p.secondary};
  font-weight: 700;
}

.term-cmd {
  color: ${p.text};
  font-weight: 600;
  padding-bottom: 6px;
  border-bottom: 1px dashed ${p.border};
}

.term-line.tone-success { color: ${p.success}; }
.term-line.tone-warn { color: ${p.warn}; }
.term-line.tone-error { color: ${p.danger}; }
.term-line.tone-dim { color: ${p.muted}; }

.caption-clip {
  position: absolute;
  left: 72px;
  right: 72px;
  bottom: 30px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.caption-pill {
  max-width: 1620px;
  padding: 12px 28px;
  border-radius: 14px;
  background: ${p.captionBg};
  border: 1px solid ${p.border};
  font-size: 24px;
  font-weight: 600;
  color: ${p.text};
  line-height: 1.4;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cap-word {
  color: ${p.muted};
}
${
  height > width
    ? `
/* 9:16 竖屏短视频自适应排版 */
.step-scene {
  padding: 56px 44px 168px;
  gap: 24px;
}
.stage-header {
  height: auto;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 18px;
}
.step-headline {
  font-size: 36px;
  white-space: normal;
  line-height: 1.25;
}
.stage-main,
.stage-main.layout-split,
.stage-main.layout-center {
  flex-direction: column;
  justify-content: flex-start;
  gap: 24px;
}
.stage-main.layout-split .editor-window,
.stage-main.layout-center .editor-window {
  width: 100%;
  flex: 0 1 auto;
}
.side-panel {
  flex: 1;
  width: 100%;
  gap: 20px;
}
.caption-clip {
  left: 36px;
  right: 36px;
  bottom: 42px;
  height: auto;
  min-height: 88px;
}
.caption-pill {
  max-width: 100%;
  padding: 16px 26px;
  font-size: 28px;
  white-space: normal;
  line-height: 1.45;
}
`
    : ""
}
`;
}

/**
 * 将 CodeStageSpec 编译为确定性、可 seek、离线自包含的 HyperFrames 工程文件集合。
 */
export async function buildCodeStage(rawSpec: CodeStageSpec): Promise<CodeStageBundle> {
  const spec = codeStageSpecSchema.parse(rawSpec);
  const duration = getTotalDuration(spec);
  const { id, width, height, fps, language, shikiTheme, title } = spec.meta;

  const diffs: CodeStepDiff[] = [];
  const highlightedSteps: HighlightedCode[] = [];

  for (let i = 0; i < spec.steps.length; i++) {
    const prevCode = i === 0 ? null : spec.steps[i - 1].code;
    diffs.push(diffCodeLines(prevCode, spec.steps[i].code));
    highlightedSteps.push(await highlightCode(spec.steps[i].code, language, shikiTheme));
  }

  const sectionsHtml = spec.steps
    .map((step, idx) => renderStepSection(step, idx, spec.steps.length, highlightedSteps[idx], diffs[idx], language))
    .join("\n");

  const palette = getStagePalette(shikiTheme);
  const metrics = computeCodeMetrics(spec.steps, height > width);
  const captionsHtml = renderCaptionsHtml(spec);
  const audioHtml = renderAudioClipsHtml(spec.audio?.segments);
  const timelineJs = buildTimelineScript(spec, diffs, metrics.lineHeight);
  const stylesCss = buildStylesCss(width, height, metrics, palette);

  const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="./styles.css" />
  <script src="./assets/vendor/gsap.min.js"></script>
</head>
<body>
  <div
    class="stage-root"
    data-composition-id="${id}"
    data-width="${width}"
    data-height="${height}"
    data-fps="${fps}"
    data-duration="${fmtNum(duration)}"
  >
    <div class="stage-bg" aria-hidden="true"></div>
    <div class="stage-grid" aria-hidden="true"></div>
    ${audioHtml}
    ${sectionsHtml}
    ${captionsHtml}
  </div>
  <script>
${timelineJs}
  </script>
</body>
</html>
`;

  return {
    files: {
      "index.html": indexHtml,
      "styles.css": stylesCss,
    },
    duration,
    width,
    height,
    fps,
  };
}
