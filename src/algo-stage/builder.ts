import { highlightCode, type HighlightedCode } from "../code-stage/highlighter";
import type { AudioSegment } from "../code-stage/schema";
import { getStagePalette, type StagePalette } from "../code-stage/stage-themes";
import { renderStructureSvg } from "./renderers";
import { algoStageSpecSchema, getAlgoTotalDuration, type AlgoStageSpec, type AlgoTraceFrame } from "./schema";

export interface AlgoStageBundle {
  files: Record<string, string>;
  duration: number;
  width: number;
  height: number;
  fps: number;
}

const escapeHtml = (value: string | number | boolean | null): string =>
  String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]!);

const fmtNum = (value: number): string => Number(value.toFixed(4)).toString();

const EVENT_LABELS: Record<AlgoTraceFrame["event"], { text: string; tone: string }> = {
  init: { text: "INIT", tone: "info" },
  compare: { text: "COMPARE", tone: "warn" },
  swap: { text: "SWAP", tone: "pink" },
  move: { text: "POINTER MOVE", tone: "info" },
  update: { text: "UPDATE", tone: "info" },
  found: { text: "FOUND", tone: "success" },
  done: { text: "DONE", tone: "success" },
};

function renderCodeTokens(tokens: HighlightedCode["lines"][number]): string {
  if (tokens.length === 0) return "&#8203;";
  return tokens
    .map((t) => {
      const styles = [`color:${t.color}`];
      if (t.italic) styles.push("font-style:italic");
      if (t.bold) styles.push("font-weight:700");
      return `<span style="${styles.join(";")}">${escapeHtml(t.content)}</span>`;
    })
    .join("");
}

function computeCodeMetrics(code: string, isPortrait: boolean): { lineHeight: number; fontSize: number; lineNumSize: number } {
  const lineCount = code.split("\n").length;
  const budget = isPortrait ? 560 : 690;
  const lineHeight = Math.min(38, Math.max(24, Math.floor(budget / Math.max(lineCount, 1))));
  const fontSize = Math.min(20, Math.max(15, Math.round(lineHeight * 0.56)));
  return { lineHeight, fontSize, lineNumSize: Math.max(13, fontSize - 3) };
}

function renderFrameSection(
  frame: AlgoTraceFrame,
  frameIdx: number,
  totalFrames: number,
  prevFrame: AlgoTraceFrame | null,
  spec: AlgoStageSpec,
  highlighted: HighlightedCode,
  svgHtml: string,
): string {
  const eventInfo = EVENT_LABELS[frame.event];
  const progressPct = Math.round(((frameIdx + 1) / totalFrames) * 100);

  const codeRowsHtml = highlighted.lines
    .map((lineTokens, idx) => {
      const lineNum = idx + 1;
      const isCurrent = lineNum === frame.line;
      return `<div class="code-line ${isCurrent ? "is-exec" : ""}" id="${frame.id}-cl-${lineNum}">
        <span class="exec-arrow">${isCurrent ? "▶" : ""}</span>
        <span class="line-num">${lineNum}</span>
        <code class="line-code">${renderCodeTokens(lineTokens)}</code>
      </div>`;
    })
    .join("");

  const varEntries = Object.entries(frame.vars);
  const varsHtml =
    varEntries.length > 0
      ? varEntries
          .map(([k, v], vIdx) => {
            const changed = prevFrame !== null && prevFrame.vars[k] !== v;
            return `<div class="var-chip ${changed ? "is-changed" : ""}" id="${frame.id}-var-${vIdx}">
              <span class="var-name">${escapeHtml(k)}</span>
              <span class="var-val">${v === null ? "null" : escapeHtml(v)}</span>
            </div>`;
          })
          .join("")
      : `<div class="var-empty">无局部变量</div>`;

  const complexityHtml = spec.meta.complexity
    ? `<div class="complexity-pills">
        <span class="comp-pill">Time ${escapeHtml(spec.meta.complexity.time)}</span>
        <span class="comp-pill">Space ${escapeHtml(spec.meta.complexity.space)}</span>
      </div>`
    : "";

  return `<section class="clip algo-scene" id="${frame.id}" data-start="${fmtNum(frame.start)}" data-duration="${fmtNum(frame.duration)}" data-track-index="1">
  <header class="algo-header">
    <div class="header-left">
      <span class="algo-badge">${escapeHtml(spec.meta.algorithm)}</span>
      <h1 class="algo-title">${escapeHtml(spec.meta.title)}</h1>
    </div>
    <div class="header-right">
      ${complexityHtml}
      <div class="step-progress">
        <div class="progress-track"><div class="progress-fill" style="width:${progressPct}%"></div></div>
        <span class="step-counter">STEP ${frameIdx + 1} / ${totalFrames}</span>
      </div>
    </div>
  </header>
  <main class="algo-grid">
    <div class="code-panel" style="--code-bg:${highlighted.bg};--code-fg:${highlighted.fg};">
      <div class="panel-bar">
        <span class="mac-dot red"></span><span class="mac-dot yellow"></span><span class="mac-dot green"></span>
        <span class="panel-title">${escapeHtml(spec.meta.filename)}</span>
        <span class="exec-line-badge">LINE ${frame.line}</span>
      </div>
      <div class="code-body">${codeRowsHtml}</div>
    </div>
    <div class="visual-column">
      <div class="viz-panel" id="${frame.id}-viz">
        <div class="panel-bar">
          <span class="event-pill tone-${eventInfo.tone}">${eventInfo.text}</span>
          <span class="event-note" id="${frame.id}-note">${escapeHtml(frame.note)}</span>
        </div>
        <div class="viz-canvas">${svgHtml}</div>
      </div>
      <div class="watch-panel" id="${frame.id}-watch">
        <div class="panel-bar watch-bar">
          <span class="panel-title">VARIABLES WATCH</span>
          <span class="watch-hint">变更变量高亮显示</span>
        </div>
        <div class="watch-grid">${varsHtml}</div>
      </div>
    </div>
  </main>
</section>`;
}

