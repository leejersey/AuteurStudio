import assert from "node:assert/strict";
import test from "node:test";
import { buildCodeStage } from "./builder";
import { pythonDecoratorDemoSpec } from "./demos/python-decorator";
import { computePackagingMetrics, renderBgmAudioHtml } from "./packaging";

test("computePackagingMetrics 正确计算片头偏移与片尾总时长", () => {
  const m = computePackagingMetrics(36, {
    enableIntro: true,
    introDuration: 2.5,
    enableOutro: true,
    outroDuration: 3.0,
    outroCta: "三连支持",
    bgmLevel: "balanced",
  });
  assert.equal(m.introOffset, 2.5);
  assert.equal(m.contentEnd, 38.5);
  assert.equal(m.outroStart, 38.5);
  assert.equal(m.totalDuration, 41.5);
});

test("renderBgmAudioHtml 为超长视频自动分段续播覆盖全片", () => {
  const bgm = renderBgmAudioHtml(
    {
      enableIntro: true,
      introDuration: 2.5,
      enableOutro: true,
      outroDuration: 3.0,
      outroCta: "CTA",
      bgmFile: "bgm-tech-01.wav",
      bgmLevel: "balanced",
    },
    125,
  );
  // bgm-tech-01.wav 为 60s，125s 视频应自动铺设 3 段无缝衔接
  assert.equal(bgm.clips.length, 3);
  assert.equal(bgm.clips[0].start, 0);
  assert.equal(bgm.clips[1].start, 60);
  assert.equal(bgm.clips[2].start, 120);
  assert.equal(bgm.clips[2].duration, 5);
});

test("buildCodeStage 开启片头/片尾/BGM 后生成完整包装 DOM 与 Auto-Ducking 音量曲线", async () => {
  const bundle = await buildCodeStage({
    ...pythonDecoratorDemoSpec,
    packaging: {
      enableIntro: true,
      introDuration: 2.5,
      enableOutro: true,
      outroDuration: 3.0,
      outroCta: "点赞收藏不迷路",
      bgmFile: "bgm-tech-01.wav",
      bgmLevel: "balanced",
    },
  });

  assert.equal(bundle.duration, 41.5);
  const html = bundle.files["index.html"];
  assert.match(html, /id="pkg-intro"/);
  assert.match(html, /id="pkg-outro"/);
  assert.match(html, /id="bgm-0"/);
  assert.match(html, /id="step-1-pain" data-start="2\.5"/);
  assert.match(html, /tl\.to\("#bgm-0", \{ volume: /);
});
