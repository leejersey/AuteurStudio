"use client";

import { useEffect, useState } from "react";

interface AudioTrack {
  file: string;
  label: string;
}

interface PackagingPanelProps {
  slug: string;
  onApplied: () => Promise<void> | void;
}

export default function PackagingPanel({ slug, onApplied }: PackagingPanelProps) {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [enableIntro, setEnableIntro] = useState(true);
  const [enableOutro, setEnableOutro] = useState(true);
  const [bgmFile, setBgmFile] = useState("bgm-tech-01.wav");
  const [bgmLevel, setBgmLevel] = useState<"soft" | "balanced" | "energetic">("balanced");
  const [outroCta, setOutroCta] = useState("点赞 · 收藏 · 关注，持续拆解硬核编程");
  const [isApplying, setIsApplying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/stage-audio", { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/stage-spec?slug=${encodeURIComponent(slug)}`, { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([audioData, specData]) => {
        if (cancelled) return;
        const list = (audioData.tracks ?? []) as AudioTrack[];
        setTracks(list);
        if (specData.spec) {
          setSpec(specData.spec);
          const pkg = specData.spec.packaging as Record<string, unknown> | undefined;
          if (pkg) {
            setEnableIntro(Boolean(pkg.enableIntro));
            setEnableOutro(Boolean(pkg.enableOutro));
            setBgmFile(typeof pkg.bgmFile === "string" ? pkg.bgmFile : "");
            setBgmLevel((pkg.bgmLevel as "soft" | "balanced" | "energetic") || "balanced");
            if (typeof pkg.outroCta === "string") setOutroCta(pkg.outroCta);
          } else {
            setEnableIntro(false);
            setEnableOutro(false);
            setBgmFile(list[0]?.file ?? "");
          }
        }
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleApply = async () => {
    if (!spec) return;
    setIsApplying(true);
    setMsg(null);
    try {
      const updatedSpec = {
        ...spec,
        packaging: {
          enableIntro,
          introDuration: 2.5,
          enableOutro,
          outroDuration: 3.0,
          outroCta: outroCta.trim() || "点赞 · 收藏 · 关注，持续拆解硬核编程",
          bgmFile: bgmFile || undefined,
          bgmLevel,
        },
      };
      const res = await fetch("/api/stage-spec", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, spec: updatedSpec }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "应用包装失败");
      setMsg("已应用片头/片尾与 Auto-Ducking BGM 并重编译");
      await onApplied();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "应用失败");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-container/80 p-4 flex flex-col gap-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">music_note</span>
          <span className="font-bold text-on-surface">片头 Hook · 结尾 CTA · Auto-Ducking BGM</span>
        </div>
        <button
          type="button"
          disabled={isApplying || !spec}
          onClick={handleApply}
          className="px-4 py-1.5 rounded-xl primary-gradient text-on-primary-fixed font-bold hover:opacity-90 disabled:opacity-50"
        >
          {isApplying ? "重编译中..." : "应用并重编译"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <label className="flex items-center justify-between rounded-xl bg-surface-container-low border border-white/10 px-3 py-2 cursor-pointer">
          <span className="text-on-surface">2.5s 片头 Hook</span>
          <input
            type="checkbox"
            checked={enableIntro}
            onChange={(e) => setEnableIntro(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
        </label>

        <label className="flex items-center justify-between rounded-xl bg-surface-container-low border border-white/10 px-3 py-2 cursor-pointer">
          <span className="text-on-surface">3.0s 结尾总结页</span>
          <input
            type="checkbox"
            checked={enableOutro}
            onChange={(e) => setEnableOutro(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
        </label>

        <label className="flex flex-col gap-1 text-on-surface-variant">
          背景音乐（`public/audio/`）
          <select
            value={bgmFile}
            onChange={(e) => setBgmFile(e.target.value)}
            className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-1.5 text-on-surface"
          >
            <option value="">关闭 BGM</option>
            {tracks.map((t) => (
              <option key={t.file} value={t.file}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-on-surface-variant">
          BGM 音量档位（自动压低人声）
          <select
            value={bgmLevel}
            onChange={(e) => setBgmLevel(e.target.value as "soft" | "balanced" | "energetic")}
            className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-1.5 text-on-surface"
          >
            <option value="soft">柔和安静（推荐长教程）</option>
            <option value="balanced">标准平衡（推荐）</option>
            <option value="energetic">动感节奏（短视频）</option>
          </select>
        </label>
      </div>

      {enableOutro && (
        <label className="flex flex-col gap-1 text-on-surface-variant">
          结尾 CTA 文案
          <input
            type="text"
            value={outroCta}
            onChange={(e) => setOutroCta(e.target.value)}
            className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-1.5 text-on-surface"
          />
        </label>
      )}

      {msg && (
        <div className="rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-primary">{msg}</div>
      )}
    </div>
  );
}
