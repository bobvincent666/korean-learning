import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// These pairs produce identical phoneme sequences in the pinned model's Korean G2P.
const allowedHomophones = new Set([
  ['뇌', '눼'], ['뢰', '뤠'], ['뫼', '뭬'], ['외', '웨'], ['차', '챠']
].map(group => group.sort().join('\0')));

export function assertDistinctPronunciations(hashesByText) {
  const groups = new Map();
  for (const [text, hash] of Object.entries(hashesByText)) {
    if (!groups.has(hash)) groups.set(hash, []);
    groups.get(hash).push(text);
  }
  for (const texts of groups.values()) {
    if (texts.length > 1 && !allowedHomophones.has(texts.sort().join('\0'))) {
      throw new Error(`Duplicate audio for distinct Korean texts: ${texts.join(', ')}`);
    }
  }
}

export async function verifyAudioAssets(manifest, projectRoot) {
  const entries = Object.entries(manifest.items || {});
  if (!entries.length) throw new Error('Audio manifest is empty');
  const hashesByText = {};
  for (const [text, relativePath] of entries) {
    if (!/^audio\/[a-f0-9]{24}\.mp3$/.test(relativePath)) {
      throw new Error(`Invalid audio path for ${text}: ${relativePath}`);
    }
    const file = resolve(projectRoot, relativePath);
    let metadata;
    try { metadata = await stat(file); }
    catch { throw new Error(`Missing audio for ${text}: ${relativePath}`); }
    if (metadata.size === 0) throw new Error(`Empty audio for ${text}: ${relativePath}`);
    let duration;
    let maxVolume;
    try {
      const probe = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file]);
      duration = Number(probe.stdout.trim());
      const decoded = await run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'volumedetect', '-f', 'null', '-']);
      maxVolume = Number(decoded.stderr.match(/max_volume:\s*([-\d.]+) dB/)?.[1]);
    } catch (error) {
      throw new Error(`Invalid audio for ${text}: ${relativePath} (${error.message})`);
    }
    if (!Number.isFinite(duration) || duration < 0.05) throw new Error(`Invalid audio duration for ${text}: ${relativePath}`);
    if (!Number.isFinite(maxVolume) || maxVolume < -55) throw new Error(`Silent audio for ${text}: ${relativePath}`);
    hashesByText[text] = createHash('sha256').update(await readFile(file)).digest('hex');
  }
  assertDistinctPronunciations(hashesByText);
  return { verified: entries.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = JSON.parse(await readFile(resolve(root, 'audio/manifest.json'), 'utf8'));
  try {
    const report = await verifyAudioAssets(manifest, root);
    console.log(`Verified ${report.verified} Korean audio files`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
