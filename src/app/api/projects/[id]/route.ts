import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/project-store";

/** GET /api/projects/:id — 获取单个项目详情 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
      return NextResponse.json(
        { error: "项目不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("[/api/projects/:id] GET Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "获取项目失败" },
      { status: 500 }
    );
  }
}