function renderCaptionsHtml(spec: AlgoStageSpec): string {
  if (spec.audio) {
    return spec.audio.segments
      .map((seg, sIdx) => {
        const wordsHtml = seg.words
          .map((w, wIdx) => `<span class="cap-word" id="cap-w-${sIdx}-${wIdx}">${escapeHtml(w.text)}</span>`)
          .join("");
        return `<div class="clip caption-clip" id="caption-seg-${seg.id}" data-start="${fmtNum(seg.start)}" data-duration="${fmtNum(seg.duration)}" data-track-index="2"><div class="caption-pill">${wordsHtml}</div></div>`;
      })
      .join("\n");
  }
  return spec.frames
    .map(
      (f) =>
        `<div class="clip caption-clip" id="caption-${f.id}" data-start="${fmtNum(f.start)}" data-duration="${fmtNum(f.duration)}" data-track-index="2"><div class="caption-pill">${escapeHtml(f.narration)}</div></div>`,
    )
    .join("\n");
}

function renderAudioHtml(segments: AudioSegment[] | undefined): string {
  if (!segments?.length) return "";
  return segments
    .map(
      (seg) =>
        `<audio id="audio-${seg.id}" class="clip" src="${escapeHtml(seg.file)}" data-start="${fmtNum(seg.start)}" data-duration="${fmtNum(seg.duration)}" data-track-index="0" preload="auto"></audio>`,
    )
    .join("\n");
}

