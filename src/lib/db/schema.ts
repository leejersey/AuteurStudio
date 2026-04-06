// src/lib/db/schema.ts — Drizzle ORM 表定义
import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── video_projects 表 ───

export const videoProjects = pgTable("video_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  videoType: text("video_type", {
    enum: ["card", "algo", "knowledge", "markdown"],
  }).notNull(),
  videoData: jsonb("video_data").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  duration: integer("duration").notNull().default(15),
  aspectRatio: text("aspect_ratio", { enum: ["9:16", "16:9"] })
    .notNull()
    .default("16:9"),
  tags: text("tags").array().notNull().default([]),
  thumbnail: text("thumbnail"),
  renderStatus: text("render_status", {
    enum: ["idle", "rendering", "completed", "failed"],
  }).default("idle"),
  renderOutputPath: text("render_output_path"),
  renderProgress: integer("render_progress").default(0),
});

// ─── 类型导出 ───

export type DbVideoProject = typeof videoProjects.$inferSelect;
export type NewDbVideoProject = typeof videoProjects.$inferInsert;
