# HyperFrames Knowledge Explainer POC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one isolated 30–90 second Chinese knowledge-explainer sample that proves HyperFrames can materially outperform the current fixed-slide Remotion output before any product or database rewrite begins.

**Architecture:** A strict Zod contract accepts one fixed script, real Volcengine TTS segments, word timestamps, one design spec, and four bounded scene intents. A trusted TypeScript builder emits one monolithic, offline HyperFrames composition with all audio directly under the host root, then runs deterministic validation and produces a blinded comparison pack. This milestone does not change the Next.js UI, database, render queue, or delete Remotion.

**Tech Stack:** Node.js 22+, TypeScript, Zod 4, HyperFrames 0.8.41, GSAP 3.14.2, existing Volcengine TTS wrapper, HyperFrames Whisper transcription, FFmpeg/ffprobe, Node test runner through `tsx --test`.

---

## Scope boundary

This plan implements only milestone 1 from `docs/superpowers/specs/2026-09-16-hyperframes-video-engine-redesign.md`.

Included:

- one locked Chinese RAG explainer script;
- four scene intents: kinetic title, process diagram, data highlight, summary;
- real segmented TTS and word timestamps;
- a trusted monolithic Host Builder;
- offline assets, deterministic GSAP timeline, captions;
- lint/validate/inspect/snapshot/render gates;
- an old-vs-new blind review pack.

Deferred:

- database schema and persistent jobs;
- Auteur Studio player integration;
- sandbox preview origin implementation;
- editing UI and HyperFrames Studio integration;
- Lambda, external queues, Lottie, Three.js, code demos;
- Remotion deletion.

## File map

### Create

- `src/hyperframes/poc/contracts.ts` — strict input schemas and inferred types.
- `src/hyperframes/poc/contracts.test.ts` — rejects invalid IDs, timing, URLs, and unsupported intents.
- `src/hyperframes/poc/audio-manifest.ts` — combines per-segment durations and local word timestamps into global timing.
- `src/hyperframes/poc/audio-manifest.test.ts` — verifies offsets and duration invariants.
- `src/hyperframes/poc/build-html.ts` — trusted monolithic Host Builder.
- `src/hyperframes/poc/build-html.test.ts` — verifies root contract, unique IDs, offline references, and direct-root audio.
- `src/hyperframes/poc/verify-artifact.ts` — digest and artifact invariant checks.
- `src/hyperframes/poc/verify-artifact.test.ts` — detects changed or escaped files.
- `scripts/hyperframes/generate-poc-audio.ts` — real Volcengine TTS, transcription, ffprobe, manifest output.
- `scripts/hyperframes/build-poc.ts` — validates fixtures and writes the generated composition.
- `scripts/hyperframes/verify-poc.ts` — runs static gates and assembled snapshots.
- `scripts/hyperframes/prepare-review.ts` — writes review metadata and anonymized A/B file mapping.
- `hyperframes/knowledge-poc/input/script.json` — locked script source.
- `hyperframes/knowledge-poc/input/design.json` — locked visual constitution.
- `hyperframes/knowledge-poc/input/storyboard.json` — four bounded scenes linked to script segment IDs.
- `hyperframes/knowledge-poc/README.md` — local generation, preview, approval, render, and review instructions.
- `hyperframes/knowledge-poc/review/rubric.md` — predeclared blinded review rubric.

### Generate, never commit

- `hyperframes/knowledge-poc/work/` — audio, transcripts, intermediate manifests.
- `hyperframes/knowledge-poc/artifact/` — built HyperFrames project.
- `hyperframes/knowledge-poc/review/generated/` — renders, snapshots, A/B mapping.

### Modify

- `package.json` — pin toolchain and add POC scripts.
- `package-lock.json` — lock dependencies.
- `.gitignore` — ignore generated audio/artifacts/review media.

