import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { listStageProjects } from "@/lib/stage-projects";

export const dynamic = "force-dynamic";

export interface RenderedVideoItem {
  filename: string;
  url: string;
  sizeBytes: number;
  modifiedAt: string;
}

function listRenderedMp4s(cwd = process.cwd()): RenderedVideoItem[] {
  const rendersDir = resolve(cwd, "public/renders");
  if (!existsSync(rendersDir)) return [];
  return readdirSync(rendersDir)
    .filter((f) => f.toLowerCase().endsWith(".mp4"))
    .map((filename) => {
      const stat = statSync(join(rendersDir, filename));
      return {
        filename,
        url: `/renders/${filename}`,
        sizeBytes: stat.size,
        modifiedAt: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

export async function GET() {
  return NextResponse.json({
    projects: listStageProjects(),
    renders: listRenderedMp4s(),
  });
}

export async function DELETE(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get("kind");
  const target = req.nextUrl.searchParams.get("target");
  if (!kind || !target) {
    return NextResponse.json({ error: "缺少 kind 或 target 参数" }, { status: 400 });
  }

  if (kind === "project") {
    // 仅允许删除 generated/ 下的用户生成工程，保护内置演示样片
    if (!target.startsWith("generated/")) {
      return NextResponse.json({ error: "内置演示样片不允许删除" }, { status: 400 });
    }
    const rootDir = resolve(process.cwd(), "hyperframes");
    const dir = resolve(rootDir, target);
    const rel = relative(rootDir, dir);
    if (rel.startsWith("..") || !existsSync(dir)) {
      return NextResponse.json({ error: "目标工程不存在" }, { status: 404 });
    }
    rmSync(dir, { recursive: true, force: true });
    return NextResponse.json({ deleted: true });
  }

  if (kind === "render") {
    const rendersDir = resolve(process.cwd(), "public/renders");
    const filePath = resolve(rendersDir, target);
    const rel = relative(rendersDir, filePath);
    if (rel.startsWith("..") || rel.includes("/") || !existsSync(filePath)) {
      return NextResponse.json({ error: "目标 MP4 文件不存在" }, { status: 404 });
    }
    rmSync(filePath, { force: true });
    return NextResponse.json({ deleted: true });
  }

  return NextResponse.json({ error: "不支持的删除类型" }, { status: 400 });
}
