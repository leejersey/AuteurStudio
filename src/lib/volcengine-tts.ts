// 火山引擎 TTS 封装
// 使用 HTTP Chunked 流式合成接口 (V3)

interface TTSConfig {
  appId: string;
  token: string;
  cluster: string;
}

interface TTSResult {
  audioBuffer: Buffer;
  // 后续可扩展字幕时间戳
}

function getConfig(): TTSConfig {
  return {
    appId: process.env.VOLC_TTS_APPID || "",
    token: process.env.VOLC_TTS_TOKEN || "",
    cluster: process.env.VOLC_TTS_CLUSTER || "volcano_tts",
  };
}

function isMockMode(): boolean {
  const config = getConfig();
  return (
    !config.appId ||
    config.appId === "your_volc_tts_appid_here" ||
    !config.token ||
    config.token === "your_volc_tts_token_here"
  );
}

// ─── 真实 TTS 调用 ───

export async function synthesizeSpeech(
  text: string,
  voiceId = "BV001_streaming",
  speedRatio = 1.0
): Promise<TTSResult> {
  if (isMockMode()) {
    console.log("[TTS Mock] 生成静默音频，文本:", text.slice(0, 50));
    // 返回一个极短的静默 WAV
    return { audioBuffer: createSilentWav(1) };
  }

  const config = getConfig();

  const payload = {
    app: {
      appid: config.appId,
      token: config.token,
      cluster: config.cluster,
    },
    user: {
      uid: "ai-video-agent",
    },
    audio: {
      voice_type: voiceId,
      encoding: "mp3",
      speed_ratio: speedRatio,
      volume_ratio: 1.0,
      pitch_ratio: 1.0,
    },
    request: {
      reqid: crypto.randomUUID(),
      text,
      text_type: "plain",
      operation: "query",
    },
  };

  const response = await fetch(
    "https://openspeech.bytedance.com/api/v1/tts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer;${config.token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`TTS API 错误: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.code !== 3000) {
    throw new Error(`TTS 合成失败: ${result.message || "未知错误"}`);
  }

  // Base64 解码音频
  const audioBase64 = result.data;
  const audioBuffer = Buffer.from(audioBase64, "base64");

  return { audioBuffer };
}

// ─── 创建静默音频（Mock 用）───

function createSilentWav(durationSec: number): Buffer {
  const sampleRate = 22050;
  const numSamples = sampleRate * durationSec;
  const dataSize = numSamples * 2; // 16-bit mono
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  // WAV header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM
  buffer.writeUInt16LE(1, 20); // Audio format
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  // 数据部分全为 0（静默）

  return buffer;
}

// ─── 可用音色列表 ───

export const AVAILABLE_VOICES = [
  { id: "BV700_streaming", name: "灿灿", desc: "活泼甜美女声", lang: "zh", gender: "female" as const },
  { id: "BV701_streaming", name: "擎苍", desc: "磁性低沉男声", lang: "zh", gender: "male" as const },
  { id: "BV001_streaming", name: "通用女声", desc: "标准播报女声", lang: "zh", gender: "female" as const },
  { id: "BV002_streaming", name: "通用男声", desc: "标准播报男声", lang: "zh", gender: "male" as const },
  { id: "BV406_streaming", name: "知性女声", desc: "温柔知性风格", lang: "zh", gender: "female" as const },
  { id: "BV407_streaming", name: "活力男声", desc: "年轻活力风格", lang: "zh", gender: "male" as const },
  { id: "BV123_streaming", name: "阳光男声", desc: "温暖阳光少年", lang: "zh", gender: "male" as const },
  { id: "BV102_streaming", name: "儿童女声", desc: "甜美童声", lang: "zh", gender: "female" as const },
];