function buildTimelineJs(
  spec: AlgoStageSpec,
  pointerCoordsPerFrame: Array<Record<string, { x: number; y: number }>>,
  cellCoordsPerFrame: Array<Record<number, { x: number; y: number }> | undefined>,
): string {
  const lines: string[] = [
    '"use strict";',
    "window.__timelines = window.__timelines || {};",
    "const tl = gsap.timeline({ paused: true });",
  ];

  spec.frames.forEach((frame, idx) => {
    const t0 = frame.start;
    const prevCoords = idx > 0 ? pointerCoordsPerFrame[idx - 1] : null;
    const currCoords = pointerCoordsPerFrame[idx];

    // 1. 当前执行代码行轻量高亮脉冲
    lines.push(
      `tl.fromTo("#${frame.id}-cl-${frame.line}", { x: -6, opacity: 0.7 }, { x: 0, opacity: 1, duration: 0.28, ease: "power2.out" }, ${fmtNum(t0)});`,
    );

    // 2. 事件说明条微入场
    lines.push(
      `tl.fromTo("#${frame.id}-note", { opacity: 0, x: 14 }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }, ${fmtNum(t0 + 0.04)});`,
    );

    // 3. 指针 FLIP 平滑位移：如果同名指针在上一帧存在且坐标变了，从旧位置平滑滑到新位置！
    for (const [ptrName, curr] of Object.entries(currCoords)) {
      const prev = prevCoords?.[ptrName];
      const selector = `#${frame.id}-ptr-${ptrName}`;
      if (prev && (prev.x !== curr.x || prev.y !== curr.y)) {
        const dx = prev.x - curr.x;
        const dy = prev.y - curr.y;
        lines.push(
          `tl.fromTo("${selector}", { x: ${dx}, y: ${dy} }, { x: 0, y: 0, duration: 0.52, ease: "power3.inOut" }, ${fmtNum(t0 + 0.05)});`,
        );
      } else if (idx === 0) {
        lines.push(
          `tl.fromTo("${selector}", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.36, ease: "power2.out" }, ${fmtNum(t0 + 0.15)});`,
        );
      }
    }

    // 3b. 数组元素 Swap 互换位移动画（swappedPair: [a, b]）
    if (frame.structure.type === "array" && frame.structure.swappedPair) {
      const [idxA, idxB] = frame.structure.swappedPair;
      const coords = cellCoordsPerFrame[idx];
      if (coords && coords[idxA] && coords[idxB] && idxA !== idxB) {
        const dx = coords[idxB].x - coords[idxA].x;
        // a 从 b 的旧位置（+dx）沿上方弧线滑落到 a，b 从 a 的旧位置（-dx）沿下方弧线滑落到 b
        lines.push(
          `tl.fromTo("#${frame.id}-cell-${idxA}", { x: ${dx}, y: -26 }, { x: 0, y: 0, duration: 0.56, ease: "power3.inOut" }, ${fmtNum(t0 + 0.06)});`,
        );
        lines.push(
          `tl.fromTo("#${frame.id}-cell-${idxB}", { x: ${-dx}, y: 26 }, { x: 0, y: 0, duration: 0.56, ease: "power3.inOut" }, ${fmtNum(t0 + 0.06)});`,
        );
      }
    }

    // 3c. Matrix DP 状态转移箭头入场动画
    if (frame.structure.type === "matrix" && frame.structure.activeCell) {
      const [ar, ac] = frame.structure.activeCell;
      lines.push(
        `tl.fromTo("#${frame.id}-mcell-${ar}-${ac}", { scale: 0.88, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.36, ease: "back.out(1.6)" }, ${fmtNum(t0 + 0.08)});`,
      );
      (frame.structure.fromCells ?? []).forEach((_, aIdx) => {
        lines.push(
          `tl.fromTo("#${frame.id}-marrow-${aIdx}", { opacity: 0 }, { opacity: 1, duration: 0.34, ease: "power2.out" }, ${fmtNum(t0 + 0.04 + aIdx * 0.08)});`,
        );
      });
    }

    // 3d. Stack / Queue 入栈/入队滑入动效
    if (frame.structure.type === "stack-queue" && frame.structure.action === "push" && frame.structure.items.length > 0) {
      const topIdx = frame.structure.items.length - 1;
      const fromProps = frame.structure.variant === "queue" ? "x: 42, opacity: 0" : "y: -36, opacity: 0";
      lines.push(
        `tl.fromTo("#${frame.id}-sq-${topIdx}", { ${fromProps} }, { x: 0, y: 0, opacity: 1, duration: 0.42, ease: "power3.out" }, ${fmtNum(t0 + 0.08)});`,
      );
    }

    // 4. 发生变更的变量芯片轻量缩放提示
    const prevFrame = idx > 0 ? spec.frames[idx - 1] : null;
    Object.entries(frame.vars).forEach(([k, v], vIdx) => {
      if (prevFrame && prevFrame.vars[k] !== v) {
        lines.push(
          `tl.fromTo("#${frame.id}-var-${vIdx}", { scale: 0.92, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.34, ease: "back.out(1.7)" }, ${fmtNum(t0 + 0.12)});`,
        );
      }
    });
  });

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

* { box-sizing: border-box; margin: 0; padding: 0; }

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
    radial-gradient(960px 580px at 14% 12%, ${p.glow1}, transparent 65%),
    radial-gradient(900px 560px at 86% 88%, ${p.glow2}, transparent 65%),
    linear-gradient(180deg, ${p.canvasBg} 0%, ${p.canvasBgEnd} 100%);
  z-index: 0;
}

