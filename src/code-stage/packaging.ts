import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import { z } from "zod";
import type { StagePalette } from "./stage-themes";

export const stagePackagingSchema = z.object({
  enableIntro: z.boolean().default(false),
  introDuration: z.number().finite().min(1).max(6).default(2.5),
  enableOutro: z.boolean().default(false),
  outroDuration: z.number().finite().min(1.5).max(8).default(3.0),
  outroPoints: z.array(z.string().trim().min(1)).max(4).optional(),
  outroCta: z.string().trim().min(1).default("点赞 · 收藏 · 关注，持续拆解硬核编程"),
  bgmFile: z.string().trim().min(1).optional(),
  bgmLevel: z.enum(["soft", "balanced", "energetic"]).default("balanced"),
}).strict();

export type StagePackaging = z.infer<typeof stagePackagingSchema>;

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]!);

const fmtNum = (value: number): string => Number(value.toFixed(4)).toString();

export interface PackagingMetrics {
  introOffset: number;
  contentEnd: number;
  totalDuration: number;
  outroStart: number;
  outroDuration: number;
}

export function computePackagingMetrics(
  rawContentDuration: number,
  packaging?: StagePackaging,
): PackagingMetrics {
  const introOffset = packaging?.enableIntro ? packaging.introDuration : 0;
  const contentEnd = Number((introOffset + rawContentDuration).toFixed(4));
  const outroDuration = packaging?.enableOutro ? packaging.outroDuration : 0;
  const totalDuration = Number((contentEnd + outroDuration).toFixed(4));
  return {
    introOffset,
    contentEnd,
    totalDuration,
    outroStart: contentEnd,
    outroDuration,
  };
}

export function probeBgmDuration(bgmFile: string, cwd = process.cwd()): number {
  const safeName = basename(bgmFile);
  const absPath = join(cwd, "public/audio", safeName);
  if (!existsSync(absPath)) return 60;
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", absPath],
      { encoding: "utf8" },
    ).trim();
    const sec = Number.parseFloat(out);
    if (Number.isFinite(sec) && sec > 1) return sec;
  } catch {
    // fallback
  }
  return 60;
}

export function freezeBgmAsset(outDir: string, bgmFile: string | undefined, cwd = process.cwd()): void {
  if (!bgmFile) return;
  const safeName = basename(bgmFile);
  const src = join(cwd, "public/audio", safeName);
  if (!existsSync(src)) return;
  const targetDir = join(outDir, "assets/audio");
  mkdirSync(targetDir, { recursive: true });
  copyFileSync(src, join(targetDir, safeName));
}

export function renderIntroHtml(params: {
  packaging?: StagePackaging;
  title: string;
  subtitle?: string;
  badges: string[];
}): string {
  if (!params.packaging?.enableIntro) return "";
  const badgesHtml = params.badges
    .filter(Boolean)
    .map((b) => `<span class="pkg-pill">${escapeHtml(b)}</span>`)
    .join("");
  return `<section class="clip pkg-scene pkg-intro" id="pkg-intro" data-start="0" data-duration="${fmtNum(params.packaging.introDuration)}" data-track-index="1">
  <div class="pkg-card" id="pkg-intro-card">
    <div class="pkg-badges" id="pkg-intro-badges">${badgesHtml}</div>
    <h1 class="pkg-title" id="pkg-intro-title">${escapeHtml(params.title)}</h1>
    ${params.subtitle ? `<p class="pkg-subtitle" id="pkg-intro-sub">${escapeHtml(params.subtitle)}</p>` : ""}
    <div class="pkg-divider" id="pkg-intro-line"></div>
  </div>
</section>`;
}

