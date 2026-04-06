// src/lib/db/index.ts — 数据库连接单例
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// 避免开发环境 HMR 导致连接池泄漏
const globalForDb = globalThis as unknown as {
  pgPool: Pool | undefined;
};

function getPool(): Pool {
  if (!globalForDb.pgPool) {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgresql://localhost:5432/auteur_studio";

    globalForDb.pgPool = new Pool({
      connectionString,
      max: 10, // 最大连接数
      idleTimeoutMillis: 30000,
    });

    // 连接错误处理
    globalForDb.pgPool.on("error", (err) => {
      console.error("[DB] Unexpected pool error:", err);
    });
  }

  return globalForDb.pgPool;
}

export const db = drizzle(getPool(), { schema });

export { schema };
