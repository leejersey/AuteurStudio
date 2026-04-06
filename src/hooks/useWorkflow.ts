"use client";

import { useState, useCallback } from "react";
import type {
  WorkflowState,
  WorkflowStage,
  TopicSuggestion,
  VideoScript,
} from "@/lib/types/workflow";
import { INITIAL_WORKFLOW_STATE } from "@/lib/types/workflow";
import type { CodeTheme } from "@/lib/types/markdown-video";

export type { WorkflowState, WorkflowStage, TopicSuggestion, VideoScript };

export function useWorkflow() {
  const [state, setState] = useState<WorkflowState>(INITIAL_WORKFLOW_STATE);

  // ─── 辅助：更新状态 ───

  const patch = useCallback(
    (updates: Partial<WorkflowState>) =>
      setState((prev) => ({ ...prev, ...updates })),
    []
  );

  const pushStage = useCallback(
    (stage: WorkflowStage) =>
      setState((prev) => ({
        ...prev,
        stage,
        history: [...prev.history, prev.stage],
        error: null,
      })),
    []
  );

  // ─── 阶段 1: 生成选题 ───

  const generateTopics = useCallback(
    async (intent: string, videoType: "card" | "landscape" | "markdown") => {
      patch({ isLoading: true, error: null, userIntent: intent, videoType });

      try {
        const res = await fetch("/api/workflow/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intent, videoType }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "选题生成失败");
        }

        const data = await res.json();
        setState((prev) => ({
          ...prev,
          stage: "topics",
          topics: data.topics || [],
          history: [...prev.history, prev.stage],
          isLoading: false,
          error: null,
        }));
      } catch (err) {
        patch({
          isLoading: false,
          error: err instanceof Error ? err.message : "选题生成失败",
        });
      }
    },
    [patch]
  );

  const regenerateTopics = useCallback(async () => {
    if (!state.userIntent) return;
    await generateTopics(state.userIntent, state.videoType);
  }, [state.userIntent, state.videoType, generateTopics]);

  // ─── 阶段 1→2: 选择选题 ───

  const selectTopic = useCallback(
    (topic: TopicSuggestion) => {
      patch({ selectedTopic: topic });
    },
    [patch]
  );

  // ─── 模板选择 ───

  const setTemplateId = useCallback(
    (templateId: string) => {
      patch({ templateId });
    },
    [patch]
  );

  // ─── 阶段 2: 生成文案 ───

  const generateScript = useCallback(
    async (userNotes?: string) => {
      if (!state.selectedTopic) {
        patch({ error: "请先选择一个选题" });
        return;
      }

      patch({ isLoading: true, error: null, topicNotes: userNotes || "" });

      try {
        const res = await fetch("/api/workflow/script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: state.selectedTopic,
            videoType: state.videoType,
            userNotes,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "文案生成失败");
        }

        const data = await res.json();
        // 自动将选题标题填充为视频标题
        const scriptWithTitle = {
          ...data.script,
          title: state.selectedTopic?.title || data.script.title,
        };
        setState((prev) => ({
          ...prev,
          stage: "script",
          script: scriptWithTitle,
          editedScript: scriptWithTitle,
          history: [...prev.history, prev.stage],
          isLoading: false,
          error: null,
        }));
      } catch (err) {
        patch({
          isLoading: false,
          error: err instanceof Error ? err.message : "文案生成失败",
        });
      }
    },
    [state.selectedTopic, state.videoType, patch]
  );

  // ─── Markdown 模式：解析 MD + 生成旁白 ───

  const generateFromMarkdown = useCallback(
    async (markdown: string, theme: CodeTheme) => {
      patch({
        isLoading: true,
        error: null,
        videoType: "markdown",
        markdownContent: markdown,
        codeTheme: theme,
      });

      try {
        const res = await fetch("/api/workflow/markdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown, theme }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Markdown 解析失败");
        }

        const data = await res.json();
        setState((prev) => ({
          ...prev,
          stage: "script",
          script: data.script,
          editedScript: data.script,
          markdownSlides: data.markdownSlides || [],
          codeTheme: data.theme || theme,
          history: [...prev.history, prev.stage],
          isLoading: false,
          error: null,
        }));
      } catch (err) {
        patch({
          isLoading: false,
          error: err instanceof Error ? err.message : "Markdown 解析失败",
        });
      }
    },
    [patch]
  );

  // ─── 阶段 2: 编辑脚本 ───

  const updateScript = useCallback(
    (script: VideoScript) => {
      patch({ editedScript: script });
    },
    [patch]
  );

  // ─── 配音设置 ───

  const setVoiceId = useCallback(
    (voiceId: string) => {
      patch({ voiceId });
    },
    [patch]
  );

  const setVoiceSpeed = useCallback(
    (voiceSpeed: number) => {
      patch({ voiceSpeed });
    },
    [patch]
  );

  // ─── 阶段 2→3: 确认文案并生成视频 ───

  const confirmAndGenerate = useCallback(async () => {
    const finalScript = state.editedScript || state.script;
    if (!finalScript) {
      patch({ error: "没有可用的脚本" });
      return;
    }

    pushStage("video");
    patch({ isLoading: true, error: null });

    try {
      // Markdown 模式使用专用 API
      const isMarkdown = state.videoType === "markdown";
      const apiUrl = isMarkdown
        ? "/api/workflow/markdown-video"
        : "/api/workflow/video";

      const body = isMarkdown
        ? {
            script: finalScript,
            markdownSlides: state.markdownSlides,
            theme: state.codeTheme,
            templateId: state.templateId,
            voiceId: state.voiceId,
            voiceSpeed: state.voiceSpeed,
          }
        : {
            script: finalScript,
            videoType: state.videoType,
            templateId: state.templateId,
            voiceId: state.voiceId,
            voiceSpeed: state.voiceSpeed,
          };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "视频生成失败");
      }

      const data = await res.json();
      setState((prev) => ({
        ...prev,
        stage: "done",
        videoData: data.videoData,
        projectId: data.projectId,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      patch({
        isLoading: false,
        stage: "script",
        error: err instanceof Error ? err.message : "视频生成失败",
      });
    }
  }, [
    state.editedScript,
    state.script,
    state.videoType,
    state.templateId,
    state.markdownSlides,
    state.codeTheme,
    patch,
    pushStage,
  ]);

  // ─── 导航控制 ───

  const goBack = useCallback(() => {
    setState((prev) => {
      const history = [...prev.history];
      const previousStage = history.pop() || "idle";
      return {
        ...prev,
        stage: previousStage as WorkflowStage,
        history,
        error: null,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_WORKFLOW_STATE);
  }, []);

  return {
    state,
    stage: state.stage,
    isLoading: state.isLoading,
    error: state.error,

    // 阶段 1
    generateTopics,
    regenerateTopics,
    selectTopic,

    // 模板
    setTemplateId,

    // 阶段 2
    generateScript,
    updateScript,

    // Markdown 模式
    generateFromMarkdown,

    // 配音设置
    setVoiceId,
    setVoiceSpeed,

    // 阶段 3
    confirmAndGenerate,

    // 导航
    goBack,
    reset,
  };
}
