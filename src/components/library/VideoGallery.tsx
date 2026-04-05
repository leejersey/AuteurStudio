"use client";

import Link from "next/link";
import type { VideoProject } from "@/hooks/useProjects";

interface VideoGalleryProps {
  projects: VideoProject[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onRefresh: () => void;
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

function getVideoTypeLabel(type: string): string {
  switch (type) {
    case "card":
      return "图文视频";
    case "algo":
      return "算法动画";
    case "knowledge":
      return "知识讲解";
    case "markdown":
      return "Markdown";
    default:
      return "视频";
  }
}

function getVideoTypeColor(type: string): string {
  switch (type) {
    case "card":
      return "text-tertiary";
    case "algo":
      return "text-secondary";
    case "knowledge":
      return "text-primary";
    case "markdown":
      return "text-secondary";
    default:
      return "text-on-surface-variant";
  }
}

export default function VideoGallery({
  projects,
  isLoading,
  onDelete,
}: VideoGalleryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-primary text-3xl animate-spin">
          sync
        </span>
        <span className="ml-3 text-on-surface-variant">加载中...</span>
      </div>
    );
  }

  // 排除 featured（第一个）后展示的项目
  const displayProjects = projects.slice(1);

  return (
    <div className="relative h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Add New Action */}
        <Link
          href="/studio"
          className="group border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center p-8 hover:border-primary/50 transition-all cursor-pointer bg-surface-container-low/20 hover:bg-surface-container-low/40 h-full min-h-[300px]"
        >
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,241,254,0.1)]">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <div className="text-center mt-6">
            <p className="font-headline font-bold text-on-surface uppercase tracking-widest text-sm">
              创建新生成
            </p>
            <p className="text-[11px] text-on-surface-variant mt-1">
              使用 AI 驱动的模板
            </p>
          </div>
        </Link>

        {/* 项目列表 */}
        {displayProjects.map((project) => (
          <div
            key={project.id}
            className="group relative bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 flex flex-col h-full min-h-[300px]"
          >
            {/* Thumbnail Area */}
            <div className="flex-1 overflow-hidden relative border-b border-outline-variant/10">
              <div
                className="w-full h-full flex items-center justify-center p-6"
                style={{
                  background:
                    project.thumbnail ||
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <span className="text-white/80 text-lg font-headline font-bold text-center leading-snug drop-shadow-md">
                  {project.title}
                </span>
              </div>
              {/* Hover Play Overlay */}
              <div className="absolute inset-0 bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                <Link href={`/studio?projectId=${project.id}`}>
                  <button className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_arrow
                    </span>
                  </button>
                </Link>
              </div>
              {/* Type Badge */}
              <span
                className={`absolute top-3 left-3 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md text-[9px] font-bold uppercase tracking-tighter ${getVideoTypeColor(
                  project.videoType
                )}`}
              >
                {getVideoTypeLabel(project.videoType)}
              </span>
            </div>
            {/* Info Area */}
            <div className="p-4 bg-surface-container-low shrink-0 h-[80px]">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-headline font-semibold text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm(`确定删除「${project.title}」？`)) {
                      await onDelete(project.id);
                    }
                  }}
                  className="text-on-surface-variant/40 hover:text-error transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-lg">
                    delete
                  </span>
                </button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-on-surface-variant font-label uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">
                    schedule
                  </span>
                  {formatTimeAgo(project.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">
                    timer
                  </span>
                  {project.duration}秒
                </span>
                {project.tags.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">
                      label
                    </span>
                    {project.tags[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {displayProjects.length === 0 && projects.length <= 1 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-primary/20 mb-4">
              video_library
            </span>
            <p className="text-on-surface-variant text-sm mb-1">
              {projects.length === 0 ? "还没有任何项目" : "没有更多项目了"}
            </p>
            <p className="text-on-surface-variant/50 text-xs">
              去 Studio 页面生成你的第一个 AI 视频吧
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <Link href="/studio">
        <button className="fixed bottom-10 right-10 flex items-center space-x-3 px-6 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full shadow-[0_10px_40px_rgba(0,241,254,0.4)] hover:scale-105 hover:rotate-2 active:scale-95 transition-all z-50">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_fix_high
          </span>
          <span className="font-headline font-bold uppercase tracking-widest text-sm">
            开始新生成
          </span>
        </button>
      </Link>
    </div>
  );
}
