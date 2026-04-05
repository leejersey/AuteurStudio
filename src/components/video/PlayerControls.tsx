export default function PlayerControls() {
  return (
    <div className="absolute bottom-8 left-12 right-12 glass-panel border border-outline-variant/10 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-primary">00:04.12</span>
        <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-[40%] bg-primary"></div>
          <div className="absolute top-0 left-[40%] h-full w-[2px] bg-white z-10 shadow-[0_0_10px_#fff]"></div>
        </div>
        <span className="text-[10px] font-mono text-on-surface-variant">
          00:15.00
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">
              skip_previous
            </span>
          </button>
          <button className="w-10 h-10 bg-primary text-on-primary-fixed rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">
              skip_next
            </span>
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">
              volume_up
            </span>
            <div className="w-16 h-1 bg-surface-container-highest rounded-full">
              <div className="w-[70%] h-full bg-on-surface-variant/40 rounded-full"></div>
            </div>
          </div>
          <div className="h-4 w-[1px] bg-outline-variant/20"></div>
          <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1 rounded-md">
            <span className="text-[10px] font-bold text-on-surface-variant">
              75%
            </span>
            <span className="material-symbols-outlined text-sm text-on-surface-variant">
              zoom_in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
