# Local Korean Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. No subagents are requested; execute inline.

**Goal:** Pre-generate every Korean pronunciation used by the learning page and play bundled audio before considering system TTS.

**Architecture:** Derive a deterministic manifest from `data.js`, synthesize each distinct text once with a pinned local ONNX Korean model, and ship MP3 files plus the manifest as ordinary static assets. A small audio player owns playback, speed, repeat and fallback to the existing Korean-only browser TTS.

**Tech Stack:** Node.js 22+, Python 3.12, `akamotaco/ppaso-tts-v1` at commit `53d09664c4f636a5fb6f2ebe3ec22cd83ee249b9`, ONNX Runtime, `python-mecab-ko`, FFmpeg, HTMLAudioElement.

## Global Constraints

- The existing four grids, lesson content, videos and Romanization remain unchanged.
- The site must play its bundled audio without a `ko-KR` browser voice or cloud TTS credential.
- Keep model weights and Python packages out of the deployed site and Git history; record model provenance and Apache-2.0 attribution.
- Preserve normal speed, slow speed at `0.78`, repeat, and Korean-only fallback.
- The current corpus has 149 unique Korean utterances; the export is recomputed from `data.js`.
- Generate deterministic `audio/manifest.json` entries and MP3 files. Do not overwrite an existing file unless explicitly requested.
- Never mark a failed or silent synthesis as a valid asset. Browser audio failure must show an error if Korean TTS fallback is unavailable.

---

### Task 1: Corpus, manifest and static serving

**Files:**
- Create: `tools/audio-corpus.js`, `tools/export-audio-manifest.js`, `tests/audio-corpus.test.js`
- Modify: `server.js`, `tests/server.test.js`, `package.json`
- Generate: `audio/manifest.json`

**Interfaces:**
- `collectUtterances(groups)` returns a sorted array of distinct NFC Korean strings.
- `audioPath(text)` returns `audio/<24 hex characters>.mp3` from SHA-256 of the normalized UTF-8 text.
- `makeManifest(groups)` returns `{schema:1, model:'ppaso-tts-v1', items:{[text]:path}}`.

- [ ] **Step 1: Write failing tests** in `tests/audio-corpus.test.js` for the three interfaces: deduplication (e.g. two occurrences of `가` produce one entry), stable hash path, exactly 149 current utterances, and all grid/lesson texts present. Extend `tests/server.test.js` to expect `/audio/manifest.json` as JSON and a sample MP3 as `audio/mpeg` once generated.
- [ ] **Step 2: Verify RED** with `node --test tests/audio-corpus.test.js tests/server.test.js`; expect the missing corpus module/manifest assertions to fail.
- [ ] **Step 3: Implement** `collectUtterances` by adding each vowel's `vowelDemo(index)`, each consonant's `demo`, every `compose(c.index,v.index)`, and every lesson's `word` and `sentence` into a `Set`, then NFC-normalizing and sorting. Implement `audioPath` with `createHash('sha256').update(text.normalize('NFC'),'utf8').digest('hex').slice(0,24)`. `export-audio-manifest.js` imports the current `groups`, calls `makeManifest`, creates `audio/`, and writes `JSON.stringify(manifest,null,2)+'\n'` to `audio/manifest.json`. Add MIME entries for `.json` and `.mp3` to `server.js`; add `"audio:manifest":"node tools/export-audio-manifest.js"` to `package.json`.
- [ ] **Step 4: Verify GREEN** with `npm run audio:manifest` and `node --test tests/audio-corpus.test.js tests/server.test.js`. The MP3 server assertion may run after Task 2 has generated an asset; until then test the MIME mapping with a temporary in-memory handler or defer only that assertion to Task 2.
- [ ] **Step 5: Commit** the source, tests, manifest, and serving changes, but no temporary files.

### Task 2: Local synthesis and asset verification

**Files:**
- Create: `tools/generate-audio.py`, `tools/requirements-audio.txt`, `tools/verify-audio.mjs`, `tests/audio-assets.test.js`
- Generate: `audio/*.mp3`
- Modify: `README.md`

