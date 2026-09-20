import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudioSpeaker } from '../audio-player.js';

function fakeAudio() {
  const instances = [];
  class AudioElement {
    constructor(src) {
      this.src = src;
      this.playbackRate = 1;
      this.preservesPitch = false;
      this.currentTime = 0;
      this.paused = false;
      this.playCalls = 0;
      instances.push(this);
    }
    play() {
      this.playCalls++;
      return this.playResult || Promise.resolve();
    }
    pause() { this.paused = true; }
  }
  return { AudioElement, instances };
}

test('bundled audio plays without a Korean system voice', () => {
  const { AudioElement, instances } = fakeAudio();
  const fallback = { available: () => false, speak: () => { throw new Error('must not synthesize'); }, stop: () => {} };
  const speaker = createAudioSpeaker({ '가': 'audio/ga.mp3' }, AudioElement, fallback);
  assert.equal(speaker.available(), true);
  assert.equal(speaker.hasRecordedAudio(), true);
  assert.equal(speaker.speak('가'), true);
  assert.equal(instances[0].src, 'audio/ga.mp3');
  assert.equal(instances[0].playCalls, 1);
});

test('slow and repeat preserve rate and stop previous recording', () => {
  const { AudioElement, instances } = fakeAudio();
  let stopped = 0;
  const fallback = { available: () => false, speak: () => false, stop: () => stopped++ };
  const speaker = createAudioSpeaker({ '가': 'audio/ga.mp3' }, AudioElement, fallback);
  assert.equal(speaker.speak('가', { slow: true }), true);
  assert.equal(instances[0].playbackRate, 0.78);
  assert.equal(instances[0].preservesPitch, true);
  assert.equal(speaker.repeat(), true);
  assert.equal(instances[0].paused, true);
  assert.equal(instances[1].src, 'audio/ga.mp3');
  assert.equal(instances[1].playbackRate, 0.78);
  assert.equal(stopped, 2);
});

test('missing recording uses the Korean-only fallback', () => {
  const { AudioElement, instances } = fakeAudio();
  const spoken = [];
  const fallback = { available: () => true, speak: (text, options) => { spoken.push([text, options.slow]); return true; }, stop: () => {} };
  const speaker = createAudioSpeaker({}, AudioElement, fallback);
  assert.equal(speaker.hasRecordedAudio(), false);
  assert.equal(speaker.speak('나', { slow: true }), true);
  assert.deepEqual(spoken, [['나', true]]);
  assert.equal(instances.length, 0);
});

test('failed recording reports an error when no Korean fallback exists', async () => {
  const { AudioElement, instances } = fakeAudio();
  let errors = 0;
  const speaker = createAudioSpeaker({ '가': 'audio/ga.mp3' }, AudioElement, {
    available: () => false, speak: () => false, stop: () => {}
  });
  assert.equal(speaker.speak('가', { onError: () => errors++ }), true);
  instances[0].onerror();
  await Promise.resolve();
  assert.equal(errors, 1);
});

test('rejected play promise reports an error when fallback is unavailable', async () => {
  const { AudioElement } = fakeAudio();
  class RejectingAudio extends AudioElement {
    play() { this.playCalls++; return Promise.reject(new Error('play blocked')); }
  }
  let errors = 0;
  const speaker = createAudioSpeaker({ '가': 'audio/ga.mp3' }, RejectingAudio, {
    available: () => false, speak: () => false, stop: () => {}
  });
  assert.equal(speaker.speak('가', { onError: () => errors++ }), true);
  await Promise.resolve();
  assert.equal(errors, 1);
});

test('synchronous playback failure is not reported as playing', () => {
  const { AudioElement } = fakeAudio();
  class ThrowingAudio extends AudioElement {
    play() { throw new Error('play blocked immediately'); }
  }
  let errors = 0;
  const speaker = createAudioSpeaker({ '가': 'audio/ga.mp3' }, ThrowingAudio, {
    available: () => false, speak: () => false, stop: () => {}
  });
  assert.equal(speaker.speak('가', { onError: () => errors++ }), false);
  assert.equal(errors, 1);
});

test('media errors fall back only once and ignore stale failures', async () => {
  const { AudioElement, instances } = fakeAudio();
  const spoken = [];
  const fallback = { available: () => true, speak: text => { spoken.push(text); return true; }, stop: () => {} };
  const speaker = createAudioSpeaker({ '가': 'audio/ga.mp3', '나': 'audio/na.mp3' }, AudioElement, fallback);
  speaker.speak('가');
  const old = instances[0];
  const oldFailure = old.onerror;
  speaker.speak('나');
  oldFailure();
  assert.deepEqual(spoken, []);
  const newFailure = instances[1].onerror;
  newFailure();
  newFailure();
  await Promise.resolve();
  assert.deepEqual(spoken, ['나']);
});
