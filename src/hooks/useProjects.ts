"use client";

import { useState, useEffect, useCallback } from "react";
import type { VideoProject, ProjectStats } from "@/lib/project-store";

// 重新导出类型供组件使用
export type { VideoProject, ProjectStats };

interface UseProjectsOptions {
  type?: "card" | "algo" | "knowledge" | "markdown";
  search?: string;
  autoFetch?: boolean;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.type) params.set("type", options.type);
      if (options.search) params.set("search", options.search);

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (!res.ok) throw new Error("获取项目列表失败");

      const data = await res.json();
      setProjects(data.projects || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setIsLoading(false);
    }
  }, [options.type, options.search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/projects?stats=true");
      if (!res.ok) return;
      const data = await res.json();
      setStats(data.stats);
    } catch {
      // 统计数据获取失败不影响主流程
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");

      // 乐观更新
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTotalCount((prev) => prev - 1);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
      return false;
    }
  }, []);

  // 自动获取（默认开启）
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchProjects();
      fetchStats();
    }
  }, [fetchProjects, fetchStats, options.autoFetch]);

  return {
    projects,
    totalCount,
    stats,
    isLoading,
    error,
    refetch: fetchProjects,
    fetchStats,
    deleteProject,
  };
}
