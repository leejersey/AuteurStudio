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
- production preview-origin deployment and Auteur Studio integration (the POC still includes a two-origin sandbox harness);
- editing UI and HyperFrames Studio integration;
- Lambda, external queues, Lottie, Three.js, code demos;
- Remotion deletion.

## File map

### Create

- `src/hyperframes/poc/contracts.ts` — strict input schemas and inferred types.
- `src/hyperframes/poc/timestamp-quality.ts` — defines and validates the chosen Chinese timed-unit semantics.
- `src/hyperframes/poc/timestamp-quality.test.ts` — rejects unusable phrase-level/low-coverage alignment.
- `src/hyperframes/poc/contracts.test.ts` — rejects invalid IDs, timing, URLs, and unsupported intents.
- `src/hyperframes/poc/audio-manifest.ts` — combines per-segment durations and local word timestamps into global timing.
- `src/hyperframes/poc/audio-manifest.test.ts` — verifies offsets and duration invariants.
- `src/hyperframes/poc/build-html.ts` — trusted monolithic Host Builder.
- `src/hyperframes/poc/build-html.test.ts` — verifies root contract, unique IDs, offline references, and direct-root audio.
- `src/hyperframes/poc/verify-artifact.ts` — digest and artifact invariant checks.
- `src/hyperframes/poc/verify-artifact.test.ts` — detects changed or escaped files.
- `scripts/hyperframes/check-poc-env.ts` — checks only required Node/FFmpeg/Chrome/Whisper/Docker capabilities.
- `scripts/hyperframes/spike-chinese-timestamps.ts` — one-segment real-audio feasibility gate before composition work.
- `scripts/hyperframes/generate-poc-audio.ts` — real Volcengine TTS, verified alignment, ffprobe, manifest output.
- `scripts/hyperframes/build-poc.ts` — validates fixtures and writes the generated composition.
- `scripts/hyperframes/verify-poc.ts` — runs static gates and assembled snapshots.
- `scripts/hyperframes/serve-review-shell.ts` — trusted localhost shell on a different origin from the player.
- `scripts/hyperframes/test-preview-sandbox.ts` — browser test for parent/storage/navigation/network denial.
- `scripts/hyperframes/approve-poc.ts` — records the exact reviewed artifact digest.
- `scripts/hyperframes/render-approved-poc.ts` — re-verifies and renders only the approved digest.
- `scripts/hyperframes/prepare-review.ts` — writes two anonymized A/B packs and answer keys.
- `scripts/hyperframes/score-caption-timing.ts` — computes median/P95 from labeled caption boundaries.
- `scripts/hyperframes/aggregate-review.ts` — validates three ballots and writes the pass/fail decision.
- `hyperframes/knowledge-poc/input/script.json` — locked script source.
- `hyperframes/knowledge-poc/input/design.json` — locked visual constitution.
- `hyperframes/knowledge-poc/input/storyboard.json` — four bounded scenes linked to script segment IDs.
- `hyperframes/knowledge-poc/README.md` — local generation, preview, approval, render, and review instructions.
- `hyperframes/knowledge-poc/review/rubric.md` — predeclared blinded review rubric.
- `hyperframes/knowledge-poc/review/ballot.schema.json` — reviewer ballot contract.
- `hyperframes/knowledge-poc/review/caption-labels.schema.json` — labeled timing sample contract.
- `hyperframes/knowledge-poc/security/review-shell.html` — minimal trusted shell with sandboxed cross-origin iframe.
- `hyperframes/knowledge-poc/security/malicious/index.html` — attack fixture for preview isolation.

### Generate, never commit

- `hyperframes/knowledge-poc/work/` — audio, transcripts, intermediate manifests.
- `hyperframes/knowledge-poc/work/staging/` — mutable build staging.
- `hyperframes/knowledge-poc/artifacts/<digest>/` — content-addressed, read-only source artifacts.
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
- Create: `scripts/hyperframes/check-poc-env.ts`

- [ ] **Step 1: Add a failing environment check**

Add this script to `package.json` before adding dependencies:

```json
"hf:poc:doctor": "tsx scripts/hyperframes/check-poc-env.ts"
```

Run:

```bash
npm run hf:poc:doctor
```

Expected: FAIL because `check-poc-env.ts` and the local `hyperframes` binary do not exist yet.

- [ ] **Step 2: Pin only the required packages**

Add:

```json
"engines": { "node": ">=22" }
```

