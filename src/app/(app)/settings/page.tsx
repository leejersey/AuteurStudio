"use client";

import { useEffect, useState } from "react";
import SideNavBar from "@/components/layout/SideNavBar";
import type { StudioSettings } from "@/app/api/stage-settings/route";

interface EnvStatus {
  deepseekConfigured: boolean;
  openaiConfigured: boolean;
  volcTtsV3Configured: boolean;
  volcSpeaker: string;
}

const SPEAKER_OPTIONS = [
  { id: "zh_female_vv_uranus_bigtts", label: "Vivi 2.0（默认清晰女声）" },
  { id: "zh_male_m191_uranus_bigtts", label: "云舟 2.0（沉稳讲解男声）" },
  { id: "zh_female_xiaohe_uranus_bigtts", label: "小何 2.0（亲和科普女声）" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<StudioSettings>({
    defaultTheme: "dracula",
    defaultEngine: "code-stage",
    defaultAspectRatio: "16:9",
    defaultMaxRounds: 3,
    defaultWithTts: true,
    defaultSpeaker: "zh_female_vv_uranus_bigtts",
  });
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stage-settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (data.envStatus) setEnvStatus(data.envStatus);
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedMsg(null);
    try {
      const res = await fetch("/api/stage-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      setSavedMsg("偏好设置已持久化保存，刷新或下次进入工坊自动生效");
    } catch (err) {
      setSavedMsg(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-on-surface">
      <SideNavBar />

      <main className="flex-1 overflow-y-auto p-8 z-10">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <header>
            <div className="text-xs font-mono text-primary uppercase tracking-widest">
              Workspace Settings
            </div>
            <h1 className="text-3xl font-bold font-headline mt-1">偏好设置与模型服务状态</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              管理代码工坊默认创作参数，并实时检测本地 `.env.local` 环境变量配置状态。
            </p>
          </header>

          {/* 环境变量检测卡片 */}
          <section className="rounded-2xl border border-white/10 bg-surface-container/80 p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold font-headline">模型与语音服务检测（只读）</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {[
                { name: "DeepSeek API", ok: envStatus?.deepseekConfigured, env: "DEEPSEEK_API_KEY" },
                { name: "OpenAI 兼容 API", ok: envStatus?.openaiConfigured, env: "OPENAI_API_KEY" },
                { name: "火山 V3 TTS", ok: envStatus?.volcTtsV3Configured, env: "VOLC_TTS_API_KEY" },
              ].map((item) => (
                <div
                  key={item.env}
                  className="rounded-xl border border-white/10 bg-surface-container-low p-3.5 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-on-surface">{item.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        item.ok ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {item.ok ? "已配置" : "未配置"}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-on-surface-variant">{item.env}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant">
              密钥仅从服务端 `.env.local` 读取，不通过浏览器传输或暴露。
            </p>
          </section>

          {/* 默认创作偏好 */}
          <section className="rounded-2xl border border-white/10 bg-surface-container/80 p-6 flex flex-col gap-5">
            <h2 className="text-base font-bold font-headline">默认创作偏好</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <label className="flex flex-col gap-1.5 text-on-surface-variant">
                默认舞台配色主题
                <select
                  value={settings.defaultTheme}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultTheme: e.target.value as StudioSettings["defaultTheme"] })
                  }
                  className="rounded-xl bg-surface-container-low border border-white/10 px-3 py-2.5 text-sm text-on-surface"
                >
                  <option value="dracula">Dracula</option>
                  <option value="tokyo-night">Tokyo Night</option>
                  <option value="github-dark">GitHub Dark</option>
                  <option value="catppuccin-mocha">Catppuccin Mocha</option>
                  <option value="one-dark-pro">One Dark Pro</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-on-surface-variant">
                默认引擎模式
                <select
                  value={settings.defaultEngine}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultEngine: e.target.value as StudioSettings["defaultEngine"] })
                  }
                  className="rounded-xl bg-surface-container-low border border-white/10 px-3 py-2.5 text-sm text-on-surface"
                >
                  <option value="code-stage">CodeStage · 语法演进</option>
                  <option value="algo-stage">AlgoStage · 算法沙箱动画</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-on-surface-variant">
                默认火山 V3 音色
                <select
                  value={settings.defaultSpeaker}
                  onChange={(e) => setSettings({ ...settings, defaultSpeaker: e.target.value })}
                  className="rounded-xl bg-surface-container-low border border-white/10 px-3 py-2.5 text-sm text-on-surface"
                >
                  {SPEAKER_OPTIONS.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-on-surface-variant">
                Agent 默认最大自修复轮数
                <select
                  value={settings.defaultMaxRounds}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultMaxRounds: Number.parseInt(e.target.value, 10) || 3 })
                  }
                  className="rounded-xl bg-surface-container-low border border-white/10 px-3 py-2.5 text-sm text-on-surface"
                >
                  <option value={1}>1 轮（快速）</option>
                  <option value={2}>2 轮</option>
                  <option value={3}>3 轮（推荐）</option>
                  <option value={4}>4 轮（严格自检）</option>
                </select>
              </label>
            </div>

            <label className="flex items-center justify-between rounded-xl bg-surface-container-low border border-white/10 px-4 py-3 cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-on-surface">默认开启火山 V3 语音配音</div>
                <div className="text-xs text-on-surface-variant">Agent 生成完成后自动合成配音并对齐逐词字幕</div>
              </div>
              <input
                type="checkbox"
                checked={settings.defaultWithTts}
                onChange={(e) => setSettings({ ...settings, defaultWithTts: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
            </label>

            {savedMsg && (
              <div className="rounded-xl bg-primary/10 border border-primary/30 px-4 py-2.5 text-xs text-primary">
                {savedMsg}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl primary-gradient text-on-primary-fixed text-sm font-bold hover:opacity-90 disabled:opacity-50 transition"
              >
                {isSaving ? "保存中..." : "保存偏好设置"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
