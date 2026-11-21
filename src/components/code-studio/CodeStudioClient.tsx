"use client";

import { useCallback, useState } from "react";
import SideNavBar from "@/components/layout/SideNavBar";
import StagePlayer from "@/components/code-studio/StagePlayer";
import StepEditorDrawer from "@/components/code-studio/StepEditorDrawer";
import type { StageProjectSummary } from "@/lib/stage-projects";
import type { StudioSettings } from "@/lib/stage-settings";

type EngineMode = "code-stage" | "algo-stage";
type ShikiTheme = "dracula" | "tokyo-night" | "github-dark" | "catppuccin-mocha" | "one-dark-pro";
type StructureHint = "array" | "linked-list" | "tree" | "matrix" | "stack-queue";

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

  const [mode, setMode] = useState<EngineMode>(resolvedMode);
  const [topic, setTopic] = useState("");
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
      const endpoint = mode === "code-stage" ? "/api/code-stage/generate" : "/api/algo-stage/generate";
      const refCode = referenceCode.trim() || undefined;
      const payload =
        mode === "code-stage"
          ? { topic: resolvedTopic, language, shikiTheme, maxRounds, withTts, speaker: defaultSpeaker, referenceCode: refCode }
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
      setTrace(data.trace ?? []);
      await loadProjects(data.slug);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Agent Loop 执行异常");
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

          {/* 引擎切换 */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-container-low border border-white/5">
            <button
              type="button"
              onClick={() => setMode("code-stage")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
                mode === "code-stage"
                  ? "bg-primary/15 text-primary border border-primary/40"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              CodeStage · 语法演进
            </button>
            <button
              type="button"
              onClick={() => setMode("algo-stage")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
                mode === "algo-stage"
                  ? "bg-secondary/20 text-secondary border border-secondary/40"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              AlgoStage · 沙箱动画
            </button>
          </div>

          {/* 输入表单 */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-on-surface-variant">
              {mode === "code-stage" ? "编程语法 / 重构主题" : "算法 / 数据结构题目"}
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                mode === "code-stage"
                  ? "例如：Python 装饰器从重复代码到 @timer 语法糖"
                  : "例如：滑动窗口求最长无重复子串"
              }
              className="w-full rounded-xl bg-surface-container-low border border-white/10 px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 resize-none"
            />

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
                    rows={6}
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    placeholder="把你的业务源码、Git 片段或 LeetCode 题解贴在这里，Agent 会自动拆解成逐步演进的教学视频..."
                    className="w-full rounded-lg bg-surface-container border border-white/10 px-2.5 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 resize-y leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* 快捷预设 */}
            <div className="flex flex-wrap gap-1.5">
              {mode === "code-stage"
                ? CODE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setTopic(p.topic);
                        setLanguage(p.lang);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-primary/15 hover:text-primary text-on-surface-variant transition"
                    >
                      {p.label}
                    </button>
                  ))
                : ALGO_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setTopic(p.topic);
                        setStructureHint(p.structure);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-secondary/20 hover:text-secondary text-on-surface-variant transition"
                    >
                      {p.label}
                    </button>
                  ))}
            </div>

            {/* 参数选择 */}
            <div className="grid grid-cols-2 gap-2.5 mt-1">
              {mode === "code-stage" ? (
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
              ) : (
                <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
                  数据结构视图
                  <select
                    value={structureHint}
                    onChange={(e) => setStructureHint(e.target.value as StructureHint)}
                    className="rounded-lg bg-surface-container-low border border-white/10 px-2.5 py-2 text-xs text-on-surface"
                  >
                    <option value="array">数组 / 柱状图 / 双指针</option>
                    <option value="linked-list">链表 / 指针反转</option>
                    <option value="tree">二叉树 / DFS / BFS</option>
                    <option value="matrix">二维矩阵 / DP 表格</option>
                    <option value="stack-queue">栈 / 队列 / 调用栈</option>
                  </select>
                </label>
              )}

              <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
                Shiki 代码配色
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

            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Agent 最大自修复轮数</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMaxRounds(r)}
                    className={`w-7 h-7 rounded-lg font-mono text-xs ${
                      maxRounds === r
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-white/5 text-on-surface-variant"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
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
              className="mt-1 w-full py-2.5 rounded-xl primary-gradient text-on-primary-fixed font-bold text-sm hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">
                {isGenerating ? "progress_activity" : "auto_awesome"}
              </span>
              {isGenerating ? "Agent Loop 生成与校验中..." : "启动 Agent Loop 生成视频"}
            </button>

            {errorMsg && (
              <div className="rounded-xl bg-error/10 border border-error/30 px-3 py-2 text-xs text-error leading-relaxed">
                {errorMsg}
              </div>
            )}
          </div>

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
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          {p.engine === "algo-stage" ? "ALGO" : "CODE"}
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
                onClick={() => setShowEditor((v) => !v)}
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
