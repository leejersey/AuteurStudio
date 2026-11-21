"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface StageTimelineItem {
  id: string;
  label: string;
  start: number;
  duration: number;
}

interface StagePlayerProps {
  previewUrl: string;
  duration: number;
  width?: number;
  height?: number;
  hasAudio?: boolean;
  reloadKey?: number;
  timelineItems: StageTimelineItem[];
}

function formatTime(sec: number): string {
  const clamped = Math.max(0, sec);
  const mins = Math.floor(clamped / 60);
  const secs = Math.floor(clamped % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function StagePlayer({
  previewUrl,
  duration,
  width = 1920,
  height = 1080,
  hasAudio = false,
  reloadKey = 0,
  timelineItems,
}: StagePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const initialPosterTime = Math.min(1.6, Math.max(0.2, duration * 0.15));
  const [currentTime, setCurrentTime] = useState(initialPosterTime);

  const timeRef = useRef(initialPosterTime);
  const lastFrameRef = useRef<number | null>(null);

  const sendSeek = useCallback((t: number) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: "stage-seek", time: t }, "*");
  }, []);

  const sendPlayState = useCallback(
    (playing: boolean, t: number, nextSpeed = speed, nextMuted = isMuted) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      win.postMessage({ type: "stage-play", playing, time: t, speed: nextSpeed, muted: nextMuted }, "*");
    },
    [speed, isMuted],
  );

  // 切换项目或配音刷新时定位到首步已入场的清晰封面帧
  useEffect(() => {
    const poster = Math.min(1.6, Math.max(0.2, duration * 0.15));
    setIsPlaying(false);
    timeRef.current = poster;
    setCurrentTime(poster);
    sendPlayState(false, poster);
  }, [previewUrl, reloadKey, duration, sendPlayState]);

  // 监听 iframe 就绪事件，立即同步当前帧
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (ev.data?.type === "stage-ready") {
        sendSeek(timeRef.current);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendSeek]);

  // 响应容器尺寸等比缩放 16:9 或 9:16 画布
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setScale(Math.min(rect.width / width, rect.height / height));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  // rAF 播放循环
  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = null;
      return;
    }
    let rafId = 0;
    const tick = (now: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = now;
      }
      const deltaSec = ((now - lastFrameRef.current) / 1000) * speed;
      lastFrameRef.current = now;

      let next = timeRef.current + deltaSec;
      if (next >= duration) {
        next = duration - 0.02;
        timeRef.current = next;
        setCurrentTime(next);
        sendPlayState(false, next);
        setIsPlaying(false);
        return;
      }
      timeRef.current = next;
      setCurrentTime(next);
      sendSeek(next);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, speed, duration, sendSeek, sendPlayState]);

  const handleSeek = (t: number) => {
    const clamped = Math.max(0, Math.min(duration - 0.02, t));
    timeRef.current = clamped;
    setCurrentTime(clamped);
    sendPlayState(isPlaying, clamped);
  };

  const togglePlay = () => {
    const nextPlaying = !isPlaying;
    let startAt = timeRef.current;
    if (nextPlaying && (startAt >= duration - 0.1 || Math.abs(startAt - initialPosterTime) < 0.05)) {
      startAt = 0;
      timeRef.current = 0;
      setCurrentTime(0);
    }
    setIsPlaying(nextPlaying);
    sendPlayState(nextPlaying, startAt);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    iframeRef.current?.contentWindow?.postMessage({ type: "stage-mute", muted: nextMuted }, "*");
  };

  const handleSpeedChange = (s: number) => {
    setSpeed(s);
    sendPlayState(isPlaying, timeRef.current, s, isMuted);
  };

  const activeIndex = timelineItems.findIndex(
    (item) => currentTime >= item.start - 0.01 && currentTime < item.start + item.duration,
  );

  const isPortrait = height > width;

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      {/* 16:9 / 9:16 实时预览舞台 */}
      <div
        ref={containerRef}
        className={`relative w-full ${
          isPortrait ? "h-[58vh]" : "aspect-video max-h-[58vh]"
        } rounded-2xl overflow-hidden border border-white/10 bg-[#080c14] shadow-[0_24px_64px_rgba(0,0,0,0.55)] flex items-center justify-center`}
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            flexShrink: 0,
          }}
        >
          <iframe
            ref={iframeRef}
            key={`${previewUrl}-${reloadKey}-${width}x${height}`}
            src={`${previewUrl}${reloadKey > 0 ? `?v=${reloadKey}` : ""}`}
            title="HyperFrames Stage Preview"
            onLoad={() => sendPlayState(false, timeRef.current)}
            style={{ width, height }}
            className="border-0 block"
          />
        </div>
      </div>

      {/* 播放控制条 */}
      <div className="rounded-xl bg-surface-container-high/70 border border-white/10 px-4 py-3 flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          className="w-10 h-10 rounded-xl primary-gradient text-on-primary-fixed flex items-center justify-center hover:opacity-90 active:scale-95 transition shrink-0"
          aria-label={isPlaying ? "暂停" : "播放"}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>

        <span className="font-mono text-xs text-on-surface-variant w-24 shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <input
          type="range"
          min={0}
          max={Math.max(duration, 0.1)}
          step={0.05}
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="flex-1 accent-primary cursor-pointer"
        />

        <div className="flex items-center gap-1 shrink-0">
          {[0.5, 1, 1.5, 2].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSpeedChange(s)}
              className={`px-2 py-1 rounded text-xs font-mono transition ${
                speed === s
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleMute}
          title={hasAudio ? (isMuted ? "取消静音" : "静音") : "当前工程未合成配音"}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition shrink-0 ${
            hasAudio
              ? isMuted
                ? "bg-white/5 border-white/10 text-on-surface-variant"
                : "bg-emerald-500/15 border-emerald-400/35 text-emerald-300"
              : "bg-white/5 border-white/5 text-on-surface-variant/50"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {!hasAudio || isMuted ? "volume_off" : "volume_up"}
          </span>
          <span className="text-[11px]">{hasAudio ? (isMuted ? "已静音" : "有声") : "无声"}</span>
        </button>
      </div>

      {/* 步骤 / 帧快速跳转轨道 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {timelineItems.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSeek(item.start + Math.min(1.4, item.duration * 0.4))}
              className={`shrink-0 max-w-[240px] text-left px-3 py-2 rounded-xl border transition ${
                isActive
                  ? "bg-primary/15 border-primary/50 text-primary"
                  : "bg-surface-container/70 border-white/5 text-on-surface-variant hover:border-white/20 hover:text-on-surface"
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono opacity-80">
                <span>#{idx + 1}</span>
                <span>{item.start.toFixed(1)}s</span>
              </div>
              <div className="text-xs font-medium truncate mt-0.5">{item.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
