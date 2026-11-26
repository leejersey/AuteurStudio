"use client";

import { useCallback, useState } from "react";
import SideNavBar from "@/components/layout/SideNavBar";
import StagePlayer from "@/components/code-studio/StagePlayer";
import StepEditorDrawer from "@/components/code-studio/StepEditorDrawer";
import PackagingPanel from "@/components/code-studio/PackagingPanel";
import type { StageProjectSummary } from "@/lib/stage-projects";
import type { StudioSettings } from "@/lib/stage-settings";
import { STAGE_TEMPLATES, type TemplateId } from "@/lib/stage-template-catalog";

type CreationTrack = "ai" | "preset" | "diff";
type EngineMode = "code-stage" | "algo-stage" | "arch-stage";
type ShikiTheme = "dracula" | "tokyo-night" | "github-dark" | "catppuccin-mocha" | "one-dark-pro";
type StructureHint = "array" | "linked-list" | "tree" | "matrix" | "stack-queue";

interface AiTemplateOption {
  id: string;
  label: string;
  badge: string;
  engine: EngineMode;
  structureHint?: StructureHint;
  targetSteps?: number;
}

const AI_TEMPLATE_OPTIONS: AiTemplateOption[] = [
  { id: "ai-code-evolve", label: "语法逐步演进", badge: "CODE", engine: "code-stage", targetSteps: 4 },
  { id: "ai-code-diff", label: "重构 / Bug 对比", badge: "CODE", engine: "code-stage", targetSteps: 3 },
  { id: "ai-arch-flow", label: "系统架构 / 原理流动", badge: "ARCH", engine: "arch-stage", targetSteps: 4 },
  { id: "ai-algo-array", label: "数组 / 双指针 / 排序", badge: "ARRAY", engine: "algo-stage", structureHint: "array" },
  { id: "ai-algo-list", label: "链表指针动画", badge: "LIST", engine: "algo-stage", structureHint: "linked-list" },
  { id: "ai-algo-tree", label: "二叉树 DFS / BFS", badge: "TREE", engine: "algo-stage", structureHint: "tree" },
  { id: "ai-algo-dp", label: "DP 矩阵填表", badge: "MATRIX", engine: "algo-stage", structureHint: "matrix" },
  { id: "ai-algo-sq", label: "栈 / 队列 / 调用栈", badge: "STACK", engine: "algo-stage", structureHint: "stack-queue" },
];

interface TraceRound {
  round: number;
  phase: string;
  status: "passed" | "failed";
  frameCount?: number;
  durationMs: number;
  issues: Array<{ gate: string; message: string }>;
}

const CODE_PRESETS = [
  { label: "TypeScript 泛型入门", topic: "TypeScript 泛型：从重复函数到可复用 <T>", lang: "typescript" },
  { label: "Python 装饰器", topic: "Python 装饰器：从重复计时代码到 @timer 与 @wraps", lang: "python" },
  { label: "Rust 所有权与借用", topic: "Rust 所有权、Move 语义与不可变/可变借用", lang: "rust" },
];

const ALGO_PRESETS: Array<{ label: string; topic: string; structure: StructureHint }> = [
  { label: "滑动窗口无重复子串", topic: "滑动窗口求最长无重复子串", structure: "array" },
  { label: "快速排序分区", topic: "快速排序 Lomuto 分区与交换演示", structure: "array" },
  { label: "快慢指针找链表中点", topic: "快慢指针寻找单链表中间节点", structure: "linked-list" },
  { label: "二叉树前序遍历", topic: "二叉树前序遍历 DFS 过程", structure: "tree" },
  { label: "DP 网格路径数", topic: "动态规划不同路径 DP 填表过程", structure: "matrix" },
  { label: "单调栈每日温度", topic: "单调栈求解每日温度问题", structure: "stack-queue" },
];

