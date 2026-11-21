import Link from 'next/link';

export default function LandingNav() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0B0E14]/60 backdrop-blur-xl shadow-[0_0_40px_rgba(0,242,255,0.06)]">
      <div className="flex justify-between items-center px-12 py-6 max-w-[1920px] mx-auto">
        <div className="text-2xl font-bold tracking-tighter text-primary font-headline">Auteur Studio</div>
        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight">
          <Link className="text-primary border-b-2 border-primary pb-1 hover:text-primary transition-colors duration-300" href="/">Studio</Link>
          <Link className="text-on-background/70 hover:text-primary transition-colors duration-300" href="#features">Features</Link>
          <Link className="text-on-background/70 hover:text-primary transition-colors duration-300" href="#showcase">Showcase</Link>
          <Link className="text-on-background/70 hover:text-primary transition-colors duration-300" href="#pricing">Pricing</Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/export" className="text-on-background/70 font-headline hover:text-primary transition-all font-medium">
            导出中心
          </Link>
          <Link href="/code-studio">
            <button className="primary-gradient text-on-primary-fixed px-6 py-2 rounded-lg font-bold font-headline active:scale-95 duration-200">
              进入代码工坊
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