export function renderOutroHtml(params: {
  packaging?: StagePackaging;
  outroStart: number;
  title: string;
  fallbackPoints: string[];
}): string {
  if (!params.packaging?.enableOutro) return "";
  const points = (params.packaging.outroPoints?.length ? params.packaging.outroPoints : params.fallbackPoints).slice(0, 3);
  const pointsHtml = points
    .map(
      (pt, idx) =>
        `<div class="pkg-point" id="pkg-outro-pt-${idx}"><span class="pkg-point-idx">0${idx + 1}</span><span class="pkg-point-text">${escapeHtml(pt)}</span></div>`,
    )
    .join("");
  return `<section class="clip pkg-scene pkg-outro" id="pkg-outro" data-start="${fmtNum(params.outroStart)}" data-duration="${fmtNum(params.packaging.outroDuration)}" data-track-index="1">
  <div class="pkg-card pkg-outro-card" id="pkg-outro-card">
    <span class="pkg-pill">SUMMARY · 核心要点</span>
    <h2 class="pkg-outro-title" id="pkg-outro-title">${escapeHtml(params.title)}</h2>
    <div class="pkg-points">${pointsHtml}</div>
    <div class="pkg-cta" id="pkg-outro-cta">${escapeHtml(params.packaging.outroCta)}</div>
  </div>
</section>`;
}

export interface BgmClipSpec {
  id: string;
  start: number;
  duration: number;
}

export function renderBgmAudioHtml(
  packaging: StagePackaging | undefined,
  totalDuration: number,
  cwd = process.cwd(),
): { html: string; clips: BgmClipSpec[] } {
  if (!packaging?.bgmFile) return { html: "", clips: [] };
  const safeName = basename(packaging.bgmFile);
  const singleDur = probeBgmDuration(safeName, cwd);
  const clips: BgmClipSpec[] = [];

  let cursor = 0;
  let idx = 0;
  while (cursor < totalDuration - 0.05) {
    const remaining = totalDuration - cursor;
    const dur = Number(Math.min(singleDur, remaining).toFixed(4));
    clips.push({ id: `bgm-${idx}`, start: Number(cursor.toFixed(4)), duration: dur });
    cursor += dur;
    idx++;
    if (idx > 20) break;
  }

  const html = clips
    .map(
      (c) =>
        `<audio id="${c.id}" class="clip" src="./assets/audio/${escapeHtml(safeName)}" data-start="${fmtNum(c.start)}" data-duration="${fmtNum(c.duration)}" data-track-index="10" preload="auto"></audio>`,
    )
    .join("\n");

  return { html, clips };
}

export function buildPackagingTimelineJs(params: {
  packaging?: StagePackaging;
  metrics: PackagingMetrics;
  hasNarrationAudio: boolean;
  bgmClips: BgmClipSpec[];
  outroPointCount: number;
}): string[] {
  const lines: string[] = [];
  const { packaging, metrics, hasNarrationAudio, bgmClips, outroPointCount } = params;

  // 1. 片头 Hook 动效
  if (packaging?.enableIntro) {
    lines.push(
      `tl.fromTo("#pkg-intro-badges", { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.42, ease: "power3.out" }, 0.08);`,
      `tl.fromTo("#pkg-intro-title", { opacity: 0, y: 26, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.56, ease: "power3.out" }, 0.22);`,
      `tl.fromTo("#pkg-intro-line", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.55, ease: "power3.inOut" }, 0.48);`,
    );
  }

  // 2. 结尾总结 + CTA 动效
  if (packaging?.enableOutro) {
    const t0 = metrics.outroStart;
    lines.push(
      `tl.fromTo("#pkg-outro-title", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, ${fmtNum(t0 + 0.08)});`,
    );
    for (let i = 0; i < Math.min(3, outroPointCount); i++) {
      lines.push(
        `tl.fromTo("#pkg-outro-pt-${i}", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.38, ease: "power2.out" }, ${fmtNum(t0 + 0.36 + i * 0.18)});`,
      );
    }
    lines.push(
      `tl.fromTo("#pkg-outro-cta", { opacity: 0, y: 16, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.44, ease: "back.out(1.4)" }, ${fmtNum(t0 + 1.05)});`,
    );
  }

  // 3. BGM Auto-Ducking 动态音量包络（片头高、正文压低、片尾回升、末尾淡出）
  if (packaging?.bgmFile && bgmClips.length > 0) {
    const levelScale = packaging.bgmLevel === "soft" ? 0.65 : packaging.bgmLevel === "energetic" ? 1.35 : 1.0;
    const introVol = Number(Math.min(0.42, 0.26 * levelScale).toFixed(3));
    const bodyVol = Number(Math.min(0.32, (hasNarrationAudio ? 0.085 : 0.19) * levelScale).toFixed(3));
    const outroVol = Number(Math.min(0.38, 0.22 * levelScale).toFixed(3));

    for (const clip of bgmClips) {
      const clipEnd = clip.start + clip.duration;
      const startVol = clip.start < metrics.introOffset ? introVol : bodyVol;
      // 淡入
      lines.push(
        `tl.fromTo("#${clip.id}", { volume: 0 }, { volume: ${startVol}, duration: ${fmtNum(Math.min(0.8, clip.duration * 0.25))}, ease: "power2.out" }, ${fmtNum(clip.start)});`,
      );
      // 片头结束进入正文时平滑压低（Ducking）
      if (metrics.introOffset > clip.start && metrics.introOffset < clipEnd - 0.5 && startVol !== bodyVol) {
        const duckAt = Math.max(clip.start + 0.85, metrics.introOffset - 0.35);
        lines.push(
          `tl.to("#${clip.id}", { volume: ${bodyVol}, duration: 0.55, ease: "power2.inOut" }, ${fmtNum(duckAt)});`,
        );
      }
      // 进入结尾 CTA 页时回升氛围音量
      if (metrics.outroDuration > 0 && metrics.outroStart > clip.start + 0.5 && metrics.outroStart < clipEnd - 1.3) {
        lines.push(
          `tl.to("#${clip.id}", { volume: ${outroVol}, duration: 0.55, ease: "power2.out" }, ${fmtNum(metrics.outroStart)});`,
        );
      }
      // 末尾平滑淡出至 0
      const fadeDur = Math.min(1.2, clip.duration * 0.3);
      const fadeAt = Math.max(clip.start + 0.9, clipEnd - fadeDur);
      lines.push(
        `tl.to("#${clip.id}", { volume: 0, duration: ${fmtNum(fadeDur)}, ease: "power2.in" }, ${fmtNum(fadeAt)});`,
      );
    }
  }

  return lines;
}

