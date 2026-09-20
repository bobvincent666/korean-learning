import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGrid, renderLessons, renderVideos } from '../render.js';
import { groups, videos } from '../data.js';

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
