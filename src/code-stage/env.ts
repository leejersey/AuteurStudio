import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 读取环境变量：优先 process.env，其次依次尝试项目根目录和 POC worktree 的 .env.local。
 */
export function loadEnvValue(key: string, cwd = process.cwd()): string | undefined {
  if (process.env[key]) return process.env[key];
  const candidates = [
    join(/*turbopackIgnore: true*/ cwd, ".env.local"),
    join(/*turbopackIgnore: true*/ cwd, ".worktrees/hyperframes-knowledge-poc/.env.local"),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && match[1] === key) {
        return match[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
  return undefined;
}
