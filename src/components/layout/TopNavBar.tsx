export default function TopNavBar({
  title = "未命名视频",
  showAuteurLogo = false,
}: {
  title?: string;
  showAuteurLogo?: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-6 w-full bg-surface-container-highest/20 backdrop-blur-2xl h-16 border-b border-white/5 shadow-[0_4px_32px_rgba(0,0,0,0.3)] font-body">
      <div className="flex items-center gap-6">
        {showAuteurLogo ? (
          <div className="text-lg font-black text-primary font-headline">
            Auteur Studio
          </div>
        ) : (
          <div className="text-lg font-black text-primary font-headline tracking-tighter">
            灵感制片厂
          </div>
        )}
        <div className="h-4 w-px bg-outline-variant/30"></div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <span className="text-on-surface/70 hover:text-primary transition-colors cursor-pointer">
            项目
          </span>
          <span className="material-symbols-outlined text-xs text-on-surface/30">
            chevron_right
          </span>
          <span className="text-primary font-bold border-b border-primary">
            {title}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-4">
          <span
            className="material-symbols-outlined text-primary text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            cloud_done
          </span>
          {!showAuteurLogo && (
            <span className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold hidden sm:inline">
              已保存至云端
            </span>
          )}
          {showAuteurLogo && (
            <span className="material-symbols-outlined text-on-surface/70 hover:text-primary transition-colors cursor-pointer">
              notifications
            </span>
          )}
        </div>
        <button className="px-4 py-1.5 text-xs lg:text-sm font-bold text-on-surface/70 hover:text-primary transition-all rounded bg-transparent hover:bg-surface-container-highest">
          分享
        </button>
        <button className="px-5 py-1.5 lg:px-6 bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed text-xs lg:text-sm font-black uppercase rounded-xl shadow-[0_0_20px_rgba(153,247,255,0.3)] hover:shadow-[0_0_30px_rgba(153,247,255,0.6)] hover:scale-105 active:scale-95 transition-all outline-none tracking-wider">
          导出{showAuteurLogo ? "" : "视频"}
        </button>
        {!showAuteurLogo && (
          <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center overflow-hidden ml-2">
            <img
              alt="User Profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFOKUAQ6demUNRy0fiQvnWiFGxyt0zbnVF4PBR0IgiGnS-LWo4gq3XghKy-Cn70cuatDI3vpnU48fal_24fOI3ez7Ik5vmzDovpnactbTxjhDpli8fs2PTetne5oo4VEnA3nCGdqQBZO-O5ZYjp6d9l8VzYSq2s-785qnjeazUmMtAAZE7R0HAGjr42weRAAshrS8CXndh-jneSjdqtFCF8gnndLexH4rCqVYGoR-R9_JZl-ttNUDoTuV1ptpJEGIpxrc7b8HkmrE"
            />
          </div>
        )}
      </div>
    </header>
  );
}
