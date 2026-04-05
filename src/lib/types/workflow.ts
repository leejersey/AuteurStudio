// ─── 工作流类型定义 ───
// 四阶段审核式视频生成管线 + Markdown 模式

import type { MarkdownSlide, CodeTheme } from "./markdown-video";

/** 工作流阶段 */
export type WorkflowStage = "idle" | "topics" | "script" | "video" | "done";

/** 单个选题建议 */
export interface TopicSuggestion {
  id: string;
  title: string;
  angle: string;             // 独特切入角度
  targetAudience: string;    // 目标受众
  hookLine: string;          // 开篇 hook（吸引力句子）
  keyPoints: string[];       // 3~5 个关键信息点
  estimatedDuration: string; // 如 "45秒"
  tags: string[];
}

/** 脚本中的单页内容 */
export interface ScriptSlide {
  pageIndex: number;
  heading: string;           // 页面标题
  bodyText: string;          // 正文内容
  narration: string;         // 旁白文本
  visualNote?: string;       // 视觉提示（给设计参考的备注）
}

/** 完整视频脚本 */
export interface VideoScript {
  title: string;
  subtitle?: string;
  slides: ScriptSlide[];
  style: string;              // 视觉风格建议
  totalEstimatedDuration: number; // 秒
  endingCTA: string;          // 结尾 Call-to-Action
  tags: string[];
}

/** 工作流完整状态 */
export interface WorkflowState {
  stage: WorkflowStage;
  userIntent: string;
  videoType: "card" | "landscape" | "markdown";
  templateId: string; // 用户选择的模板 ID

  // 阶段 1: 选题
  topics: TopicSuggestion[];
  selectedTopic: TopicSuggestion | null;
  topicNotes: string;           // 用户对选题的补充说明

  // 阶段 2: 文案
  script: VideoScript | null;
  editedScript: VideoScript | null; // 用户编辑后的版本

  // 阶段 3: 视频
  videoData: unknown;
  projectId: string | null;

  // Markdown 模式专用
  markdownContent: string;
  markdownSlides: MarkdownSlide[];
  codeTheme: CodeTheme;

  // 通用
  isLoading: boolean;
  error: string | null;
  history: WorkflowStage[];     // 用于回退
}

/** 初始状态 */
export const INITIAL_WORKFLOW_STATE: WorkflowState = {
  stage: "idle",
  userIntent: "",
  videoType: "card",
  templateId: "dark-tech",
  topics: [],
  selectedTopic: null,
  topicNotes: "",
  script: null,
  editedScript: null,
  videoData: null,
  projectId: null,
  markdownContent: "",
  markdownSlides: [],
  codeTheme: "dracula",
  isLoading: false,
  error: null,
  history: [],
};
