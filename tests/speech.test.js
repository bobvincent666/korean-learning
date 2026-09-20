import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseKoreanVoice, createSpeaker } from '../speech.js';

test('selects Korean voice only', () => {
  assert.equal(chooseKoreanVoice([{lang:'en-US'},{lang:'ko-KR',name:'Korean'}]).name, 'Korean');
  assert.equal(chooseKoreanVoice([{lang:'zh-CN'},{lang:'en-US'}]), null);
  assert.equal(chooseKoreanVoice([{lang:'ko',name:'Generic Korean'}]).name, 'Generic Korean');
});

test('speaker cancels old speech, uses Korean voice and remembers repeat', () => {
  const spoken = [];
  const synthesis = {
    getVoices: () => [{lang:'ko-KR',name:'Korean'}],
    cancel: () => spoken.push('cancel'),
    speak: utterance => spoken.push(utterance)
  };
  const speaker = createSpeaker(synthesis, class { constructor(text) { this.text = text; } });
  assert.equal(speaker.speak('가', {slow:true}), true);
  assert.equal(spoken[0], 'cancel');
  assert.equal(spoken[1].text, '가');
  assert.equal(spoken[1].lang, 'ko-KR');
  assert.equal(spoken[1].rate, 0.78);
  assert.equal(speaker.repeat(), true);
  assert.equal(spoken[3].text, '가');
});

test('speaker refuses playback without Korean voice', () => {
  const synthesis = { getVoices: () => [{lang:'en-US'}], cancel: () => {}, speak: () => { throw new Error('must not speak'); } };
  const speaker = createSpeaker(synthesis, class {});
  assert.equal(speaker.speak('가'), false);
  assert.equal(speaker.repeat(), false);
});

test('speaker reports asynchronous synthesis failure', () => {
  let utterance;
  let reported = false;
  const synthesis = {
    getVoices: () => [{lang:'ko-KR',name:'Korean'}],
    cancel: () => {},
    speak: value => { utterance = value; }
  };
  const speaker = createSpeaker(synthesis, class { constructor(text) { this.text = text; } });
  assert.equal(speaker.speak('가', { onError: () => { reported = true; } }), true);
  utterance.onerror({ error:'synthesis-failed' });
  assert.equal(reported, true);
});

test('replacing speech does not report expected cancellation as failure', () => {
  let previous;
  let errors = 0;
  const synthesis = {
    getVoices: () => [{lang:'ko-KR'}],
    cancel: () => previous?.onerror?.({error:'interrupted'}),
    speak: utterance => { previous = utterance; }
  };
  const speaker = createSpeaker(synthesis, class { constructor(text) { this.text = text; } });
  speaker.speak('가', {onError: () => errors++});
  speaker.speak('나', {onError: () => errors++});
  assert.equal(errors, 0);
});

test('Korean browser speech can be stopped before recorded audio starts', () => {
  let cancellations = 0;
  const synthesis = { getVoices: () => [{lang:'ko-KR'}], cancel: () => cancellations++, speak: () => {} };
  const speaker = createSpeaker(synthesis, class { constructor(text) { this.text = text; } });
  speaker.stop();
  assert.equal(cancellations, 1);
});