export function buildPackagingCss(p: StagePalette, isPortrait: boolean): string {
  return `
.pkg-scene {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${isPortrait ? "80px 52px" : "72px 120px"};
  z-index: 2;
}
.pkg-card {
  width: 100%;
  max-width: ${isPortrait ? "960px" : "1360px"};
  padding: ${isPortrait ? "64px 48px" : "68px 80px"};
  border-radius: 28px;
  background: ${p.panelBg};
  border: 1px solid ${p.border};
  box-shadow: 0 32px 90px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 28px;
}
.pkg-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}
.pkg-pill {
  padding: 8px 18px;
  border-radius: 999px;
  background: ${p.focusBg};
  border: 1px solid ${p.primary};
  color: ${p.primary};
  font-family: ui-monospace, monospace;
  font-size: ${isPortrait ? "20px" : "18px"};
  font-weight: 700;
  letter-spacing: 0.06em;
}
.pkg-title {
  font-size: ${isPortrait ? "60px" : "68px"};
  font-weight: 900;
  color: ${p.text};
  line-height: 1.2;
  letter-spacing: -0.02em;
}
.pkg-subtitle {
  font-size: ${isPortrait ? "28px" : "26px"};
  color: ${p.muted};
  line-height: 1.5;
  max-width: 960px;
}
.pkg-divider {
  width: 180px;
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(90deg, ${p.primary}, ${p.secondary});
}
.pkg-outro-title {
  font-size: ${isPortrait ? "44px" : "46px"};
  font-weight: 800;
  color: ${p.text};
}
.pkg-points {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 8px 0;
}
.pkg-point {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 26px;
  border-radius: 16px;
  background: ${p.barBg};
  border: 1px solid ${p.border};
  text-align: left;
}
.pkg-point-idx {
  font-family: ui-monospace, monospace;
  font-size: 20px;
  font-weight: 800;
  color: ${p.secondary};
  flex-shrink: 0;
}
.pkg-point-text {
  font-size: ${isPortrait ? "26px" : "24px"};
  font-weight: 600;
  color: ${p.text};
}
.pkg-cta {
  margin-top: 8px;
  padding: 14px 36px;
  border-radius: 999px;
  background: linear-gradient(135deg, ${p.primary}, ${p.secondary});
  color: ${p.canvasBgEnd};
  font-size: ${isPortrait ? "24px" : "22px"};
  font-weight: 800;
  letter-spacing: 0.04em;
}
`;
}
