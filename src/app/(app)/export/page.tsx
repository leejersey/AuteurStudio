"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import type { RenderJobRecord } from "@/lib/render-jobs";
import type { StageProjectSummary } from "@/lib/stage-projects";

export default function ExportPage() {
  const [projects, setProjects] = useState<StageProjectSummary[]>([]);
  const [jobs, setJobs] = useState<RenderJobRecord[]>([]);
  const [submittingSlug, setSubmittingSlug] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [pRes, jRes] = await Promise.all([
        fetch("/api/stage-projects", { cache: "no-store" }),
        fetch("/api/stage-render", { cache: "no-store" }),
      ]);
      const pData = await pRes.json();
      const jData = await jRes.json();
      setProjects(pData.projects ?? []);
      setJobs(jData.jobs ?? []);
    } catch (err) {
      console.error("加载导出队列失败:", err);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  // 有运行中或排队中任务时自动轮询
  useEffect(() => {
    const hasActive = jobs.some((j) => j.status === "queued" || j.status === "running");
    if (!hasActive) return;
    const timer = setInterval(() => {
      void fetchAll();
    }, 1500);
    return () => clearInterval(timer);
  }, [jobs, fetchAll]);

  const handleEnqueue = async (slug: string) => {
    setSubmittingSlug(slug);
    try {
      await fetch("/api/stage-render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      await fetchAll();
    } finally {
      setSubmittingSlug(null);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/stage-render?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await fetchAll();
  };

  const runningCount = jobs.filter((j) => j.status === "running" || j.status === "queued").length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-on-surface">
      <SideNavBar />

      <main className="flex-1 flex min-w-0 overflow-hidden z-10">
        {/* 左侧：可导出的 HyperFrames 工程 */}
        <section className="w-[380px] shrink-0 border-r border-white/5 bg-surface-container/60 p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <h2 className="text-lg font-bold font-headline">可导出工程 ({projects.length})</h2>
            <p className="text-xs text-on-surface-variant mt-1">
              点击右侧按钮提交至后台异步渲染队列
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {projects.map((p) => (
              <div
                key={p.slug}
                className="rounded-xl border border-white/10 bg-surface-container-low/80 p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{p.title}</div>
                    <div className="text-[11px] font-mono text-on-surface-variant mt-0.5">
                      {p.width}×{p.height} · {p.duration}s {p.hasAudio ? "· 有声" : "· 无声"}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/15 text-primary shrink-0">
                    {p.engine === "algo-stage" ? "ALGO" : "CODE"}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={submittingSlug === p.slug}
                  onClick={() => handleEnqueue(p.slug)}
                  className="w-full py-1.5 rounded-lg primary-gradient text-on-primary-fixed text-xs font-bold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {submittingSlug === p.slug ? "提交中..." : "加入渲染队列"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 右侧：持久化异步渲染队列 */}
        <section className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <header className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-primary">
                  <span className={`w-2 h-2 rounded-full bg-primary ${runningCount > 0 ? "animate-pulse" : ""}`} />
                  {runningCount > 0 ? `正在后台渲染 (${runningCount})` : "HyperFrames 渲染引擎就绪"}
                </div>
                <h1 className="text-3xl font-bold font-headline mt-1">导出中心与异步渲染队列</h1>
                <p className="text-xs text-on-surface-variant mt-1">
                  任务状态已持久化至磁盘，刷新页面或切换路由不会中断后台渲染。
                </p>
              </div>
              <Link
                href="/code-studio"
                className="px-4 py-2 rounded-xl border border-white/15 bg-surface-container-high text-xs font-bold hover:border-primary/50 transition"
              >
                返回代码工坊
              </Link>
            </header>

            {jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-sm text-on-surface-variant">
                暂无渲染任务，请在左侧选择一个工程点击「加入渲染队列」。
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-2xl border border-white/10 bg-surface-container/80 p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">{job.title}</div>
                        <div className="text-[11px] font-mono text-on-surface-variant mt-0.5">
                          {job.slug} · {new Date(job.createdAt).toLocaleString("zh-CN")}
                          {job.durationMs ? ` · 耗时 ${(job.durationMs / 1000).toFixed(1)}s` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                            job.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : job.status === "failed"
                                ? "bg-error/20 text-error"
                                : "bg-primary/20 text-primary"
                          }`}
                        >
                          {job.status === "completed"
                            ? "已完成"
                            : job.status === "failed"
                              ? "失败"
                              : `渲染中 ${job.progress}%`}
                        </span>
                        {job.outputUrl && (
                          <a
                            href={job.outputUrl}
                            download
                            className="px-3 py-1 rounded-lg primary-gradient text-on-primary-fixed text-xs font-bold hover:opacity-90"
                          >
                            下载 MP4
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(job.id)}
                          className="p-1 text-on-surface-variant hover:text-error transition"
                          title="删除记录"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>

                    {(job.status === "running" || job.status === "queued") && (
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full primary-gradient transition-all duration-300"
                          style={{ width: `${Math.max(6, job.progress)}%` }}
                        />
                      </div>
                    )}

                    {job.error && (
                      <div className="text-xs text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2 font-mono">
                        {job.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
