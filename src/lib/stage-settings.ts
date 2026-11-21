import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { z } from "zod";
import { loadEnvValue } from "@/code-stage/env";

export const studioSettingsSchema = z.object({
  defaultTheme: z.enum(["dracula", "tokyo-night", "github-dark", "catppuccin-mocha", "one-dark-pro"]).default("dracula"),
  defaultEngine: z.enum(["code-stage", "algo-stage"]).default("code-stage"),
  defaultAspectRatio: z.enum(["16:9", "9:16"]).default("16:9"),
  defaultMaxRounds: z.number().int().min(1).max(4).default(3),
  defaultWithTts: z.boolean().default(true),
  defaultSpeaker: z.string().trim().min(1).default("zh_female_vv_uranus_bigtts"),
});

export type StudioSettings = z.infer<typeof studioSettingsSchema>;

const SETTINGS_FILE = resolve(process.cwd(), "hyperframes/.jobs/settings.json");

export function readStudioSettings(): StudioSettings {
  if (!existsSync(SETTINGS_FILE)) {
    return studioSettingsSchema.parse({});
  }
  try {
    return studioSettingsSchema.parse(JSON.parse(readFileSync(SETTINGS_FILE, "utf8")));
  } catch {
    return studioSettingsSchema.parse({});
  }
}

export function writeStudioSettings(next: StudioSettings): StudioSettings {
  const parsed = studioSettingsSchema.parse(next);
  mkdirSync(dirname(SETTINGS_FILE), { recursive: true });
  writeFileSync(SETTINGS_FILE, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return parsed;
}

export function getStudioEnvStatus() {
  const deepseek = loadEnvValue("DEEPSEEK_API_KEY");
  const openai = loadEnvValue("OPENAI_API_KEY");
  const volcKey = loadEnvValue("VOLC_TTS_API_KEY");
  return {
    deepseekConfigured: Boolean(deepseek && deepseek !== "your_deepseek_api_key_here"),
    openaiConfigured: Boolean(openai),
    volcTtsV3Configured: Boolean(volcKey),
    volcSpeaker: loadEnvValue("VOLC_TTS_SPEAKER") || "zh_female_vv_uranus_bigtts",
  };
}
