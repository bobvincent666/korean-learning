import test from 'node:test';
import assert from 'node:assert/strict';
import { compose, reading, vowelDemo } from '../hangul.js';
import { groups } from '../data.js';

test('Hangul composition matches representative syllables', () => {
  assert.equal(compose(0, 0), '가');
  assert.equal(compose(1, 20), '끼');
  assert.equal(compose(11, 9), '와');
  assert.equal(vowelDemo(0), '아');
  assert.equal(reading('', 'wa'), 'wa');
  assert.throws(() => compose(19, 0), RangeError);
});

test('four groups reproduce the confirmed printed axes', () => {
  assert.deepEqual(groups.map(g => [g.vowels.length, g.consonants.length]), [[5,5],[3,5],[7,5],[6,4]]);
  assert.deepEqual(groups[0].vowels.map(v => v.jamo), ['ㅏ','ㅓ','ㅗ','ㅜ','ㅡ']);
  assert.deepEqual(groups[1].consonants.map(c => c.jamo), ['ㄲ','ㄸ','ㅃ','ㅆ','ㅉ']);
  assert.deepEqual(groups[2].vowels.map(v => v.jamo), ['ㅑ','ㅕ','ㅛ','ㅠ','ㅒ','ㅖ','ㅢ']);
  assert.deepEqual(groups[3].vowels.map(v => v.jamo), ['ㅘ','ㅝ','ㅟ','ㅚ','ㅞ','ㅙ']);
  assert.equal(groups.reduce((sum, g) => sum + g.vowels.length * g.consonants.length, 0), 99);
});

test('each group has real word and sentence lessons', () => {
  for (const group of groups) {
    assert.ok(group.lessons.length >= 3);
    for (const lesson of group.lessons) {
      for (const key of ['seed','word','wordRoman','meaning','sentence','sentenceRoman','translation']) {
        assert.ok(lesson[key], `${group.id} ${key}`);
      }
      assert.ok(lesson.word.includes(lesson.seed) || lesson.sentence.includes(lesson.seed));
    }
  }
});
