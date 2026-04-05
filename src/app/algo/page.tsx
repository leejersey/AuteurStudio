import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import AlgoGrid from "@/components/algo/AlgoGrid";
import CodeHighlight from "@/components/algo/CodeHighlight";
import StepDescription from "@/components/algo/StepDescription";
import NarrationBar from "@/components/algo/NarrationBar";

export default function AlgoVisPage() {
  return (
    <div className="flex h-screen w-full">
      <SideNavBar />

      <main className="flex-1 flex flex-col min-w-0 relative h-screen bg-background overflow-hidden">
        <TopNavBar title="未命名视频" showAuteurLogo />

        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          <div className="flex-[2] flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-headline text-xl font-bold tracking-tight text-on-surface">
                LeetCode 994 - 腐烂的橘子 (BFS 算法可视化)
              </h1>
              <div className="flex gap-2 items-center bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/10">
                <div className="w-2 h-2 rounded-full bg-primary pulse-primary"></div>
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                  实时渲染
                </span>
              </div>
            </div>

            <AlgoGrid />
          </div>

          <aside className="w-80 flex flex-col gap-4">
            <StepDescription />
            <CodeHighlight />
          </aside>
        </div>

        <NarrationBar />
      </main>
    </div>
  );
}
