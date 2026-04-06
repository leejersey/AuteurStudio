"use client";

import { useState, useRef, useCallback } from "react";
import { AVAILABLE_VOICES } from "@/lib/volcengine-tts";

interface VoiceConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  voiceId: string;
  voiceSpeed: number;
  onVoiceChange: (voiceId: string) => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [
  { value: 0.8, label: "0.8x" },
  { value: 0.9, label: "0.9x" },
  { value: 1.0, label: "1.0x" },
  { value: 1.1, label: "1.1x" },
  { value: 1.2, label: "1.2x" },
  { value: 1.5, label: "1.5x" },
];

export default function VoiceConfigPanel({
  isOpen,
  onClose,
  voiceId,
  voiceSpeed,
  onVoiceChange,
  onSpeedChange,
}: VoiceConfigPanelProps) {
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePreview = useCallback(
    async (id: string) => {
      // 停止正在播放的
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setPreviewVoiceId(id);
      setIsPlaying(true);

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: "你好，我是你的AI配音助手，很高兴为你服务。",
            voiceId: id,
          }),
        });

        if (!res.ok) throw new Error("TTS 请求失败");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          setPreviewVoiceId(null);
          URL.revokeObjectURL(url);
        };

        audio.onerror = () => {
          setIsPlaying(false);
          setPreviewVoiceId(null);
        };

        await audio.play();
      } catch {
        setIsPlaying(false);
        setPreviewVoiceId(null);
      }
    },
    []
  );

  if (!isOpen) return null;

  const female = AVAILABLE_VOICES.filter((v) => v.gender === "female");
  const male = AVAILABLE_VOICES.filter((v) => v.gender === "male");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="relative w-[520px] max-h-[85vh] bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontSize: 20 }}
              >
                settings_voice
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">配音设置</h3>
              <p className="text-[11px] text-on-surface-variant">
                选择音色与语速
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              close
            </span>
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-130px)]">
          {/* 女声区 */}
          <VoiceSection
            title="女声"
            icon="female"
            voices={female}
            selectedId={voiceId}
            previewId={previewVoiceId}
            isPlaying={isPlaying}
            onSelect={onVoiceChange}
            onPreview={handlePreview}
            accentClass="text-tertiary"
            bgClass="bg-tertiary/10 border-tertiary/20"
          />

          {/* 男声区 */}
          <VoiceSection
            title="男声"
            icon="male"
            voices={male}
            selectedId={voiceId}
            previewId={previewVoiceId}
            isPlaying={isPlaying}
            onSelect={onVoiceChange}
            onPreview={handlePreview}
            accentClass="text-primary"
            bgClass="bg-primary/10 border-primary/20"
          />

          {/* 语速控制 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                speed
              </span>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                语速
              </span>
            </div>
            <div className="flex gap-2">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSpeedChange(opt.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    voiceSpeed === opt.value
                      ? "bg-secondary/20 border border-secondary/50 text-secondary shadow-[0_0_12px_rgba(172,138,255,0.15)]"
                      : "bg-surface-container-high border border-outline-variant/15 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="px-6 py-4 border-t border-outline-variant/10 flex items-center justify-between">
          <p className="text-[11px] text-on-surface-variant">
            当前：
            <span className="text-secondary font-semibold">
              {AVAILABLE_VOICES.find((v) => v.id === voiceId)?.name || "未选择"}
            </span>
            {" · "}
            <span className="text-primary font-semibold">{voiceSpeed}x</span>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary text-sm font-semibold hover:bg-secondary/25 transition-all"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 音色分组子组件 ───

interface VoiceSectionProps {
  title: string;
  icon: string;
  voices: typeof AVAILABLE_VOICES;
  selectedId: string;
  previewId: string | null;
  isPlaying: boolean;
  onSelect: (id: string) => void;
  onPreview: (id: string) => void;
  accentClass: string;
  bgClass: string;
}

function VoiceSection({
  title,
  icon,
  voices,
  selectedId,
  previewId,
  isPlaying,
  onSelect,
  onPreview,
  accentClass,
  bgClass,
}: VoiceSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`material-symbols-outlined ${accentClass}`} style={{ fontSize: 18 }}>
          {icon}
        </span>
        <span className={`text-xs font-semibold ${accentClass} uppercase tracking-wider`}>
          {title}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {voices.map((voice) => {
          const isSelected = selectedId === voice.id;
          const isPreviewing = previewId === voice.id && isPlaying;

          return (
            <button
              key={voice.id}
              onClick={() => onSelect(voice.id)}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                isSelected
                  ? `${bgClass} shadow-md`
                  : "bg-surface-container-high/50 border-outline-variant/10 hover:border-outline-variant/25 hover:bg-surface-container-high"
              }`}
            >
              {/* 选中指示 */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              )}

              {/* 头像 */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 ${
                  isSelected ? bgClass : "bg-surface-container-highest border border-outline-variant/15"
                }`}
              >
                {voice.gender === "female" ? "👩" : "👨"}
              </div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isSelected ? "text-on-surface" : "text-on-surface-variant"}`}>
                  {voice.name}
                </p>
                <p className="text-[10px] text-on-surface-variant truncate">
                  {voice.desc}
                </p>
              </div>

              {/* 试听按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(voice.id);
                }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
                  isPreviewing
                    ? "bg-secondary/20 text-secondary opacity-100"
                    : "bg-surface-container-highest text-on-surface-variant hover:text-secondary"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
                  {isPreviewing ? "stop" : "play_arrow"}
                </span>
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
}
