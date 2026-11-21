import type {
  AlgoStructure,
  ArrayStructure,
  LinkedListStructure,
  MatrixStructure,
  NodeVisualState,
  StackQueueStructure,
  TreeStructure,
} from "./schema";

const escapeHtml = (value: string | number): string =>
  String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]!);

const STATE_COLORS: Record<NodeVisualState, { fill: string; stroke: string; text: string }> = {
  default: { fill: "#161e2e", stroke: "#334155", text: "#e2e8f0" },
  active: { fill: "#132c47", stroke: "#38bdf8", text: "#7dd3fc" },
  comparing: { fill: "#332510", stroke: "#fbbf24", text: "#fde68a" },
  swapped: { fill: "#381c2e", stroke: "#f472b6", text: "#fbcfe8" },
  sorted: { fill: "#113026", stroke: "#4ade80", text: "#86efac" },
  pivot: { fill: "#281e4a", stroke: "#a78bfa", text: "#ddd6fe" },
  found: { fill: "#11382a", stroke: "#22c55e", text: "#bbf7d0" },
  dim: { fill: "#0f1522", stroke: "#1e293b", text: "#64748b" },
};

const POINTER_PALETTE = ["#38bdf8", "#fbbf24", "#a78bfa", "#4ade80", "#f472b6"];

export interface RenderedStructure {
  svgHtml: string;
  /** 供 GSAP 做指针平滑位移的坐标表：pointerName -> { x, y } */
  pointerCoords: Record<string, { x: number; y: number }>;
  /** 供 GSAP 做数组元素 Swap 互换动画的格中心坐标表 */
  cellCoords?: Record<number, { x: number; y: number }>;
}

export function renderStructureSvg(frameId: string, structure: AlgoStructure): RenderedStructure {
  switch (structure.type) {
    case "array":
      return renderArraySvg(frameId, structure);
    case "linked-list":
      return renderLinkedListSvg(frameId, structure);
    case "tree":
      return renderTreeSvg(frameId, structure);
    case "matrix":
      return renderMatrixSvg(frameId, structure);
    case "stack-queue":
      return renderStackQueueSvg(frameId, structure);
  }
}

