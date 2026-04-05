"use client";

import type { RenderTask, RenderVideoType } from "@/hooks/useRenderTask";
import type { VideoProject } from "@/hooks/useProjects";

function getVideoTypeLabel(type: string): string {
  switch (type) {
    case "card":
      return "竖屏 9:16";
    case "algo":
      return "算法 16:9";
    case "knowledge":
      return "知识 16:9";
    case "markdown":
      return "Markdown 16:9";
    default:
      return "";
  }
}

interface RenderQueueProps {
  tasks: RenderTask[];
  projects: VideoProject[];
  onStartRender: (
    title: string,
    videoData: unknown,
    videoType: RenderVideoType,
    projectId?: string
  ) => Promise<string | null>;
  onRemoveTask: (taskId: string) => void;
}

export default function RenderQueue({
  tasks,
  projects,
  onStartRender,
  onRemoveTask,
}: RenderQueueProps) {
  // 如果没有任务，显示空状态+快速渲染入口
  if (tasks.length === 0) {
    return (
      <div className="space-y-4">
        {/* 快速渲染入口：从最近的项目 */}
        {projects.slice(0, 3).map((project) => (
          <div
            key={project.id}
            className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-surface-container-high transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Thumbnail */}
              <div
                className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden border border-outline-variant/20 flex items-center justify-center"
                style={{
                  background:
                    project.thumbnail ||
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <span className="text-white/80 text-[10px] font-bold text-center px-1 leading-tight">
                  {project.title.slice(0, 8)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold font-headline">
                    {project.title}
                  </h4>
                  <div className="text-right">
                    <span className="text-on-surface-variant font-mono text-sm">
                      {project.renderStatus === "completed"
                        ? "已渲染"
                        : "待渲染"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      onStartRender(
                        project.title,
                        project.videoData,
                        project.videoType as RenderVideoType,
                        project.id
                      )
                    }
                    className="px-5 py-2 bg-surface-container-highest text-primary text-xs font-bold rounded-lg border border-primary/20 hover:bg-primary hover:text-on-primary-fixed transition-all flex items-center gap-2 uppercase tracking-wider"
                  >
                    <span className="material-symbols-outlined text-sm">
                      movie_creation
                    </span>
                    开始渲染
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-primary/20 mb-4">
              movie_filter
            </span>
            <p className="text-on-surface-variant text-sm mb-1">
              暂无渲染任务
            </p>
            <p className="text-on-surface-variant/50 text-xs">
              在 Studio 中生成视频后，来这里导出
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        if (task.status === "rendering") {
          return (
            <div
              key={task.taskId}
              className="bg-surface-container-high border border-outline-variant/10 rounded-2xl p-6 relative overflow-hidden group hover:border-primary/20 transition-all"
            >
              <div className="absolute top-0 left-0 w-1 h-full primary-gradient"></div>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-surface-container-highest flex-shrink-0 flex items-center justify-center border border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-2xl animate-spin">
                    sync
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold font-headline">
                      {task.projectTitle}
                      <span className="ml-2 text-[10px] font-bold text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">
                        {getVideoTypeLabel(task.videoType)}
                      </span>
                    </h4>
                    <div className="text-right">
                      <span className="text-primary font-mono text-sm">
                        {task.progress}% 正在渲染...
                      </span>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold mt-1">
                        预计剩余时间:{" "}
                        {Math.max(
                          1,
                          Math.ceil(
                            ((100 - task.progress) / Math.max(task.progress, 1)) *
                              ((Date.now() -
                                new Date(task.startedAt).getTime()) /
                                1000)
                          )
                        )}
                        秒
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full primary-gradient rounded-full pulse-glow transition-all duration-500"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button
                    onClick={() => onRemoveTask(task.taskId)}
                    className="p-3 bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                  </button>
                </div>
              </div>
            </div>
          );
        }

        if (task.status === "completed") {
          return (
            <div
              key={task.taskId}
              className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 relative overflow-hidden group hover:bg-surface-container-high transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-surface-container-highest flex-shrink-0 overflow-hidden border border-outline-variant/20 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold font-headline">
                      {task.projectTitle}
                    </h4>
                    <div className="text-right">
                      <span className="text-secondary font-mono text-sm">
                        渲染完成
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    {task.outputPath && (
                      <a
                        href={task.outputPath}
                        download
                        className="px-5 py-2 bg-surface-container-highest text-primary text-xs font-bold rounded-lg border border-primary/20 hover:bg-primary hover:text-on-primary-fixed transition-all flex items-center gap-2 uppercase tracking-wider"
                      >
                        <span className="material-symbols-outlined text-sm">
                          download
                        </span>
                        下载视频
                      </a>
                    )}
                    <button
                      onClick={() => onRemoveTask(task.taskId)}
                      className="px-5 py-2 bg-surface-container-highest text-on-surface-variant text-xs font-bold rounded-lg border border-outline-variant/30 hover:text-[#ECEDF6] transition-all flex items-center gap-2 uppercase tracking-wider"
                    >
                      <span className="material-symbols-outlined text-sm">
                        close
                      </span>
                      移除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Failed
        return (
          <div
            key={task.taskId}
            className="bg-surface-container-low border border-error/10 rounded-2xl p-6 relative overflow-hidden group"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 rounded-xl bg-surface-container-highest flex-shrink-0 overflow-hidden border border-error/20 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-error/10 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-error"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    error
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold font-headline">
                    {task.projectTitle}
                  </h4>
                  <div className="text-right">
                    <span className="text-error font-mono text-sm">
                      渲染失败
                    </span>
                    <p className="text-[10px] text-error/60 uppercase font-bold mt-1">
                      {task.error || "未知错误"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => onRemoveTask(task.taskId)}
                    className="px-5 py-2 text-on-surface-variant text-xs font-bold rounded-lg hover:text-[#ECEDF6] transition-all flex items-center gap-2 uppercase tracking-wider"
                  >
                    移除
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