**Interfaces:**
- `python tools/generate-audio.py --sample` creates a representative sample set without overwriting existing assets.
- `python tools/generate-audio.py` creates all missing assets from `audio/manifest.json`.
- `node tools/verify-audio.mjs` exits nonzero when a manifest item is absent, zero-byte, undecodable, or silent.

- [ ] **Step 1: Write failing tests** in `tests/audio-assets.test.js`: every manifest path must be relative and under `audio/`, every referenced asset must exist and be nonempty, and the verifier must reject a copied empty/truncated MP3 fixture. Run `node --test tests/audio-assets.test.js`; expect failure because assets/verifier do not exist.
- [ ] **Step 2: Create the minimal synthesis script**: read `audio/manifest.json`; download only `config.json`, `example/ppaso_tts.py`, `onnx/**`, and `runtime/**` from the pinned model revision via `huggingface_hub.snapshot_download`; load `PpasoTTS(snapshot,backend='onnx')` once; synthesize each requested Korean text; write a temporary WAV with `soundfile`; convert to mono MP3 with FFmpeg; reject NaN, all-zero audio, duration under 0.05 seconds or FFmpeg decode failure; atomically move each verified MP3 into its manifest path. Skip existing files by default and require `--force` to replace them. The sample mode chooses representatives from the four grids, one word and one sentence.
- [ ] **Step 3: Install isolated Python dependencies** in a task-specific virtual environment, run the sample generation, listen/inspect representative files, then generate all 149 assets. Do not add the virtual environment or model cache to Git. If the model cannot run on this Windows host, diagnose; do not silently switch model or substitute invalid audio.
- [ ] **Step 4: Implement verifier** using Node for manifest coverage and FFprobe/FFmpeg for decode, duration and non-silence; run `node tools/verify-audio.mjs`. Run the asset tests and `npm test`; expect zero failures and exactly 149 mapped paths.
- [ ] **Step 5: Update README** with regeneration instructions, source commit, Apache-2.0 attribution, audio quality caveat and need for Korean-proficient spot-check. Commit generated MP3s, verifier, tests, scripts and docs.

### Task 3: Bundled-audio player and browser fallback

**Files:**
- Create: `audio-player.js`, `tests/audio-player.test.js`
- Modify: `app.js`, `README.md`, `tests/server.test.js`

**Interfaces:**
- `createAudioSpeaker(items, AudioCtor, fallback)` exposes `available()`, `hasRecordedAudio()`, `speak(text,{slow,onError})`, and `repeat()`.
- `fallback` is the existing `createSpeaker(window.speechSynthesis,window.SpeechSynthesisUtterance)`.

- [ ] **Step 1: Write failing tests** in `tests/audio-player.test.js`: bundled audio plays with no Korean system voice; new playback stops the previous audio; slow sets `playbackRate` to `0.78`; repeat uses previous text and speed; missing/failed files try Korean fallback; both sources failing call `onError`. Use a minimal fake Audio element whose `play()` returns a resolved or rejected Promise, and a Korean-only fake fallback.
- [ ] **Step 2: Verify RED** with `node --test tests/audio-player.test.js`; expect missing `createAudioSpeaker`.
- [ ] **Step 3: Implement** `createAudioSpeaker` with one active `Audio` instance, a remembered `{text,slow,onError}`, and a once-only failure handler for media `error` and `play()` rejection. Asset URLs come only from manifest entries; do not synthesize or fetch text from a cloud API. In `app.js`, load `audio/manifest.json` once with `fetch(new URL('./audio/manifest.json',import.meta.url))`, initialize `createAudioSpeaker`, and update ready/error status copy. Preserve existing button delegation and repeat control.
- [ ] **Step 4: Verify GREEN** with `node --test tests/audio-player.test.js` and `npm test`. Start the local site and click a grid cell, a word, a sentence, slow and repeat with no `ko-KR` browser voice. Confirm successful MP3 requests, no console errors and no browser TTS calls on normal playback.
- [ ] **Step 5: Commit** player, tests and README changes. Final full verification: `npm test`, `node tools/verify-audio.mjs`, local HTTP checks for manifest and MP3, and `git status --short`.