Add dev dependencies:

```json
"gsap": "3.14.2",
"hyperframes": "0.8.41",
"puppeteer-core": "25.8.0",
"tsx": "4.20.5"
```

Add scripts:

```json
"test:hf-poc": "tsx --test src/hyperframes/poc/*.test.ts",
"hf:poc:timestamp-spike": "tsx scripts/hyperframes/spike-chinese-timestamps.ts",
"hf:poc:audio": "tsx scripts/hyperframes/generate-poc-audio.ts",
"hf:poc:build": "tsx scripts/hyperframes/build-poc.ts",
"hf:poc:verify": "tsx scripts/hyperframes/verify-poc.ts",
"hf:poc:preview": "tsx scripts/hyperframes/serve-review-shell.ts",
"hf:poc:approve": "tsx scripts/hyperframes/approve-poc.ts",
"hf:poc:render": "tsx scripts/hyperframes/render-approved-poc.ts"
```

Run:

```bash
npm install
npm run hf:poc:doctor
```

Create `scripts/hyperframes/check-poc-env.ts`. In Task 1 it asserts Node >=22, `ffmpeg`/`ffprobe`, the HyperFrames browser, writable free disk, the initial HyperFrames Whisper `small` candidate (including model cache or permission for first download), and a running Docker daemon. Parse `hyperframes doctor --json`; do not trust its exit code because it exits zero when `ok` is false. Check required capabilities individually rather than failing on unrelated optional media tools.

Expected: install succeeds and the required-capability JSON reports healthy. If it does not, stop before authoring.

- [ ] **Step 3: Ignore generated media**

Append to `.gitignore`:

```gitignore
/hyperframes/knowledge-poc/work/
/hyperframes/knowledge-poc/artifacts/
/hyperframes/knowledge-poc/review/generated/
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore scripts/hyperframes/check-poc-env.ts
git commit -m "build: pin HyperFrames POC toolchain"
```

## Task 2: Prove Chinese timestamp feasibility first

**Files:**
- Create: `src/hyperframes/poc/timestamp-quality.ts`
- Create: `src/hyperframes/poc/timestamp-quality.test.ts`
- Create: `scripts/hyperframes/spike-chinese-timestamps.ts`

- [ ] **Step 1: Define the timed-unit acceptance test**

The POC metric unit is a Chinese character or punctuation-free segmented word, whichever the selected aligner emits consistently. Do not call a whole phrase a word. Write failing tests that require:

- monotonic non-overlapping units;
- non-empty text and positive durations;
- normalized timed-unit text covers at least 95% of normalized narration text;
- the fixed spike sentence yields at least 12 timed units;
- no single unit contains more than 8 Han characters;
- a committed manual sample of at least 20 boundaries can be scored in milliseconds.

Run `npm run test:hf-poc`; expected FAIL.

- [ ] **Step 2: Implement the smallest validator**

Export `assessChineseTimestamps(text, units)` returning coverage, unit count, longest Han run, monotonicity, and pass/fail reasons. It validates evidence; it must not rewrite or guess timestamps.

- [ ] **Step 3: Run one real-audio spike**

`spike-chinese-timestamps.ts` synthesizes only `seg-hook` with the existing Volcengine wrapper, rejects the one-second RIFF mock, runs HyperFrames 0.8.41 Whisper `small --language zh`, and writes ignored evidence under `work/timestamp-spike/`.

Before invoking the configured paid account, ask once for user approval. Run:

```bash
npm run hf:poc:timestamp-spike
```

Manually label at least 20 character/word boundaries in the spike and apply `assessChineseTimestamps`.

- [ ] **Step 4: Stop or lock the alignment path**

If HyperFrames normalization merges Chinese into phrase-sized units or misses the thresholds, stop all later tasks. Replace it with a verified Volcengine timestamp endpoint or CJK-capable forced aligner and update this task with the exact invocation. After one engine passes, update `check-poc-env.ts` to check that exact engine/cache/network requirement and rerun `npm run hf:poc:doctor` before Task 3. Commit the checker change with Task 2. Only then may `audio-manifest.ts` define its timed-unit semantics.

- [ ] **Step 5: Test and commit**

```bash
npm run test:hf-poc
git add src/hyperframes/poc/timestamp-quality.ts src/hyperframes/poc/timestamp-quality.test.ts scripts/hyperframes/spike-chinese-timestamps.ts scripts/hyperframes/check-poc-env.ts
git commit -m "test: verify Chinese narration timestamps"
```

