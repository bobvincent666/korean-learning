import { createHash } from 'node:crypto';
import { compose, vowelDemo } from '../hangul.js';

export function collectUtterances(groups) {
  const texts = new Set();
  const add = text => texts.add(text.normalize('NFC'));
  for (const group of groups) {
    for (const vowel of group.vowels) add(vowelDemo(vowel.index));
    for (const consonant of group.consonants) {
      add(consonant.demo);
      for (const vowel of group.vowels) add(compose(consonant.index, vowel.index));
    }
    for (const lesson of group.lessons) {
      add(lesson.word);
      add(lesson.sentence);
    }
  }
  return [...texts].sort();
}

export function audioPath(text) {
  const hash = createHash('sha256').update(text.normalize('NFC'), 'utf8').digest('hex').slice(0, 24);
  return `audio/${hash}.mp3`;
}

export function makeManifest(groups) {
  return {
    schema: 1,
    model: 'ppaso-tts-v1',
    items: Object.fromEntries(collectUtterances(groups).map(text => [text, audioPath(text)]))
  };
}
