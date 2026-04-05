import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="w-full max-w-md mt-16 mb-24 z-10">
      {/* Auth Card */}
      <div className="bg-surface-container-low/60 p-8 md:p-10 rounded-xl border border-outline-variant/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Top Accent Glow */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-2">创建账号</h1>
          <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest">The Digital Auteur Ecosystem</p>
        </div>
        
        {/* Form */}
        <form className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-xs font-semibold text-primary uppercase tracking-tighter block ml-1">用户名</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">person</span>
              <input 
                type="text" 
                id="username" 
                className="w-full bg-surface-container-highest border-transparent focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface py-3.5 pl-12 pr-4 rounded-lg transition-all outline-none text-sm placeholder:text-outline-variant/50 font-body" 
                placeholder="输入您的创作代号" 
              />
            </div>
          </div>

          {/* Email/Phone */}
          <div className="space-y-2">
            <label htmlFor="account" className="text-xs font-semibold text-primary uppercase tracking-tighter block ml-1">邮箱 / 手机号</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">alternate_email</span>
              <input 
                type="text" 
                id="account" 
                className="w-full bg-surface-container-highest border-transparent focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface py-3.5 pl-12 pr-4 rounded-lg transition-all outline-none text-sm placeholder:text-outline-variant/50 font-body" 
                placeholder="用于接收验证通知" 
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-semibold text-primary uppercase tracking-tighter block ml-1">设置密码</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">lock</span>
              <input 
                type="password" 
                id="password" 
                className="w-full bg-surface-container-highest border-transparent focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface py-3.5 pl-12 pr-4 rounded-lg transition-all outline-none text-sm placeholder:text-outline-variant/50 font-body" 
                placeholder="建议包含字母与数字" 
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirm_password" className="text-xs font-semibold text-primary uppercase tracking-tighter block ml-1">确认密码</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">verified_user</span>
              <input 
                type="password" 
                id="confirm_password" 
                className="w-full bg-surface-container-highest border-transparent focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface py-3.5 pl-12 pr-4 rounded-lg transition-all outline-none text-sm placeholder:text-outline-variant/50 font-body" 
                placeholder="请再次输入密码" 
              />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 py-2 px-1">
            <div className="flex items-center h-5">
              <input 
                type="checkbox" 
                id="terms" 
                className="w-4 h-4 rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 focus:ring-offset-background selection:bg-transparent transition-colors mt-0.5 cursor-pointer" 
              />
            </div>
            <label htmlFor="terms" className="text-xs leading-normal text-on-surface-variant font-label cursor-pointer select-none">
              我已阅读并同意 <Link href="#" className="text-primary hover:underline transition-all">服务协议</Link> 和 <Link href="#" className="text-primary hover:underline transition-all">隐私政策</Link>
            </label>
          </div>

          {/* Action Button */}
          <Link href="/studio" className="block w-full">
            <button 
              type="button" 
              className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold py-3.5 rounded-lg shadow-[0_0_20px_rgba(153,247,255,0.15)] hover:shadow-[0_0_30px_rgba(153,247,255,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group"
            >
              <span>创建账号</span>
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </Link>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center border-t border-outline-variant/10 pt-6">
          <p className="text-sm text-on-surface-variant font-body">
            已有账号？ 
            <Link href="/login" className="text-secondary hover:text-primary transition-colors font-medium ml-1">立即登录</Link>
          </p>
        </div>
      </div>

      {/* Meta Info / Decoration */}
      <div className="mt-12 flex justify-between items-center opacity-30 select-none pointer-events-none">
        <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
        <div className="px-4 font-headline text-[10px] tracking-[0.4em] uppercase text-outline-variant">Auteur Identity Protocol v4.0.1</div>
        <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
      </div>
    </main>
  );
}
