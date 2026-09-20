import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { groups } from '../data.js';
import { renderGrid, renderLessons } from '../render.js';
import { collectUtterances, audioPath, makeManifest } from '../tools/audio-corpus.js';

test('audio corpus normalizes and deduplicates spoken text', () => {
  const sample = [{
    vowels: [{ index: 0 }],
    consonants: [{ index: 0, demo: '가' }],
    lessons: [{ word: '가', sentence: '가' }]
  }];
  assert.deepEqual(collectUtterances(sample), ['가', '아']);
});

test('audio paths are stable hashes of normalized Korean text', () => {
  assert.equal(audioPath('가'), 'audio/64ee5293d31bc58b72d76ae9.mp3');
  assert.equal(audioPath('가'), audioPath('가'));
});

test('manifest covers all current sound buttons exactly once', () => {
  const manifest = makeManifest(groups);
  assert.equal(manifest.schema, 1);
  assert.equal(manifest.model, 'ppaso-tts-v1');
  assert.equal(Object.keys(manifest.items).length, 149);
  assert.equal(new Set(Object.values(manifest.items)).size, 149);
  for (const group of groups) {
    const html = renderGrid(group) + renderLessons(group);
    for (const match of html.matchAll(/data-speak="([^"]+)"/g)) {
      assert.ok(manifest.items[match[1]], `missing audio for ${match[1]}`);
    }
  }
});

test('exported manifest matches current data', async () => {
  const saved = JSON.parse(await readFile(new URL('../audio/manifest.json', import.meta.url), 'utf8'));
  assert.deepEqual(saved, makeManifest(groups));
});
