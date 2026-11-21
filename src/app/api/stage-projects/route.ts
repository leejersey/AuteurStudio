import { NextResponse } from "next/server";
import { listStageProjects } from "@/lib/stage-projects";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ projects: listStageProjects() });
}
