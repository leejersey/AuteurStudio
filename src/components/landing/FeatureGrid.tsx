export default function FeatureGrid() {
  return (
    <section id="features" className="px-6 py-24 bg-surface-container-low/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-8 rounded-xl bg-surface-container border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 group">
            <div className="mb-6 inline-flex p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
            </div>
            <h3 className="font-headline text-2xl font-bold mb-4">AI 对话驱动</h3>
            <p className="text-on-surface-variant leading-relaxed">
              无需复杂的工具栏，通过自然语言对话描述您的视觉需求，AI 将自动完成剪辑、调色与特效合成。
            </p>
          </div>
          {/* Feature 2 */}
          <div className="p-8 rounded-xl bg-surface-container border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 group">
            <div className="mb-6 inline-flex p-3 rounded-lg bg-secondary/10 text-secondary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>aspect_ratio</span>
            </div>
            <h3 className="font-headline text-2xl font-bold mb-4">双重创作模式</h3>
            <p className="text-on-surface-variant leading-relaxed">
              一键切换 9:16 短视频与 16:9 传统构图，基于智能算法自动重构画面，适配不同分发渠道。
            </p>
          </div>
          {/* Feature 3 */}
          <div className="p-8 rounded-xl bg-surface-container border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 group">
            <div className="mb-6 inline-flex p-3 rounded-lg bg-tertiary/10 text-tertiary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <h3 className="font-headline text-2xl font-bold mb-4">极速渲染 & 导出</h3>
            <p className="text-on-surface-variant leading-relaxed">
              基于 Remotion 云端渲染技术，复杂的工程文件可在秒级完成渲染，支持 4K HDR 无损导出。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
