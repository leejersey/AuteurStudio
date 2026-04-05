"use client";

interface VideoGeneratorProps {
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
}

export default function VideoGenerator({
  isLoading,
  error,
  onBack,
}: VideoGeneratorProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center min-h-0">
      {isLoading && (
        <>
          {/* Animated Progress */}
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-primary/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-secondary animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-primary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                movie_creation
              </span>
            </div>
          </div>

          <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
            正在生成视频
          </h3>
          <p className="text-xs text-on-surface-variant max-w-xs mb-6 leading-relaxed">
            AI 正在将文案转化为视频数据并合成语音旁白，这可能需要 10~30 秒...
          </p>

          {/* Steps */}
          <div className="space-y-3 w-full max-w-xs text-left">
            {["格式转换 · 将文案映射为视频结构", "TTS 合成 · 为每页生成语音旁白", "数据整合 · 生成完整视频数据包"].map(
              (step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-[10px] uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-primary text-sm animate-pulse">
                    radio_button_checked
                  </span>
                  <span className="text-on-surface-variant">{step}</span>
                </div>
              )
            )}
          </div>
        </>
      )}

      {error && (
        <>
          <span className="material-symbols-outlined text-error text-5xl mb-4">
            error_outline
          </span>
          <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
            生成失败
          </h3>
          <p className="text-xs text-error/70 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-lg bg-surface-container-highest border border-outline-variant/20 text-on-surface text-[10px] font-bold uppercase tracking-widest hover:border-primary/30 transition-all"
          >
            返回修改文案
          </button>
        </>
      )}
    </div>
  );
}
