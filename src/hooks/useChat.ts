"use client";

import { useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  time: string;
  videoData?: unknown;
  videoType?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      content: string,
      videoType: "card" | "landscape" = "card"
    ): Promise<{ videoData?: unknown; videoType?: string; projectId?: string } | null> => {
      if (!content.trim()) return null;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        time: new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, videoType }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `请求失败 (${res.status})`);
        }

        const data = await res.json();

        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "ai",
          content: data.reply || "视频数据已生成，请查看右侧预览。",
          time: new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          videoData: data.videoData,
          videoType: data.videoType,
        };

        setMessages((prev) => [...prev, aiMsg]);
        return { videoData: data.videoData, videoType: data.videoType, projectId: data.projectId };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "网络错误";
        setError(msg);

        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "ai",
          content: `⚠️ ${msg}`,
          time: new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errMsg]);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