.stage-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(${p.gridDot} 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.58;
  z-index: 0;
}

.algo-scene {
  position: absolute;
  inset: 0;
  width: ${width}px;
  height: ${height}px;
  padding: 36px 56px 110px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  z-index: 1;
}

.algo-header {
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${p.border};
  padding-bottom: 14px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.algo-badge {
  padding: 6px 14px;
  border-radius: 999px;
  background: ${p.focusBg};
  border: 1px solid ${p.primary};
  color: ${p.primary};
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}

.algo-title {
  font-size: 30px;
  font-weight: 800;
  color: ${p.text};
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.complexity-pills {
  display: flex;
  gap: 10px;
}

.comp-pill {
  padding: 5px 12px;
  border-radius: 8px;
  background: ${p.barBg};
  border: 1px solid ${p.border};
  color: ${p.muted};
  font-family: ui-monospace, monospace;
  font-size: 14px;
  font-weight: 600;
}

.step-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-track {
  width: 120px;
  height: 8px;
  border-radius: 999px;
  background: ${p.border};
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, ${p.primary}, ${p.secondary});
}

.step-counter {
  font-family: ui-monospace, monospace;
  font-size: 15px;
  color: ${p.muted};
  font-weight: 700;
}

.algo-grid {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 28px;
}

.code-panel {
  width: 780px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  background: var(--code-bg, ${p.panelBg});
  border: 1px solid ${p.border};
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.visual-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.viz-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  background: ${p.panelBg};
  border: 1px solid ${p.border};
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.watch-panel {
  height: 210px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  background: ${p.panelBg};
  border: 1px solid ${p.border};
  overflow: hidden;
}

.panel-bar {
  height: 46px;
  padding: 0 18px;
  background: ${p.barBg};
  border-bottom: 1px solid ${p.border};
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.mac-dot { width: 11px; height: 11px; border-radius: 50%; }
.mac-dot.red { background: #ff5555; }
.mac-dot.yellow { background: #f1fa8c; }
.mac-dot.green { background: #50fa7b; }

.panel-title {
  margin-left: 6px;
  font-family: ui-monospace, monospace;
  font-size: 15px;
  font-weight: 700;
  color: ${p.muted};
}

.exec-line-badge {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 6px;
  background: ${p.focusBg};
  color: ${p.secondary};
  font-family: ui-monospace, monospace;
  font-size: 14px;
  font-weight: 700;
}

.code-body {
  flex: 1;
  padding: 14px 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.code-line {
  height: ${metrics.lineHeight}px;
  display: flex;
  align-items: center;
  padding: 0 18px 0 8px;
  font-family: ui-monospace, monospace;
  font-size: ${metrics.fontSize}px;
  line-height: ${metrics.lineHeight}px;
  white-space: pre;
  border-left: 3px solid transparent;
}

.code-line.is-exec {
  background: ${p.focusBg};
  border-left-color: ${p.secondary};
}

.exec-arrow {
  width: 20px;
  color: ${p.secondary};
  font-size: 13px;
  text-align: center;
  flex-shrink: 0;
}

.line-num {
  width: 36px;
  padding-right: 12px;
  text-align: right;
  color: ${p.lineNum};
  font-size: ${metrics.lineNumSize}px;
  flex-shrink: 0;
}

.code-line.is-exec .line-num {
  color: ${p.secondary};
  font-weight: 700;
}

.line-code {
  font-family: ui-monospace, monospace;
  white-space: pre;
}

.event-pill {
  padding: 4px 10px;
  border-radius: 6px;
  font-family: ui-monospace, monospace;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.event-pill.tone-info { background: ${p.focusBg}; color: ${p.primary}; }
.event-pill.tone-warn { background: rgba(241, 250, 140, 0.16); color: ${p.warn}; }
.event-pill.tone-pink { background: rgba(255, 121, 198, 0.18); color: ${p.secondary}; }
.event-pill.tone-success { background: ${p.addedBg}; color: ${p.success}; }

.event-note {
  font-size: 17px;
  font-weight: 600;
  color: ${p.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.viz-canvas {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
}

.algo-svg {
  width: 100%;
  height: 100%;
  max-width: 940px;
  max-height: 430px;
}

.watch-hint {
  margin-left: auto;
  font-size: 13px;
  color: ${p.muted};
}

.watch-grid {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 12px;
}

.var-chip {
  min-width: 150px;
  padding: 10px 16px;
  border-radius: 12px;
  background: ${p.barBg};
  border: 1px solid ${p.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  font-family: ui-monospace, monospace;
}

.var-chip.is-changed {
  background: rgba(241, 250, 140, 0.12);
  border-color: ${p.warn};
}

.var-name {
  font-size: 16px;
  color: ${p.muted};
  font-weight: 600;
}

.var-chip.is-changed .var-name {
  color: ${p.warn};
}

.var-val {
  font-size: 20px;
  color: ${p.text};
  font-weight: 700;
}

.var-empty {
  font-size: 16px;
  color: ${p.muted};
}

.caption-clip {
  position: absolute;
  left: 56px;
  right: 56px;
  bottom: 26px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.caption-pill {
  max-width: 1660px;
  padding: 10px 26px;
  border-radius: 14px;
  background: ${p.captionBg};
  border: 1px solid ${p.border};
  font-size: 22px;
  font-weight: 600;
  color: ${p.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cap-word { color: ${p.muted}; }
${
  height > width
    ? `
/* 9:16 竖屏短视频自适应排版 */
.algo-scene {
  padding: 52px 40px 164px;
  gap: 20px;
}
.algo-header {
  height: auto;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}
.algo-title {
  font-size: 34px;
  white-space: normal;
  line-height: 1.25;
}
.algo-grid {
  flex-direction: column;
  gap: 20px;
}
.code-panel {
  width: 100%;
  height: 620px;
  flex-shrink: 0;
}
.visual-column {
  flex: 1;
  gap: 18px;
}
.watch-panel {
  height: 220px;
}
.caption-clip {
  left: 34px;
  right: 34px;
  bottom: 40px;
  height: auto;
  min-height: 88px;
}
.caption-pill {
  max-width: 100%;
  padding: 14px 24px;
  font-size: 27px;
  white-space: normal;
  line-height: 1.45;
}
`
    : ""
}
`;
}

export async function buildAlgoStage(rawSpec: AlgoStageSpec): Promise<AlgoStageBundle> {
  const spec = algoStageSpecSchema.parse(rawSpec);
  const duration = getAlgoTotalDuration(spec);
  const { id, width, height, fps, language, shikiTheme, title } = spec.meta;

  const highlighted = await highlightCode(spec.code, language, shikiTheme);
  const metrics = computeCodeMetrics(spec.code, height > width);

  const pointerCoordsPerFrame: Array<Record<string, { x: number; y: number }>> = [];
  const cellCoordsPerFrame: Array<Record<number, { x: number; y: number }> | undefined> = [];
  const sectionsHtml = spec.frames
    .map((frame, idx) => {
      const rendered = renderStructureSvg(frame.id, frame.structure);
      pointerCoordsPerFrame.push(rendered.pointerCoords);
      cellCoordsPerFrame.push(rendered.cellCoords);
      const prev = idx > 0 ? spec.frames[idx - 1] : null;
      return renderFrameSection(frame, idx, spec.frames.length, prev, spec, highlighted, rendered.svgHtml);
    })
    .join("\n");

  const palette = getStagePalette(shikiTheme);
  const timelineJs = buildTimelineJs(spec, pointerCoordsPerFrame, cellCoordsPerFrame);
  const stylesCss = buildStylesCss(width, height, metrics, palette);
  const captionsHtml = renderCaptionsHtml(spec);
  const audioHtml = renderAudioHtml(spec.audio?.segments);

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
