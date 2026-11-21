"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import type { StageProjectSummary } from "@/lib/stage-projects";
import type { RenderedVideoItem } from "@/app/api/stage-library/route";

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function LibraryPage() {
  const [tab, setTab] = useState<"projects" | "renders">("projects");
  const [projects, setProjects] = useState<StageProjectSummary[]>([]);
  const [renders, setRenders] = useState<RenderedVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stage-library", { cache: "no-store" });
      const data = await res.json();
      setProjects(data.projects ?? []);
      setRenders(data.renders ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  const handleDelete = async (kind: "project" | "render", target: string) => {
    const res = await fetch(
      `/api/stage-library?kind=${kind}&target=${encodeURIComponent(target)}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      if (kind === "render" && playingUrl === `/renders/${target}`) setPlayingUrl(null);
      await loadLibrary();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-on-surface">
      <SideNavBar />

      <main className="flex-1 overflow-y-auto p-8 z-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <header className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-primary uppercase tracking-widest">
                HyperFrames Media Library
              </div>
              <h1 className="text-3xl font-bold font-headline mt-1">媒体库与成片管理</h1>
              <p className="text-sm text-on-surface-variant mt-1">
                统一管理所有 HyperFrames 源码工程与已导出的 MP4 成片。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadLibrary()}
                className="px-3.5 py-2 rounded-xl bg-surface-container-high border border-white/10 text-xs font-bold hover:border-primary/40 transition"
              >
                刷新
              </button>
              <Link
                href="/code-studio"
                className="px-4 py-2 rounded-xl primary-gradient text-on-primary-fixed text-xs font-bold hover:opacity-90 transition"
              >
                新建视频
              </Link>
            </div>
          </header>

          {/* Tab 切换 */}
          <div className="flex gap-2 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setTab("projects")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tab === "projects"
                  ? "bg-primary/15 text-primary border border-primary/40"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              HyperFrames 工程 ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("renders")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tab === "renders"
                  ? "bg-primary/15 text-primary border border-primary/40"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              已导出 MP4 成片 ({renders.length})
            </button>
          </div>

          {isLoading ? (
            <div className="text-sm text-on-surface-variant py-12 text-center">正在加载媒体库...</div>
          ) : tab === "projects" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => {
                const isBuiltIn = !p.slug.startsWith("generated/");
                return (
                  <div
                    key={p.slug}
                    className="rounded-2xl border border-white/10 bg-surface-container/80 p-5 flex flex-col gap-3 hover:border-primary/40 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          p.engine === "algo-stage"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {p.engine === "algo-stage" ? "ALGO STAGE" : "CODE STAGE"}
                      </span>
                      <span className="text-[11px] font-mono text-on-surface-variant">
                        {p.width}×{p.height}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-headline line-clamp-1">{p.title}</h3>
                      <p className="text-xs font-mono text-on-surface-variant mt-1">
                        {p.itemCount} 步 · {p.duration}s {p.hasAudio ? "· 有声" : "· 无声"}
                      </p>
                    </div>
                    <div className="mt-auto pt-2 flex items-center gap-2">
                      <Link
                        href={`/code-studio?slug=${encodeURIComponent(p.slug)}`}
                        className="flex-1 text-center py-2 rounded-xl primary-gradient text-on-primary-fixed text-xs font-bold hover:opacity-90 transition"
                      >
                        打开预览 / 编辑
                      </Link>
                      {!isBuiltIn && (
                        <button
                          type="button"
                          onClick={() => void handleDelete("project", p.slug)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-error/15 text-on-surface-variant hover:text-error transition"
                          title="删除工程"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {playingUrl && (
                <div className="rounded-2xl border border-primary/30 bg-black p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant">
                    <span>正在播放：{playingUrl}</span>
                    <button
                      type="button"
                      onClick={() => setPlayingUrl(null)}
                      className="text-primary hover:underline"
                    >
                      关闭播放器
                    </button>
                  </div>
                  <video src={playingUrl} controls autoPlay className="w-full max-h-[55vh] rounded-xl bg-black" />
                </div>
              )}

              {renders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-sm text-on-surface-variant">
                  暂无已导出的 MP4 成片，请前往「代码工坊」或「导出中心」渲染视频。
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renders.map((r) => (
                    <div
                      key={r.filename}
                      className="rounded-2xl border border-white/10 bg-surface-container/80 p-4 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-mono font-bold truncate">{r.filename}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">
                          {formatSize(r.sizeBytes)} · {new Date(r.modifiedAt).toLocaleString("zh-CN")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPlayingUrl(r.url)}
                          className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-bold hover:bg-primary/25 transition"
                        >
                          播放
                        </button>
                        <a
                          href={r.url}
                          download
                          className="px-3 py-1.5 rounded-lg primary-gradient text-on-primary-fixed text-xs font-bold hover:opacity-90 transition"
                        >
                          下载
                        </a>
                        <button
                          type="button"
                          onClick={() => void handleDelete("render", r.filename)}
                          className="p-1.5 text-on-surface-variant hover:text-error transition"
                          title="删除文件"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
