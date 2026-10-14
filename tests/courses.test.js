import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { courses } from '../course-data.js';
import { resolveRoute } from '../route.js';

test('compiled courses match the tracked source notes', async () => {
  for (const course of courses) {
    const bytes = await readFile(new URL(`../${course.source}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), course.sourceHash, `${course.source} needs rebuilding`);
    assert.deepEqual(resolveRoute(`#${course.id}`, courses.map(item => item.id)), { page: 'grammar', lessonId: course.id });
  }
});

test('complete notes preserve their final exercises and key vocabulary', () => {
  assert.match(courses[0].html, /<img[^>]+src="\.\/courses\/image\//);
  assert.match(courses[0].html, /href="#hangul"/);
  assert.match(courses[1].html, /练习五/);
  assert.match(courses[1].html, /우유하고 과일을 사요/);
  assert.match(courses[2].html, /练习六/);
  assert.match(courses[2].html, /냉장고에 뭐가 있어요/);
  assert.match(courses[3].html, /들었어요/);
  assert.match(courses[4].html, /여름/);
  assert.match(courses[4].html, /운동을 <strong>안 해요<\/strong>/);
  for (const course of courses.slice(1)) {
    assert.match(course.html, /class="course-table-scroll"/);
    assert.match(course.html, /<details class="answer-box" id="course-answers">/);
    assert.doesNotMatch(course.html, /<details[^>]+\bopen\b/);
  }
});