function renderArraySvg(frameId: string, arr: ArrayStructure): RenderedStructure {
  const W = 940;
  const H = 430;
  const n = arr.items.length;
  const gap = n > 10 ? 8 : 14;
  const cellW = Math.min(86, Math.floor((W - 80 - gap * (n - 1)) / n));
  const cellH = Math.min(86, cellW);
  const totalW = n * cellW + (n - 1) * gap;
  const startX = Math.round((W - totalW) / 2);
  const boxY = 170;

  // 若全部是数字，在方块上方叠加轻量比例柱条增强直观感
  const numericVals = arr.items.map((it) => (typeof it.value === "number" ? it.value : null));
  const allNumeric = numericVals.every((v) => v !== null);
  const maxVal = allNumeric ? Math.max(...(numericVals as number[]).map((v) => Math.abs(v)), 1) : 1;

  const cellCoords: Record<number, { x: number; y: number }> = {};
  const cellsSvg = arr.items
    .map((item, idx) => {
      const x = startX + idx * (cellW + gap);
      cellCoords[idx] = { x: x + cellW / 2, y: boxY + cellH / 2 };
      const colors = STATE_COLORS[item.state];
      const barH = allNumeric ? Math.max(12, Math.round((Math.abs(item.value as number) / maxVal) * 76)) : 0;
      const barY = boxY - 18 - barH;

      return `<g class="algo-cell" id="${frameId}-cell-${idx}">
        ${
          allNumeric
            ? `<rect x="${x + 12}" y="${barY}" width="${Math.max(12, cellW - 24)}" height="${barH}" rx="6" fill="${colors.stroke}" fill-opacity="0.32" stroke="${colors.stroke}" stroke-opacity="0.7" stroke-width="1.5" />`
            : ""
        }
        <rect x="${x}" y="${boxY}" width="${cellW}" height="${cellH}" rx="12" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2.5" />
        <text x="${x + cellW / 2}" y="${boxY + cellH / 2 + 8}" text-anchor="middle" fill="${colors.text}" font-size="${cellW < 64 ? 20 : 25}" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(item.value)}</text>
        <text x="${x + cellW / 2}" y="${boxY + cellH + 24}" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="ui-monospace, monospace">[${idx}]</text>
      </g>`;
    })
    .join("");

  // 将指向同一 index 的多个指针纵向错开，绝不重叠
  const slotCountByIndex = new Map<number, number>();
  const pointerCoords: Record<string, { x: number; y: number }> = {};
  const pointersSvg = arr.pointers
    .map((ptr, pIdx) => {
      const clampedIdx = Math.max(0, Math.min(n - 1, ptr.index));
      const slot = slotCountByIndex.get(clampedIdx) ?? 0;
      slotCountByIndex.set(clampedIdx, slot + 1);

      const cx = startX + clampedIdx * (cellW + gap) + cellW / 2;
      const py = boxY + cellH + 46 + slot * 36;
      const color = ptr.color || POINTER_PALETTE[pIdx % POINTER_PALETTE.length];
      const pillW = Math.max(54, ptr.name.length * 11 + 22);
      pointerCoords[ptr.name] = { x: cx, y: py };

      return `<g class="algo-pointer" id="${frameId}-ptr-${escapeHtml(ptr.name)}">
        ${
          slot === 0
            ? `<path d="M ${cx} ${boxY + cellH + 30} L ${cx - 6} ${boxY + cellH + 40} L ${cx + 6} ${boxY + cellH + 40} Z" fill="${color}" />`
            : ""
        }
        <rect x="${cx - pillW / 2}" y="${py}" width="${pillW}" height="28" rx="8" fill="#0b101b" stroke="${color}" stroke-width="2" />
        <text x="${cx}" y="${py + 19}" text-anchor="middle" fill="${color}" font-size="15" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(ptr.name)}</text>
      </g>`;
    })
    .join("");

  const labelSvg = arr.label
    ? `<text x="24" y="34" fill="#94a3b8" font-size="16" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(arr.label)}</text>`
    : "";

  return {
    svgHtml: `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="algo-svg" role="img" aria-label="数组可视化">${labelSvg}${cellsSvg}${pointersSvg}</svg>`,
    pointerCoords,
    cellCoords,
  };
}

