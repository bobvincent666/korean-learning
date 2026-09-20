import { groups, videos } from './data.js';
import { renderGrid, renderLessons, renderVideos } from './render.js';
import { createSpeaker } from './speech.js';
import { createAudioSpeaker } from './audio-player.js';

const $ = selector => document.querySelector(selector);
$('#grids').innerHTML = groups.map(renderGrid).join('');
$('#lessons').innerHTML = groups.map(renderLessons).join('');
$('#videos').innerHTML = renderVideos(videos);

const browserSpeaker = createSpeaker(window.speechSynthesis, window.SpeechSynthesisUtterance);
let audioItems = {};
try {
  const response = await fetch(new URL('./audio/manifest.json', import.meta.url));
  if (!response.ok) throw new Error(`Audio manifest: ${response.status}`);
  const manifest = await response.json();
  if (manifest.schema !== 1 || !manifest.items || typeof manifest.items !== 'object') {
    throw new Error('Invalid audio manifest');
  }
  audioItems = manifest.items;
} catch {
  audioItems = {};
}
const speaker = createAudioSpeaker(audioItems, window.Audio, browserSpeaker);
const status = $('#speech-status');
const speed = $('#speed-select');
let statusTimer;

function showStatus(message, warning = false) {
  status.textContent = message;
  status.classList.toggle('warning', warning);
  status.classList.add('is-visible');
  clearTimeout(statusTimer);
  if (!warning) statusTimer = setTimeout(() => status.classList.remove('is-visible'), 3600);
}

function updateVoiceStatus() {
  if (speaker.hasRecordedAudio()) {
    status.textContent = '韩语音频已就绪。点击任意小喇叭开始听，无需安装韩语语音包。';
    status.classList.remove('warning');
  } else if (browserSpeaker.available()) {
    status.textContent = '预生成音频暂时不可用，正在使用浏览器的韩语语音。';
    status.classList.remove('warning');
  } else {
    status.textContent = '预生成音频加载失败，浏览器也没有韩语语音。请检查网络或稍后重试。';
    status.classList.add('warning', 'is-visible');
  }
}

if (window.speechSynthesis) {
  window.speechSynthesis.addEventListener?.('voiceschanged', updateVoiceStatus);
  setTimeout(updateVoiceStatus, 500);
}
updateVoiceStatus();

const tabs = [...document.querySelectorAll('[role="tab"]')];
const panelCopy = {
  grid: ['01 / SOUND TABLES', '把声音排成一张地图', '先认横轴元音，再认纵轴辅音。每一个交叉格，都可以点开听。'],
  lessons: ['02 / WORDS & SENTENCES', '从一个字，走进一句话', '挑真实常用的词，顺着音节一步步读到完整表达。'],
  videos: ['03 / WATCH & PRACTICE', '听一遍，再跟着说', '先看韩文如何组成，再把声音放进真实对话。']
};

function activateTab(name, focus = false) {
  for (const tab of tabs) {
    const active = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus();
    $(`#panel-${tab.dataset.tab}`).hidden = !active;
  }
  const [kicker, title, description] = panelCopy[name];
  $('#workspace-kicker').textContent = kicker;
  $('#workspace-title').textContent = title;
  $('#workspace-description').textContent = description;
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    activateTab(tabs[next].dataset.tab, true);
  });
});

document.addEventListener('click', event => {
  const soundButton = event.target.closest('[data-speak]');
  if (soundButton) {
    const played = speaker.speak(soundButton.dataset.speak, {
      slow: speed.value === 'slow',
      onError: () => showStatus('音频播放失败。请检查网络，或稍后重试。', true)
    });
    if (played) {
      document.querySelectorAll('.is-speaking').forEach(el => el.classList.remove('is-speaking'));
      soundButton.classList.add('is-speaking');
      showStatus(`正在朗读：${soundButton.dataset.speak}`);
      setTimeout(() => soundButton.classList.remove('is-speaking'), 1100);
    } else if (speaker.available()) showStatus('发音播放失败。请稍后重试。', true);
    else updateVoiceStatus();
    return;
  }
  const switchButton = event.target.closest('[data-switch]');
  if (switchButton) {
    activateTab(switchButton.dataset.switch);
    $('.workspace').scrollIntoView({ behavior:'smooth', block:'start' });
    return;
  }
  const gridButton = event.target.closest('[data-grid]');
  if (gridButton) {
    activateTab('grid');
    $(`#grid-${gridButton.dataset.grid}`).scrollIntoView({ behavior:'smooth', block:'start' });
    return;
  }
  const embedButton = event.target.closest('[data-embed]');
  if (embedButton) {
    const player = $('#video-player');
    player.hidden = false;
    player.replaceChildren();
    const frame = document.createElement('iframe');
    frame.src = embedButton.dataset.embed;
    frame.title = embedButton.dataset.title;
    frame.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    player.append(frame);
    player.scrollIntoView({ behavior:'smooth', block:'center' });
  }
});

$('#repeat-button').addEventListener('click', () => {
  if (!speaker.repeat()) {
    if (speaker.available()) showStatus('还没有可重复的发音。先点一个小喇叭。', true);
    else updateVoiceStatus();
  }
  else showStatus('正在重复上一段韩语。');
});
