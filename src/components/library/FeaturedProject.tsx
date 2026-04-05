import Link from "next/link";
import type { VideoProject } from "@/hooks/useProjects";

interface FeaturedProjectProps {
  project: VideoProject;
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前创建`;
  if (days < 7) return `${days}天前创建`;
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

export default function FeaturedProject({ project }: FeaturedProjectProps) {
  return (
    <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/20 flex flex-col lg:flex-row gap-8 items-center">
      {/* Thumbnail */}
      <div className="w-full lg:w-1/3 aspect-video rounded-xl overflow-hidden relative shadow-2xl group">
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: project.thumbnail || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
        >
          <span className="text-white/90 text-4xl font-headline font-bold text-center px-6 drop-shadow-lg leading-tight">
            {project.title}
          </span>
        </div>
        <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
          <button className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
          </button>
        </div>
      </div>
      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-secondary/10 text-[10px] font-bold text-secondary uppercase tracking-widest border border-secondary/20">
              精选生成
            </span>
            <span className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
              {formatTimeAgo(project.createdAt)}
            </span>
          </div>
          <h2 className="font-headline text-2xl font-bold text-primary">
            {project.title}
          </h2>
          <p className="text-on-surface-variant text-sm max-w-2xl leading-relaxed">
            {project.description || `使用 Auteur Studio 渲染引擎生成的${getVideoTypeLabel(project.videoType)}。`}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background/40 p-3 rounded-lg border border-outline-variant/10">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter mb-1">
              分辨率
            </p>
            <p className="text-sm font-semibold">
              {project.aspectRatio === "9:16" ? "1080 x 1920" : "1920 x 1080"}
            </p>
          </div>
          <div className="bg-background/40 p-3 rounded-lg border border-outline-variant/10">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter mb-1">
              时长
            </p>
            <p className="text-sm font-semibold">{project.duration}s</p>
          </div>
          <div className="bg-background/40 p-3 rounded-lg border border-outline-variant/10">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter mb-1">
              画幅比
            </p>
            <p className="text-sm font-semibold">
              {project.aspectRatio} ({project.aspectRatio === "9:16" ? "竖屏" : "横屏"})
            </p>
          </div>
          <div className="bg-background/40 p-3 rounded-lg border border-outline-variant/10">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter mb-1">
              项目分类
            </p>
            <p className="text-sm font-semibold">
              {getVideoTypeLabel(project.videoType)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 pt-2">
          <Link href={`/studio?projectId=${project.id}`}>
            <button className="bg-primary hover:bg-primary-dim text-on-primary px-6 py-2.5 rounded-lg text-sm font-bold tracking-widest transition-colors flex items-center space-x-2">
              <span className="material-symbols-outlined text-lg">edit</span>
              <span>继续编辑</span>
            </button>
          </Link>
          <button className="bg-surface-container-highest hover:bg-surface-container-high text-on-surface px-6 py-2.5 rounded-lg text-sm font-bold tracking-widest transition-colors border border-outline-variant/20">
            导出成品
          </button>
        </div>
      </div>
    </div>
  );
}
