import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import { STAGE_PALETTES, type StageThemeId } from "@/code-stage/stage-themes";

const THEME_CARDS: Array<{
  id: StageThemeId;
  name: string;
  badge: string;
  description: string;
}> = [
  {
    id: "dracula",
    name: "Dracula（默认）",
    badge: "紫粉暗夜",
    description: "经典 Dracula 深紫灰画布 + 紫粉荧光焦点条，高辨识度极客美学。",
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    badge: "深海青蓝",
    description: "东京暗夜深蓝底色搭配清爽青蓝高亮，适合硬核工程与系统架构讲解。",
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    badge: "极简开源",
    description: "贴近 GitHub 源码阅读体验的中性深灰配色，适合开源项目与 PR 拆解。",
  },
  {
    id: "catppuccin-mocha",
    name: "Catppuccin Mocha",
    badge: "柔和粉彩",
    description: "低对比柔和莫兰迪暗色调，长时间观看不刺眼，适合长篇语法教程。",
  },
  {
    id: "one-dark-pro",
    name: "One Dark Pro",
    badge: "经典 IDE",
    description: "VS Code 装机量第一的经典均衡暗色主题，语法层次清晰分明。",
  },
];

export default function TemplatesPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-on-surface">
      <SideNavBar />

      <main className="flex-1 overflow-y-auto p-8 z-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <header className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-primary uppercase tracking-widest">
                HyperFrames Stage Themes
              </div>
              <h1 className="text-3xl font-bold font-headline mt-1">舞台配色与视频模板中心</h1>
              <p className="text-sm text-on-surface-variant mt-1">
                所有主题同时驱动 CodeStage（语法演进）与 AlgoStage（算法沙箱）的整套舞台色板与 Shiki 高亮。
              </p>
            </div>
            <Link
              href="/code-studio"
              className="px-4 py-2 rounded-xl primary-gradient text-on-primary-fixed text-xs font-bold hover:opacity-90 transition shrink-0"
            >
              前往代码工坊
            </Link>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {THEME_CARDS.map((card) => {
              const p = STAGE_PALETTES[card.id];
              return (
                <div
                  key={card.id}
                  className="rounded-2xl border border-white/10 bg-surface-container/80 overflow-hidden flex flex-col hover:border-primary/40 transition"
                >
                  {/* 真实色板微缩舞台预览 */}
                  <div
                    className="h-44 p-4 flex flex-col justify-between relative overflow-hidden"
                    style={{
                      background: `radial-gradient(240px 140px at 18% 15%, ${p.glow1}, transparent 70%), radial-gradient(220px 140px at 85% 90%, ${p.glow2}, transparent 70%), linear-gradient(180deg, ${p.canvasBg} 0%, ${p.canvasBgEnd} 100%)`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                        style={{ background: p.focusBg, color: p.primary, border: `1px solid ${p.primary}` }}
                      >
                        {card.badge}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[p.primary, p.secondary, p.success, p.warn].map((hex) => (
                          <span
                            key={hex}
                            className="w-3 h-3 rounded-full border border-black/30"
                            style={{ background: hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* 微缩代码编辑器卡片 */}
                    <div
                      className="rounded-xl p-3 font-mono text-[11px] leading-relaxed shadow-lg"
                      style={{ background: p.panelBg, border: `1px solid ${p.border}`, color: p.text }}
                    >
                      <div style={{ color: p.muted }}>{"// " + card.id}</div>
                      <div>
                        <span style={{ color: p.secondary }}>function</span>{" "}
                        <span style={{ color: p.success }}>solve</span>
                        <span>(nums) {"{"}</span>
                      </div>
                      <div
                        className="px-1.5 rounded -mx-1.5"
                        style={{ background: p.focusBg, borderLeft: `2px solid ${p.secondary}` }}
                      >
                        <span style={{ color: p.primary }}>return</span> nums.length;
                      </div>
                      <div>{"}"}</div>
                    </div>
                  </div>

                  {/* 卡片信息与操作 */}
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div>
                      <h2 className="text-base font-bold font-headline">{card.name}</h2>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{card.description}</p>
                    </div>
                    <div className="mt-auto pt-2 flex gap-2">
                      <Link
                        href={`/code-studio?theme=${card.id}&mode=code-stage`}
                        className="flex-1 text-center py-2 rounded-xl primary-gradient text-on-primary-fixed text-xs font-bold hover:opacity-90 transition"
                      >
                        用于语法视频
                      </Link>
                      <Link
                        href={`/code-studio?theme=${card.id}&mode=algo-stage`}
                        className="flex-1 text-center py-2 rounded-xl bg-surface-container-high border border-white/10 hover:border-primary/40 text-xs font-bold text-on-surface transition"
                      >
                        用于算法动画
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
