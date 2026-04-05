"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import TopNavBar from "@/components/layout/TopNavBar";
import ChatPanel from "@/components/ChatPanel";
import VideoPreview from "@/components/VideoPreview";
import ControlPanel from "@/components/ControlPanel";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useVideoData } from "@/hooks/useVideoData";
import { useRenderTask } from "@/hooks/useRenderTask";

function StudioContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const workflow = useWorkflow();
  const { videoData, videoType, totalFrames, updateVideoData } = useVideoData();
  const { startRender } = useRenderTask();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  // 从 URL 加载已有项目
  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      setIsLoadingProject(true);
      fetch(`/api/projects/${projectId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.project) {
            updateVideoData(data.project.videoData, data.project.videoType);
            setCurrentProjectId(projectId);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingProject(false));
    }
  }, [projectId, currentProjectId, updateVideoData]);

  // 工作流完成 → 更新视频预览
  useEffect(() => {
    if (workflow.stage === "done" && workflow.state.videoData) {
      const vType =
        workflow.state.videoType === "markdown"
          ? "markdown"
          : workflow.state.videoType === "landscape"
          ? "knowledge"
          : "card";
      updateVideoData(workflow.state.videoData, vType);
      if (workflow.state.projectId) {
        setCurrentProjectId(workflow.state.projectId);
      }
    }
  }, [workflow.stage, workflow.state.videoData, workflow.state.videoType, workflow.state.projectId, updateVideoData]);

  const handleExport = async () => {
    if (!videoData) return;
    const title =
      workflow.state.editedScript?.title ||
      workflow.state.script?.title ||
      "未命名视频";
    await startRender(title, videoData, videoType, currentProjectId || undefined);
  };

  const displayTitle =
    workflow.state.editedScript?.title ||
    workflow.state.script?.title ||
    (videoData && typeof videoData === "object" && videoData !== null && "meta" in videoData
      ? ((videoData as unknown as { meta: { title: string } }).meta.title)
      : "未命名视频");

  return (
    <>
      <TopNavBar title={displayTitle} />
      <main className="flex-1 flex overflow-hidden">
        <ChatPanel
          stage={workflow.stage}
          isLoading={workflow.isLoading}
          error={workflow.error}
          topics={workflow.state.topics}
          selectedTopic={workflow.state.selectedTopic}
          videoType={workflow.state.videoType}
          script={workflow.state.editedScript || workflow.state.script}
          onGenerateTopics={workflow.generateTopics}
          onSelectTopic={workflow.selectTopic}
          onRegenerateTopics={workflow.regenerateTopics}
          onGenerateScript={workflow.generateScript}
          onUpdateScript={workflow.updateScript}
          onConfirmAndGenerate={workflow.confirmAndGenerate}
          onGoBack={workflow.goBack}
          onReset={workflow.reset}
          onGenerateFromMarkdown={workflow.generateFromMarkdown}
          templateId={workflow.state.templateId}
          onTemplateChange={workflow.setTemplateId}
        />
        <section className="flex-1 flex bg-background relative">
          {isLoadingProject ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl animate-spin">
                sync
              </span>
              <span className="ml-3 text-on-surface-variant">
                加载项目中...
              </span>
            </div>
          ) : (
            <VideoPreview
              videoData={videoData}
              videoType={videoType}
              totalFrames={totalFrames}
            />
          )}
          <ControlPanel onExport={handleExport} hasVideoData={!!videoData} />
        </section>
      </main>

      {/* Timeline */}
      <div className="h-1 w-full bg-surface-container-lowest relative z-50">
        <div className="absolute top-0 left-0 h-full w-[25%] bg-primary/20"></div>
        <div className="absolute top-0 left-[25%] h-full w-[40%] bg-secondary/20"></div>
        <div className="absolute top-0 left-[65%] h-full w-[10%] bg-tertiary/20"></div>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-background">
          <span className="material-symbols-outlined text-primary text-3xl animate-spin">
            sync
          </span>
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}
