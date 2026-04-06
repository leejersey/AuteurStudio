// src/remotion/TemplateThemeContext.tsx — 模板主题 React Context
// 让所有 Slide 组件通过 useTemplateTheme() 获取当前主题配置

import React, { createContext, useContext } from "react";
import type { TemplateTheme } from "./template-theme";

const TemplateThemeContext = createContext<TemplateTheme | null>(null);

interface ProviderProps {
  theme: TemplateTheme;
  children: React.ReactNode;
}

/**
 * 在 Composition 顶层包裹此 Provider，将 theme 注入给所有子组件
 */
export const TemplateThemeProvider: React.FC<ProviderProps> = ({
  theme,
  children,
}) => {
  return (
    <TemplateThemeContext.Provider value={theme}>
      {children}
    </TemplateThemeContext.Provider>
  );
};

/**
 * 在任何 Slide 组件中调用，获取当前 TemplateTheme
 * 如果在 Provider 外使用则抛出错误
 */
export function useTemplateTheme(): TemplateTheme {
  const ctx = useContext(TemplateThemeContext);
  if (!ctx) {
    throw new Error(
      "useTemplateTheme() must be used inside <TemplateThemeProvider>. " +
        "Ensure that your Composition wraps children with TemplateThemeProvider."
    );
  }
  return ctx;
}