## Task 3: Define strict first-slice contracts

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

## Task 4: Lock the sample and produce real timing

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
5. invoke the exact Chinese alignment path proven by Task 2 for every segment; if the passing candidate is HyperFrames Whisper, run:

```bash
hyperframes transcribe <segment.mp3> \
  --dir <work/transcripts/segment-id> \
  --engine whisper --model small --language zh --json
```

6. validate every generated transcript with `assessChineseTimestamps` before reading it into the manifest;
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

## Task 5: Build the trusted monolithic composition

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
- references only files declared in the artifact manifest;
- renders hostile text such as `</script><script>alert(1)</script>` and `\" onerror=\"alert(1)` as inert literal text, with no injected element, event handler, selector, CSS token, or executable script.

Run `npm run test:hf-poc`; expected FAIL.

- [ ] **Step 2: Implement four explicit scene renderers**

In `build-html.ts`, use a plain switch over the four allowed intents. Do not create a plugin registry. Build markup through one audited HTML text-escape helper, serialize data islands with safe JSON serialization, and accept only schema-validated enums/hex colors for CSS. Never interpolate model strings into inline scripts, selectors, raw attributes, or CSS.

The rendered end states:

- hook: oversized thesis with one emphasized phrase;
- process diagram: document → vector index → semantic retrieval;
- data highlight: one large “问题 + 证据” relationship with supporting labels;
- summary: final sentence and three compact takeaways.

Generate captions from manifest words in one direct-root caption clip. Use static HTML/CSS end states and GSAP entrance/emphasis tweens at scene-global times. Keep body text free of `<br>`.

- [ ] **Step 3: Keep dependencies local**

`build-poc.ts` must clean and recreate only `work/staging/` (never an existing published digest directory), then copy:

- `node_modules/gsap/dist/gsap.min.js` → `artifact/assets/vendor/gsap.min.js`;
- a verified local Noto Sans SC WOFF2 from the installed `@fontsource/noto-sans-sc` package → `artifact/assets/fonts/noto-sans-sc.woff2`;
- generated segment audio → `artifact/assets/audio/`.

Generate `@font-face` and only relative asset paths. Write `index.html`, human-readable `SCRIPT.md`, `STORYBOARD.md`, `design.md`, and the strict JSON inputs into the artifact.

- [ ] **Step 4: Build and run unit tests**

```bash
npm run test:hf-poc
npm run hf:poc:build
```

Expected: tests pass and `artifacts/<printed-digest>/index.html` exists with no network references.

- [ ] **Step 5: Commit**

```bash
git add src/hyperframes/poc/build-html.ts src/hyperframes/poc/build-html.test.ts scripts/hyperframes/build-poc.ts
git commit -m "feat: build deterministic HyperFrames sample"
```

## Task 6: Add immutable manifest verification

**Files:**
- Create: `src/hyperframes/poc/verify-artifact.ts`
- Create: `src/hyperframes/poc/verify-artifact.test.ts`
- Modify: `scripts/hyperframes/build-poc.ts`

- [ ] **Step 1: Write failing digest tests**

Use a temporary directory. Verify:

- stable sorted file paths produce the same golden digest;
- changing one byte changes the digest;
- `../`, absolute paths, symlinks, and external URLs are rejected;
- the manifest includes toolchain version, entry file, width, height, FPS, duration, per-file size and SHA-256;
- `manifest.json` is excluded from its own file table and digest input.

Run `npm run test:hf-poc`; expected FAIL.

- [ ] **Step 2: Implement minimal manifest functions**

Use only `node:crypto`, `node:fs`, and `node:path`. Export:

```ts
buildArtifactManifest(root, metadata)
verifyArtifactManifest(root, manifest)
```

Sort normalized POSIX relative paths before hashing. Reject symlinks rather than resolving them. Define the top-level digest as SHA-256 over canonical UTF-8 JSON with recursively sorted object keys, sorted file records, no whitespace, and no digest field; `manifest.json` is not part of the per-file set.

- [ ] **Step 3: Publish content-addressed bytes only after verification**

Update `build-poc.ts` to build under `work/staging/`, write `manifest.json` last, verify it immediately, then atomically rename the staging directory to `artifacts/<digest>/` and make source files read-only. If that digest already exists and verifies, reuse it. Never delete or overwrite an existing digest path. Print both the path and digest. Do not add object-storage abstractions in this milestone.

