import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGrid, renderLessons, renderVideos } from '../render.js';
import { groups, videos } from '../data.js';
import {
  renderGrammarIndex,
  renderGrammarLesson,
  renderGrammarNav,
  renderLessonOutline
} from '../render.js';
import { grammarLessons } from '../data.js';

test('grid renders a button for each axis item and syllable', () => {
  const html = renderGrid(groups[0]);
  assert.equal((html.match(/class="sound-button"/g) || []).length, 5 + 5 + 25);
  assert.match(html, /data-speak="가"/);
  assert.match(html, /aria-label="朗读音节 가"/);
  assert.match(html, /标准罗马字/);
  assert.match(html, /class="group-index">01</);
});

test('lesson cards connect seed, word, and sentence with independent speech', () => {
  const html = renderLessons(groups[0]);
  assert.match(html, /加深拼读/);
  assert.match(html, /data-speak="가다"/);
  assert.match(html, /data-speak="제가 가요。"|data-speak="제가 가요\."/);
  assert.match(html, /去/);
});

test('video cards retain original link and do not autoplay', () => {
  const html = renderVideos(videos);
  assert.match(html, /https:\/\/www.youtube.com\/watch\?v=iOard-x3mKc/);
  assert.equal(videos.length, 3);
  assert.ok(videos.every(video => video.url.startsWith('https://www.youtube.com/watch?v=') && video.embed));
  assert.doesNotMatch(html, /autoplay=1/);
  assert.match(html, /打开原视频/);
});

test('course data contains the five numbered Korea source notes', () => {
  assert.deepEqual(grammarLessons.map(lesson => lesson.id), ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5']);
  assert.deepEqual(grammarLessons.map(lesson => lesson.title), [
    '音标',
    '语法 日常生活',
    '语法 主语助词',
    '场所助词',
    '天气与四季：안 否定与 그리고 连接'
  ]);
  assert.ok(grammarLessons.every(lesson => lesson.html.length > 0 && lesson.source));
  assert.ok(grammarLessons.slice(1).every(lesson => lesson.html.includes('查看参考答案')));
});

test('grammar navigation and index are generated from lesson data', () => {
  const nav = renderGrammarNav(grammarLessons);
  const index = renderGrammarIndex(grammarLessons);
  assert.match(nav, /href="#lesson-1"/);
  assert.match(nav, /第 03 课/);
  assert.match(index, /语法 日常生活/);
  assert.equal((index.match(/class="grammar-index-card"/g) || []).length, 5);
});

test('grammar lesson renders rules, exercises, collapsed answers and neighbors', () => {
  const html = renderGrammarLesson(grammarLessons[2], grammarLessons);
  assert.match(html, /第 03 课/);
  assert.match(html, /id="course-answers"/);
  assert.match(html, /<details class="answer-box" id="course-answers">/);
  assert.match(html, /<summary>查看参考答案<\/summary>/);
  assert.match(html, /href="#lesson-2"/);
  assert.match(html, /href="#lesson-4"/);
  assert.match(renderLessonOutline(grammarLessons[2]), /data-outline="course-answers"/);
});

test('grammar lesson heading accepts programmatic focus', () => {
  const html = renderGrammarLesson(grammarLessons[0], grammarLessons);
  assert.match(html, /<h1 tabindex="-1">音标<\/h1>/);
});

test('polite lesson explains the vowel contraction in 가요', () => {
  const html = renderGrammarLesson(grammarLessons[1], grammarLessons);
  assert.match(html, /가 \+ 아요 → 가요/);
});