function renderLinkedListSvg(frameId: string, list: LinkedListStructure): RenderedStructure {
  const W = 940;
  const H = 430;
  const n = list.nodes.length;
  const nodeW = Math.min(110, Math.floor((W - 140) / Math.max(n, 1)) - 44);
  const nodeH = 68;
  const gap = Math.min(72, Math.max(44, Math.floor((W - 120 - n * nodeW) / Math.max(n - 1, 1))));
  const totalW = n * nodeW + Math.max(0, n - 1) * gap;
  const startX = Math.round((W - totalW) / 2);
  const nodeY = 195;

  const nodePos = new Map<string, { x: number; y: number; cx: number; cy: number }>();
  list.nodes.forEach((node, idx) => {
    const x = startX + idx * (nodeW + gap);
    nodePos.set(node.id, { x, y: nodeY, cx: x + nodeW / 2, cy: nodeY + nodeH / 2 });
  });

  const defs = `<defs>
    <marker id="${frameId}-arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" /></marker>
    <marker id="${frameId}-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" /></marker>
    <marker id="${frameId}-arrow-reversed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="#4ade80" /></marker>
  </defs>`;

  const edgesSvg = list.edges
    .map((edge, idx) => {
      const from = nodePos.get(edge.from);
      const to = nodePos.get(edge.to);
      if (!from || !to) return "";
      const forward = to.cx > from.cx;
      const x1 = forward ? from.x + nodeW : from.x;
      const x2 = forward ? to.x - 4 : to.x + nodeW + 4;
      const y = forward ? from.cy : from.cy;
      const stroke = edge.state === "reversed" ? "#4ade80" : edge.state === "active" ? "#38bdf8" : "#64748b";
      const marker = `url(#${frameId}-arrow-${edge.state})`;
      const pathD = forward
        ? `M ${x1} ${y} L ${x2} ${y}`
        : `M ${x1} ${y + 10} C ${x1 - 14} ${y + 38}, ${x2 + 14} ${y + 38}, ${x2} ${y + 10}`;
      return `<path id="${frameId}-edge-${idx}" d="${pathD}" fill="none" stroke="${stroke}" stroke-width="3" marker-end="${marker}" />`;
    })
    .join("");

  const nodesSvg = list.nodes
    .map((node) => {
      const pos = nodePos.get(node.id)!;
      const colors = STATE_COLORS[node.state];
      return `<g id="${frameId}-node-${escapeHtml(node.id)}">
        <rect x="${pos.x}" y="${pos.y}" width="${nodeW}" height="${nodeH}" rx="14" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2.5" />
        <text x="${pos.cx}" y="${pos.cy + 8}" text-anchor="middle" fill="${colors.text}" font-size="24" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(node.value)}</text>
      </g>`;
    })
    .join("");

  const nullX = startX - 58;
  const nullBadge = `<g opacity="0.75"><rect x="${Math.max(12, nullX - 24)}" y="${nodeY + 14}" width="58" height="40" rx="8" fill="#0f172a" stroke="#334155" stroke-dasharray="4 3" /><text x="${Math.max(12, nullX - 24) + 29}" y="${nodeY + 40}" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="ui-monospace, monospace">null</text></g>`;

  const slotByTarget = new Map<string, number>();
  const pointerCoords: Record<string, { x: number; y: number }> = {};
  const pointersSvg = list.pointers
    .map((ptr, pIdx) => {
      const key = ptr.nodeId ?? "__null__";
      const slot = slotByTarget.get(key) ?? 0;
      slotByTarget.set(key, slot + 1);

      const target = ptr.nodeId ? nodePos.get(ptr.nodeId) : undefined;
      const cx = target ? target.cx : Math.max(41, nullX + 5);
      const py = nodeY - 56 - slot * 36;
      const color = ptr.color || POINTER_PALETTE[pIdx % POINTER_PALETTE.length];
      const pillW = Math.max(58, ptr.name.length * 11 + 22);
      pointerCoords[ptr.name] = { x: cx, y: py };

      return `<g class="algo-pointer" id="${frameId}-ptr-${escapeHtml(ptr.name)}">
        <rect x="${cx - pillW / 2}" y="${py}" width="${pillW}" height="28" rx="8" fill="#0b101b" stroke="${color}" stroke-width="2" />
        <text x="${cx}" y="${py + 19}" text-anchor="middle" fill="${color}" font-size="15" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(ptr.name)}</text>
        ${
          slot === 0
            ? `<path d="M ${cx} ${nodeY - 12} L ${cx - 6} ${nodeY - 22} L ${cx + 6} ${nodeY - 22} Z" fill="${color}" />`
            : ""
        }
      </g>`;
    })
    .join("");

  const labelSvg = list.label
    ? `<text x="24" y="34" fill="#94a3b8" font-size="16" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(list.label)}</text>`
    : "";

  return {
    svgHtml: `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="algo-svg" role="img" aria-label="链表可视化">${defs}${labelSvg}${nullBadge}${edgesSvg}${nodesSvg}${pointersSvg}</svg>`,
    pointerCoords,
  };
}

