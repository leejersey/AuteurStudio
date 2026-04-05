export default function WorkflowSection() {
  return (
    <section className="px-6 py-32 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="font-headline text-4xl md:text-6xl font-bold mb-6 tracking-tight">简单三步，释放无限可能</h2>
          <p className="text-on-surface-variant text-lg">从灵感到成品，只需简单的交互逻辑。</p>
        </div>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Connector line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent -translate-y-1/2 z-0"></div>
          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center border border-primary/50 text-primary font-headline text-2xl font-bold mb-8 group-hover:shadow-[0_0_30px_rgba(153,247,255,0.4)] transition-all">1</div>
            <h4 className="text-xl font-bold mb-4">输入创意</h4>
            <p className="text-on-surface-variant px-4">输入文本 Prompt 或上传核心素材，由 DeepSeek 解析语义逻辑。</p>
          </div>
          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center border border-secondary/50 text-secondary font-headline text-2xl font-bold mb-8 group-hover:shadow-[0_0_30px_rgba(172,138,255,0.4)] transition-all">2</div>
            <h4 className="text-xl font-bold mb-4">AI 智能排版</h4>
            <p className="text-on-surface-variant px-4">AI 自动匹配视觉风格、转场动画与背景音乐，生成预览工程。</p>
          </div>
          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center border border-tertiary/50 text-tertiary font-headline text-2xl font-bold mb-8 group-hover:shadow-[0_0_30px_rgba(255,111,247,0.4)] transition-all">3</div>
            <h4 className="text-xl font-bold mb-4">一键渲染导出</h4>
            <p className="text-on-surface-variant px-4">Remotion 渲染引擎介入，快速生成全平台兼容的专业级视频文件。</p>
          </div>
        </div>
      </div>
    </section>
  );
}