## Task 1: Pin the minimal toolchain

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`

- [ ] **Step 1: Add a failing environment check**

Add this script to `package.json` before adding dependencies:

```json
"hf:poc:doctor": "node -e \"const major=Number(process.versions.node.split('.')[0]); if(major<22) throw new Error('Node >=22 required')\" && hyperframes doctor --json"
```

Run:

```bash
npm run hf:poc:doctor
```

Expected: FAIL because the local `hyperframes` binary is not installed.

- [ ] **Step 2: Pin only the required packages**

Add:

```json
"engines": { "node": ">=22" }
```

Add dev dependencies:

```json
"gsap": "3.14.2",
"hyperframes": "0.8.41",
"tsx": "4.20.5"
```

Add scripts:

```json
"test:hf-poc": "tsx --test src/hyperframes/poc/*.test.ts",
"hf:poc:audio": "tsx scripts/hyperframes/generate-poc-audio.ts",
"hf:poc:build": "tsx scripts/hyperframes/build-poc.ts",
"hf:poc:verify": "tsx scripts/hyperframes/verify-poc.ts",
"hf:poc:preview": "hyperframes preview hyperframes/knowledge-poc/artifact",
"hf:poc:render": "hyperframes render hyperframes/knowledge-poc/artifact --docker --strict --strict-variables --output hyperframes/knowledge-poc/review/generated/hyperframes.mp4"
```

Run:

```bash
npm install
npm run hf:poc:doctor
```

Expected: install succeeds; doctor JSON has `ok: true`. If it does not, stop and fix Node/FFmpeg/Chrome before authoring.

- [ ] **Step 3: Ignore generated media**

Append to `.gitignore`:

```gitignore
/hyperframes/knowledge-poc/work/
/hyperframes/knowledge-poc/artifact/
/hyperframes/knowledge-poc/review/generated/
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "build: pin HyperFrames POC toolchain"
```

## Task 2: Define strict first-slice contracts

**Files:**
- Create: `src/hyperframes/poc/contracts.ts`
- Create: `src/hyperframes/poc/contracts.test.ts`

- [ ] **Step 1: Write failing schema tests**

Cover these cases with `node:test` and `assert`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { storyboardSchema } from "./contracts";

const valid = {
  version: 1,
  width: 1920,
  height: 1080,
  fps: 30,
  scenes: [
    {
      id: "scene-hook",
      intent: "kinetic-title",
      segmentId: "seg-hook",
      start: 0,
      duration: 5,
      title: "RAG 解决什么？",
      mediaIds: [],
    },
  ],
};

test("accepts the bounded POC storyboard", () => {
  assert.equal(storyboardSchema.safeParse(valid).success, true);
});

test("rejects external media URLs", () => {
  const value = structuredClone(valid);
  value.scenes[0].mediaIds = ["https://example.com/a.png"];
  assert.equal(storyboardSchema.safeParse(value).success, false);
});

test("rejects unknown scene intents", () => {
  const value = structuredClone(valid);
  value.scenes[0].intent = "threejs-world";
  assert.equal(storyboardSchema.safeParse(value).success, false);
});
```

Also test duplicate scene IDs, duplicate segment IDs, negative timing, non-monotonic scenes, overlaps, unknown fields, and missing narration links.

Run:

```bash
npm run test:hf-poc
```

Expected: FAIL because `contracts.ts` does not exist.

- [ ] **Step 2: Implement minimal strict schemas**

Use `.strict()` throughout. Define:

```ts
const id = z.string().regex(/^[a-z][a-z0-9-]*$/);
const localAssetId = z.string().regex(/^[a-z][a-z0-9-]*$/);
const sceneIntent = z.enum([
  "kinetic-title",
  "process-diagram",
  "data-highlight",
  "summary",
]);
```

Export strict schemas and inferred types for:

- `scriptSchema`: version, language, title, ordered segments with stable IDs and text;
- `designSchema`: colors, typography, motion density, caption style;
- `storyboardSchema`: fixed dimensions/FPS and ordered scenes;
- `audioManifestSchema`: per-segment files, offsets, durations, and words;
- `pocInputSchema`: cross-validates segment references and monotonic non-overlap.

Keep cross-field checks in one `.superRefine()`; do not create a generic validation framework.

- [ ] **Step 3: Run tests**

```bash
npm run test:hf-poc
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/hyperframes/poc/contracts.ts src/hyperframes/poc/contracts.test.ts
git commit -m "feat: define HyperFrames POC contracts"
```

## Task 3: Lock the sample and produce real timing

**Files:**
- Create: `hyperframes/knowledge-poc/input/script.json`
- Create: `hyperframes/knowledge-poc/input/design.json`
- Create: `hyperframes/knowledge-poc/input/storyboard.json`
- Create: `src/hyperframes/poc/audio-manifest.ts`
- Create: `src/hyperframes/poc/audio-manifest.test.ts`
- Create: `scripts/hyperframes/generate-poc-audio.ts`