function renderTreeSvg(frameId: string, tree: TreeStructure): RenderedStructure {
  const W = 940;
  const H = 430;
  const coords = new Map<string, { x: number; y: number }>();

  // 按二叉堆位置自动分配坐标（支持最多 4 层）
  const byId = new Map(tree.nodes.map((n) => [n.id, n]));
  const depthMap = new Map<string, number>();
  const posIndexMap = new Map<string, number>();

  const root = tree.nodes.find((n) => !n.parentId) ?? tree.nodes[0];
  depthMap.set(root.id, 0);
  posIndexMap.set(root.id, 0);

  for (const node of tree.nodes) {
    if (node.id === root.id) continue;
    const parentDepth = depthMap.get(node.parentId ?? "") ?? 0;
    const parentPos = posIndexMap.get(node.parentId ?? "") ?? 0;
    const depth = parentDepth + 1;
    const offset = node.side === "right" ? 1 : 0;
    depthMap.set(node.id, depth);
    posIndexMap.set(node.id, parentPos * 2 + offset);
  }

  const maxDepth = Math.max(...Array.from(depthMap.values()), 1);
  const levelGap = Math.min(100, Math.floor((H - 120) / Math.max(maxDepth, 1)));

  for (const node of tree.nodes) {
    const depth = depthMap.get(node.id) ?? 0;
    const idx = posIndexMap.get(node.id) ?? 0;
    const slots = Math.pow(2, depth);
    const x = Math.round(((idx + 0.5) / slots) * (W - 120) + 60);
    const y = 78 + depth * levelGap;
    coords.set(node.id, { x, y });
  }

  const edgesSvg = tree.nodes
    .filter((n) => n.parentId && byId.has(n.parentId))
    .map((n, idx) => {
      const p = coords.get(n.parentId!)!;
      const c = coords.get(n.id)!;
      const stroke = n.state === "active" || n.state === "found" ? "#38bdf8" : "#475569";
      return `<line id="${frameId}-tedge-${idx}" x1="${p.x}" y1="${p.y}" x2="${c.x}" y2="${c.y}" stroke="${stroke}" stroke-width="2.5" />`;
    })
    .join("");

  const nodesSvg = tree.nodes
    .map((n) => {
      const pos = coords.get(n.id)!;
      const colors = STATE_COLORS[n.state];
      return `<g id="${frameId}-tnode-${escapeHtml(n.id)}">
        <circle cx="${pos.x}" cy="${pos.y}" r="28" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2.5" />
        <text x="${pos.x}" y="${pos.y + 8}" text-anchor="middle" fill="${colors.text}" font-size="21" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(n.value)}</text>
      </g>`;
    })
    .join("");

  const pointerCoords: Record<string, { x: number; y: number }> = {};
  const pointersSvg = tree.pointers
    .map((ptr, pIdx) => {
      const pos = coords.get(ptr.nodeId);
      if (!pos) return "";
      const color = ptr.color || POINTER_PALETTE[pIdx % POINTER_PALETTE.length];
      const pillW = Math.max(54, ptr.name.length * 10 + 20);
      const px = pos.x + 36;
      const py = pos.y - 14;
      pointerCoords[ptr.name] = { x: px, y: py };
      return `<g class="algo-pointer" id="${frameId}-ptr-${escapeHtml(ptr.name)}">
        <rect x="${px}" y="${py}" width="${pillW}" height="26" rx="8" fill="#0b101b" stroke="${color}" stroke-width="2" />
        <text x="${px + pillW / 2}" y="${py + 18}" text-anchor="middle" fill="${color}" font-size="14" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(ptr.name)}</text>
      </g>`;
    })
    .join("");

  const labelSvg = tree.label
    ? `<text x="24" y="34" fill="#94a3b8" font-size="16" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(tree.label)}</text>`
    : "";

  return {
    svgHtml: `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="algo-svg" role="img" aria-label="树结构可视化">${labelSvg}${edgesSvg}${nodesSvg}${pointersSvg}</svg>`,
    pointerCoords,
  };
}

