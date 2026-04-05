import TopNavBar from "@/components/layout/TopNavBar";
import SideNavBar from "@/components/layout/SideNavBar";
import Link from "next/link";

const ALL_TEMPLATES = [
  {
    id: "dark-tech",
    name: "暗黑科技",
    description: "深色背景 + 科技感光效 + 网格纹理",
    thumbnail: "linear-gradient(135deg, #0b0e14 0%, #161a21 40%, #00e2ee22 100%)",
    videoTypes: ["图文视频 (9:16)", "算法动画 (16:9)", "知识讲解 (16:9)", "Markdown (16:9)"],
  },
  {
    id: "minimal-white",
    name: "极简白色",
    description: "白色背景 + 衬线标题 + 卡片式排版，适合干净专业的内容呈现",
    thumbnail: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 50%, #3b82f615 100%)",
    videoTypes: ["图文视频 (9:16)", "算法动画 (16:9)", "知识讲解 (16:9)", "Markdown (16:9)"],
  },
];

export default function TemplatesPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideNavBar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavBar title="模板中心" />
        
        <main className="flex-1 overflow-y-auto bg-background p-8 font-body">
          <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-on-surface font-headline flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_awesome_motion</span>
              视频模板库
            </h1>
            <p className="text-sm text-on-surface-variant mt-2">
              在这里浏览并管理可用的视频渲染模板。选择模板开始创作你想要的风格。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-surface-container-low border border-outline-variant/15 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 group flex flex-col"
              >
                {/* 封面 */}
                <div
                  className="h-48 w-full relative"
                  style={{ background: tpl.thumbnail }}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  
                  {/* 模拟排版预览图 */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {tpl.id === "dark-tech" ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-2 rounded bg-white/30" />
                        <div className="w-24 h-3 rounded bg-white/40" />
                        <div className="w-12 h-1.5 rounded bg-cyan-400/50 mt-2" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-4 p-8 w-full h-full justify-center">
                        <div className="w-16 h-3 rounded bg-gray-900/30" />
                        <div className="w-12 h-1 rounded bg-blue-500/40" />
                        <div className="w-24 h-2 rounded bg-gray-900/15" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 内容 */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-on-surface mb-2">{tpl.name}</h3>
                  <p className="text-sm text-on-surface-variant/80 mb-4 line-clamp-2">
                    {tpl.description}
                  </p>

                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {tpl.videoTypes.map((type, index) => (
                         <span key={index} className="text-[10px] px-2 py-1 rounded bg-surface-container-high text-on-surface-variant border border-outline-variant/10">
                           {type}
                         </span>
                      ))}
                    </div>

                    <Link
                      href="/studio"
                      className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      使用此模板创作
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 即将推出占位 */}
            <div className="bg-surface-container-low border border-dashed border-outline-variant/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-70 min-h-[350px]">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl text-on-surface-variant">hourglass_empty</span>
              </div>
              <p className="text-on-surface font-bold mb-1">更多模板正在开发中</p>
              <p className="text-sm text-on-surface-variant">敬请期待更多风格组合</p>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
