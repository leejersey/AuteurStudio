export default function AlgoGrid() {
  return (
    <div className="relative w-full aspect-video bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden shadow-2xl flex items-center justify-center group">
      {/* Algorithmic Grid */}
      <div className="grid grid-cols-5 gap-3 p-12 w-full h-full max-w-2xl max-h-[80%]">
        {/* Row 0 */}
        <div className="aspect-square rounded-lg border border-primary/40 bg-secondary-container/20 flex items-center justify-center relative overflow-hidden group-hover:border-primary transition-colors shadow-[0_0_15px_rgba(172,138,255,0.1)]">
          <span
            className="material-symbols-outlined text-4xl text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
          <div className="absolute inset-0 bg-secondary/10 pointer-events-none"></div>
        </div>
        <div className="aspect-square rounded-lg border border-primary/60 bg-primary/10 flex items-center justify-center relative ring-2 ring-primary ring-offset-4 ring-offset-background animate-pulse">
          <span
            className="material-symbols-outlined text-4xl text-orange-400"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
          <div className="absolute bottom-1 right-1 text-[8px] font-black text-primary opacity-60">
            NEW ROT
          </div>
        </div>
        <div className="aspect-square rounded-lg border border-outline-variant/10 bg-surface-container-low/50 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">
            close
          </span>
        </div>
        <div className="aspect-square rounded-lg border border-outline-variant/30 bg-surface-container-low flex items-center justify-center">
          <span
            className="material-symbols-outlined text-4xl text-orange-400"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            eco
          </span>
        </div>
        <div className="aspect-square rounded-lg border border-outline-variant/30 bg-surface-container-low flex items-center justify-center">
          <span
            className="material-symbols-outlined text-4xl text-orange-400"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            eco
          </span>
        </div>
        {/* Row 1 (The spread row) */}
        <div className="aspect-square rounded-lg border border-primary/60 bg-primary/10 flex items-center justify-center relative ring-2 ring-primary ring-offset-4 ring-offset-background animate-pulse">
          <span
            className="material-symbols-outlined text-4xl text-orange-400"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
          <div className="absolute -top-1 -left-1 text-[8px] font-black text-primary bg-background px-1 border border-primary/40">
            STEP 3
          </div>
        </div>
        <div className="aspect-square rounded-lg border border-outline-variant/10 bg-surface-container-low/50 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">
            close
          </span>
        </div>
        <div className="aspect-square rounded-lg border border-outline-variant/30 bg-surface-container-low flex items-center justify-center">
          <span
            className="material-symbols-outlined text-4xl text-orange-400"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            eco
          </span>
        </div>
        <div className="aspect-square rounded-lg border border-outline-variant/30 bg-surface-container-low flex items-center justify-center">
          <span
            className="material-symbols-outlined text-4xl text-orange-400"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            eco
          </span>
        </div>
        <div className="aspect-square rounded-lg border border-outline-variant/30 bg-surface-container-low flex items-center justify-center">
          <span
            className="material-symbols-outlined text-4xl text-orange-400"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            eco
          </span>
        </div>
        {/* Row 2 */}
        <div className="aspect-square rounded-lg border border-outline-variant/30 bg-surface-container-low flex items-center justify-center">
          <span
            className="material-symbols-outlined text-4xl text-orange-400"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            eco
          </span>
        </div>
        <div className="aspect-square rounded-lg border border-outline-variant/30 bg-surface-container-low flex items-center justify-center">
          <span
            className="material-symbols-outlined text-4xl text-orange-400"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            eco
          </span>
        </div>
        <div className="aspect-square rounded-lg border border-outline-variant/30 bg-surface-container-low flex items-center justify-center">
          <span
            className="material-symbols-outlined text-4xl text-orange-400"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            eco
          </span>
        </div>
        <div className="aspect-square rounded-lg border border-outline-variant/10 bg-surface-container-low/50 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">
            close
          </span>
        </div>
        <div className="aspect-square rounded-lg border border-outline-variant/30 bg-surface-container-low flex items-center justify-center">
          <span
            className="material-symbols-outlined text-4xl text-orange-400"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            eco
          </span>
        </div>
      </div>

      {/* Overlay UI Elements */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <div className="px-4 py-1.5 bg-surface-container/60 backdrop-blur-md rounded border border-outline-variant/10 text-on-surface text-xs font-medium">
          队列: <span className="text-primary font-bold">[(1,0), (0,1)]</span>
        </div>
        <div className="px-4 py-1.5 bg-surface-container/60 backdrop-blur-md rounded border border-outline-variant/10 text-on-surface text-xs font-medium">
          时间: <span className="text-secondary font-bold">3 分钟</span>
        </div>
      </div>
    </div>
  );
}
