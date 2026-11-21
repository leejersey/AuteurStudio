"use client";

import { useEffect, useState } from "react";

interface StepEditorDrawerProps {
  slug: string;
  onCompiled: () => Promise<void> | void;
}

export default function StepEditorDrawer({ slug, onCompiled }: StepEditorDrawerProps) {
  const [engine, setEngine] = useState<"code-stage" | "algo-stage">("code-stage");
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setStatusMsg(null);
    fetch(`/api/stage-spec?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.spec) {
          setEngine(data.engine);
          setSpec(data.spec);
          setSelectedIdx(0);
        }
      })
      .catch((err) => {
        if (!cancelled) setStatusMsg(`加载失败: ${String(err)}`);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading || !spec) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-container/70 p-4 text-xs text-on-surface-variant">
        {isLoading ? "正在加载步骤数据..." : "无法加载该工程的 spec.json"}
      </div>
    );
  }

  const isAlgo = engine === "algo-stage";
  const items = (isAlgo ? spec.frames : spec.steps) as Array<Record<string, unknown>>;
  const current = items[selectedIdx] ?? items[0];

  const updateCurrentItem = (patch: Record<string, unknown>) => {
    const key = isAlgo ? "frames" : "steps";
    const nextItems = items.map((it, idx) => (idx === selectedIdx ? { ...it, ...patch } : it));
    setSpec({ ...spec, [key]: nextItems });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/stage-spec", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, spec }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "重编译失败");
      setStatusMsg("已保存并完成毫秒级重编译（如修改了旁白可点击右上角重新配音）");
      await onCompiled();
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-container/80 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs font-bold text-primary shrink-0">步骤微调</span>
          {items.map((it, idx) => (
            <button
              key={String(it.id ?? idx)}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono shrink-0 transition ${
                idx === selectedIdx
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-white/5 text-on-surface-variant hover:text-on-surface"
              }`}
            >
              #{idx + 1}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="px-4 py-1.5 rounded-xl primary-gradient text-on-primary-fixed text-xs font-bold hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          {isSaving ? "重编译中..." : "保存并重编译"}
        </button>
      </div>

      {statusMsg && (
        <div className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary">
          {statusMsg}
        </div>
      )}

      {!isAlgo ? (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <label className="flex flex-col gap-1 text-on-surface-variant">
            步骤标题 (headline)
            <input
              type="text"
              value={String(current.headline ?? "")}
              onChange={(e) => updateCurrentItem({ headline: e.target.value })}
              className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-1.5 text-on-surface"
            />
          </label>
          <label className="flex flex-col gap-1 text-on-surface-variant">
            聚焦行号 (逗号分隔，如 2,5,6)
            <input
              type="text"
              value={Array.isArray(current.focusLines) ? current.focusLines.join(",") : ""}
              onChange={(e) => {
                const nums = e.target.value
                  .split(/[,\s]+/)
                  .map((n) => Number.parseInt(n, 10))
                  .filter((n) => Number.isFinite(n) && n > 0);
                updateCurrentItem({ focusLines: nums.length > 0 ? nums : undefined });
              }}
              className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-1.5 text-on-surface font-mono"
            />
          </label>
          <label className="flex flex-col gap-1 text-on-surface-variant col-span-2">
            步骤代码 (code)
            <textarea
              rows={6}
              value={String(current.code ?? "")}
              onChange={(e) => updateCurrentItem({ code: e.target.value })}
              className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-2 text-on-surface font-mono text-xs leading-relaxed"
            />
          </label>
          <label className="flex flex-col gap-1 text-on-surface-variant col-span-2">
            旁白解说 (narration)
            <textarea
              rows={2}
              value={String(current.narration ?? "")}
              onChange={(e) => updateCurrentItem({ narration: e.target.value })}
              className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-1.5 text-on-surface"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 text-xs">
          <label className="flex flex-col gap-1 text-on-surface-variant">
            高亮代码行号 (line)
            <input
              type="number"
              min={1}
              value={Number(current.line ?? 1)}
              onChange={(e) => updateCurrentItem({ line: Math.max(1, Number.parseInt(e.target.value, 10) || 1) })}
              className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-1.5 text-on-surface font-mono"
            />
          </label>
          <label className="flex flex-col gap-1 text-on-surface-variant col-span-2">
            步骤事件说明 (note)
            <input
              type="text"
              value={String(current.note ?? "")}
              onChange={(e) => updateCurrentItem({ note: e.target.value })}
              className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-1.5 text-on-surface"
            />
          </label>
          <label className="flex flex-col gap-1 text-on-surface-variant col-span-3">
            旁白解说 (narration)
            <textarea
              rows={2}
              value={String(current.narration ?? "")}
              onChange={(e) => updateCurrentItem({ narration: e.target.value })}
              className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-1.5 text-on-surface"
            />
          </label>
        </div>
      )}
    </div>
  );
}
