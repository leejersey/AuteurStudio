"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type RenderVideoType = "card" | "algo" | "knowledge" | "markdown";

export interface RenderTask {
  taskId: string;
  projectTitle: string;
  videoType: RenderVideoType;
  status: "rendering" | "completed" | "failed";
  progress: number;
  outputPath?: string;
  error?: string;
  startedAt: string;
}

export function useRenderTask() {
  const [tasks, setTasks] = useState<RenderTask[]>([]);
  const pollTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 清理定时器
  useEffect(() => {
    return () => {
      pollTimers.current.forEach((timer) => clearInterval(timer));
    };
  }, []);

  // 轮询渲染进度
  const pollProgress = useCallback((taskId: string) => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/render?taskId=${taskId}`);
        if (!res.ok) return;

        const data = await res.json();

        setTasks((prev) =>
          prev.map((t) =>
            t.taskId === taskId
              ? {
                  ...t,
                  status: data.status,
                  progress: data.progress || 0,
                  outputPath: data.outputPath,
                  error: data.error,
                }
              : t
          )
        );

        // 完成或失败时停止轮询
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(timer);
          pollTimers.current.delete(taskId);
        }
      } catch {
        // 网络错误时继续重试
      }
    }, 2000);

    pollTimers.current.set(taskId, timer);
  }, []);

  // 触发渲染
  const startRender = useCallback(
    async (
      projectTitle: string,
      videoData: unknown,
      videoType: RenderVideoType,
      projectId?: string
    ) => {
      try {
        const res = await fetch("/api/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoData,
            videoType,
            projectId,
          }),
        });

        if (!res.ok) throw new Error("渲染请求失败");

        const data = await res.json();
        const taskId = data.taskId;

        const newTask: RenderTask = {
          taskId,
          projectTitle,
          videoType,
          status: "rendering",
          progress: 0,
          startedAt: new Date().toISOString(),
        };

        setTasks((prev) => [newTask, ...prev]);
        pollProgress(taskId);

        return taskId;
      } catch (err) {
        console.error("渲染启动失败:", err);
        return null;
      }
    },
    [pollProgress]
  );

  // 取消/移除任务（从列表中移除）
  const removeTask = useCallback((taskId: string) => {
    const timer = pollTimers.current.get(taskId);
    if (timer) {
      clearInterval(timer);
      pollTimers.current.delete(taskId);
    }
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
  }, []);

  return {
    tasks,
    startRender,
    removeTask,
  };
}
