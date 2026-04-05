"use client";

import { useState } from "react";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";

const TABS = [
  { id: "profile", label: "个人资料", icon: "person" },
  { id: "apis", label: "模型服务", icon: "key" },
  { id: "preferences", label: "视频偏好", icon: "movie" },
  { id: "billing", label: "订阅计划", icon: "credit_card" },
] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]["id"]>("profile");
  
  // 模拟假加载/保存状态
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = () => {
    setIsSaving(true);
    setMessage("");
    setTimeout(() => {
      setIsSaving(false);
      setMessage("设置保存成功");
      setTimeout(() => setMessage(""), 3000);
    }, 1000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SideNavBar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavBar title="偏好设置" />
        
        <main className="flex-1 overflow-y-auto p-8 font-body">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
            
            {/* 左侧：垂直设置导航 */}
            <aside className="w-full md:w-64 shrink-0">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-on-surface font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">settings</span>
                  设置中心
                </h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  管理您的账号和工作空间偏好。
                </p>
              </div>
              
              <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
                {TABS.map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                       activeTab === tab.id
                         ? "bg-primary/10 text-primary font-bold shadow-[inset_2px_0_0_0_#99f7ff]"
                         : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                     }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* 右侧：设置内容区 */}
            <section className="flex-1 min-w-0">
              <div className="bg-surface-container-low border border-outline-variant/15 rounded-3xl p-8 relative overflow-hidden">
                {/* 装饰性背景光效 */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

                {/* --- 个人资料 --- */}
                {activeTab === "profile" && (
                  <div className="space-y-8 relative z-10">
                    <div>
                      <h2 className="text-lg font-bold text-on-surface mb-1">个人资料</h2>
                      <p className="text-sm text-on-surface-variant">管理您的公开信息和安全选项。</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="relative group cursor-pointer">
                        <div className="w-20 h-20 rounded-full bg-surface-container-highest overflow-hidden border-2 border-primary/20 transition-all group-hover:border-primary/50">
                          <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnlJTl14qvSDXRMgo0TjaoIoRkwazSM1kLL4kl7UKOFuNsV6gkMIsh_NmEBA5sJuMPPwPVOCNpmHHph1lYl3DdxrmnSJW9PL9k2_NN6k7NgQhNLvVFEgbTVwbQwlQjsykXLtJuDcg_zecwA8VZF4eIsRXMEujCYIFcwgvCD3jedTAm0RBIFqmfujSYqjyQ3fA_LHSCkcppYP00AYQLT9kJrF8WpT3Fb9gO7g5531mEfI_rsiLOfWBWDjZCMYse180HbZ67591THiY"
                            alt="头像"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <span className="material-symbols-outlined text-white">photo_camera</span>
                        </div>
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-sm text-on-surface rounded-lg transition-colors border border-outline-variant/20">
                          更换头像
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-6 max-w-lg">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">显示昵称</label>
                        <input
                          type="text"
                          defaultValue="陈子昂"
                          className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">电子邮箱</label>
                        <input
                          type="email"
                          defaultValue="creator@auteur.studio"
                          disabled
                          className="w-full bg-surface-container-highest border border-transparent rounded-xl px-4 py-3 text-sm text-on-surface-variant cursor-not-allowed"
                        />
                        <p className="text-[10px] text-on-surface-variant/70 mt-1">邮箱由第三方账号绑定，不可修改。</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 模型服务 --- */}
                {activeTab === "apis" && (
                  <div className="space-y-8 relative z-10">
                    <div>
                      <h2 className="text-lg font-bold text-on-surface mb-1">模型服务集成</h2>
                      <p className="text-sm text-on-surface-variant">配置外置大模型、TTS 以及搜索服务的 API Keys (本地加密存储)。</p>
                    </div>

                    <div className="grid gap-6 max-w-xl">
                      {/* DeepSeek */}
                      <div className="p-5 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-blue-400 text-sm">smart_toy</span>
                            </div>
                            <h3 className="font-bold text-sm text-on-surface">DeepSeek AI</h3>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20">已连接</span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">用于智能选题、大纲解析与爆款文案生成的核心语言模型。</p>
                        <input
                          type="password"
                          defaultValue="sk-deepseek-xxxxxxxxxxxxxxxxxx"
                          className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                          placeholder="sk-..."
                        />
                      </div>

                      {/* 火山引擎 TTS */}
                      <div className="p-5 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-indigo-400 text-sm">record_voice_over</span>
                            </div>
                            <h3 className="font-bold text-sm text-on-surface">火山引擎 TTS</h3>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-surface-container-high text-on-surface-variant border border-outline-variant/10">未配置</span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">用于生成自然、高质量的音色旁白，如不配置将使用默认合成策略。</p>
                        <div className="flex gap-2">
                           <input
                             type="text"
                             className="flex-1 bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                             placeholder="App ID"
                           />
                           <input
                             type="password"
                             className="flex-1 bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                             placeholder="Access Token"
                           />
                        </div>
                      </div>

                      {/* Tavily 搜索 */}
                      <div className="p-5 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-emerald-400 text-sm">travel_explore</span>
                            </div>
                            <h3 className="font-bold text-sm text-on-surface">Tavily Search Engine</h3>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20">已连接</span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">提供事实核查与最新资讯联网能力。</p>
                        <input
                          type="password"
                          defaultValue="tvly-xxxxxxxxxxxxxxxxxxxx"
                          className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                          placeholder="tvly-..."
                        />
                      </div>

                    </div>
                  </div>
                )}

                {/* --- 视频偏好 --- */}
                {activeTab === "preferences" && (
                  <div className="space-y-8 relative z-10">
                    <div>
                      <h2 className="text-lg font-bold text-on-surface mb-1">全局视频偏好</h2>
                      <p className="text-sm text-on-surface-variant">每次创建新项目时的默认选项。</p>
                    </div>

                    <div className="grid gap-8 max-w-lg">
                      {/* 默认画幅比例 */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">默认画幅比例</label>
                        <div className="grid grid-cols-2 gap-3">
                           <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-primary bg-primary/5 gap-2">
                              <div className="w-12 h-16 border-2 border-primary/50 rounded flex items-center justify-center">
                                 <span className="text-[10px] font-bold text-primary">9:16</span>
                              </div>
                              <span className="text-sm font-bold text-primary">竖屏 (Shorts/Reels)</span>
                           </button>
                           <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-outline-variant/10 bg-surface-container-lowest hover:border-outline-variant/30 gap-2 transition-colors">
                              <div className="w-16 h-10 border-2 border-on-surface-variant/30 rounded flex items-center justify-center">
                                 <span className="text-[10px] font-bold text-on-surface-variant">16:9</span>
                              </div>
                              <span className="text-sm font-bold text-on-surface-variant">横屏 (YouTube/Bili)</span>
                           </button>
                        </div>
                      </div>

                      {/* 渲染性能偏好 */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">导出分辨率 / 选项</label>
                        <select className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                          <option>1080p (高质量, 渲染较慢)</option>
                          <option>720p (预览级, 渲染极快)</option>
                          <option>4K (超清, 消耗额外算力)</option>
                        </select>
                      </div>

                      {/* 本地渲染加速 (Mock toggle) */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15">
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">浏览器本地 GPU 加速</h4>
                          <p className="text-xs text-on-surface-variant mt-1">使用 WebGL/WebGPU 提高实时预览帧率</p>
                        </div>
                        <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-background rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 订阅计划 --- */}
                {activeTab === "billing" && (
                  <div className="space-y-8 relative z-10">
                     <div>
                      <h2 className="text-lg font-bold text-on-surface mb-1">订阅计划</h2>
                      <p className="text-sm text-on-surface-variant">查看和管理您的计算力配额与套餐。</p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-surface-container-low to-primary/10 border border-primary/20 rounded-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-6 flex justify-end opacity-20 pointer-events-none">
                         <span className="material-symbols-outlined text-[100px] text-primary">diamond</span>
                       </div>
                       
                       <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                         <div className="space-y-2">
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 shadow-[0_0_10px_rgba(153,247,255,0.2)]">
                             Pro Plan
                           </div>
                           <h3 className="text-3xl font-headline font-bold text-on-surface">专业版计划</h3>
                           <p className="text-sm text-on-surface-variant">畅享无限制的 4K 导出与高级并发处理能力。</p>
                         </div>
                         <button className="px-5 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant/20 rounded-xl text-sm font-bold hover:bg-surface-container-high transition-colors">
                           管理账单
                         </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/15">
                        <div className="text-xs font-bold text-on-surface-variant uppercase mb-4 tracking-wider">本月云端视频时长配额</div>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-2xl font-bold text-on-surface">142</span>
                          <span className="text-sm text-on-surface-variant mb-1">/ 500 分钟</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[28%] rounded-full shadow-[0_0_10px_rgba(153,247,255,0.8)]"></div>
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/15">
                        <div className="text-xs font-bold text-on-surface-variant uppercase mb-4 tracking-wider">云端媒体存储容量</div>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-2xl font-bold text-on-surface">12.4</span>
                          <span className="text-sm text-on-surface-variant mb-1">/ 100 GB</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-secondary w-[12%] rounded-full shadow-[0_0_10px_rgba(202,196,204,0.8)]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {/* 底部保存条 */}
                <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                  <div className="h-5">
                    {message && (
                      <span className="text-xs font-bold text-primary flex items-center gap-1 animate-in fade-in slide-in-from-bottom-2">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        {message}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-primary text-on-primary-fixed text-sm font-bold rounded-xl primary-gradient active:scale-95 transition-all shadow-[0_0_20px_rgba(153,247,255,0.2)] disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                        保存中...
                      </>
                    ) : (
                      '保存更改'
                    )}
                  </button>
                </div>
              </div>
            </section>
            
          </div>
        </main>
      </div>
    </div>
  );
}