function renderMatrixSvg(frameId: string, mat: MatrixStructure): RenderedStructure {
  const W = 940;
  const H = 430;
  const numRows = mat.rows.length;
  const numCols = Math.max(...mat.rows.map((r) => r.length), 1);
  const gap = 8;
  const maxCellW = Math.floor((W - 140 - gap * (numCols - 1)) / numCols);
  const maxCellH = Math.floor((H - 120 - gap * (numRows - 1)) / numRows);
  const cellSize = Math.min(72, Math.max(36, Math.min(maxCellW, maxCellH)));

  const gridW = numCols * cellSize + (numCols - 1) * gap;
  const gridH = numRows * cellSize + (numRows - 1) * gap;
  const startX = Math.round((W - gridW) / 2) + 14;
  const startY = Math.round((H - gridH) / 2) + 18;

  const cellCenter = (r: number, c: number) => ({
    x: startX + c * (cellSize + gap) + cellSize / 2,
    y: startY + r * (cellSize + gap) + cellSize / 2,
  });

  const defs = `<defs><marker id="${frameId}-dp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" /></marker></defs>`;

  const colHeaders = Array.from({ length: numCols }, (_, c) => {
    const label = mat.colLabels?.[c] ?? `[${c}]`;
    const cx = startX + c * (cellSize + gap) + cellSize / 2;
    return `<text x="${cx}" y="${startY - 12}" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="ui-monospace, monospace">${escapeHtml(label)}</text>`;
  }).join("");

  const rowHeaders = Array.from({ length: numRows }, (_, r) => {
    const label = mat.rowLabels?.[r] ?? `[${r}]`;
    const cy = startY + r * (cellSize + gap) + cellSize / 2 + 5;
    return `<text x="${startX - 14}" y="${cy}" text-anchor="end" fill="#94a3b8" font-size="14" font-family="ui-monospace, monospace">${escapeHtml(label)}</text>`;
  }).join("");

  const cellsSvg = mat.rows
    .map((row, r) =>
      row
        .map((cell, c) => {
          const x = startX + c * (cellSize + gap);
          const y = startY + r * (cellSize + gap);
          const isActive = mat.activeCell && mat.activeCell[0] === r && mat.activeCell[1] === c;
          const colors = STATE_COLORS[isActive && cell.state === "default" ? "active" : cell.state];
          return `<g id="${frameId}-mcell-${r}-${c}">
            <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="10" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="${isActive ? 3 : 2}" />
            <text x="${x + cellSize / 2}" y="${y + cellSize / 2 + 7}" text-anchor="middle" fill="${colors.text}" font-size="${cellSize < 48 ? 16 : 21}" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(cell.value)}</text>
          </g>`;
        })
        .join(""),
    )
    .join("");

  const arrowsSvg =
    mat.activeCell && mat.fromCells?.length
      ? mat.fromCells
          .map(([fr, fc], idx) => {
            const p1 = cellCenter(fr, fc);
            const p2 = cellCenter(mat.activeCell![0], mat.activeCell![1]);
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.hypot(dx, dy) || 1;
            const pad = cellSize * 0.42;
            const x1 = p1.x + (dx / dist) * pad;
            const y1 = p1.y + (dy / dist) * pad;
            const x2 = p2.x - (dx / dist) * pad;
            const y2 = p2.y - (dy / dist) * pad;
            return `<line id="${frameId}-marrow-${idx}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="5 3" marker-end="url(#${frameId}-dp-arrow)" />`;
          })
          .join("")
      : "";

  const labelSvg = mat.label
    ? `<text x="24" y="34" fill="#94a3b8" font-size="16" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(mat.label)}</text>`
    : "";

  return {
    svgHtml: `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="algo-svg" role="img" aria-label="矩阵与DP表可视化">${defs}${labelSvg}${colHeaders}${rowHeaders}${cellsSvg}${arrowsSvg}</svg>`,
    pointerCoords: {},
  };
}

