// src/lib/project-store.ts — 项目持久化存储服务
// 使用 JSON 文件存储，适用于 MVP 阶段

import fs from "fs/promises";
import path from "path";

// ─── 项目类型定义 ───

export interface VideoProject {
  id: string;
  title: string;
  description: string;
  videoType: "card" | "algo" | "knowledge" | "markdown";
  videoData: unknown;
  createdAt: string; // ISO 8601
  updatedAt: string;
  duration: number; // 秒
  aspectRatio: "9:16" | "16:9";
  tags: string[];
  thumbnail?: string; // 渐变色 CSS 或 base64
  renderStatus?: "idle" | "rendering" | "completed" | "failed";
  renderOutputPath?: string;
  renderProgress?: number;
}

export interface ProjectStats {
  totalProjects: number;
  cardCount: number;
  algoCount: number;
  knowledgeCount: number;
  markdownCount: number;
  totalRenderTimeMs: number;
  totalStorageBytes: number;
}

// ─── 存储路径配置 ───

const DATA_DIR = path.resolve(process.cwd(), ".data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

// ─── 持久化读写辅助 ───

async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readProjects(): Promise<VideoProject[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(PROJECTS_FILE, "utf-8");
    return JSON.parse(raw) as VideoProject[];
  } catch {
    // 文件不存在时返回空数组
    return [];
  }
}

async function writeProjects(projects: VideoProject[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

// ─── CRUD 操作 ───

/** 获取所有项目（按创建时间倒序） */
export async function listProjects(filter?: {
  type?: "card" | "algo" | "knowledge" | "markdown";
  search?: string;
}): Promise<VideoProject[]> {
  let projects = await readProjects();

  // 按类型筛选
  if (filter?.type) {
    projects = projects.filter((p) => p.videoType === filter.type);
  }

  // 按搜索关键字筛选（标题 + 标签）
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    projects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // 按创建时间倒序
  projects.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return projects;
}

/** 获取单个项目 */
export async function getProject(
  id: string
): Promise<VideoProject | undefined> {
  const projects = await readProjects();
  return projects.find((p) => p.id === id);
}

/** 保存项目（新增或更新） */
export async function saveProject(
  project: VideoProject
): Promise<VideoProject> {
  const projects = await readProjects();
  const existingIndex = projects.findIndex((p) => p.id === project.id);

  if (existingIndex !== -1) {
    // 更新
    projects[existingIndex] = { ...projects[existingIndex], ...project, updatedAt: new Date().toISOString() };
  } else {
    // 新增
    projects.push(project);
  }

  await writeProjects(projects);
  return project;
}

/** 删除项目 */
export async function deleteProject(id: string): Promise<boolean> {
  const projects = await readProjects();
  const filtered = projects.filter((p) => p.id !== id);

  if (filtered.length === projects.length) {
    return false; // 不存在
  }

  await writeProjects(filtered);
  return true;
}

/** 获取统计数据 */
export async function getProjectStats(): Promise<ProjectStats> {
  const projects = await readProjects();

  return {
    totalProjects: projects.length,
    cardCount: projects.filter((p) => p.videoType === "card").length,
    algoCount: projects.filter((p) => p.videoType === "algo").length,
    knowledgeCount: projects.filter((p) => p.videoType === "knowledge").length,
    markdownCount: projects.filter((p) => p.videoType === "markdown").length,
    totalRenderTimeMs: 0, // 暂未追踪
    totalStorageBytes: 0, // 暂未追踪
  };
}

// ─── 辅助函数：从视频数据创建项目 ───

export function createProjectFromVideoData(
  videoData: Record<string, unknown>,
  videoType: "card" | "algo" | "knowledge" | "markdown",
  userMessage: string
): VideoProject {
  const now = new Date().toISOString();
  const meta = (videoData.meta || {}) as Record<string, unknown>;
  const title = (meta.title as string) || "未命名视频";

  // 估算视频时长
  let duration = 15; // fallback
  if (videoType === "card" && Array.isArray(videoData.slides)) {
    duration = videoData.slides.length * 4; // 每页 4 秒
  } else if (videoType === "algo" && Array.isArray(videoData.steps)) {
    duration = videoData.steps.length * 5; // 每步约 5 秒
  } else if (videoType === "knowledge" && Array.isArray(videoData.slides)) {
    duration = videoData.slides.length * 6; // 每页 6 秒
  } else if (videoType === "markdown" && Array.isArray(videoData.slides)) {
    duration = videoData.slides.length * 5; // 每页 5 秒
  }

  // 生成渐变色缩略图 CSS
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    "linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)",
  ];
  const thumbnail = gradients[Math.floor(Math.random() * gradients.length)];

  // 提取标签
  const tags: string[] = [];
  if (meta.category) tags.push(meta.category as string);
  if (meta.algorithm) tags.push(meta.algorithm as string);
  if (meta.difficulty) tags.push(meta.difficulty as string);

  return {
    id: crypto.randomUUID(),
    title,
    description: userMessage.slice(0, 200),
    videoType,
    videoData,
    createdAt: now,
    updatedAt: now,
    duration,
    aspectRatio: videoType === "card" ? "9:16" : "16:9",
    tags,
    thumbnail,
    renderStatus: "idle",
  };
}
