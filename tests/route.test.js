import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoute } from '../route.js';

const lessonIds = ['lesson-1', 'lesson-2', 'lesson-3'];

test('top-level hashes select their page', () => {
  assert.deepEqual(resolveRoute('#hangul', lessonIds), { page: 'hangul', lessonId: null });
  assert.deepEqual(resolveRoute('#grammar', lessonIds), { page: 'grammar', lessonId: null });
});

test('lesson hashes select the grammar page and requested lesson', () => {
  assert.deepEqual(resolveRoute('#lesson-2', lessonIds), { page: 'grammar', lessonId: 'lesson-2' });
});

test('empty, unknown and malformed hashes fall back to home', () => {
  assert.deepEqual(resolveRoute('', lessonIds), { page: 'home', lessonId: null });
  assert.deepEqual(resolveRoute('#unknown', lessonIds), { page: 'home', lessonId: null });
  assert.deepEqual(resolveRoute('#%E0%A4%A', lessonIds), { page: 'home', lessonId: null });
});
