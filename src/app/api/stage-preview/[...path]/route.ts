import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { NextRequest, NextResponse } from "next/server";

const MIME_MAP: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

/**
 * 注入到预览 HTML 末尾的轻量级 seek 桥接脚本（仅在浏览器预览 API 中注入，不改动源 artifact）：
 * 接收父页面 postMessage({ type: "seek", time })，精准同步 GSAP 主时间线与所有 .clip 元素的显隐窗口。
 */
const PREVIEW_BRIDGE_SCRIPT = `
<script>
(function () {
  var isPlaying = false;
  var isMuted = false;
  var playbackRate = 1;

  function syncAudio(t) {
    var audios = document.querySelectorAll("audio.clip");
    for (var i = 0; i < audios.length; i++) {
      var a = audios[i];
      var s = parseFloat(a.getAttribute("data-start") || "0");
      var d = parseFloat(a.getAttribute("data-duration") || "0");
      a.muted = isMuted;
      a.playbackRate = playbackRate;
      var inWindow = t >= s - 0.02 && t < s + d;
      if (isPlaying && inWindow) {
        var target = Math.max(0, t - s);
        if (Math.abs((a.currentTime || 0) - target) > 0.28) {
          try { a.currentTime = target; } catch (e) {}
        }
        if (a.paused) {
          var p = a.play();
          if (p && typeof p.catch === "function") p.catch(function () {});
        }
      } else {
        if (!a.paused) a.pause();
      }
    }
  }

  function applyTime(t) {
    var root = document.querySelector("[data-composition-id]");
    if (!root) return;
    var compId = root.getAttribute("data-composition-id");
    var tl = window.__timelines && window.__timelines[compId];
    if (tl && typeof tl.time === "function") {
      tl.pause();
      tl.time(t);
    }
    var clips = root.querySelectorAll(".clip");
    for (var i = 0; i < clips.length; i++) {
      var el = clips[i];
      if (el.tagName === "AUDIO" || el.tagName === "VIDEO") continue;
      var s = parseFloat(el.getAttribute("data-start") || "0");
      var d = parseFloat(el.getAttribute("data-duration") || "0");
      var active = t >= s - 0.001 && t < s + d;
      el.style.visibility = active ? "visible" : "hidden";
      el.style.pointerEvents = active ? "auto" : "none";
    }
    syncAudio(t);
  }

  window.addEventListener("message", function (ev) {
    if (!ev.data || !ev.data.type) return;
    if (ev.data.type === "stage-play") {
      isPlaying = Boolean(ev.data.playing);
      if (typeof ev.data.speed === "number") playbackRate = ev.data.speed;
      if (typeof ev.data.muted === "boolean") isMuted = ev.data.muted;
      var t = Number(ev.data.time);
      if (Number.isFinite(t) && t >= 0) applyTime(t);
      return;
    }
    if (ev.data.type === "stage-mute") {
      isMuted = Boolean(ev.data.muted);
      var audios = document.querySelectorAll("audio.clip");
      for (var i = 0; i < audios.length; i++) audios[i].muted = isMuted;
      return;
    }
    if (ev.data.type === "stage-seek") {
      var t2 = Number(ev.data.time);
      if (Number.isFinite(t2) && t2 >= 0) applyTime(t2);
    }
  });
  window.addEventListener("load", function () {
    applyTime(1.6);
    window.parent.postMessage({ type: "stage-ready" }, "*");
  });
})();
</script>
`;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  if (!segments || segments.length === 0) {
    return NextResponse.json({ error: "缺少文件路径" }, { status: 400 });
  }

  const rootDir = resolve(process.cwd(), "hyperframes");
  const targetPath = resolve(rootDir, ...segments);
  const rel = relative(rootDir, targetPath);

  // 严格防路径穿越
  if (rel.startsWith("..") || rel.includes("\0") || !existsSync(targetPath)) {
    return NextResponse.json({ error: "文件不存在" }, { status: 404 });
  }

  const stat = statSync(targetPath);
  if (!stat.isFile()) {
    return NextResponse.json({ error: "非法文件类型" }, { status: 400 });
  }

  const ext = extname(targetPath).toLowerCase();
  const contentType = MIME_MAP[ext];
  if (!contentType) {
    return NextResponse.json({ error: "不支持的文件扩展名" }, { status: 415 });
  }

  if (ext === ".html") {
    let html = readFileSync(targetPath, "utf8");
    const closeIdx = html.lastIndexOf("</body>");
    if (closeIdx !== -1) {
      html = `${html.slice(0, closeIdx)}${PREVIEW_BRIDGE_SCRIPT}\n${html.slice(closeIdx)}`;
    } else {
      html += PREVIEW_BRIDGE_SCRIPT;
    }
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  }

  const data = readFileSync(targetPath);
  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    },
  });
}
