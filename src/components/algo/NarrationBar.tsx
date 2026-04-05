export default function NarrationBar() {
  return (
    <footer className="h-24 bg-surface-container-high/80 backdrop-blur-xl border-t border-outline-variant/10 flex items-center px-8 gap-8">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          graphic_eq
        </span>
      </div>
      <div className="flex-1">
        <p className="text-on-surface font-medium text-lg tracking-tight">
          “现在腐烂开始向相邻的橘子扩散...”
        </p>
        <div className="mt-2 h-1 w-full bg-surface-container rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1">
          <div className="w-0.5 h-4 bg-primary animate-pulse"></div>
          <div
            className="w-0.5 h-6 bg-primary animate-pulse"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-0.5 h-3 bg-primary animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-0.5 h-5 bg-primary animate-pulse"
            style={{ animationDelay: "0.3s" }}
          ></div>
          <div
            className="w-0.5 h-4 bg-primary animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
        <div className="text-[10px] font-black text-on-surface-variant tracking-widest uppercase">
          音轨：火山引擎 AI-音色-4
        </div>
      </div>
    </footer>
  );
}
