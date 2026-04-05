"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function SideNavBar() {
  const pathname = usePathname();

  const navItems = [
    { icon: "add_box", label: "新建视频", href: "/studio" },
    { icon: "video_library", label: "媒体库", href: "/library" },
    { icon: "movie_creation", label: "导出中心", href: "/export" },
    { icon: "auto_awesome_motion", label: "模板", href: "/templates" },
    { icon: "settings", label: "设置", href: "/settings" },
  ];

  return (
    <aside className="h-screen w-64 border-r border-outline-variant/15 bg-background flex flex-col overflow-y-auto z-50 font-body">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center text-on-primary-fixed">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            movie_filter
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tighter font-headline">
            Auteur Studio
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold">
            AI 创意套件
          </p>
        </div>
      </div>
      <nav className="flex-1 px-4 mt-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "text-primary bg-surface-container-high border-r-2 border-primary rounded-r-none"
                  : "text-on-surface/60 hover:bg-surface-container-high hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4">
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-primary/20 shrink-0">
              <img
                alt="陈子昂"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnlJTl14qvSDXRMgo0TjaoIoRkwazSM1kLL4kl7UKOFuNsV6gkMIsh_NmEBA5sJuMPPwPVOCNpmHHph1lYl3DdxrmnSJW9PL9k2_NN6k7NgQhNLvVFEgbTVwbQwlQjsykXLtJuDcg_zecwA8VZF4eIsRXMEujCYIFcwgvCD3jedTAm0RBIFqmfujSYqjyQ3fA_LHSCkcppYP00AYQLT9kJrF8WpT3Fb9gO7g5531mEfI_rsiLOfWBWDjZCMYse180HbZ67591THiY"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">陈子昂</p>
              <p className="text-[10px] text-on-surface-variant truncate">
                专业版计划
              </p>
            </div>
          </div>
          <button className="w-full py-2 bg-primary text-on-primary-fixed text-sm font-bold rounded-lg primary-gradient active:scale-95 transition-transform shadow-[0_0_20px_rgba(153,247,255,0.2)]">
            新建项目
          </button>
        </div>
      </div>
    </aside>
  );
}
