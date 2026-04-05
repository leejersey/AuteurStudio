import type { VideoProject } from "@/hooks/useProjects";
import Link from "next/link";

interface MediaLibraryProps {
  projects: VideoProject[];
}

function getVideoTypeLabel(type: string): string {
  switch (type) {
    case "card":
      return "竖屏";
    case "algo":
    case "knowledge":
      return "横屏";
    case "markdown":
      return "Markdown";
    default:
      return "";
  }
}

export default function MediaLibrary({ projects }: MediaLibraryProps) {
  return (
    <aside className="w-80 bg-surface-container-low border-r border-outline-variant/10 overflow-y-auto p-6 hidden lg:block">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline font-bold text-lg tracking-tight">
          已保存素材
        </h3>
        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
          {projects.length} 项
        </span>
      </div>
      <div className="space-y-6">
        {projects.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-3 block">
              folder_open
            </span>
            <p className="text-xs text-on-surface-variant/50">
              暂无素材
            </p>
          </div>
        )}

        {projects.map((project) => (
          <Link
            href={`/studio?projectId=${project.id}`}
            key={project.id}
            className="group cursor-pointer block"
          >
            <div
              className={`${
                project.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"
              } rounded-xl overflow-hidden mb-3 border border-outline-variant/20 group-hover:border-primary/40 transition-colors flex items-center justify-center`}
              style={{
                background:
                  project.thumbnail ||
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <span className="text-white/70 text-sm font-headline font-bold text-center px-4 leading-snug drop-shadow-md">
                {project.title}
              </span>
            </div>
            <p className="text-sm font-medium truncate">
              {project.title}
            </p>
            <p className="text-[10px] text-on-surface-variant uppercase font-bold">
              {getVideoTypeLabel(project.videoType)} •{" "}
              {project.duration}秒
            </p>
          </Link>
        ))}
      </div>
    </aside>
  );
}
