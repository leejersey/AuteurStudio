// src/lib/project-store.ts — 项目持久化存储服务
// 使用 PostgreSQL + Drizzle ORM

import { db } from "./db";
import { videoProjects } from "./db/schema";
import { eq, desc, ilike, or, sql } from "drizzle-orm";

// ─── 项目类型定义（保持与旧接口兼容）───

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

// ─── DB 行 → VideoProject 转换 ───

function toVideoProject(row: typeof videoProjects.$inferSelect): VideoProject {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    videoType: row.videoType as VideoProject["videoType"],
    videoData: row.videoData,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    duration: row.duration,
    aspectRatio: row.aspectRatio as VideoProject["aspectRatio"],
    tags: row.tags ?? [],
    thumbnail: row.thumbnail ?? undefined,
    renderStatus: (row.renderStatus as VideoProject["renderStatus"]) ?? undefined,
    renderOutputPath: row.renderOutputPath ?? undefined,
    renderProgress: row.renderProgress ?? undefined,
  };
}

// ─── CRUD 操作 ───

/** 获取所有项目（按创建时间倒序） */
export async function listProjects(filter?: {
  type?: "card" | "algo" | "knowledge" | "markdown";
  search?: string;
}): Promise<VideoProject[]> {
  const conditions = [];

  // 按类型筛选
  if (filter?.type) {
    conditions.push(eq(videoProjects.videoType, filter.type));
  }

  // 按搜索关键字筛选（标题 + 描述）
  if (filter?.search) {
    const pattern = `%${filter.search}%`;
    conditions.push(
      or(
        ilike(videoProjects.title, pattern),
        ilike(videoProjects.description, pattern)
      )!
    );
  }

  const rows = await db
    .select()
    .from(videoProjects)
    .where(conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`) : undefined)
    .orderBy(desc(videoProjects.createdAt));

  return rows.map(toVideoProject);
}

/** 获取单个项目 */
export async function getProject(
  id: string
): Promise<VideoProject | undefined> {
  const rows = await db
    .select()
    .from(videoProjects)
    .where(eq(videoProjects.id, id))
    .limit(1);

  return rows.length > 0 ? toVideoProject(rows[0]) : undefined;
}

/** 保存项目（新增或更新 — upsert） */
export async function saveProject(
  project: VideoProject
): Promise<VideoProject> {
  const now = new Date();

  const rows = await db
    .insert(videoProjects)
    .values({
      id: project.id,
      title: project.title,
      description: project.description,
      videoType: project.videoType,
      videoData: project.videoData ?? {},
      createdAt: new Date(project.createdAt),
      updatedAt: now,
      duration: project.duration,
      aspectRatio: project.aspectRatio,
      tags: project.tags,
      thumbnail: project.thumbnail ?? null,
      renderStatus: project.renderStatus ?? "idle",
      renderOutputPath: project.renderOutputPath ?? null,
      renderProgress: project.renderProgress ?? 0,
    })
    .onConflictDoUpdate({
      target: videoProjects.id,
      set: {
        title: project.title,
        description: project.description,
        videoType: project.videoType,
        videoData: project.videoData ?? {},
        updatedAt: now,
        duration: project.duration,
        aspectRatio: project.aspectRatio,
        tags: project.tags,
        thumbnail: project.thumbnail ?? null,
        renderStatus: project.renderStatus ?? "idle",
        renderOutputPath: project.renderOutputPath ?? null,
        renderProgress: project.renderProgress ?? 0,
      },
    })
    .returning();

  return toVideoProject(rows[0]);
}

/** 删除项目 */
export async function deleteProject(id: string): Promise<boolean> {
  const result = await db
    .delete(videoProjects)
    .where(eq(videoProjects.id, id))
    .returning({ id: videoProjects.id });

  return result.length > 0;
}

/** 获取统计数据 */
export async function getProjectStats(): Promise<ProjectStats> {
  const rows = await db
    .select({
      videoType: videoProjects.videoType,
      count: sql<number>`count(*)::int`,
    })
    .from(videoProjects)
    .groupBy(videoProjects.videoType);

  const stats: ProjectStats = {
    totalProjects: 0,
    cardCount: 0,
    algoCount: 0,
    knowledgeCount: 0,
    markdownCount: 0,
    totalRenderTimeMs: 0,
    totalStorageBytes: 0,
  };

  for (const row of rows) {
    const count = Number(row.count);
    stats.totalProjects += count;
    switch (row.videoType) {
      case "card":
        stats.cardCount = count;
        break;
      case "algo":
        stats.algoCount = count;
        break;
      case "knowledge":
        stats.knowledgeCount = count;
        break;
      case "markdown":
        stats.markdownCount = count;
        break;
    }
  }

  return stats;
}

// ─── 辅助函数：从视频数据创建项目（纯函数，不变）───

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
