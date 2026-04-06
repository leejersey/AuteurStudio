// scripts/migrate-json-to-pg.ts — 一次性迁移脚本：JSON → PostgreSQL
// 运行: npx tsx scripts/migrate-json-to-pg.ts

import fs from "fs/promises";
import path from "path";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { videoProjects } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

interface OldVideoProject {
  id: string;
  title: string;
  description: string;
  videoType: "card" | "algo" | "knowledge" | "markdown";
  videoData: unknown;
  createdAt: string;
  updatedAt: string;
  duration: number;
  aspectRatio: "9:16" | "16:9";
  tags: string[];
  thumbnail?: string;
  renderStatus?: string;
  renderOutputPath?: string;
  renderProgress?: number;
}

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://localhost:5432/auteur_studio";
const JSON_FILE = path.resolve(process.cwd(), ".data/projects.json");

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║  JSON → PostgreSQL 数据迁移              ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log();

  // 1. 读取 JSON 文件
  console.log(`📂 读取 ${JSON_FILE} ...`);
  let raw: string;
  try {
    raw = await fs.readFile(JSON_FILE, "utf-8");
  } catch {
    console.log("⚠️  JSON 文件不存在，无数据需要迁移。");
    process.exit(0);
  }

  const projects: OldVideoProject[] = JSON.parse(raw);
  console.log(`✅ 读取到 ${projects.length} 个项目`);

  if (projects.length === 0) {
    console.log("✅ 无数据需要迁移。");
    process.exit(0);
  }

  // 2. 连接数据库
  console.log(`\n🔗 连接 PostgreSQL: ${DATABASE_URL.replace(/:[^:@]*@/, ':***@')} ...`);
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool);

  // 3. 检查表是否存在
  try {
    await db.select({ count: sql<number>`count(*)` }).from(videoProjects);
  } catch {
    console.error("❌ 表 video_projects 不存在，请先运行 npm run db:push");
    await pool.end();
    process.exit(1);
  }

  // 4. 批量插入
  const BATCH_SIZE = 100;
  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < projects.length; i += BATCH_SIZE) {
    const batch = projects.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(projects.length / BATCH_SIZE);

    console.log(`\n📦 批次 ${batchNum}/${totalBatches} (${batch.length} 条) ...`);

    for (const p of batch) {
      try {
        // 验证必要字段
        if (!p.id || !p.title) {
          console.log(`  ⚠️ 跳过无效项目: id=${p.id}, title=${p.title}`);
          skipped++;
          continue;
        }

        await db
          .insert(videoProjects)
          .values({
            id: p.id,
            title: p.title,
            description: p.description || "",
            videoType: p.videoType,
            videoData: p.videoData ?? {},
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
            duration: p.duration || 15,
            aspectRatio: p.aspectRatio || "16:9",
            tags: p.tags || [],
            thumbnail: p.thumbnail || null,
            renderStatus: (p.renderStatus as "idle" | "rendering" | "completed" | "failed") || "idle",
            renderOutputPath: p.renderOutputPath || null,
            renderProgress: p.renderProgress || 0,
          })
          .onConflictDoNothing();

        inserted++;
      } catch (err) {
        console.error(`  ❌ 插入失败 (id=${p.id}):`, err instanceof Error ? err.message : err);
        failed++;
      }
    }

    console.log(`  ✅ 本批完成`);
  }

  // 5. 验证
  console.log("\n🔍 验证迁移结果...");
  const [{ count: dbCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(videoProjects);

  console.log();
  console.log("╔══════════════════════════════════════════╗");
  console.log("║  迁移报告                                ║");
  console.log("╠══════════════════════════════════════════╣");
  console.log(`║  JSON 总数:    ${String(projects.length).padStart(6)}                    ║`);
  console.log(`║  成功插入:     ${String(inserted).padStart(6)}                    ║`);
  console.log(`║  跳过:         ${String(skipped).padStart(6)}                    ║`);
  console.log(`║  失败:         ${String(failed).padStart(6)}                    ║`);
  console.log(`║  DB 总数:      ${String(dbCount).padStart(6)}                    ║`);
  console.log("╚══════════════════════════════════════════╝");

  if (failed > 0) {
    console.log("\n⚠️  有失败的记录，请检查日志。");
  } else {
    console.log("\n🎉 迁移完成！旧文件 .data/projects.json 保留作为备份。");
  }

  await pool.end();
}

main().catch((err) => {
  console.error("迁移脚本异常:", err);
  process.exit(1);
});
