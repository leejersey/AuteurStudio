import type { ProjectStats } from "@/hooks/useProjects";

interface CloudStatsProps {
  stats: ProjectStats | null;
  renderingCount: number;
}

export default function CloudStats({ stats, renderingCount }: CloudStatsProps) {
  const totalProjects = stats?.totalProjects || 0;
  // 粗略估算存储（每个项目约 50KB JSON）
  const estimatedStorageGB = ((totalProjects * 50) / 1024 / 1024).toFixed(1);

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10">
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">
          项目数量
        </p>
        <div className="flex items-end justify-between">
          <h5 className="text-3xl font-headline font-bold">
            {totalProjects}
            <span className="text-lg text-on-surface-variant"> 个</span>
          </h5>
          <span className="material-symbols-outlined text-primary mb-1">
            video_library
          </span>
        </div>
        <div className="flex gap-3 mt-4 text-[10px] text-on-surface-variant">
          <span>图文 {stats?.cardCount || 0}</span>
          <span>•</span>
          <span>算法 {stats?.algoCount || 0}</span>
          <span>•</span>
          <span>知识 {stats?.knowledgeCount || 0}</span>
        </div>
      </div>
      <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10">
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">
          渲染状态
        </p>
        <div className="flex items-end justify-between">
          <h5 className="text-3xl font-headline font-bold">
            {renderingCount}
            <span className="text-lg text-on-surface-variant"> 进行中</span>
          </h5>
          <span className="material-symbols-outlined text-secondary mb-1">
            speed
          </span>
        </div>
        <p className="text-[10px] text-on-surface-variant mt-4">
          {renderingCount > 0 ? "渲染引擎正在工作" : "引擎空闲，可以开始新任务"}
        </p>
      </div>
      <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10">
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">
          预估存储
        </p>
        <div className="flex items-end justify-between">
          <h5 className="text-3xl font-headline font-bold">
            {estimatedStorageGB}
            <span className="text-lg text-on-surface-variant"> MB</span>
          </h5>
          <span className="material-symbols-outlined text-tertiary mb-1">
            cloud_queue
          </span>
        </div>
        <p className="text-[10px] text-on-surface-variant mt-4">
          基于 JSON 项目数据估算
        </p>
      </div>
    </div>
  );
}