- [ ] **Step 4: Test and commit**

```bash
npm run test:hf-poc
npm run hf:poc:build
git add src/hyperframes/poc/verify-artifact.ts src/hyperframes/poc/verify-artifact.test.ts scripts/hyperframes/build-poc.ts
git commit -m "feat: verify HyperFrames artifact digests"
```

## Task 7: Automate static and assembled visual gates

**Files:**
- Create: `scripts/hyperframes/verify-poc.ts`
- Modify: `package.json`

- [ ] **Step 1: Make verification fail on a deliberate defect**

Temporarily remove timeline registration from a staging build and run `npm run hf:poc:verify`. Expect non-zero lint status. Rebuild immediately; never mutate a published digest path.

- [ ] **Step 2: Implement exact gate commands**

Read the latest published digest from `work/latest-artifact.json`, verify it, and use that immutable directory for every command. Compute a comma-separated time list containing 0, each scene midpoint, one frame before/after each boundary, and final-minus-one-frame. Remove old temp directories, then run:

```bash
hyperframes lint <artifact-digest-dir> --json
hyperframes validate <artifact-digest-dir> --json
hyperframes inspect <artifact-digest-dir> --json
rm -rf <work/snapshots-a> <work/snapshots-b>
hyperframes snapshot <artifact-digest-dir> --at <times> --output <work/snapshots-a>
hyperframes snapshot <artifact-digest-dir> --at <times> --output <work/snapshots-b>
```

Compare sorted `(relative path, SHA-256)` pairs byte-for-byte. If a mismatch is demonstrated, stop and investigate; do not silently add a looser image comparator in this milestone.

- [ ] **Step 3: Run all non-render gates**

```bash
npm run test:hf-poc
npm run hf:poc:build
npm run hf:poc:verify
```

Expected: all pass with no lint/validate/inspect errors and identical snapshot sets.

- [ ] **Step 4: Commit**

```bash
git add scripts/hyperframes/verify-poc.ts package.json package-lock.json
git commit -m "test: gate HyperFrames sample output"
```

## Task 8: Build and test the two-origin preview sandbox

**Files:**
- Create: `hyperframes/knowledge-poc/security/review-shell.html`
- Create: `hyperframes/knowledge-poc/security/malicious/index.html`
- Create: `scripts/hyperframes/serve-review-shell.ts`
- Create: `scripts/hyperframes/test-preview-sandbox.ts`

- [ ] **Step 1: Write a failing malicious fixture**

The fixture attempts to read `parent.document`, cookies, localStorage, navigate the parent, submit a form, open a popup, call a fake authenticated shell endpoint, and fetch an unapproved external host. It reports results only through a nonce-checked `postMessage` payload.

- [ ] **Step 2: Implement both origins and enforce policy on the untrusted origin**

Serve the trusted shell on `127.0.0.1:4311`. On `127.0.0.1:4312`, `serve-review-shell.ts` serves a tiny preview wrapper, `node_modules/hyperframes/dist/hyperframes-player.global.js`, and the approved artifact under `/composition/`; do not delegate to raw `hyperframes play`.

Every 4312 response sets a restrictive CSP appropriate to its MIME type: `default-src 'self'`; `connect-src 'none'`; no forms, objects, base rewriting, or top navigation; scripts/styles/fonts/media only from the same preview origin; `frame-ancestors http://127.0.0.1:4311`. The wrapper instantiates `<hyperframes-player sandbox-origin src="/composition/index.html">` and contains the only relay. It validates `event.source`, the opaque sandbox origin (`event.origin === "null"` where applicable), a per-session nonce, and an exact schema, then maps only `play`, `pause`, `seek`, and read-only state requests to the player's public methods/properties.

The 4311 shell embeds the 4312 wrapper with `sandbox="allow-scripts"` only—no `allow-same-origin`, navigation, forms, or popups—and has its own restrictive CSP. It applies the same source/origin/nonce/schema checks.

- [ ] **Step 3: Automate the boundary test**

Use direct `puppeteer-core` and the browser path returned by `hyperframes browser path`. Assert every attack fails, parent URL is unchanged, shell cookies/storage remain unreadable, no popup opens, and browser security reports CSP-blocked external/authenticated requests. Request interception may record evidence but must not be the blocking mechanism. Also test accepted play/seek messages and rejected wrong-source, wrong-nonce, and unknown-action messages.

Run:

```bash
npm run hf:poc:preview -- --malicious-test
```

