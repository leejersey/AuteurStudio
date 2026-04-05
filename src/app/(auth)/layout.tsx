import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auteur Studio | Identity",
  description: "Login to Auteur Studio",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`dark ${inter.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-body min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container antialiased">
        
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          {/* Digital Grid Texture */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: "linear-gradient(#99F7FF 1px, transparent 1px), linear-gradient(90deg, #99F7FF 1px, transparent 1px)", backgroundSize: "60px 60px" }}
          ></div>
          {/* Light Leaks */}
          <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] bg-secondary/10 blur-[150px] rounded-full"></div>
        </div>

        {/* Minimal Header */}
        <header className="fixed top-0 w-full flex justify-between items-center px-8 py-6 max-w-7xl mx-auto z-50 left-1/2 -translate-x-1/2">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-[#99F7FF] font-headline">
            Auteur Studio
          </Link>
          <div className="hidden md:flex gap-8">
            <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-sm tracking-wide" href="/">返回首页</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-sm tracking-wide" href="/">联系我们</Link>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 w-full">
          {children}
        </div>

        {/* Footer Information */}
        <footer className="w-full flex justify-center items-center gap-8 px-8 py-6 text-xs tracking-wide uppercase text-on-surface-variant font-body z-10">
          <span>© 2024 Auteur Studio. The Digital Auteur.</span>
          <div className="hidden sm:flex gap-4">
            <a className="hover:text-primary transition-colors duration-200" href="#">Terms of Service</a>
            <a className="hover:text-primary transition-colors duration-200" href="#">Privacy Policy</a>
          </div>
        </footer>

      </body>
    </html>
  );
}
