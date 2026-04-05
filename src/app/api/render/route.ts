import { NextRequest, NextResponse } from "next/server";
import { renderVideo, getCompositionId } from "@/lib/renderer";
import type { VideoType } from "@/lib/renderer";
import { getProject, saveProject } from "@/lib/project-store";

// 渲染任务状态存储（内存，仅限开发环境）
const renderTasks = new Map<
  string,
  {
    status: string;
    progress: number;
    outputPath?: string;
    error?: string;
    videoType: string;
  }
>();

export async function POST(req: NextRequest) {
  try {
    const { videoData, videoType = "card", projectId } = await req.json();

    if (!videoData) {
      return NextResponse.json(
        { error: "缺少视频数据" },
        { status: 400 }
      );
    }

    const taskId = crypto.randomUUID();
    const compositionId = getCompositionId(videoType as VideoType);

    // 初始化任务状态
    renderTasks.set(taskId, {
      status: "rendering",
      progress: 0,
      videoType,
    });

    // 异步触发渲染（不阻塞响应）
    renderVideo(
      {
        compositionId,
        inputProps: { data: videoData },
      },
      (progress) => {
        const task = renderTasks.get(taskId);
        if (task) {
          task.progress = progress;
        }
      }
    )
      .then(async (result) => {
        const task = renderTasks.get(taskId);
        if (task) {
          task.status = "completed";
          task.progress = 100;
          task.outputPath = result.outputPath;
        }

        // 回写项目状态
        if (projectId) {
          try {
            const project = await getProject(projectId);
            if (project) {
              await saveProject({
                ...project,
                renderStatus: "completed",
                renderOutputPath: result.outputPath,
                renderProgress: 100,
              });
            }
          } catch (err) {
            console.warn("[/api/render] 项目状态回写失败:", err);
          }
        }
      })
      .catch(async (error) => {
        const task = renderTasks.get(taskId);
        if (task) {
          task.status = "failed";
          task.error =
            error instanceof Error ? error.message : "渲染失败";
        }

        // 回写项目失败状态
        if (projectId) {
          try {
            const project = await getProject(projectId);
            if (project) {
              await saveProject({
                ...project,
                renderStatus: "failed",
                renderProgress: 0,
              });
            }
          } catch (err) {
            console.warn("[/api/render] 项目状态回写失败:", err);
          }
        }
      });

    return NextResponse.json({
      taskId,
      status: "rendering",
      message: "渲染任务已提交，请使用 taskId 轮询进度",
    });
  } catch (error) {
    console.error("[/api/render] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "渲染请求处理失败",
      },
      { status: 500 }
    );
  }
}

// 查询渲染进度
export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(
      { error: "缺少 taskId 参数" },
      { status: 400 }
    );
  }

  const task = renderTasks.get(taskId);

  if (!task) {
    return NextResponse.json(
      { error: "任务不存在" },
      { status: 404 }
    );
  }

  return NextResponse.json(task);
}
