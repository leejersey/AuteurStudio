import { NextRequest, NextResponse } from "next/server";
import {
  listProjects,
  saveProject,
  deleteProject,
  getProjectStats,
} from "@/lib/project-store";
import type { VideoProject } from "@/lib/project-store";

/** GET /api/projects — 获取项目列表 */
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") as
      | "card"
      | "algo"
      | "knowledge"
      | "markdown"
      | null;
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const statsOnly = req.nextUrl.searchParams.get("stats") === "true";

    // 仅返回统计数据
    if (statsOnly) {
      const stats = await getProjectStats();
      return NextResponse.json({ stats });
    }

    const projects = await listProjects({
      type: type || undefined,
      search,
    });

    return NextResponse.json({
      projects,
      totalCount: projects.length,
    });
  } catch (error) {
    console.error("[/api/projects] GET Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "获取项目列表失败" },
      { status: 500 }
    );
  }
}

/** POST /api/projects — 保存项目 */
export async function POST(req: NextRequest) {
  try {
    const project: VideoProject = await req.json();

    if (!project.id || !project.title) {
      return NextResponse.json(
        { error: "缺少必填字段 (id, title)" },
        { status: 400 }
      );
    }

    const saved = await saveProject(project);
    return NextResponse.json({ project: saved });
  } catch (error) {
    console.error("[/api/projects] POST Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存项目失败" },
      { status: 500 }
    );
  }
}

/** DELETE /api/projects?id=xxx — 删除项目 */
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "缺少 id 参数" },
        { status: 400 }
      );
    }

    const deleted = await deleteProject(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "项目不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/projects] DELETE Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除项目失败" },
      { status: 500 }
    );
  }
}