Expected: all security assertions pass.

- [ ] **Step 4: Commit**

```bash
git add hyperframes/knowledge-poc/security scripts/hyperframes/serve-review-shell.ts scripts/hyperframes/test-preview-sandbox.ts
git commit -m "test: sandbox HyperFrames preview"
```

## Task 9: Freeze the quality gate and reproducible baseline before preview

**Files:**
- Create: `hyperframes/knowledge-poc/review/rubric.md`
- Create: `hyperframes/knowledge-poc/review/ballot.schema.json`
- Create: `hyperframes/knowledge-poc/review/caption-labels.schema.json`
- Create: `scripts/hyperframes/prepare-remotion-baseline.ts`
- Create: `scripts/hyperframes/score-caption-timing.ts`
- Create: `scripts/hyperframes/prepare-review.ts`
- Create: `scripts/hyperframes/aggregate-review.ts`

- [ ] **Step 1: Commit the rubric and schemas before seeing the final render**

Freeze four dimensions: composition variety, pacing, visual relevance, overall finish. Three blinded reviewers each choose A, B, or tie per dimension. HyperFrames passes only with majority preference in at least three dimensions; a dimension tie does not pass.

`caption-labels.schema.json` requires at least 20 manually labeled timed-unit boundaries with `id`, expected milliseconds, and observed milliseconds. `score-caption-timing.ts` calculates absolute errors, median, P95, and exits nonzero above 100ms/250ms.

- [ ] **Step 2: Make the Remotion baseline reproducible**

`prepare-remotion-baseline.ts` maps the locked script, generated audio manifest, four audio files, and same factual source set into ignored `work/remotion-baseline-props.json`; copies audio into ignored `public/hf-poc/<audio-digest>/`; and prints this exact command:

```bash
npx remotion render KnowledgeVideo \
  hyperframes/knowledge-poc/review/generated/remotion.mp4 \
  --props=hyperframes/knowledge-poc/work/remotion-baseline-props.json
```

Use 1920×1080 at 30 FPS. Do not add improvements unavailable to the existing pipeline.

- [ ] **Step 3: Define both comparison packs**

`prepare-review.ts` creates `same-assets/` and `best-achievable/` A/B packs with independent cryptographic assignments and separate answer keys. For this vector-only POC the media sets are intentionally identical; record that fact in each pack manifest rather than silently omitting the second required comparison.

- [ ] **Step 4: Define machine-checkable review outputs**

Store anonymous ballots under ignored `review/generated/<pack>/ballots/`. `aggregate-review.ts` validates exactly three ballots against the committed schema, resolves the answer key, and writes `result.json` with per-dimension counts and overall pass/fail.

- [ ] **Step 5: Add exact gate scripts before rendering**

Add to `package.json`:

```json
"hf:poc:baseline": "tsx scripts/hyperframes/prepare-remotion-baseline.ts --render",
"hf:poc:score-captions": "tsx scripts/hyperframes/score-caption-timing.ts --labels hyperframes/knowledge-poc/review/generated/caption-labels.json --approval hyperframes/knowledge-poc/work/approval.json",
"hf:poc:prepare-review": "tsx scripts/hyperframes/prepare-review.ts --approval hyperframes/knowledge-poc/work/approval.json",
"hf:poc:aggregate-review": "tsx scripts/hyperframes/aggregate-review.ts --approval hyperframes/knowledge-poc/work/approval.json"
```

Each script records and verifies the approved artifact digest and Remotion baseline digest. Caption scoring and aggregation exit non-zero when thresholds fail, ballots are stale/missing, or either pack does not pass.

- [ ] **Step 6: Test and commit the frozen gate**

Add small fixture tests for timing percentile math, A/B assignment completeness, digest matching, ballot validation, and tie failure. Then:

```bash
npm run test:hf-poc
git add package.json package-lock.json hyperframes/knowledge-poc/review scripts/hyperframes/prepare-remotion-baseline.ts scripts/hyperframes/score-caption-timing.ts scripts/hyperframes/prepare-review.ts scripts/hyperframes/aggregate-review.ts
git commit -m "test: freeze HyperFrames quality gate"
```

## Task 10: Preview, bind approval to digest, and render

**Files:**
- Create: `scripts/hyperframes/approve-poc.ts`
- Create: `scripts/hyperframes/render-approved-poc.ts`
- Create: `hyperframes/knowledge-poc/README.md`