export default function CodeStudioClient({
  initialProjects,
  initialSettings,
  initialSlug,
  initialTheme,
  initialMode,
}: {
  initialProjects: StageProjectSummary[];
  initialSettings: StudioSettings;
  initialSlug?: string;
  initialTheme?: string;
  initialMode?: string;
}) {
  const validThemes: ShikiTheme[] = ["dracula", "tokyo-night", "github-dark", "catppuccin-mocha", "one-dark-pro"];
  const resolvedTheme: ShikiTheme = validThemes.includes(initialTheme as ShikiTheme)
    ? (initialTheme as ShikiTheme)
    : initialSettings.defaultTheme;
  const resolvedMode: EngineMode =
    initialMode === "algo-stage" || initialMode === "code-stage"
      ? initialMode
      : initialSettings.defaultEngine;
  const resolvedProject =
    (initialSlug ? initialProjects.find((p) => p.slug === initialSlug) : undefined) ?? initialProjects[0] ?? null;

  const [creationTrack, setCreationTrack] = useState<CreationTrack>("ai");
  const [aiTemplateId, setAiTemplateId] = useState<string>(
    resolvedMode === "algo-stage" ? "ai-algo-array" : "ai-code-evolve",
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>("algo-bubble-sort");
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({
    nums: "9, 4, 7, 2, 5",
  });
  const [enableTplPackaging, setEnableTplPackaging] = useState(true);

  const [mode, setMode] = useState<EngineMode>(resolvedMode);
  const [targetSteps, setTargetSteps] = useState<number | undefined>(4);
  const [topic, setTopic] = useState("");
  const [diffInput, setDiffInput] = useState("");
  const [prUrlInput, setPrUrlInput] = useState("");
  const [diffTitle, setDiffTitle] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [showRefCode, setShowRefCode] = useState(false);
  const [language, setLanguage] = useState("typescript");
  const [structureHint, setStructureHint] = useState<StructureHint>("array");
  const [shikiTheme, setShikiTheme] = useState<ShikiTheme>(resolvedTheme);
  const [maxRounds, setMaxRounds] = useState(initialSettings.defaultMaxRounds);
  const [withTts, setWithTts] = useState(initialSettings.defaultWithTts);
  const defaultSpeaker = initialSettings.defaultSpeaker;

  const [projects, setProjects] = useState<StageProjectSummary[]>(initialProjects);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [activeProject, setActiveProject] = useState<StageProjectSummary | null>(resolvedProject);
  const [reloadKey, setReloadKey] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSynthesizingTts, setIsSynthesizingTts] = useState(false);
  const [isSwitchingRatio, setIsSwitchingRatio] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPackaging, setShowPackaging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trace, setTrace] = useState<TraceRound[]>([]);

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  const loadProjects = useCallback(async (selectSlug?: string) => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/stage-projects", { cache: "no-store" });
      const data = (await res.json()) as { projects?: StageProjectSummary[] };
      const list = data.projects ?? [];
      setProjects(list);
      if (selectSlug) {
        const matched = list.find((p) => p.slug === selectSlug);
        if (matched) setActiveProject(matched);
      } else if (list.length > 0) {
        setActiveProject((prev) => prev ?? list[0]);
      }
    } catch (err) {
      console.error("加载工程列表失败:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  const handleCodeFileUpload = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setReferenceCode(text);
    setShowRefCode(true);
    const ext = file.name.split(".").pop()?.toLowerCase();
    const extMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      py: "python",
      go: "go",
      rs: "rust",
      java: "java",
      cpp: "cpp",
      cc: "cpp",
      c: "cpp",
    };
    if (ext && extMap[ext]) setLanguage(extMap[ext]);
    if (!topic.trim()) setTopic(`拆解讲解 ${file.name} 核心代码`);
  };

  const activeTemplate = STAGE_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? STAGE_TEMPLATES[0];

  const handleSelectTemplate = (tplId: TemplateId) => {
    setSelectedTemplateId(tplId);
    const tpl = STAGE_TEMPLATES.find((t) => t.id === tplId);
    if (tpl) {
      setTemplateParams(Object.fromEntries(tpl.fields.map((f) => [f.key, f.defaultValue])));
    }
  };

  const handleCreateFromTemplate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setRenderedUrl(null);
    setTrace([]);
    try {
      const res = await fetch("/api/stage-template/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          params: templateParams,
          shikiTheme,
          withTts,
          speaker: defaultSpeaker,
          enablePackaging: enableTplPackaging,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "模板生成失败");
      await loadProjects(data.slug);
      setReloadKey((k) => k + 1);
      // 若为免 AI 代码样板，自动展开右侧步骤编辑器方便直接替换代码
      if (data.engine === "code-stage") {
        setShowEditor(true);
        setShowPackaging(false);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "模板生成异常");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    const resolvedTopic = topic.trim() || (referenceCode.trim() ? "拆解并逐步讲解以下核心代码" : "");
    if (!resolvedTopic) {
      setErrorMsg("请先输入主题，或粘贴一段自有代码");
      return;
    }
    setIsGenerating(true);
    setErrorMsg(null);
    setRenderedUrl(null);
    setTrace([]);

    try {
      const endpoint =
        mode === "code-stage"
          ? "/api/code-stage/generate"
          : mode === "arch-stage"
            ? "/api/arch-stage/generate"
            : "/api/algo-stage/generate";
      const refCode = referenceCode.trim() || undefined;
      const payload =
        mode === "code-stage"
          ? { topic: resolvedTopic, language, shikiTheme, targetSteps, maxRounds, withTts, speaker: defaultSpeaker, referenceCode: refCode }
          : mode === "arch-stage"
            ? { topic: resolvedTopic, theme: shikiTheme, targetSteps, maxRounds, withTts, speaker: defaultSpeaker, referenceNotes: refCode }
            : { topic: resolvedTopic, structureHint, shikiTheme, maxRounds, withTts, speaker: defaultSpeaker, referenceCode: refCode };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "生成失败");
      }
      setTrace(data.trace ?? data.rounds ?? []);
      await loadProjects(data.slug);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Agent Loop 执行异常");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateFromDiff = async () => {
    if (!diffInput.trim() && !prUrlInput.trim()) {
      setErrorMsg("请粘贴 git diff 文本，或输入公开的 GitHub PR 链接");
      return;
    }
    setIsGenerating(true);
    setErrorMsg(null);
    setRenderedUrl(null);
    setTrace([]);
    try {
      const res = await fetch("/api/code-stage/from-diff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diffText: diffInput.trim() || undefined,
          prUrl: prUrlInput.trim() || undefined,
          title: diffTitle.trim() || undefined,
          theme: shikiTheme,
          enablePackaging: enableTplPackaging,
          withTts,
          speaker: defaultSpeaker,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Git Diff 转视频失败");
      await loadProjects(data.slug);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Git Diff 转视频失败");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSynthesizeTts = async () => {
    if (!activeProject) return;
    setIsSynthesizingTts(true);
    setErrorMsg(null);
    setRenderedUrl(null);
    try {
      const res = await fetch("/api/stage-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: activeProject.slug, speaker: defaultSpeaker }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "语音合成失败");
      await loadProjects(activeProject.slug);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "语音合成失败");
    } finally {
      setIsSynthesizingTts(false);
    }
  };

  const handleToggleAspectRatio = async () => {
    if (!activeProject) return;
    setIsSwitchingRatio(true);
    setErrorMsg(null);
    setRenderedUrl(null);
    try {
      const getRes = await fetch(`/api/stage-spec?slug=${encodeURIComponent(activeProject.slug)}`, { cache: "no-store" });
      const getData = await getRes.json();
      if (!getRes.ok || !getData.spec) throw new Error(getData.error || "读取工程失败");

      const isCurrentlyPortrait = activeProject.height > activeProject.width;
      const nextWidth = isCurrentlyPortrait ? 1920 : 1080;
      const nextHeight = isCurrentlyPortrait ? 1080 : 1920;
      const updatedSpec = {
        ...getData.spec,
        meta: {
          ...getData.spec.meta,
          width: nextWidth,
          height: nextHeight,
        },
      };

      const putRes = await fetch("/api/stage-spec", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: activeProject.slug, spec: updatedSpec }),
      });
      const putData = await putRes.json();
      if (!putRes.ok) throw new Error(putData.error || "切换画幅失败");

      await loadProjects(activeProject.slug);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "切换画幅失败");
    } finally {
      setIsSwitchingRatio(false);
    }
  };

  const handleRenderMp4 = async () => {
    if (!activeProject) return;
    setIsRendering(true);
    setRenderProgress(5);
    setErrorMsg(null);
    setRenderedUrl(null);
    try {
      const res = await fetch("/api/stage-render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: activeProject.slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.job?.id) throw new Error(data.error || "提交渲染任务失败");

      const jobId = String(data.job.id);
      // 轮询持久化异步渲染任务进度
      while (true) {
        await new Promise((r) => setTimeout(r, 1200));
        const pollRes = await fetch(`/api/stage-render?id=${encodeURIComponent(jobId)}`, { cache: "no-store" });
        const pollData = await pollRes.json();
        const job = pollData.job as { status: string; progress: number; outputUrl?: string; error?: string } | undefined;
        if (!job) throw new Error("渲染任务状态丢失");
        setRenderProgress(job.progress ?? 0);
        if (job.status === "completed" && job.outputUrl) {
          setRenderedUrl(job.outputUrl);
          break;
        }
        if (job.status === "failed") {
          throw new Error(job.error || "HyperFrames 渲染失败");
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "渲染导出失败");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-on-surface">
      <SideNavBar />

      <div className="flex-1 flex min-w-0 overflow-hidden z-10">
        {/* 左侧：引擎控制与 Agent Loop 面板 */}
        <section className="w-[410px] shrink-0 border-r border-white/5 bg-surface-container/60 backdrop-blur-xl flex flex-col overflow-y-auto p-5 gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">terminal</span>
              <h2 className="text-lg font-bold font-headline tracking-tight">代码与算法工坊</h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              HyperFrames 确定性渲染 + Agent Loop 自检修复
            </p>
          </div>

          {/* 三轨创建切换：AI 新建（默认） vs 免 AI 参数模板 vs Git Diff / PR */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-container-low border border-white/10">
            <button
              type="button"
              onClick={() => setCreationTrack("ai")}
              className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                creationTrack === "ai"
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              AI 新建
            </button>
            <button
              type="button"
              onClick={() => setCreationTrack("preset")}
              className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                creationTrack === "preset"
                  ? "bg-secondary/20 text-secondary border border-secondary/40"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-sm">bolt</span>
              免 AI 模板
            </button>
            <button
              type="button"
              onClick={() => setCreationTrack("diff")}
              className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                creationTrack === "diff"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-sm">difference</span>
              Diff / PR
            </button>
          </div>

          {creationTrack === "diff" ? (
            <div className="flex flex-col gap-3">
              <div className="text-[11px] text-on-surface-variant bg-surface-container-low/80 border border-white/5 rounded-lg px-3 py-2 leading-relaxed">
                0 Token 确定性拆解：贴入 <code className="text-primary">git diff</code> 或公开 GitHub PR 链接，1 秒生成「改动前 → Magic Move Diff → 验证」讲解视频。
              </div>
              <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
                GitHub PR 链接（可选，自动拉取 .diff）
                <input
                  type="url"
                  value={prUrlInput}
                  onChange={(e) => setPrUrlInput(e.target.value)}
                  placeholder="https://github.com/owner/repo/pull/123"
                  className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary/60"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
                或直接粘贴 git diff 文本
                <textarea
                  rows={6}
                  value={diffInput}
                  onChange={(e) => setDiffInput(e.target.value)}
                  placeholder={"diff --git a/src/app.ts b/src/app.ts\n@@ -1,4 +1,5 @@\n- const old = 1;\n+ const next = 2;"}
                  className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-2 text-[11px] font-mono text-on-surface focus:outline-none focus:border-primary/60 resize-y leading-relaxed"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
                视频标题（留空自动根据文件名生成）
                <input
                  type="text"
                  value={diffTitle}
                  onChange={(e) => setDiffTitle(e.target.value)}
                  placeholder="例如：Code Review：一次消除重复查询的重构"
                  className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/60"
                />
              </label>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleCreateFromDiff}
                className="w-full py-2.5 rounded-xl primary-gradient text-on-primary-fixed font-bold text-sm hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  {isGenerating ? "progress_activity" : "difference"}
                </span>
                {isGenerating ? "正在解析 Diff 并编译..." : "一键从 Diff / PR 生成视频"}
              </button>
              {errorMsg && (
                <div className="rounded-xl bg-error/10 border border-error/30 px-3 py-2 text-xs text-error leading-relaxed">
                  {errorMsg}
                </div>
              )}
            </div>
          ) : creationTrack === "preset" ? (
            <div className="flex flex-col gap-3">
              <div className="text-[11px] text-on-surface-variant bg-surface-container-low/80 border border-white/5 rounded-lg px-3 py-2">
                0 Token 免大模型：改下方参数 1 秒生成新算法动画，或新建代码样板后在右侧直接改写代码。
              </div>
              <div className="grid grid-cols-2 gap-2">
                {STAGE_TEMPLATES.map((tpl) => {
                  const active = tpl.id === selectedTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className={`text-left p-2.5 rounded-xl border transition ${
                        active
                          ? "bg-primary/15 border-primary/50 text-on-surface"
                          : "bg-surface-container-low/80 border-white/5 text-on-surface-variant hover:border-white/20"
                      }`}
                    >
                      <div className="text-[10px] font-mono text-primary font-bold">{tpl.badge}</div>
                      <div className="text-xs font-bold mt-0.5 truncate">{tpl.name}</div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {activeTemplate.description}
              </p>

              {/* 参数化输入框 */}
              <div className="flex flex-col gap-2">
                {activeTemplate.fields.map((field) => (
                  <label key={field.key} className="flex flex-col gap-1 text-xs text-on-surface-variant">
                    {field.label}
                    <input
                      type="text"
                      value={templateParams[field.key] ?? field.defaultValue}
                      onChange={(e) =>
                        setTemplateParams((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary/60"
                    />
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
                  舞台配色主题
                  <select
                    value={shikiTheme}
                    onChange={(e) => setShikiTheme(e.target.value as ShikiTheme)}
                    className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-2 text-xs text-on-surface"
                  >
                    <option value="dracula">Dracula</option>
                    <option value="tokyo-night">Tokyo Night</option>
                    <option value="github-dark">GitHub Dark</option>
                    <option value="catppuccin-mocha">Catppuccin Mocha</option>
                    <option value="one-dark-pro">One Dark Pro</option>
                  </select>
                </label>

                <label className="flex items-center justify-between rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-2 mt-5 cursor-pointer">
                  <span className="text-xs text-on-surface">片头/片尾+BGM</span>
                  <input
                    type="checkbox"
                    checked={enableTplPackaging}
                    onChange={(e) => setEnableTplPackaging(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </label>
              </div>

              <label className="flex items-center justify-between rounded-xl bg-surface-container-low border border-white/10 px-3 py-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">record_voice_over</span>
                  <div>
                    <div className="text-xs font-semibold text-on-surface">火山 V3 语音配音</div>
                    <div className="text-[10px] text-on-surface-variant">取消勾选可 1 秒纯视觉预览</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={withTts}
                  onChange={(e) => setWithTts(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
              </label>

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleCreateFromTemplate}
                className="w-full py-2.5 rounded-xl primary-gradient text-on-primary-fixed font-bold text-sm hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  {isGenerating ? "progress_activity" : "bolt"}
                </span>
                {isGenerating ? "正在编译模板..." : "秒级新建视频"}
              </button>

              {errorMsg && (
                <div className="rounded-xl bg-error/10 border border-error/30 px-3 py-2 text-xs text-error leading-relaxed">
                  {errorMsg}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Step 1: 先输入视频主题 */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface">
                  1. 输入视频主题
                </label>
                <textarea
                  rows={2}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="例如：Python 列表推导式、TypeScript 泛型、快速排序分区..."
                  className="w-full rounded-xl bg-surface-container-low border border-white/10 px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 resize-none"
                />
              </div>

              {/* Step 2: 选择要套用的视频模板 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-on-surface">2. 选择视频模板</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {AI_TEMPLATE_OPTIONS.map((opt) => {
                    const active = aiTemplateId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setAiTemplateId(opt.id);
                          setMode(opt.engine);
                          if (opt.structureHint) setStructureHint(opt.structureHint);
                          if (opt.targetSteps) setTargetSteps(opt.targetSteps);
                        }}
                        className={`text-left px-2.5 py-2 rounded-xl border transition ${
                          active
                            ? "bg-primary/15 border-primary/50 text-on-surface"
                            : "bg-surface-container-low/70 border-white/5 text-on-surface-variant hover:border-white/20"
                        }`}
                      >
                        <div className="text-[10px] font-mono text-primary font-bold">{opt.badge}</div>
                        <div className="text-xs font-semibold truncate">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 粘贴/上传自有代码（可选） */}
              <div className="rounded-xl bg-surface-container-low border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setShowRefCode((v) => !v)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition"
                  >
                    <span className="material-symbols-outlined text-base text-primary">
                      {showRefCode ? "expand_more" : "chevron_right"}
                    </span>
                    粘贴自有代码 / 题解（可选）
                    {referenceCode.trim() && (
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/15 text-primary font-mono text-[10px]">
                        {referenceCode.split("\n").length} 行
                      </span>
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    {referenceCode.trim() && (
                      <button
                        type="button"
                        onClick={() => setReferenceCode("")}
                        className="text-[11px] text-on-surface-variant hover:text-error transition"
                      >
                        清空
                      </button>
                    )}
                    <label className="text-[11px] text-primary hover:underline cursor-pointer">
                      上传文件
                      <input
                        type="file"
                        accept=".ts,.tsx,.js,.jsx,.py,.go,.rs,.java,.cpp,.cc,.c,.txt"
                        onChange={(e) => void handleCodeFileUpload(e.target.files?.[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                {showRefCode && (
                  <div className="px-3 pb-3">
                    <textarea
                      rows={5}
                      value={referenceCode}
                      onChange={(e) => setReferenceCode(e.target.value)}
                      placeholder="把你的业务源码或 LeetCode 题解贴在这里，AI 会围绕它拆解..."
                      className="w-full rounded-lg bg-surface-container border border-white/10 px-2.5 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 resize-y leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Step 3: 生成策略（模板快速 1 轮 vs Agent Loop 多轮自检） */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-on-surface">3. 生成策略</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMaxRounds(1)}
                    className={`px-2.5 py-2 rounded-xl border text-left transition ${
                      maxRounds === 1
                        ? "bg-primary/15 border-primary/50 text-on-surface"
                        : "bg-surface-container-low/70 border-white/5 text-on-surface-variant"
                    }`}
                  >
                    <div className="text-xs font-bold">模板快速生成</div>
                    <div className="text-[10px] opacity-75">单轮直出，速度快</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaxRounds(3)}
                    className={`px-2.5 py-2 rounded-xl border text-left transition ${
                      maxRounds > 1
                        ? "bg-primary/15 border-primary/50 text-on-surface"
                        : "bg-surface-container-low/70 border-white/5 text-on-surface-variant"
                    }`}
                  >
                    <div className="text-xs font-bold">Agent Loop 自检</div>
                    <div className="text-[10px] opacity-75">沙箱+lint 自动修复</div>
                  </button>
                </div>
              </div>

              {/* 语言 / 配色 */}
              <div className="grid grid-cols-2 gap-2">
                {mode === "code-stage" && (
                  <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
                    编程语言
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-2 text-xs text-on-surface"
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </label>
                )}

                <label className={`flex flex-col gap-1 text-xs text-on-surface-variant ${mode === "algo-stage" ? "col-span-2" : ""}`}>
                  舞台配色主题
                  <select
                    value={shikiTheme}
                    onChange={(e) => setShikiTheme(e.target.value as ShikiTheme)}
                    className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-2 text-xs text-on-surface"
                  >
                    <option value="dracula">Dracula</option>
                    <option value="tokyo-night">Tokyo Night</option>
                    <option value="github-dark">GitHub Dark</option>
                    <option value="catppuccin-mocha">Catppuccin Mocha</option>
                    <option value="one-dark-pro">One Dark Pro</option>
                  </select>
                </label>
              </div>

              <label className="flex items-center justify-between rounded-xl bg-surface-container-low border border-white/10 px-3 py-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">record_voice_over</span>
                  <div>
                    <div className="text-xs font-semibold text-on-surface">火山 V3 语音配音</div>
                    <div className="text-[10px] text-on-surface-variant">真实配音 + 字级同步字幕</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={withTts}
                  onChange={(e) => setWithTts(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
              </label>

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="w-full py-2.5 rounded-xl primary-gradient text-on-primary-fixed font-bold text-sm hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  {isGenerating ? "progress_activity" : "auto_awesome"}
                </span>
                {isGenerating ? "正在新建并生成视频..." : "新建并生成视频"}
              </button>

              {errorMsg && (
                <div className="rounded-xl bg-error/10 border border-error/30 px-3 py-2 text-xs text-error leading-relaxed">
                  {errorMsg}
                </div>
              )}
            </div>
          )}

          {/* Agent Loop 诊断日志 */}
          {trace.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Agent Loop 执行轨迹
              </h3>
              <div className="flex flex-col gap-2">
                {trace.map((t) => (
                  <div
                    key={t.round}
                    className={`rounded-xl border px-3 py-2 text-xs ${
                      t.status === "passed"
                        ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-200"
                        : "bg-amber-500/10 border-amber-400/30 text-amber-200"
                    }`}
                  >
                    <div className="flex justify-between font-mono">
                      <span>
                        Round {t.round} · {t.phase}
                      </span>
                      <span>
                        {t.status === "passed" ? "PASS" : "REPAIR"} ({(t.durationMs / 1000).toFixed(1)}s)
                      </span>
                    </div>
                    {t.issues.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-[11px] opacity-90">
                        {t.issues.map((iss, i) => (
                          <li key={i}>
                            [{iss.gate}] {iss.message.slice(0, 100)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 已有样片与生成工程列表 */}
          <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                样片与已生成工程 ({projects.length})
              </h3>
              <button
                type="button"
                onClick={() => void loadProjects()}
                className="text-[11px] text-primary/80 hover:text-primary transition"
              >
                {isLoadingProjects ? "刷新中..." : "刷新"}
              </button>
            </div>
            {projects.length === 0 ? (
              <div className="text-xs text-on-surface-variant/70 py-2">暂无已构建样片</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {projects.map((p) => {
                  const selected = activeProject?.slug === p.slug;
                  return (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => {
                        setActiveProject(p);
                        setRenderedUrl(null);
                      }}
                      className={`text-left px-3 py-2.5 rounded-xl border transition ${
                        selected
                          ? "bg-primary/10 border-primary/40 text-on-surface"
                          : "bg-surface-container-low/70 border-white/5 text-on-surface-variant hover:border-white/15 hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold truncate">{p.title}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                            p.engine === "algo-stage"
                              ? "bg-secondary/20 text-secondary"
                              : p.engine === "arch-stage"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-primary/15 text-primary"
                          }`}
                        >
                          {p.engine === "algo-stage" ? "ALGO" : p.engine === "arch-stage" ? "ARCH" : "CODE"}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono opacity-65 mt-0.5 flex items-center gap-2">
                        <span>
                          {p.itemCount} 步 · {p.duration}s
                        </span>
                        {p.hasAudio && <span className="text-emerald-400">· 有声</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 右侧：16:9 交互式预览舞台 */}
        <main className="flex-1 flex flex-col min-w-0 p-6 gap-4 overflow-y-auto">
          <header className="flex items-center justify-between gap-4 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold font-headline truncate">
                  {activeProject ? activeProject.title : "请选择左侧样片或生成新视频"}
                </h1>
                {activeProject?.subtitle && (
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-mono text-primary shrink-0">
                    {activeProject.subtitle}
                  </span>
                )}
              </div>
              {activeProject && (
                <p className="text-xs font-mono text-on-surface-variant mt-0.5">
                  hyperframes/{activeProject.slug} · {activeProject.width}×{activeProject.height} · 30fps · {activeProject.duration}s
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                disabled={!activeProject || isSwitchingRatio}
                onClick={handleToggleAspectRatio}
                className="px-3 py-2 rounded-xl bg-surface-container-high border border-white/15 hover:border-primary/50 text-on-surface text-xs font-mono font-bold disabled:opacity-40 transition flex items-center gap-1.5"
                title="一键切换 16:9 横屏与 9:16 竖屏短视频布局"
              >
                <span className="material-symbols-outlined text-base text-secondary">
                  {activeProject && activeProject.height > activeProject.width ? "stay_current_portrait" : "crop_landscape"}
                </span>
                {isSwitchingRatio
                  ? "切换中..."
                  : activeProject && activeProject.height > activeProject.width
                    ? "9:16 竖屏"
                    : "16:9 横屏"}
              </button>
              <button
                type="button"
                disabled={!activeProject}
                onClick={() => {
                  setShowPackaging((v) => !v);
                  setShowEditor(false);
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-bold disabled:opacity-40 transition flex items-center gap-1.5 ${
                  showPackaging
                    ? "bg-primary/15 border-primary/50 text-primary"
                    : "bg-surface-container-high border-white/15 text-on-surface hover:border-primary/40"
                }`}
              >
                <span className="material-symbols-outlined text-base">music_note</span>
                片头 / BGM
              </button>
              <button
                type="button"
                disabled={!activeProject}
                onClick={() => {
                  setShowEditor((v) => !v);
                  setShowPackaging(false);
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-bold disabled:opacity-40 transition flex items-center gap-1.5 ${
                  showEditor
                    ? "bg-primary/15 border-primary/50 text-primary"
                    : "bg-surface-container-high border-white/15 text-on-surface hover:border-primary/40"
                }`}
              >
                <span className="material-symbols-outlined text-base">tune</span>
                微调步骤
              </button>
              <button
                type="button"
                disabled={!activeProject || isSynthesizingTts}
                onClick={handleSynthesizeTts}
                className="px-4 py-2 rounded-xl bg-surface-container-high border border-white/15 hover:border-primary/50 text-on-surface text-xs font-bold disabled:opacity-40 transition flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base text-primary">
                  {isSynthesizingTts ? "progress_activity" : "record_voice_over"}
                </span>
                {isSynthesizingTts
                  ? "正在合成配音..."
                  : activeProject?.hasAudio
                    ? "重新配音"
                    : "一键合成配音"}
              </button>
              {renderedUrl && (
                <a
                  href={renderedUrl}
                  download
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold hover:bg-emerald-500/30 transition flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  下载 MP4
                </a>
              )}
              <button
                type="button"
                disabled={!activeProject || isRendering}
                onClick={handleRenderMp4}
                className="px-5 py-2 rounded-xl primary-gradient text-on-primary-fixed text-xs font-black tracking-wider hover:opacity-90 disabled:opacity-40 transition flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">movie</span>
                {isRendering ? `渲染中 ${renderProgress}%...` : "导出高清 MP4"}
              </button>
            </div>
          </header>

          {activeProject ? (
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              <StagePlayer
                previewUrl={activeProject.previewUrl}
                duration={activeProject.duration}
                width={activeProject.width}
                height={activeProject.height}
                hasAudio={activeProject.hasAudio}
                reloadKey={reloadKey}
                timelineItems={activeProject.timelineItems}
              />
              {showPackaging && (
                <PackagingPanel
                  slug={activeProject.slug}
                  onApplied={async () => {
                    await loadProjects(activeProject.slug);
                    setReloadKey((k) => k + 1);
                  }}
                />
              )}
              {showEditor && (
                <StepEditorDrawer
                  slug={activeProject.slug}
                  onCompiled={async () => {
                    await loadProjects(activeProject.slug);
                    setReloadKey((k) => k + 1);
                  }}
                />
              )}
            </div>
          ) : (
            <div className="flex-1 rounded-2xl border border-dashed border-white/15 flex flex-col items-center justify-center text-on-surface-variant gap-2">
              <span className="material-symbols-outlined text-4xl opacity-40">code_blocks</span>
              <p className="text-sm">点击左侧内置样片立即预览，或输入主题启动 Agent Loop 生成</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
