import Link from "next/link";

export default function LandingFooter() {
  return (
    <>
      {/* Final CTA */}
      <section className="px-6 py-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-primary/10 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-4xl mx-auto text-center border border-outline-variant/20 rounded-2xl p-12 md:p-24 bg-[#161a21]/60 backdrop-blur-[20px]">
          <h2 className="font-headline text-4xl md:text-6xl font-bold mb-8">开启您的 Auteur 创作之旅</h2>
          <p className="text-on-surface-variant text-xl mb-12">现在加入，体验 AI 驱动下的全新创作自由。首月订阅享 7 折优惠。</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/studio">
              <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed px-12 py-5 rounded-lg font-bold text-xl active:scale-95 duration-200 shadow-[0_0_20px_rgba(153,247,255,0.15)]">
                立即体验
              </button>
            </Link>
            <button className="text-on-surface hover:text-primary transition-colors text-lg font-medium flex items-center gap-2">
              联系商务合作 <span className="material-symbols-outlined">trending_flat</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-outline-variant/15 bg-background">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-12 gap-8 max-w-[1920px] mx-auto">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="text-lg font-bold text-primary">Auteur Studio</div>
            <div className="text-on-background/50 font-body text-sm tracking-wide">© 2024 Auteur Studio. The Digital Auteur.</div>
          </div>
          <div className="flex gap-8 font-body text-sm tracking-wide">
            <Link className="text-on-background/50 hover:text-secondary transition-all" href="#">Privacy Policy</Link>
            <Link className="text-on-background/50 hover:text-secondary transition-all" href="#">Terms of Service</Link>
            <Link className="text-on-background/50 hover:text-secondary transition-all" href="#">Twitter</Link>
            <Link className="text-on-background/50 hover:text-secondary transition-all" href="#">Discord</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
