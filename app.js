import { grammarLessons, groups, videos } from './data.js';
import {
  renderGrammarIndex,
  renderGrammarLesson,
  renderGrammarNav,
  renderGrid,
  renderLessonOutline,
  renderLessons,
  renderVideos
} from './render.js';
import { resolveRoute } from './route.js';
import { createSpeaker } from './speech.js';
import { createAudioSpeaker } from './audio-player.js';

const $ = selector => document.querySelector(selector);
const scrollBehavior = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
$('#grids').innerHTML = groups.map(renderGrid).join('');
$('#lessons').innerHTML = groups.map(renderLessons).join('');
$('#videos').innerHTML = renderVideos(videos);
$('#grammar-nav').innerHTML = renderGrammarNav(grammarLessons);
$('#course-home-list').innerHTML = renderGrammarIndex(grammarLessons);
$('.course-overview-heading h2').textContent = `按顺序学习 · ${grammarLessons.length} 节课程`;

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

const panelCopy = {
  home: ['START HERE', '从零开始，建立你的韩语课程路径', '先学字母和发音，再进入单词、句子与日常语法。'],
  hangul: ['01 / HANGUL', '韩文字母与拼读', '先认横轴元音，再认纵轴辅音。每一个交叉格都可以点开听。'],
  words: ['02 / WORDS & SENTENCES', '从一个字，走进一句话', '挑真实常用的词，顺着音节一步步读到完整表达。'],
  grammar: ['KOREA / COURSES', '完整课程目录', '按本地 Korea 笔记的编号学习，课程原文、练习和答案全部保留。'],
  videos: ['04 / WATCH & PRACTICE', '视频学习', '先看韩文如何组成，再把声音放进真实对话。']
};

const lessonIds = grammarLessons.map(lesson => lesson.id);
const panels = [...document.querySelectorAll('[data-panel]')];
const mobileCourseMenu = window.matchMedia('(max-width:1120px)');
let currentLessonId = null;

function closeCourseMenu() {
  if ($('#course-sidebar').contains(document.activeElement)) $('#course-menu-button').focus();
  $('#course-shell').classList.remove('menu-open');
  $('#course-menu-button').setAttribute('aria-expanded', 'false');
  $('#course-sidebar').inert = mobileCourseMenu.matches;
}

function applyRoute(event) {
  const route = resolveRoute(window.location.hash, lessonIds);
  const lesson = route.lessonId ? grammarLessons.find(item => item.id === route.lessonId) : null;
  const lessonChanged = lesson && lesson.id !== currentLessonId;
  currentLessonId = lesson?.id || null;
  const canonicalHash = `#${lesson?.id || route.page}`;
  if (window.location.hash !== canonicalHash) history.replaceState(null, '', canonicalHash);

  for (const panel of panels) panel.hidden = panel.dataset.panel !== route.page;
  document.querySelectorAll('.top-nav a').forEach(link => {
    if (link.dataset.page === route.page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-route]').forEach(link => {
    link.classList.toggle('is-active', link.getAttribute('href') === canonicalHash);
  });

  const copy = panelCopy[route.page];
  $('#workspace-kicker').textContent = lesson ? `第 ${String(lesson.number).padStart(2, '0')} 课` : copy[0];
  $('#workspace-title').textContent = lesson ? lesson.title : copy[1];
  $('#workspace-description').textContent = lesson ? lesson.summary : copy[2];
  $('#workspace-header').hidden = route.page === 'home' || Boolean(lesson);

  const grammarContent = $('#grammar-content');
  grammarContent.innerHTML = lesson
    ? renderGrammarLesson(lesson, grammarLessons)
    : renderGrammarIndex(grammarLessons);
  $('#page-outline').innerHTML = lesson ? renderLessonOutline(lesson) : '';
  $('#page-outline').hidden = !lesson;
  $('#course-shell').classList.toggle('has-outline', Boolean(lesson));

  const hasAudioControls = route.page === 'hangul' || route.page === 'words';
  $('#audio-controls').hidden = !hasAudioControls;
  $('#speech-status').hidden = !hasAudioControls;
  const title = lesson ? `第 ${String(lesson.number).padStart(2, '0')} 课｜${lesson.title}` : copy[1];
  document.title = `${title}｜零基础韩语课`;
  closeCourseMenu();
  if (event?.type === 'hashchange' && lessonChanged) {
    const heading = $('.lesson-title h1');
    heading.focus({ preventScroll:true });
    heading.scrollIntoView({ behavior:scrollBehavior(), block:'start' });
  }
}

$('#course-menu-button').addEventListener('click', () => {
  if ($('#course-shell').classList.contains('menu-open')) return closeCourseMenu();
  $('#course-shell').classList.add('menu-open');
  $('#course-menu-button').setAttribute('aria-expanded', 'true');
  $('#course-sidebar').inert = false;
  $('#course-sidebar a').focus();
});
$('#course-backdrop').addEventListener('click', closeCourseMenu);
mobileCourseMenu.addEventListener('change', closeCourseMenu);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeCourseMenu();
  if (event.key === 'Tab' && $('#course-shell').classList.contains('menu-open')) {
    const links = [...$('#course-sidebar').querySelectorAll('a')];
    const edge = event.shiftKey ? links[0] : links.at(-1);
    if (document.activeElement === edge || !$('#course-sidebar').contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? links.at(-1) : links[0]).focus();
    }
  }
});
window.addEventListener('hashchange', applyRoute);

document.addEventListener('click', event => {
  if (event.target.closest('.skip-link')) {
    event.preventDefault();
    $('#main').focus();
    return;
  }
  if (event.target.closest('[data-route]')) closeCourseMenu();
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
  const outlineLink = event.target.closest('[data-outline]');
  if (outlineLink) {
    event.preventDefault();
    document.getElementById(outlineLink.dataset.outline)?.scrollIntoView({ behavior:scrollBehavior(), block:'start' });
    return;
  }
  const gridButton = event.target.closest('[data-grid]');
  if (gridButton) {
    event.preventDefault();
    window.location.hash = 'hangul';
    requestAnimationFrame(() => $(`#grid-${gridButton.dataset.grid}`).scrollIntoView({ behavior:scrollBehavior(), block:'start' }));
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
    player.scrollIntoView({ behavior:scrollBehavior(), block:'center' });
  }
});

$('#repeat-button').addEventListener('click', () => {
  if (!speaker.repeat()) {
    if (speaker.available()) showStatus('还没有可重复的发音。先点一个小喇叭。', true);
    else updateVoiceStatus();
  }
  else showStatus('正在重复上一段韩语。');
});

applyRoute();
