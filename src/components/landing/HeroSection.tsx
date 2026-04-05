import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative px-6 pt-20 pb-32 md:pt-32 md:pb-48">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/15 text-primary text-xs font-bold tracking-widest uppercase mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Next-Gen Video Generation
        </div>
        <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter text-on-background mb-8 leading-[1.1]">
          Auteur Studio: <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-container to-secondary">对话即剪辑</span>
        </h1>
        <p className="font-body text-on-surface-variant text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed">
          基于 DeepSeek 驱动，结合 Remotion 渲染引擎，<br className="hidden md:block" />让创意瞬间化为真实。
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Link href="/studio">
            <button className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed px-10 py-4 rounded-lg font-bold text-lg active:scale-95 duration-200 shadow-[0_0_30px_rgba(153,247,255,0.3)]">
              立即免费开始
            </button>
          </Link>
          <button className="w-full md:w-auto px-10 py-4 rounded-lg font-bold text-lg border border-outline-variant/30 hover:border-primary/50 transition-all text-on-surface">
            观看演示
          </button>
        </div>
        {/* Abstract Hero Visual */}
        <div className="mt-24 relative max-w-5xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative rounded-xl overflow-hidden border border-outline-variant/15 bg-surface-container-low aspect-video">
            <img className="w-full h-full object-cover" alt="Futuristic digital video editing interface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCec9z2B5jN5dqtPpvhLg7XIwAdCAo89B15tMZh00bxcpt2KkbHPJls5gy3PxL__MGgsfVJmLswud3-RrIPFlDhfcN3QWuUl63Aagf0BIMSnax9jdW6QugLsigfouhXLhswHoqHosVPT2erHwEL7QZRsClucUERr6SlowRyOsDuAYp7Ih0UvHWRXF9E7D7A6DfWSNVFv8rCCHfIT0YsduXPZ3d3hoP25BOeyNchiYSf92C9kXQN9CnOUetvgLJW2s-N-cLiURWr5v4" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
              <div className="text-left">
                <div className="text-primary font-headline font-bold text-xl">Prompt Engineering</div>
                <div className="text-on-surface-variant text-sm">Active DeepSeek Context: v3.1</div>
              </div>
              <div className="flex gap-2">
                <div className="h-1 w-12 bg-primary rounded-full"></div>
                <div className="h-1 w-8 bg-outline-variant rounded-full"></div>
                <div className="h-1 w-8 bg-outline-variant rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