- [ ] **Step 1: Write offset tests**

Use two fake segments and verify that the second segment and every word receive the first segment's duration as their global offset. Assert:

```ts
assert.equal(manifest.segments[1].start, 2.5);
assert.equal(manifest.segments[1].words[0].start, 2.6);
assert.equal(manifest.duration, 5.5);
```

Also reject empty words, words outside segment duration, non-positive durations, and mock one-second silence.

Run `npm run test:hf-poc`; expected FAIL.

- [ ] **Step 2: Add the locked RAG script**

Create four concise Chinese segments totaling roughly 30–45 seconds:

```json
{
  "version": 1,
  "language": "zh",
  "title": "RAG：让大模型先找证据，再回答",
  "segments": [
    {"id":"seg-hook","text":"大模型会回答问题，却不知道你公司的最新资料。RAG 要解决的，就是这道知识时差。"},
    {"id":"seg-index","text":"第一步，把文档切成片段，再转换成向量，存进可以按语义搜索的索引。"},
    {"id":"seg-retrieve","text":"问题到来时，系统先找出最相关的片段，把证据和问题一起交给模型。"},
    {"id":"seg-summary","text":"所以 RAG 不是让模型记住更多，而是让它在回答之前，先找到可靠证据。"}
  ]
}
```

Create one restrained visual system in `design.json`; use only local fonts, dark ink background, warm paper foreground, one cyan accent, and medium motion density.

Create four storyboard scenes linked one-to-one to segments. Start/duration values are placeholders until audio generation rewrites them from the manifest.

- [ ] **Step 3: Implement segmented audio generation**

`scripts/hyperframes/generate-poc-audio.ts` must:

1. validate `script.json`;
2. call existing `synthesizeSpeech()` once per segment;
3. reject buffers beginning with `RIFF` and exactly one second long as mock output;
4. write each real segment to `work/audio/<segment-id>.mp3`;
5. run:

```bash
hyperframes transcribe <segment.mp3> \
  --dir <work/transcripts/segment-id> \
  --engine whisper --model small --language zh --json
```

6. read each generated `transcript.json`;
7. obtain exact duration using `ffprobe`;
8. call `buildAudioManifest()` to convert local word times to global times;
9. write `work/audio-manifest.json`;
10. rewrite storyboard scene start/duration from the corresponding audio segment, then validate it.

Do not silently continue without credentials, real speech, ffprobe, or word timestamps.

- [ ] **Step 4: Run the real audio gate**

Before the paid Volcengine call, confirm the user wants to use their configured account. Then run:

```bash
npm run hf:poc:audio
```

Expected:

- four non-empty real audio files;
- four transcript files with Chinese word timestamps;
- one valid `work/audio-manifest.json`;
- total duration between 30 and 90 seconds.

If the current script is under 30 seconds, adjust delivery speed or script wording once; do not pad with silence.

- [ ] **Step 5: Run tests and commit source only**

```bash
npm run test:hf-poc
git add hyperframes/knowledge-poc/input src/hyperframes/poc/audio-manifest.ts src/hyperframes/poc/audio-manifest.test.ts scripts/hyperframes/generate-poc-audio.ts
git commit -m "feat: add timed knowledge explainer fixture"
```

Generated audio remains ignored.

## Task 4: Build the trusted monolithic composition

**Files:**
- Create: `src/hyperframes/poc/build-html.ts`
- Create: `src/hyperframes/poc/build-html.test.ts`
- Create: `scripts/hyperframes/build-poc.ts`

- [ ] **Step 1: Write failing Host Builder tests**

Given validated fixtures, assert the generated HTML:

- has one root with `data-composition-id="knowledge-poc"`, 1920×1080, 30 FPS, and static total duration;
- registers exactly one paused timeline at `window.__timelines["knowledge-poc"]`;
- has every visible timed scene as a direct-root `.clip`;
- has all four `<audio>` elements as direct root children with global `data-start`, `data-duration`, `data-track-index`, and local paths;
- contains no `http://`, `https://`, `file://`, `Date.now`, `performance.now`, `Math.random`, `repeat:-1`, `setTimeout`, or runtime `fetch`;
- has no duplicate IDs;
- references only files declared in the artifact manifest.

Run `npm run test:hf-poc`; expected FAIL.

- [ ] **Step 2: Implement four explicit scene renderers**

