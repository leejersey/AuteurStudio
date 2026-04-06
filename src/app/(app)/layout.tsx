import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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
  title: "灵感制片厂 | Auteur Studio",
  description: "AI 创意套件",
};

export default function RootLayout({
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
      <body className="h-screen flex flex-col overflow-hidden bg-background text-on-surface">
        {/* 全局环境光晕 (Ambient Glow) — 用 fixed 定位，不参与 flex 布局 */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-primary/5 blur-[120px] mix-blend-screen animate-[aurora-1_20s_ease-in-out_infinite_alternate]"></div>
          <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-secondary/5 blur-[100px] mix-blend-screen animate-[aurora-2_25s_ease-in-out_infinite_alternate]"></div>
        </div>
        {/* children 直接参与 body 的 flex 布局，不额外包裹 */}
        {children}
      </body>
    </html>
  );
}
