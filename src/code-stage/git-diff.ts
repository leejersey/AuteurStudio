import type { CodeStageSpec } from "./schema";
import type { StageThemeId } from "./stage-themes";

export interface ParsedDiffFile {
  filename: string;
  language: string;
  beforeCode: string;
  afterCode: string;
  addedCount: number;
  removedCount: number;
  addedLines: number[];
  removedLines: number[];
}

function inferLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    go: "go",
    rs: "rust",
    java: "java",
    cpp: "cpp",
    cc: "cpp",
    c: "cpp",
    sql: "sql",
    sh: "bash",
    json: "json",
  };
  return map[ext] ?? "typescript";
}

/**
 * 解析标准 Unified Diff / `git diff` 文本，抽取每个变更文件的 Before/After 代码快照与精确变更行号。
 */
export function parseUnifiedDiff(diffText: string): ParsedDiffFile[] {
  const lines = diffText.replace(/\r\n/g, "\n").split("\n");
  const files: ParsedDiffFile[] = [];

  let currentFile = "";
  let beforeLines: string[] = [];
  let afterLines: string[] = [];
  let addedLines: number[] = [];
  let removedLines: number[] = [];
  let inHunk = false;

  const flush = () => {
    if (!currentFile || (beforeLines.length === 0 && afterLines.length === 0)) return;
    files.push({
      filename: currentFile,
      language: inferLanguageFromFilename(currentFile),
      beforeCode: beforeLines.join("\n").slice(0, 2800),
      afterCode: afterLines.join("\n").slice(0, 2800),
      addedCount: addedLines.length,
      removedCount: removedLines.length,
      addedLines,
      removedLines,
    });
  };

  for (const line of lines) {
    if (line.startsWith("diff --git ")) {
      flush();
      const m = line.match(/diff --git a\/(.+?) b\/(.+)$/);
      currentFile = m ? m[2] : "changed.ts";
      beforeLines = [];
      afterLines = [];
      addedLines = [];
      removedLines = [];
      inHunk = false;
      continue;
    }

    if (line.startsWith("+++ b/")) {
      if (!currentFile) currentFile = line.slice(6).trim();
      continue;
    }
    if (line.startsWith("--- ") || line.startsWith("index ") || line.startsWith("new file") || line.startsWith("deleted file")) {
      continue;
    }

    if (line.startsWith("@@ ")) {
      inHunk = true;
      continue;
    }

    if (!inHunk) continue;
    if (line.startsWith("\\ No newline")) continue;

    if (line.startsWith("+")) {
      afterLines.push(line.slice(1));
      addedLines.push(afterLines.length);
    } else if (line.startsWith("-")) {
      beforeLines.push(line.slice(1));
      removedLines.push(beforeLines.length);
    } else {
      const content = line.startsWith(" ") ? line.slice(1) : line;
      beforeLines.push(content);
      afterLines.push(content);
    }
  }

  flush();
  return files;
}

/**
 * 将解析后的 Git Diff 直接编译为 3 步 `CodeStageSpec`（0 Token 秒级出片：原代码痛点 → Diff 改动聚焦 → 改动后完整代码与验证）
 */