In `build-html.ts`, use a plain switch over the four allowed intents. Do not create a plugin registry.

The rendered end states:

- hook: oversized thesis with one emphasized phrase;
- process diagram: document → vector index → semantic retrieval;
- data highlight: one large “问题 + 证据” relationship with supporting labels;
- summary: final sentence and three compact takeaways.

Generate captions from manifest words in one direct-root caption clip. Use static HTML/CSS end states and GSAP entrance/emphasis tweens at scene-global times. Keep body text free of `<br>`.

- [ ] **Step 3: Keep dependencies local**

`build-poc.ts` must clean and recreate `artifact/`, then copy:

- `node_modules/gsap/dist/gsap.min.js` → `artifact/assets/vendor/gsap.min.js`;
- a verified local Noto Sans SC WOFF2 from the installed `@fontsource/noto-sans-sc` package → `artifact/assets/fonts/noto-sans-sc.woff2`;
- generated segment audio → `artifact/assets/audio/`.

Generate `@font-face` and only relative asset paths. Write `index.html`, human-readable `SCRIPT.md`, `STORYBOARD.md`, `design.md`, and the strict JSON inputs into the artifact.

- [ ] **Step 4: Build and run unit tests**

```bash
npm run test:hf-poc
npm run hf:poc:build
```

Expected: tests pass and `artifact/index.html` exists with no network references.

- [ ] **Step 5: Commit**

```bash
git add src/hyperframes/poc/build-html.ts src/hyperframes/poc/build-html.test.ts scripts/hyperframes/build-poc.ts
git commit -m "feat: build deterministic HyperFrames sample"
```

## Task 5: Add immutable manifest verification

**Files:**
- Create: `src/hyperframes/poc/verify-artifact.ts`
- Create: `src/hyperframes/poc/verify-artifact.test.ts`
- Modify: `scripts/hyperframes/build-poc.ts`

- [ ] **Step 1: Write failing digest tests**

Use a temporary directory. Verify:

- stable sorted file paths produce the same digest;
- changing one byte changes the digest;
- `../`, absolute paths, symlinks, and external URLs are rejected;
- the manifest includes toolchain version, entry file, width, height, FPS, duration, per-file size and SHA-256.

Run `npm run test:hf-poc`; expected FAIL.

- [ ] **Step 2: Implement minimal manifest functions**

Use only `node:crypto`, `node:fs`, and `node:path`. Export:

```ts
buildArtifactManifest(root, metadata)
verifyArtifactManifest(root, manifest)
```

Sort normalized POSIX relative paths before hashing. Reject symlinks rather than resolving them.

- [ ] **Step 3: Publish only after verification**

Update `build-poc.ts` to write `manifest.json` last, verify it immediately, and print the top-level artifact digest. Do not add object-storage abstractions in this milestone.

- [ ] **Step 4: Test and commit**

```bash
npm run test:hf-poc
npm run hf:poc:build
git add src/hyperframes/poc/verify-artifact.ts src/hyperframes/poc/verify-artifact.test.ts scripts/hyperframes/build-poc.ts
git commit -m "feat: verify HyperFrames artifact digests"
```

## Task 6: Automate static and assembled visual gates

**Files:**
- Create: `scripts/hyperframes/verify-poc.ts`
- Modify: `package.json`
- Modify: `package-lock.json` only if scripts require lock metadata updates

- [ ] **Step 1: Make verification fail on a deliberate defect**

Temporarily remove the timeline registration from generated HTML and run:

```bash
npm run hf:poc:verify
```

Expected: non-zero exit from `hyperframes lint`. Restore by rebuilding; do not commit the defect.

- [ ] **Step 2: Implement the gate runner**

The script runs sequentially and stops on the first failure:

```bash
hyperframes lint hyperframes/knowledge-poc/artifact --json
hyperframes validate hyperframes/knowledge-poc/artifact --json
hyperframes inspect hyperframes/knowledge-poc/artifact --json
hyperframes snapshot hyperframes/knowledge-poc/artifact --at <times>
```

Compute snapshot times from the validated storyboard:

- `0`;
- each scene midpoint;
- one frame before and after every scene boundary;
- final time minus one frame.

Then hash each snapshot, rerun the same snapshot command into a second directory, and compare hashes. If browser rasterization introduces documented nondeterministic bytes, compare decoded pixels with an explicit zero-or-low tolerance instead; record the reason in `README.md`.