- [ ] **Step 1: Preview the exact immutable digest**

Run `npm run hf:poc:preview`. The script reads `work/latest-artifact.json`, verifies its manifest, serves the custom CSP-enforced preview wrapper and artifact on port 4312 plus the trusted sandbox shell on port 4311, then reports only the shell URL. Stop for user review.

Visual feedback changes source fixtures or Builder code, creates a new digest, and repeats build + gates. Never patch a published artifact.

- [ ] **Step 2: Record approval**

After explicit approval, run:

```bash
npm run hf:poc:approve
```

`approve-poc.ts` re-verifies the artifact and writes ignored `work/approval.json` containing digest, manifest SHA-256, approval timestamp, and source commit. It refuses a dirty source tree unless only ignored generated files differ.

- [ ] **Step 3: Render only the approved digest**

`render-approved-poc.ts` reads `approval.json`, verifies the digest path and every file immediately before render, then runs:

```bash
hyperframes render <approved-artifact-dir> --docker --strict --strict-variables \
  --output hyperframes/knowledge-poc/review/generated/hyperframes.mp4
```

It fails if `latest-artifact.json` points elsewhere, any byte changed, Docker is unavailable, or no approval exists. Verify one video stream, one audio stream, and duration within one frame of AudioManifest.

- [ ] **Step 4: Commit workflow documentation**

Document timestamp spike, audio, build, verify, sandbox preview, approval, render, caption scoring, and blinded review commands.

```bash
git add scripts/hyperframes/approve-poc.ts scripts/hyperframes/render-approved-poc.ts hyperframes/knowledge-poc/README.md
git commit -m "docs: bind HyperFrames preview approval to render"
```

## Task 11: Run the blinded quality decision

- [ ] **Step 1: Render the frozen Remotion baseline**

```bash
npm run hf:poc:baseline
```

The command prepares exact props, renders, runs ffprobe, and writes the baseline digest. Stop on stream/duration failure.

- [ ] **Step 2: Score caption timing**

Label at least 20 boundaries without changing the committed schema or thresholds, then run:

```bash
npm run hf:poc:score-captions
```

Stop on median >100ms, P95 >250ms, stale approval digest, or invalid labels.

- [ ] **Step 3: Prepare and distribute both blinded packs**

```bash
npm run hf:poc:prepare-review
```

Distribute `same-assets` and `best-achievable` A/B videos without answer keys; collect exactly three schema-valid ballots per pack.

- [ ] **Step 4: Aggregate three ballots**

```bash
npm run hf:poc:aggregate-review
```

The command exits non-zero unless both `result.json` payloads have `pass: true` and current approved/baseline digests. If either fails, improve only the demonstrated Builder/scene weakness and repeat milestone 1; do not start database or UI work.

## Final verification

Run from repository root:

```bash
npm run lint
npm run test:hf-poc
npm run hf:poc:doctor
npm run hf:poc:timestamp-spike
npm run hf:poc:build
npm run hf:poc:verify
npm run hf:poc:preview -- --malicious-test
npm run hf:poc:render
npm run hf:poc:baseline
npm run hf:poc:score-captions
npm run hf:poc:prepare-review
npm run hf:poc:aggregate-review
test -s hyperframes/knowledge-poc/review/generated/hyperframes.mp4
ffprobe -v error -show_entries format=duration -show_streams -of json \
  hyperframes/knowledge-poc/review/generated/hyperframes.mp4
node -e "for (const p of ['same-assets','best-achievable']) { const r=require('./hyperframes/knowledge-poc/review/generated/'+p+'/result.json'); if (r.pass !== true) process.exit(1); }"
node -e "const a=require('./hyperframes/knowledge-poc/work/approval.json'); for (const p of ['same-assets','best-achievable']) { const r=require('./hyperframes/knowledge-poc/review/generated/'+p+'/result.json'); if (r.artifactDigest !== a.artifactDigest) process.exit(1); }"

git status --short
```

Expected:

- lint and all POC tests pass;
- required environment capabilities report healthy;
- the real Chinese timestamp spike passes its declared unit/coverage gate;
- static, runtime, layout, assembled snapshot, determinism, XSS, and preview-sandbox gates pass;
- approval digest matches the immutable artifact rendered to the final MP4;
- final MP4 has valid audio/video streams and caption timing meets the frozen threshold;
- both blinded review packs pass and have machine-readable results;
- only intentionally ignored generated media remains outside git before milestone 2 is planned.
