import { randomUUID } from "node:crypto";
import type { TimedWord } from "./schema";

const ENDPOINT = "https://openspeech.bytedance.com/api/v3/tts/unidirectional";
const SUCCESS_CODE = 20_000_000;

export interface VolcengineV3SynthesisResult {
  audioBuffer: Buffer;
  subtitleText: string;
  words: TimedWord[];
}

export interface VolcengineV3Options {
  apiKey: string;
  resourceId?: string;
  speaker?: string;
  text: string;
  timeoutMs?: number;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function parseVolcengineV3Ndjson(ndjson: string): VolcengineV3SynthesisResult {
  const lines = ndjson.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) throw new Error("火山 V3 TTS 返回空响应");

  const chunks: Buffer[] = [];
  const words: TimedWord[] = [];
  const texts: string[] = [];
  let finished = false;

  for (const [idx, line] of lines.entries()) {
    let event: unknown;
    try {
      event = JSON.parse(line);
    } catch {
      throw new Error(`火山 V3 TTS 第 ${idx + 1} 行 JSON 解析失败`);
    }
    if (!isRecord(event) || typeof event.code !== "number") {
      throw new Error(`火山 V3 TTS 第 ${idx + 1} 行结构异常`);
    }
    if (event.code !== 0 && event.code !== SUCCESS_CODE) {
      throw new Error(`火山 V3 TTS 返回错误码 ${event.code}: ${String(event.message || "")}`);
    }
    if (event.code === SUCCESS_CODE) {
      finished = true;
    }
    if (typeof event.data === "string" && event.data.length > 0) {
      chunks.push(Buffer.from(event.data, "base64"));
    }
    if (isRecord(event.sentence) && typeof event.sentence.text === "string" && Array.isArray(event.sentence.words)) {
      if (event.sentence.words.length > 0) {
        texts.push(event.sentence.text);
        for (const w of event.sentence.words) {
          if (isRecord(w) && typeof w.word === "string" && typeof w.startTime === "number" && typeof w.endTime === "number") {
            words.push({ text: w.word, start: w.startTime, end: w.endTime });
          }
        }
      }
    }
  }

  if (!finished) throw new Error("火山 V3 TTS 未收到结束事件");
  if (chunks.length === 0) throw new Error("火山 V3 TTS 未返回音频数据");
  if (words.length === 0) throw new Error("火山 V3 TTS 未返回字级时间戳");

  return {
    audioBuffer: Buffer.concat(chunks),
    subtitleText: texts.join(""),
    words,
  };
}

export async function synthesizeVolcengineV3(options: VolcengineV3Options): Promise<VolcengineV3SynthesisResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 60_000);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": options.apiKey,
        "X-Api-Resource-Id": options.resourceId || "seed-tts-2.0",
        "X-Api-Request-Id": randomUUID(),
      },
      body: JSON.stringify({
        user: { uid: "auteur-code-stage" },
        req_params: {
          text: options.text,
          speaker: options.speaker || "zh_female_vv_uranus_bigtts",
          audio_params: {
            format: "mp3",
            sample_rate: 24000,
            enable_subtitle: true,
          },
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`火山 V3 TTS HTTP ${response.status}: ${await response.text()}`);
    }

    const body = await response.text();
    return parseVolcengineV3Ndjson(body);
  } finally {
    clearTimeout(timer);
  }
}