- [ ] **Step 3: Run all non-render gates**

```bash
npm run test:hf-poc
npm run hf:poc:build
npm run hf:poc:verify
```

Expected: all pass with no lint/validate/inspect errors and two identical snapshot sets.

- [ ] **Step 4: Commit**

```bash
git add scripts/hyperframes/verify-poc.ts package.json package-lock.json
git commit -m "test: gate HyperFrames sample output"
```

## Task 7: Preview, approve, and render

**Files:**
- Create: `hyperframes/knowledge-poc/README.md`

- [ ] **Step 1: Document the exact local loop**

Include:

```bash
npm run hf:poc:audio
npm run hf:poc:build
npm run hf:poc:verify
npm run hf:poc:preview
```

Document that generated media is local, credentials are never copied, and preview approval is required before render.

- [ ] **Step 2: Open preview and request user approval**

Run:

```bash
npm run hf:poc:preview
```

Report the actual Studio URL. Stop and wait for user approval. Apply visual feedback through source fixtures/builder and repeat build + verify; do not patch generated artifact by hand.

- [ ] **Step 3: Render only after approval**

Run:

```bash
npm run hf:poc:render
```

Verify:

```bash
test -s hyperframes/knowledge-poc/review/generated/hyperframes.mp4
ffprobe -v error -show_entries format=duration -show_streams -of json \
  hyperframes/knowledge-poc/review/generated/hyperframes.mp4
```

Expected: one video stream, one audio stream, and duration within one frame of AudioManifest.

- [ ] **Step 4: Commit documentation**

```bash
git add hyperframes/knowledge-poc/README.md
git commit -m "docs: document HyperFrames sample workflow"
```

## Task 8: Prepare the blinded quality gate

**Files:**
- Create: `hyperframes/knowledge-poc/review/rubric.md`
- Create: `scripts/hyperframes/prepare-review.ts`

- [ ] **Step 1: Write the rubric before comparison**

The rubric must score these four dimensions independently:

1. composition variety;
2. pacing;
3. visual relevance to narration;
4. overall finish.

Use three blinded reviewers. New output passes only if it receives majority preference in at least three dimensions; ties fail. Record caption timing metrics separately: median ≤100ms and P95 ≤250ms on a manually labeled sample.

- [ ] **Step 2: Produce the current Remotion baseline**

Before Remotion deletion, render `KnowledgeVideo` using the same four narration segments, timings, canvas, and factual source set. It may use the existing visual system, but must not receive post-hoc improvements unavailable to the current pipeline. Save it only under ignored `review/generated/`.

- [ ] **Step 3: Anonymize A/B files**

`prepare-review.ts` accepts the two MP4 paths, uses cryptographically random A/B assignment, copies them to `review/generated/A.mp4` and `B.mp4`, and writes the answer key separately. The rubric must not reveal the engines.

- [ ] **Step 4: Run technical checks**

Check both outputs with ffprobe. For HyperFrames, additionally confirm:

- duration delta ≤ one frame;
- expected streams exist;
- named snapshots contain no critical clipping/overflow;
- caption labeled-sample median and P95 meet the rubric.

- [ ] **Step 5: Conduct review and record the decision**

Collect three independent rubrics. If the HyperFrames output does not pass, stop: improve only the demonstrated weak scene/builder behavior and rerun this milestone. Do not begin database or UI restructuring.

- [ ] **Step 6: Commit only source and rubric**

```bash
git add hyperframes/knowledge-poc/review/rubric.md scripts/hyperframes/prepare-review.ts
git commit -m "test: define HyperFrames quality gate"
```

## Final verification

Run from repository root:

```bash
npm run lint
npm run test:hf-poc
npm run hf:poc:doctor
npm run hf:poc:build
npm run hf:poc:verify
test -s hyperframes/knowledge-poc/review/generated/hyperframes.mp4
ffprobe -v error -show_entries format=duration -show_streams -of json \
  hyperframes/knowledge-poc/review/generated/hyperframes.mp4

git status --short
```

Expected:

- lint and all POC tests pass;
- HyperFrames doctor reports healthy environment;
- static, runtime, layout, assembled snapshot, and determinism gates pass;
- final MP4 exists with valid audio/video streams;
- only intentionally ignored generated media remains outside git;
- blinded review result is recorded before milestone 2 is planned.
