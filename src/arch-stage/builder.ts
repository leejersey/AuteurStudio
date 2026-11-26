import {
  buildPackagingCss,
  buildPackagingTimelineJs,
  computePackagingMetrics,
  renderBgmAudioHtml,
  renderIntroHtml,
  renderOutroHtml,
} from "@/code-stage/packaging";
import { getStagePalette, type StagePalette } from "@/code-stage/stage-themes";
import {
  archStageSpecSchema,
  type ArchEdge,
  type ArchNode,
  type ArchNodeKind,
  type ArchStageSpec,
} from "./schema";

export interface BuiltArchStageBundle {
  indexHtml: string;
  stylesCss: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
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

const KIND_TAG: Record<ArchNodeKind, { tag: string; colorKey: keyof StagePalette }> = {
  client: { tag: "CLIENT", colorKey: "primary" },
  browser: { tag: "BROWSER", colorKey: "primary" },
  gateway: { tag: "GATEWAY", colorKey: "secondary" },
  service: { tag: "SERVICE", colorKey: "primary" },
  runtime: { tag: "RUNTIME", colorKey: "secondary" },
  cache: { tag: "CACHE", colorKey: "warn" },
  database: { tag: "STORAGE", colorKey: "success" },
  queue: { tag: "QUEUE", colorKey: "warn" },
  llm: { tag: "AI MODEL", colorKey: "secondary" },
  external: { tag: "API", colorKey: "muted" },
};

interface NodeRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

interface EdgeGeom {
  edge: ArchEdge;
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  x2: number;
  y2: number;
  labelX: number;
  labelY: number;
  pathD: string;
}

function computeTopologyLayout(
  nodes: ArchNode[],
  edges: ArchEdge[],
  viewW: number,
  viewH: number,
): { rects: Map<string, NodeRect>; geoms: Map<string, EdgeGeom> } {
  const cols = [...new Set(nodes.map((n) => n.col))].sort((a, b) => a - b);
  const rows = [...new Set(nodes.map((n) => n.row))].sort((a, b) => a - b);
  const colIndex = new Map(cols.map((c, i) => [c, i]));
  const rowIndex = new Map(rows.map((r, i) => [r, i]));

  const padX = 56;
  const padY = 58;
  const usableW = viewW - padX * 2;
  const usableH = viewH - padY * 2;

  const colCount = Math.max(1, cols.length);
  const rowCount = Math.max(1, rows.length);

  const cellW = usableW / colCount;
  const cellH = usableH / rowCount;
  const nodeW = Math.min(246, Math.max(168, Math.floor(cellW * 0.72)));
  const nodeH = Math.min(112, Math.max(88, Math.floor(cellH * 0.56)));

  const rects = new Map<string, NodeRect>();
  for (const node of nodes) {
    const ci = colIndex.get(node.col) ?? 0;
    const ri = rowIndex.get(node.row) ?? 0;
    const cx = padX + cellW * (ci + 0.5);
    const cy = padY + cellH * (ri + 0.5);
    rects.set(node.id, {
      id: node.id,
      x: cx - nodeW / 2,
      y: cy - nodeH / 2,
      w: nodeW,
      h: nodeH,
      cx,
      cy,
    });
  }

  // 检测反向双向边，给相反方向的连线轻微弯曲错位避免重合
  const pairCount = new Map<string, number>();
  for (const e of edges) {
    const key = [e.from, e.to].sort().join("--");
    pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
  }
  const pairSeen = new Map<string, number>();

  const geoms = new Map<string, EdgeGeom>();
  for (const edge of edges) {
    const a = rects.get(edge.from);
    const b = rects.get(edge.to);
    if (!a || !b) continue;

    const dx = b.cx - a.cx;
    const dy = b.cy - a.cy;

    let x1 = a.cx;
    let y1 = a.cy;
    let x2 = b.cx;
    let y2 = b.cy;

    if (Math.abs(dx) >= Math.abs(dy)) {
      x1 = dx >= 0 ? a.x + a.w : a.x;
      x2 = dx >= 0 ? b.x : b.x + b.w;
    } else {
      y1 = dy >= 0 ? a.y + a.h : a.y;
      y2 = dy >= 0 ? b.y : b.y + b.h;
    }

    const key = [edge.from, edge.to].sort().join("--");
    const total = pairCount.get(key) ?? 1;
    const seen = pairSeen.get(key) ?? 0;
    pairSeen.set(key, seen + 1);

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;
    const bend = total > 1 ? (seen === 0 ? -28 : 28) : 0;
    const cx = mx + nx * bend;
    const cy = my + ny * bend;

    const pathD =
      bend === 0
        ? `M ${fmtNum(x1)} ${fmtNum(y1)} L ${fmtNum(x2)} ${fmtNum(y2)}`
        : `M ${fmtNum(x1)} ${fmtNum(y1)} Q ${fmtNum(cx)} ${fmtNum(cy)} ${fmtNum(x2)} ${fmtNum(y2)}`;

    // 二次贝塞尔 t=0.5 中点坐标用于文字标签
    const labelX = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
    const labelY = 0.25 * y1 + 0.5 * cy + 0.25 * y2 - 12;

    geoms.set(edge.id, { edge, x1, y1, cx, cy, x2, y2, labelX, labelY, pathD });
  }

  return { rects, geoms };
}

function buildStylesCss(p: StagePalette, isPortrait: boolean): string {
  return `@font-face {
  font-family: "NotoSansSC";
  src: url("./assets/fonts/noto-sans-sc-chinese-simplified-400-normal.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "NotoSansSC";
  src: url("./assets/fonts/noto-sans-sc-chinese-simplified-700-normal.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${p.canvasBg};
  color: ${p.text};
  font-family: "NotoSansSC", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.stage {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.stage-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 16%, ${p.glow1}, transparent 48%),
    radial-gradient(circle at 82% 84%, ${p.glow2}, transparent 46%),
    linear-gradient(155deg, ${p.canvasBg} 0%, ${p.canvasBgEnd} 100%);
}

.stage-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(${p.gridDot} 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.55;
}

.stage-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: ${isPortrait ? "48px 34px 120px" : "34px 48px 104px"};
  gap: ${isPortrait ? "18px" : "20px"};
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.step-badge {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 999px;
  background: ${p.focusBg};
  border: 1px solid ${p.primary};
  color: ${p.primary};
  font-size: ${isPortrait ? "18px" : "16px"};
  font-weight: 700;
  letter-spacing: 0.04em;
}

.headline {
  font-size: ${isPortrait ? "30px" : "32px"};
  font-weight: 700;
  color: ${p.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.domain-pill {
  padding: 6px 14px;
  border-radius: 10px;
  background: ${p.barBg};
  border: 1px solid ${p.border};
  color: ${p.secondary};
  font-family: ui-monospace, monospace;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.progress-dots {
  display: flex;
  align-items: center;
  gap: 7px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: ${p.border};
}

.dot.active {
  width: 24px;
  background: ${p.primary};
}

.workspace {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: ${isPortrait ? "1fr" : "1.95fr 0.85fr"};
  grid-template-rows: ${isPortrait ? "1.35fr 0.78fr" : "1fr"};
  gap: ${isPortrait ? "16px" : "22px"};
}

.panel {
  position: relative;
  border-radius: 18px;
  background: ${p.panelBg};
  border: 1px solid ${p.border};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 22px 54px rgba(0, 0, 0, 0.36);
}

.panel-bar {
  height: 44px;
  padding: 0 18px;
  background: ${p.barBg};
  border-bottom: 1px solid ${p.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: ui-monospace, monospace;
  font-size: 14px;
  color: ${p.muted};
}

.win-dots {
  display: flex;
  align-items: center;
  gap: 8px;
}

.win-dot {
  width: 11px;
  height: 11px;
  border-radius: 999px;
}

.canvas-body {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arch-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.side-body {
  flex: 1;
  min-height: 0;
  padding: ${isPortrait ? "16px 20px" : "22px 22px"};
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.callout-box {
  padding: 18px 20px;
  border-radius: 14px;
  background: ${p.barBg};
  border: 1px solid ${p.primary};
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.callout-title {
  font-size: 19px;
  font-weight: 700;
  color: ${p.primary};
}

.callout-body {
  font-size: 17px;
  line-height: 1.62;
  color: ${p.text};
}

.metrics-grid {
  display: grid;
  grid-template-columns: ${isPortrait ? "repeat(2, 1fr)" : "1fr"};
  gap: 10px;
}

.metric-card {
  padding: 12px 16px;
  border-radius: 12px;
  background: ${p.barBg};
  border: 1px solid ${p.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-label {
  font-size: 14px;
  color: ${p.muted};
  font-family: ui-monospace, monospace;
}

.metric-value {
  font-size: 17px;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  color: ${p.text};
}

.metric-value.primary { color: ${p.primary}; }
.metric-value.success { color: ${p.success}; }
.metric-value.warn { color: ${p.warn}; }
.metric-value.danger { color: ${p.danger}; }

.legend-bar {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid ${p.border};
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: ${p.muted};
  font-family: ui-monospace, monospace;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-swatch {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.caption-bar {
  position: absolute;
  left: ${isPortrait ? "34px" : "96px"};
  right: ${isPortrait ? "34px" : "96px"};
  bottom: ${isPortrait ? "34px" : "24px"};
  padding: 14px 24px;
  border-radius: 14px;
  background: ${p.captionBg};
  border: 1px solid ${p.border};
  text-align: center;
  font-size: ${isPortrait ? "24px" : "23px"};
  line-height: 1.48;
  color: ${p.text};
  z-index: 40;
}

.cap-word {
  color: ${p.muted};
}

.cap-word.spoken {
  color: ${p.text};
}

.cap-word.active {
  color: ${p.primary};
  font-weight: 700;
}

${buildPackagingCss(p, isPortrait)}
`;
}

export async function buildArchStage(rawSpec: ArchStageSpec): Promise<BuiltArchStageBundle> {
  const spec = archStageSpecSchema.parse(rawSpec);
  const { width, height, fps, title, subtitle, domain, theme } = spec.meta;
  const isPortrait = height > width;
  const palette = getStagePalette(theme);

  const lastStep = spec.steps[spec.steps.length - 1];
  const rawDuration = Math.max(
    lastStep.start + lastStep.duration,
    spec.audio?.duration ?? 0,
  );
  const pkgMetrics = computePackagingMetrics(rawDuration, spec.packaging);
  const { introOffset, contentEnd, totalDuration, outroStart } = pkgMetrics;

  const viewW = isPortrait ? 960 : 1220;
  const viewH = isPortrait ? 920 : 760;
  const { rects, geoms } = computeTopologyLayout(spec.nodes, spec.edges, viewW, viewH);

  // 渲染静态 SVG 拓扑层
  const edgesSvg = spec.edges
    .map((edge) => {
      const g = geoms.get(edge.id);
      if (!g) return "";
      const dash = edge.style === "dashed" ? ` stroke-dasharray="9 7"` : "";
      const labelSvg = edge.label
        ? `<g id="edge-lbl-${escapeHtml(edge.id)}" opacity="0.72">
            <rect x="${fmtNum(g.labelX - Math.max(36, edge.label.length * 6.5))}" y="${fmtNum(g.labelY - 12)}" width="${fmtNum(Math.max(72, edge.label.length * 13))}" height="24" rx="7" fill="${palette.barBg}" stroke="${palette.border}" stroke-width="1" />
            <text x="${fmtNum(g.labelX)}" y="${fmtNum(g.labelY + 4)}" text-anchor="middle" fill="${palette.muted}" font-size="13" font-family="ui-monospace, monospace">${escapeHtml(edge.label)}</text>
          </g>`
        : "";
      return `<g id="edge-grp-${escapeHtml(edge.id)}">
        <path id="edge-path-${escapeHtml(edge.id)}" d="${g.pathD}" fill="none" stroke="${palette.border}" stroke-width="2.6"${dash} marker-end="url(#arrow-muted)" />
        <path id="edge-glow-${escapeHtml(edge.id)}" d="${g.pathD}" fill="none" stroke="${palette.primary}" stroke-width="4.2"${dash} opacity="0" marker-end="url(#arrow-active)" />
        ${labelSvg}
      </g>`;
    })
    .join("\n");

  const nodesSvg = spec.nodes
    .map((node) => {
      const r = rects.get(node.id);
      if (!r) return "";
      const meta = KIND_TAG[node.kind];
      const accent = palette[meta.colorKey];
      const pillText = node.badge || meta.tag;
      return `<g id="node-${escapeHtml(node.id)}" opacity="0.82">
        <rect id="node-glow-${escapeHtml(node.id)}" x="${fmtNum(r.x - 5)}" y="${fmtNum(r.y - 5)}" width="${fmtNum(r.w + 10)}" height="${fmtNum(r.h + 10)}" rx="20" fill="none" stroke="${accent}" stroke-width="3" opacity="0" />
        <rect id="node-box-${escapeHtml(node.id)}" x="${fmtNum(r.x)}" y="${fmtNum(r.y)}" width="${fmtNum(r.w)}" height="${fmtNum(r.h)}" rx="16" fill="${palette.barBg}" stroke="${palette.border}" stroke-width="2" />
        <rect x="${fmtNum(r.x + 14)}" y="${fmtNum(r.y + 12)}" width="${fmtNum(Math.min(r.w - 28, Math.max(66, pillText.length * 9 + 18)))}" height="22" rx="6" fill="${palette.panelBg}" stroke="${accent}" stroke-width="1" />
        <text x="${fmtNum(r.x + 24)}" y="${fmtNum(r.y + 27)}" fill="${accent}" font-size="11.5" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(pillText)}</text>
        <text x="${fmtNum(r.x + 14)}" y="${fmtNum(r.y + 58)}" fill="${palette.text}" font-size="19" font-weight="700" font-family="NotoSansSC, sans-serif">${escapeHtml(node.label)}</text>
        <text id="node-sub-${escapeHtml(node.id)}" x="${fmtNum(r.x + 14)}" y="${fmtNum(r.y + 82)}" fill="${palette.muted}" font-size="13.5" font-family="ui-monospace, monospace">${escapeHtml(node.sublabel ?? "")}</text>
      </g>`;
    })
    .join("\n");

  // 为每一步的数据包预渲染独立 SVG 胶囊（避免同一步多个包冲突）
  const packetsSvg = spec.steps
    .flatMap((step, sIdx) =>
      step.packets.map((pkt, pIdx) => {
        const g = geoms.get(pkt.edgeId);
        if (!g) return "";
        const toneColor =
          pkt.tone === "success"
            ? palette.success
            : pkt.tone === "warn"
              ? palette.warn
              : pkt.tone === "danger"
                ? palette.danger
                : palette.primary;
        const pw = Math.max(84, pkt.label.length * 10.5 + 24);
        const pid = `pkt-${sIdx}-${pIdx}`;
        return `<g id="${pid}" opacity="0" transform="translate(${fmtNum(g.x1)}, ${fmtNum(g.y1)})">
          <rect x="${fmtNum(-pw / 2)}" y="-16" width="${fmtNum(pw)}" height="32" rx="16" fill="${palette.canvasBg}" stroke="${toneColor}" stroke-width="2.4" />
          <circle cx="${fmtNum(-pw / 2 + 14)}" cy="0" r="4.5" fill="${toneColor}" />
          <text x="5" y="5" text-anchor="middle" fill="${palette.text}" font-size="13" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(pkt.label)}</text>
        </g>`;
      }),
    )
    .join("\n");

  // 每步的动态状态文字叠加层（不修改静态 DOM textContent，保持 100% seek-safe！）
  const nodeStateOverlaysSvg = spec.steps
    .flatMap((step, sIdx) =>
      Object.entries(step.nodeStates ?? {}).map(([nid, text]) => {
        const r = rects.get(nid);
        if (!r) return "";
        const pillW = Math.min(r.w + 24, Math.max(96, text.length * 12 + 22));
        return `<g id="nstate-${sIdx}-${escapeHtml(nid)}" opacity="0">
          <rect x="${fmtNum(r.cx - pillW / 2)}" y="${fmtNum(r.y + r.h - 14)}" width="${fmtNum(pillW)}" height="26" rx="8" fill="${palette.primary}" />
          <text x="${fmtNum(r.cx)}" y="${fmtNum(r.y + r.h + 4)}" text-anchor="middle" fill="${palette.canvasBg}" font-size="12.5" font-weight="700" font-family="NotoSansSC, sans-serif">${escapeHtml(text)}</text>
        </g>`;
      }),
    )
    .join("\n");

  // 渲染每一步的头部标题、侧栏解说、指标卡和字幕层
  const stepHeadersHtml = spec.steps
    .map(
      (step, idx) => `<div class="header-left" id="hdr-${idx}" style="position:absolute;inset:0;opacity:${idx === 0 ? 1 : 0};">
        <span class="step-badge">${escapeHtml(step.badge)}</span>
        <h1 class="headline">${escapeHtml(step.headline)}</h1>
      </div>`,
    )
    .join("\n");

  const stepPanelsHtml = spec.steps
    .map((step, idx) => {
      const calloutHtml = step.callout
        ? `<div class="callout-box">
            <div class="callout-title">${escapeHtml(step.callout.title)}</div>
            <div class="callout-body">${escapeHtml(step.callout.body)}</div>
          </div>`
        : "";
      const metricsHtml = step.metrics?.length
        ? `<div class="metrics-grid">${step.metrics
            .map(
              (m) => `<div class="metric-card">
                <span class="metric-label">${escapeHtml(m.label)}</span>
                <span class="metric-value ${m.tone !== "default" ? m.tone : ""}">${escapeHtml(m.value)}</span>
              </div>`,
            )
            .join("")}</div>`
        : "";
      return `<div class="side-body" id="side-${idx}" style="position:absolute;inset:0;opacity:${idx === 0 ? 1 : 0};">
        ${calloutHtml}
        ${metricsHtml}
        <div class="legend-bar">
          <span class="legend-item"><span class="legend-swatch" style="background:${palette.primary}"></span>请求 / 主流</span>
          <span class="legend-item"><span class="legend-swatch" style="background:${palette.success}"></span>命中 / 返回</span>
          <span class="legend-item"><span class="legend-swatch" style="background:${palette.warn}"></span>队列 / 异步</span>
        </div>
      </div>`;
    })
    .join("\n");

  const dotsHtml = spec.steps
    .map((_, idx) => `<span class="dot${idx === 0 ? " active" : ""}" id="dot-${idx}"></span>`)
    .join("");

  const audioSegById = new Map((spec.audio?.segments ?? []).map((seg) => [seg.id, seg]));

  const captionsHtml = spec.steps
    .map((step, idx) => {
      const seg = audioSegById.get(step.id);
      if (seg && seg.words.length > 0) {
        const spans = seg.words
          .map((w, wIdx) => `<span class="cap-word" id="cw-${idx}-${wIdx}">${escapeHtml(w.text)}</span>`)
          .join("");
        return `<div class="caption-bar" id="cap-${idx}" style="opacity:${idx === 0 ? 1 : 0};">${spans}</div>`;
      }
      return `<div class="caption-bar" id="cap-${idx}" style="opacity:${idx === 0 ? 1 : 0};">${escapeHtml(step.narration)}</div>`;
    })
    .join("\n");

  const voiceAudioHtml = (spec.audio?.segments ?? [])
    .map(
      (seg) =>
        `<audio src="./${escapeHtml(seg.file)}" data-start="${fmtNum(seg.start + introOffset)}" data-duration="${fmtNum(seg.duration)}" data-track-index="2"></audio>`,
    )
    .join("\n  ");

  const bgmResult = renderBgmAudioHtml(spec.packaging, totalDuration);
  const bgmAudioHtml = bgmResult.html;

  const introHtml = renderIntroHtml({
    packaging: spec.packaging,
    title,
    subtitle,
    badges: [domain, `${spec.nodes.length} NODES`, `${spec.steps.length} STEPS`],
  });

  const outroHtml = renderOutroHtml({
    packaging: spec.packaging,
    outroStart,
    title,
    fallbackPoints: spec.steps.slice(0, 3).map((s) => `${s.badge} · ${s.headline}`),
  });

  // 构建确定性 GSAP 时间轴
  const timelineLines: string[] = [
    `const tl = gsap.timeline({ paused: true });`,
    `tl.to({}, { duration: ${fmtNum(totalDuration)} }, 0);`,
  ];

  if (introOffset > 0) {
    timelineLines.push(`tl.set("#arch-stage-main", { opacity: 0 }, 0);`);
    timelineLines.push(`tl.to("#arch-stage-main", { opacity: 1, duration: 0.45, ease: "power2.out" }, ${fmtNum(introOffset)});`);
  }

  for (let sIdx = 0; sIdx < spec.steps.length; sIdx += 1) {
    const step = spec.steps[sIdx];
    const t0 = Number((step.start + introOffset).toFixed(4));
    const stepEnd = Number((t0 + step.duration).toFixed(4));
    const activeNodeSet = new Set(step.activeNodes);
    const activeEdgeSet = new Set(step.activeEdges);

    // 切换标题、侧栏、字幕、进度点
    if (sIdx > 0) {
      timelineLines.push(`tl.to("#hdr-${sIdx - 1}", { opacity: 0, duration: 0.2 }, ${fmtNum(t0)});`);
      timelineLines.push(`tl.to("#hdr-${sIdx}", { opacity: 1, duration: 0.28 }, ${fmtNum(t0 + 0.08)});`);
      timelineLines.push(`tl.to("#side-${sIdx - 1}", { opacity: 0, duration: 0.2 }, ${fmtNum(t0)});`);
      timelineLines.push(`tl.to("#side-${sIdx}", { opacity: 1, duration: 0.28 }, ${fmtNum(t0 + 0.08)});`);
      timelineLines.push(`tl.to("#cap-${sIdx - 1}", { opacity: 0, duration: 0.18 }, ${fmtNum(t0)});`);
      timelineLines.push(`tl.to("#cap-${sIdx}", { opacity: 1, duration: 0.22 }, ${fmtNum(t0 + 0.06)});`);
      timelineLines.push(`tl.to("#dot-${sIdx - 1}", { width: 9, backgroundColor: "${palette.border}", duration: 0.2 }, ${fmtNum(t0)});`);
      timelineLines.push(`tl.to("#dot-${sIdx}", { width: 24, backgroundColor: "${palette.primary}", duration: 0.25 }, ${fmtNum(t0)});`);
    }

    // 节点激活高亮与非激活降噪
    for (const node of spec.nodes) {
      const active = activeNodeSet.has(node.id);
      const accent = palette[KIND_TAG[node.kind].colorKey];
      timelineLines.push(
        `tl.to("#node-${node.id}", { opacity: ${active ? 1 : 0.45}, duration: 0.3 }, ${fmtNum(t0)});`,
      );
      timelineLines.push(
        `tl.to("#node-glow-${node.id}", { opacity: ${active ? 0.95 : 0}, duration: 0.3 }, ${fmtNum(t0)});`,
      );
      timelineLines.push(
        `tl.to("#node-box-${node.id}", { attr: { stroke: "${active ? accent : palette.border}" }, duration: 0.3 }, ${fmtNum(t0)});`,
      );
    }

    // 连线点亮
    for (const edge of spec.edges) {
      const active = activeEdgeSet.has(edge.id);
      timelineLines.push(
        `tl.to("#edge-glow-${edge.id}", { opacity: ${active ? 0.95 : 0}, duration: 0.28 }, ${fmtNum(t0)});`,
      );
      if (edge.label) {
        timelineLines.push(
          `tl.to("#edge-lbl-${edge.id}", { opacity: ${active ? 1 : 0.45}, duration: 0.28 }, ${fmtNum(t0)});`,
        );
      }
    }

    // 本步节点状态胶囊淡入/淡出
    for (const nid of Object.keys(step.nodeStates ?? {})) {
      const ovId = `#nstate-${sIdx}-${nid}`;
      timelineLines.push(`tl.to("${ovId}", { opacity: 1, duration: 0.28 }, ${fmtNum(t0 + 0.25)});`);
      timelineLines.push(`tl.to("${ovId}", { opacity: 0, duration: 0.2 }, ${fmtNum(Math.max(t0 + 0.6, stepEnd - 0.22))});`);
    }

    // 数据包沿连线平滑流动（支持顺向/逆向 & 多包错峰发车）
    const pktCount = step.packets.length;
    step.packets.forEach((pkt, pIdx) => {
      const g = geoms.get(pkt.edgeId);
      if (!g) return;
      const pid = `#pkt-${sIdx}-${pIdx}`;
      const sx = pkt.reverse ? g.x2 : g.x1;
      const sy = pkt.reverse ? g.y2 : g.y1;
      const ex = pkt.reverse ? g.x1 : g.x2;
      const ey = pkt.reverse ? g.y1 : g.y2;
      const travelSlot = Math.max(0.85, Math.min(2.2, (step.duration - 0.6) / Math.max(1, pktCount)));
      const pStart = Number((t0 + 0.22 + pIdx * Math.min(0.65, travelSlot * 0.55)).toFixed(4));
      const pEnd = Number(Math.min(stepEnd - 0.18, pStart + travelSlot).toFixed(4));
      const pDur = Math.max(0.45, Number((pEnd - pStart).toFixed(4)));

      timelineLines.push(`tl.set("${pid}", { attr: { transform: "translate(${fmtNum(sx)}, ${fmtNum(sy)})" }, opacity: 0 }, ${fmtNum(t0)});`);
      timelineLines.push(`tl.to("${pid}", { opacity: 1, duration: 0.16 }, ${fmtNum(pStart)});`);
      timelineLines.push(
        `tl.to("${pid}", { attr: { transform: "translate(${fmtNum(ex)}, ${fmtNum(ey)})" }, duration: ${fmtNum(pDur)}, ease: "power2.inOut" }, ${fmtNum(pStart + 0.08)});`,
      );
      timelineLines.push(`tl.to("${pid}", { opacity: 0, duration: 0.18 }, ${fmtNum(pStart + 0.08 + pDur)});`);
    });

    // 逐词高亮字幕（如有火山 V3 时间戳）
    const seg = audioSegById.get(step.id);
    if (seg && seg.words.length > 0) {
      seg.words.forEach((w, wIdx) => {
        const ws = Number((w.start + introOffset).toFixed(4));
        const we = Number((w.end + introOffset).toFixed(4));
        const wid = `#cw-${sIdx}-${wIdx}`;
        timelineLines.push(`tl.set("${wid}", { color: "${palette.primary}", fontWeight: 700 }, ${fmtNum(ws)});`);
        timelineLines.push(`tl.set("${wid}", { color: "${palette.text}", fontWeight: 400 }, ${fmtNum(Math.max(ws + 0.04, we))});`);
      });
    }
  }

  if (spec.packaging?.enableOutro) {
    timelineLines.push(`tl.to("#arch-stage-main", { opacity: 0, duration: 0.35 }, ${fmtNum(Math.max(0, outroStart - 0.25))});`);
  }

  const pkgLines = buildPackagingTimelineJs({
    packaging: spec.packaging,
    metrics: pkgMetrics,
    hasNarrationAudio: (spec.audio?.segments?.length ?? 0) > 0,
    bgmClips: bgmResult.clips,
    outroPointCount: spec.packaging?.outroPoints?.length || Math.min(3, spec.steps.length),
  });
  timelineLines.push(...pkgLines);

  timelineLines.push(`window.__timelines = window.__timelines || {};`);
  timelineLines.push(`window.__timelines["${escapeHtml(spec.meta.id)}"] = tl;`);

  const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=${width}, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="./styles.css" />
  <script src="./assets/vendor/gsap.min.js"></script>
</head>
<body>
  <div id="${escapeHtml(spec.meta.id)}" class="stage" data-composition-id="${escapeHtml(spec.meta.id)}" data-start="0" data-duration="${fmtNum(totalDuration)}" data-width="${width}" data-height="${height}" data-fps="${fps}">
    <div class="stage-bg"></div>
    <div class="stage-grid"></div>
    ${introHtml}
    <section class="clip stage-content" id="arch-stage-main" data-start="${fmtNum(introOffset)}" data-duration="${fmtNum(Math.max(0.5, contentEnd - introOffset))}" data-track-index="0">
      <header class="header">
        <div style="position:relative;flex:1;min-width:0;height:46px;">
          ${stepHeadersHtml}
        </div>
        <div class="header-right">
          <span class="domain-pill">${escapeHtml(domain)}</span>
          <div class="progress-dots">${dotsHtml}</div>
        </div>
      </header>
      <div class="workspace">
        <div class="panel">
          <div class="panel-bar">
            <div class="win-dots">
              <span class="win-dot" style="background:#ff5f56"></span>
              <span class="win-dot" style="background:#ffbd2e"></span>
              <span class="win-dot" style="background:#27c93f"></span>
              <span style="margin-left:8px;">architecture-topology.svg</span>
            </div>
            <span>${spec.nodes.length} NODES · ${spec.edges.length} LINKS</span>
          </div>
          <div class="canvas-body">
            <svg class="arch-svg" viewBox="0 0 ${viewW} ${viewH}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="arrow-muted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="${palette.muted}" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="${palette.primary}" />
                </marker>
              </defs>
              ${edgesSvg}
              ${nodesSvg}
              ${nodeStateOverlaysSvg}
              ${packetsSvg}
            </svg>
          </div>
        </div>
        <div class="panel">
          <div class="panel-bar">
            <span>EXECUTION INSIGHTS</span>
            <span>LIVE TRACE</span>
          </div>
          <div style="position:relative;flex:1;min-height:0;">
            ${stepPanelsHtml}
          </div>
        </div>
      </div>
      ${captionsHtml}
    </section>
    ${outroHtml}
    ${voiceAudioHtml}
    ${bgmAudioHtml}
  </div>
  <script>
${timelineLines.join("\n")}
  </script>
</body>
</html>`;

  return {
    indexHtml,
    stylesCss: buildStylesCss(palette, isPortrait),
    duration: totalDuration,
    width,
    height,
    fps,
  };
}
