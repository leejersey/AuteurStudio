import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="w-full max-w-md mt-16 mb-16 z-10">
      {/* Auth Card */}
      <div className="bg-surface-container-low/60 p-8 md:p-10 rounded-xl border border-outline-variant/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Top Accent Glow */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">欢迎回来</h1>
          <p className="text-on-surface-variant text-sm font-body">启动您的数字创作引擎</p>
        </div>

        {/* Login Form */}
        <form className="space-y-6">
          {/* Account Input */}
          <div className="space-y-2">
            <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant ml-1">账号 / 手机号</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">person</span>
              <input 
                type="text" 
                className="w-full bg-surface-container-highest border-transparent focus:border-primary focus:ring-1 focus:ring-primary/20 py-3 pl-12 pr-4 rounded-lg text-on-surface placeholder:text-outline-variant/50 transition-all font-body text-sm outline-none" 
                placeholder="输入您的账号" 
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant">密码</label>
              <Link href="#" className="text-xs text-primary hover:text-primary-dim transition-colors">忘记密码？</Link>
            </div>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">lock</span>
              <input 
                type="password" 
                className="w-full bg-surface-container-highest border-transparent focus:border-primary focus:ring-1 focus:ring-primary/20 py-3 pl-12 pr-12 rounded-lg text-on-surface placeholder:text-outline-variant/50 transition-all font-body text-sm outline-none" 
                placeholder="••••••••" 
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors flex items-center">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 px-1 py-1">
            <input 
              type="checkbox" 
              id="remember" 
              className="w-4 h-4 rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 focus:ring-offset-background selection:bg-transparent transition-colors" 
            />
            <label htmlFor="remember" className="text-sm text-on-surface-variant font-body select-none cursor-pointer">记住我</label>
          </div>

          {/* Submit Button */}
          <Link href="/studio" className="block w-full">
            <button 
              type="button" 
              className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold py-3.5 rounded-lg shadow-[0_0_20px_rgba(153,247,255,0.15)] hover:shadow-[0_0_30px_rgba(153,247,255,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <span>登录</span>
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">login</span>
            </button>
          </Link>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-outline-variant/30"></div>
          <span className="text-[10px] uppercase tracking-widest text-outline-variant">使用第三方账号登录</span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-outline-variant/30"></div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-3 gap-4">
          <button className="flex items-center justify-center py-3 bg-surface-container-highest rounded-lg border border-outline-variant/10 hover:bg-surface-container-high hover:border-outline-variant/30 transition-all group">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNIGAIeUYqvkqLaUsC42gCzDZPtth_2jkOtcev5Mq6svXKTltkK0vzwGluVLhxWzyio3-FouN9kT-MXieKNwX11-PmIO9LS4R07cSS0cm3UlrIDteQWHAddtcKdW10laScwSU0mI0gr3UcQjU4SGY7BNrEnchBrnQ-SYMYUk27fYQMSgEvaGd-x1YEivfsHbJnHYnEpVvSfcUeTJPa6FvPWKetvmVAG_Jj67edwVhceJQQVa9pj0ZUvqGvqnfKXD1v4x5m5alz2Wc" alt="GitHub" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </button>
          <button className="flex items-center justify-center py-3 bg-surface-container-highest rounded-lg border border-outline-variant/10 hover:bg-surface-container-high hover:border-outline-variant/30 transition-all group">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoR7c9wNtCW6ggWiVRevB5jyDjCZMJNPvVPQCimVA7uMeSnjpQuYnxKvOrT2GuaNlWbToCpkfX4QvP8ZUHnIfpM3UdggWlPFYoSlsy9jZIVwfz-bA1m67-u0xsa4J_TzsO7G_dAyfayTL4AP37SRQ_3oEhawPLmG7MTLd_NmdUAkQExSKBkJhk8KIYBzBk1gLDq9DFiD4znyOZZ4_7GHWm4PtTmBNXaUqD3v8o_ZryXPmY8YbldBcSUbPiPt3hcfQmx5cjJIIjhFw" alt="Google" className="w-5 h-5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
          </button>
          <button className="flex items-center justify-center py-3 bg-surface-container-highest rounded-lg border border-outline-variant/10 hover:bg-surface-container-high hover:border-outline-variant/30 transition-all group">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSecUbbCAkVseFvPN5FbgSRI60nyB34wpkSyA-Kr-dTZzU4sR-DjZ8FuKuZqnFAxknAGEU8xBnK4X8UN6jJKLhavNFBy5uLAZ-3jlsFV6JkPaEgDZR68RM6mhUuFRnWDB7jXU0iX0wdykp4xoqg7bocnyEdnmc7elliZjEEN0PxwWU12VqVEwzsKk1NV9Dv5SKSWHxOduhaV4AwMhpwGwNwhjo2D_4dFu2_BSXNd6qEElX7pp2wAjZ70JZOk3j2x9O2_pd790YkYE" alt="Discord" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Footer Link */}
        <div className="mt-10 text-center">
          <p className="text-on-surface-variant text-sm font-body">
            还没有账号？ <Link href="/register" className="text-primary font-semibold hover:underline underline-offset-4 transition-all">立即注册</Link>
          </p>
        </div>
      </div>

    </main>
  );
}
