import Link from 'next/link';

export default function ShowcaseSection() {
  return (
    <section id="showcase" className="px-6 py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4">应用场景展示</h2>
            <p className="text-on-surface-variant">探索 Auteur Studio 在不同领域的创作潜力。</p>
          </div>
          <Link className="text-primary flex items-center gap-2 hover:gap-4 transition-all font-bold" href="/library">
            Learn More <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Case 1 */}
          <div className="relative group cursor-pointer overflow-hidden rounded-xl bg-surface-container-high border border-outline-variant/15">
            <div className="aspect-[16/10] overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="9:16 Social Media Video" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1tnlraVFGkt_zNxQ0pn0bbr4XVhdyAvN_cLoV0eT5MU3joj_D5NclXbHXXQqhSZEIiEKojbEAFFN4CtR02SvnGRnZutWhbs9Hm0MOeE4EGRm1yesiVmzxHsvrsic4C1tST41Elq4cRpg80bZ0-yafB-yDpCGNOhS99cNOGsqt6NF_ySyfvtaH-jzS1YgNq1PtCKW1HETYUo_uzNs5aQ5c8rqwUbkP9bjxGhCBTw_xmdJE7R384AEmXY1PdW2ZMDT0e9oc8aIJ8Ec" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <span className="text-primary text-xs font-bold tracking-widest uppercase mb-2 block">Case Study</span>
              <h3 className="text-3xl font-headline font-bold mb-4">9:16 自媒体短视频</h3>
              <p className="text-on-surface-variant max-w-sm mb-6">为抖音、视频号、TikTok 打造的高转化率视觉内容，AI 自动抓取节奏。 </p>
            </div>
          </div>
          {/* Case 2 */}
          <div className="relative group cursor-pointer overflow-hidden rounded-xl bg-surface-container-high border border-outline-variant/15">
            <div className="aspect-[16/10] overflow-hidden">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="16:9 Algorithm Visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8HoleHXzU1Wdg039Nehp4AZLOoD2ZXMezUyTIyMq7R4yFmeu1hWNceZG6EIh-lgyPVF8s93igtiVDc7HpoUDRQrkYMzAj1hLXBJ_asLJfnzwwL_QMkvPC4_nJWoo21UlA02-ccDoINDVQxhfgPN82XsAM49P_S3dYt_Po5di-EAVXS1j5-eo4NAzMM0781tZXbXCOOjtxmUgjG4-qrpucMcLoVCYpDj1BFFMqjOyyCa9vI8mJonq0JQkRiFLsinBnmF5tZvmQgOk" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <span className="text-secondary text-xs font-bold tracking-widest uppercase mb-2 block">Case Study</span>
              <h3 className="text-3xl font-headline font-bold mb-4">16:9 算法可视化</h3>
              <p className="text-on-surface-variant max-w-sm mb-6">将枯燥的数据与复杂的逻辑转化为震撼的视听语言，适合技术演示。 </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