export function buildCodeStageSpecFromDiff(params: {
  diffText: string;
  title?: string;
  theme?: StageThemeId;
  enablePackaging?: boolean;
}): CodeStageSpec {
  const parsedFiles = parseUnifiedDiff(params.diffText);
  if (parsedFiles.length === 0) {
    throw new Error("未在输入中解析到有效的 Unified Diff（需要包含 @@ hunk 与 +/- 变更行）");
  }

  // 优先选择变更量最有代表性的核心文件
  const primary = [...parsedFiles].sort(
    (a, b) => b.addedCount + b.removedCount - (a.addedCount + a.removedCount),
  )[0];

  const shortName = primary.filename.split("/").pop() || primary.filename;
  const title = params.title?.trim() || `Code Review：拆解 ${shortName} 核心改动`;
  const theme = params.theme ?? "dracula";

  const beforeFocus = primary.removedLines.slice(0, 6);
  const afterFocus = primary.addedLines.slice(0, 8);
  const beforeCode = primary.beforeCode.trim() || "// 新增文件，此前无代码";
  const afterCode = primary.afterCode.trim() || "// 该片段已被清理移除";

  return {
    version: 1,
    meta: {
      id: `diff-${Date.now()}`,
      title,
      subtitle: `${primary.filename} · +${primary.addedCount} / -${primary.removedCount}`,
      language: primary.language,
      shikiTheme: theme,
      width: 1920,
      height: 1080,
      fps: 30,
    },
    steps: [
      {
        id: "step-1",
        badge: "01 · 改动前代码",
        headline: `定位 ${shortName} 中待优化的原始实现`,
        filename: shortName,
        start: 0,
        duration: 5.5,
        code: beforeCode,
        focusLines: beforeFocus.length > 0 ? beforeFocus : [1],
        callout: {
          line: beforeFocus[0] ?? 1,
          title: `准备移除 ${primary.removedCount} 行旧逻辑`,
          body: `高亮区域是本次 PR / Commit 即将替换或删除的关键行，先看清原始上下文。`,
          tone: "warn",
        },
        narration: `先看 ${shortName} 改动前的原始代码，高亮部分就是本次提交准备重写或移除的 ${primary.removedCount} 行旧逻辑。`,
      },
      {
        id: "step-2",
        badge: "02 · 核心 Diff 演进",
        headline: `Magic Move 对比：新增 ${primary.addedCount} 行、移除 ${primary.removedCount} 行`,
        filename: shortName,
        start: 5.5,
        duration: 6.5,
        code: afterCode,
        focusLines: afterFocus.length > 0 ? afterFocus : [1],
        callout: {
          line: afterFocus[0] ?? 1,
          title: `本次提交核心改动 (+${primary.addedCount} / -${primary.removedCount})`,
          body: `绿色行是新增实现，未改动的代码行自动平滑保留，让变更意图一目了然。`,
          tone: "success",
        },
        narration: `切入本次提交的核心 Diff：新增了 ${primary.addedCount} 行实现，保留上下文不变，改动点清晰聚焦。`,
      },
      {
        id: "step-3",
        badge: "03 · 变更总结与验证",
        headline: `确认 ${shortName} 改动落地与测试通过`,
        filename: shortName,
        start: 12.0,
        duration: 5.0,
        code: afterCode,
        focusLines: [],
        terminal: {
          title: "Git Diff Summary",
          command: `git diff --stat ${primary.filename}`,
          lines: [
            { text: `${primary.filename} | ${primary.addedCount + primary.removedCount} +${primary.addedCount} -${primary.removedCount}`, tone: "stdout" },
            { text: `共涉及 ${parsedFiles.length} 个文件，核心变更已平滑同步`, tone: "success" },
          ],
        },
        narration: `最终确认变更统计：本次修改了 ${parsedFiles.length} 个文件，核心逻辑集中在 ${shortName}，简洁清晰易于 Code Review。`,
      },
    ],
    packaging: params.enablePackaging
      ? {
          enableIntro: true,
          introDuration: 2.5,
          enableOutro: true,
          outroDuration: 3.0,
          outroPoints: [
            `核心文件：${primary.filename}（+${primary.addedCount} / -${primary.removedCount}）`,
            "通过行级 Diff 对比，快速定位变更意图与影响范围",
            "点击右侧「微调步骤」可补充更深入的业务背景说明",
          ],
          outroCta: "点赞 · 收藏 · 关注，持续拆解高质量源码改动",
          bgmFile: "bgm-tech-01.wav",
          bgmLevel: "balanced",
        }
      : undefined,
  };
}

/**
 * 如果传入 GitHub PR URL（如 https://github.com/owner/repo/pull/123），自动拉取其 .diff 原始文本。
 */
export async function fetchGithubPrDiff(prUrl: string): Promise<{ diffText: string; suggestedTitle: string }> {
  const m = prUrl.trim().match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
  if (!m) {
    throw new Error("请输入标准 GitHub PR 链接，例如 https://github.com/owner/repo/pull/123");
  }
  const [, owner, repo, num] = m;
  const diffEndpoint = `https://github.com/${owner}/${repo}/pull/${num}.diff`;
  const res = await fetch(diffEndpoint, {
    headers: { Accept: "text/plain", "User-Agent": "AuteurStudio-DiffImporter/1.0" },
  });
  if (!res.ok) {
    throw new Error(`拉取 GitHub PR Diff 失败 (HTTP ${res.status})，请确认仓库为公开仓库或直接粘贴 git diff 文本`);
  }
  const diffText = await res.text();
  return {
    diffText,
    suggestedTitle: `PR #${num} 改动拆解（${owner}/${repo}）`,
  };
}
