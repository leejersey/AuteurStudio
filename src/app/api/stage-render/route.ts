import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteRenderJob, enqueueRenderJob, getRenderJob, listRenderJobs } from "@/lib/render-jobs";

export const dynamic = "force-dynamic";

const renderSchema = z.object({
  slug: z.string().trim().min(1),
});

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const job = getRenderJob(id);
    if (!job) return NextResponse.json({ error: "渲染任务不存在" }, { status: 404 });
    return NextResponse.json({ job });
  }
  return NextResponse.json({ jobs: listRenderJobs() });
}

export async function POST(req: NextRequest) {
  try {
    const { slug } = renderSchema.parse(await req.json());
    const job = enqueueRenderJob(slug);
    return NextResponse.json({ job }, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "提交渲染任务失败" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少任务 id" }, { status: 400 });
  const deleted = deleteRenderJob(id);
  return NextResponse.json({ deleted });
}