function renderStackQueueSvg(frameId: string, sq: StackQueueStructure): RenderedStructure {
  const W = 940;
  const H = 430;
  const labelSvg = sq.label
    ? `<text x="24" y="34" fill="#94a3b8" font-size="16" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(sq.label)}</text>`
    : "";

  if (sq.variant === "queue") {
    const n = sq.items.length;
    const itemW = Math.min(120, Math.max(76, Math.floor((W - 180) / Math.max(n, 1)) - 12));
    const itemH = 74;
    const gap = 12;
    const totalW = n * itemW + Math.max(0, n - 1) * gap;
    const startX = Math.round((W - totalW) / 2);
    const y = 178;

    const rails = `<line x1="80" y1="${y - 16}" x2="${W - 80}" y2="${y - 16}" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
      <line x1="80" y1="${y + itemH + 16}" x2="${W - 80}" y2="${y + itemH + 16}" stroke="#334155" stroke-width="2" stroke-dasharray="6 4" />
      <text x="90" y="${y - 28}" fill="#38bdf8" font-size="14" font-weight="700" font-family="ui-monospace, monospace">FRONT (出队)</text>
      <text x="${W - 90}" y="${y - 28}" text-anchor="end" fill="#4ade80" font-size="14" font-weight="700" font-family="ui-monospace, monospace">REAR (入队)</text>`;

    const itemsSvg = sq.items
      .map((item, idx) => {
        const x = startX + idx * (itemW + gap);
        const colors = STATE_COLORS[item.state];
        return `<g class="sq-item" id="${frameId}-sq-${idx}">
          <rect x="${x}" y="${y}" width="${itemW}" height="${itemH}" rx="12" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2.5" />
          <text x="${x + itemW / 2}" y="${y + (item.detail ? 34 : 44)}" text-anchor="middle" fill="${colors.text}" font-size="21" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(item.label)}</text>
          ${
            item.detail
              ? `<text x="${x + itemW / 2}" y="${y + 56}" text-anchor="middle" fill="#94a3b8" font-size="13" font-family="ui-monospace, monospace">${escapeHtml(item.detail)}</text>`
              : ""
          }
        </g>`;
      })
      .join("");

    const emptyHint =
      n === 0
        ? `<text x="${W / 2}" y="${y + 44}" text-anchor="middle" fill="#64748b" font-size="18" font-family="ui-monospace, monospace">[ Empty Queue ]</text>`
        : "";

    return {
      svgHtml: `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="algo-svg" role="img" aria-label="队列可视化">${labelSvg}${rails}${itemsSvg}${emptyHint}</svg>`,
      pointerCoords: {},
    };
  }

  // stack 或 call-stack：垂直栈容器（数组最后一项为栈顶）
  const n = sq.items.length;
  const boxW = sq.variant === "call-stack" ? 420 : 280;
  const itemH = Math.min(54, Math.max(36, Math.floor(310 / Math.max(n, 1)) - 8));
  const gap = 8;
  const baseY = 382;
  const boxX = Math.round((W - boxW) / 2);

  const container = `<path d="M ${boxX - 16} 78 L ${boxX - 16} ${baseY + 12} L ${boxX + boxW + 16} ${baseY + 12} L ${boxX + boxW + 16} 78" fill="none" stroke="#334155" stroke-width="3" stroke-linecap="round" />`;

  const itemsSvg = sq.items
    .map((item, idx) => {
      const y = baseY - (idx + 1) * itemH - idx * gap;
      const colors = STATE_COLORS[item.state];
      const isTop = idx === n - 1;
      return `<g class="sq-item" id="${frameId}-sq-${idx}">
        <rect x="${boxX}" y="${y}" width="${boxW}" height="${itemH}" rx="10" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="${isTop ? 3 : 2}" />
        <text x="${boxX + 18}" y="${y + itemH / 2 + 7}" fill="${colors.text}" font-size="19" font-weight="700" font-family="ui-monospace, monospace">${escapeHtml(item.label)}</text>
        ${
          item.detail
            ? `<text x="${boxX + boxW - 18}" y="${y + itemH / 2 + 6}" text-anchor="end" fill="#94a3b8" font-size="14" font-family="ui-monospace, monospace">${escapeHtml(item.detail)}</text>`
            : ""
        }
        ${
          isTop
            ? `<text x="${boxX + boxW + 30}" y="${y + itemH / 2 + 6}" fill="#38bdf8" font-size="15" font-weight="700" font-family="ui-monospace, monospace">◀ TOP</text>`
            : ""
        }
      </g>`;
    })
    .join("");

  const emptyHint =
    n === 0
      ? `<text x="${W / 2}" y="${baseY - 120}" text-anchor="middle" fill="#64748b" font-size="18" font-family="ui-monospace, monospace">[ Empty Stack ]</text>`
      : "";

  return {
    svgHtml: `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="algo-svg" role="img" aria-label="栈可视化">${labelSvg}${container}${itemsSvg}${emptyHint}</svg>`,
    pointerCoords: {},
  };
}
