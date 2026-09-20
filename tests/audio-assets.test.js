import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertDistinctPronunciations, verifyAudioAssets } from '../tools/verify-audio.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifest = JSON.parse(await readFile(new URL('../audio/manifest.json', import.meta.url), 'utf8'));

test('manifest paths stay inside the bundled audio directory', () => {
  for (const path of Object.values(manifest.items)) {
    assert.match(path, /^audio\/[a-f0-9]{24}\.mp3$/);
  }
});

test('every published pronunciation asset is complete and audible', async () => {
  const report = await verifyAudioAssets(manifest, root);
  assert.equal(report.verified, 149);
});

test('asset verifier rejects an empty MP3', async () => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'korean-audio-test-'));
  const emptyName = '000000000000000000000000.mp3';
  try {
    await mkdir(join(fixtureRoot, 'audio'));
    await writeFile(join(fixtureRoot, 'audio', emptyName), '');
    await assert.rejects(
      verifyAudioAssets({ items: { '가': `audio/${emptyName}` } }, fixtureRoot),
      /empty audio/i
    );
  } finally {
    await unlink(join(fixtureRoot, 'audio', emptyName));
    await rmdir(join(fixtureRoot, 'audio'));
    await rmdir(fixtureRoot);
  }
});

test('asset verifier rejects audio collisions between different phonemes', () => {
  assert.throws(() => assertDistinctPronunciations({ '햐': 'same', '효': 'same' }), /duplicate audio/i);
  assert.doesNotThrow(() => assertDistinctPronunciations({ '웨': 'same', '외': 'same' }));
  assert.doesNotThrow(() => assertDistinctPronunciations({ '차': 'same', '챠': 'same' }));
  assert.doesNotThrow(() => assertDistinctPronunciations({ '뇌': 'same', '눼': 'same' }));
  assert.doesNotThrow(() => assertDistinctPronunciations({ '뢰': 'same', '뤠': 'same' }));
  assert.doesNotThrow(() => assertDistinctPronunciations({ '뫼': 'same', '뭬': 'same' }));
  assert.throws(() => assertDistinctPronunciations({ '웨': 'same', '외': 'same', '햐': 'same' }), /duplicate audio/i);
});
