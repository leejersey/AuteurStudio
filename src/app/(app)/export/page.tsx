"use client";

import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import MediaLibrary from "@/components/export/MediaLibrary";
import RenderQueue from "@/components/export/RenderQueue";
import CloudStats from "@/components/export/CloudStats";
import { useProjects } from "@/hooks/useProjects";
import { useRenderTask } from "@/hooks/useRenderTask";
import type { RenderVideoType } from "@/hooks/useRenderTask";
import { useCallback } from "react";

export default function ExportPage() {
  const { projects, stats } = useProjects();
  const { tasks, startRender, removeTask } = useRenderTask();

  // 桥接 RenderQueue 的回调签名（含 projectId）
  const handleStartRender = useCallback(
    async (
      title: string,
      videoData: unknown,
      videoType: RenderVideoType,
      projectId?: string
    ) => {
      return startRender(title, videoData, videoType, projectId);
    },
    [startRender]
  );

  return (
    <div className="flex min-h-screen">
      <SideNavBar />

      <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
        <TopNavBar title="导出中心" showAuteurLogo />

        <div className="flex-1 flex flex-row overflow-hidden">
          <MediaLibrary projects={projects} />

          <section className="flex-1 p-8 lg:p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <header className="mb-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse pulse-glow"></span>
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest">
                    {tasks.some((t) => t.status === "rendering")
                      ? "正在运行的渲染引擎"
                      : "渲染引擎就绪"}
                  </span>
                </div>
                <h2 className="text-4xl font-headline font-bold tracking-tighter">
                  视频导出与渲染队列
                </h2>
                <p className="text-on-surface-variant mt-2 max-w-lg">
                  实时监控云端渲染任务与 AI 生成进度。
                </p>
              </header>

              <RenderQueue
                tasks={tasks}
                projects={projects}
                onStartRender={handleStartRender}
                onRemoveTask={removeTask}
              />

              <CloudStats
                stats={stats}
                renderingCount={
                  tasks.filter((t) => t.status === "rendering").length
                }
              />
            </div>
          </section>
        </div>

        {/* Background Decoration Gradients */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      </main>
    </div>
  );
}

