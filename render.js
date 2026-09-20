import { compose, reading, vowelDemo } from './hangul.js';

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
})[char]);

const soundButton = (text, label, extra = '') =>
  `<button class="sound-button" type="button" data-speak="${escapeHtml(text)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}" ${extra}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Zm12-1.5a6 6 0 0 1 0 9m2.5-11.5a9 9 0 0 1 0 14"/></svg></button>`;

export function renderGrid(group) {
  const head = group.vowels.map(v => `<th scope="col"><div class="axis-item"><span class="axis-jamo">${v.jamo}</span><span class="axis-roman">${v.roman}</span>${soundButton(vowelDemo(v.index), `朗读元音 ${v.jamo}，示范音 ${vowelDemo(v.index)}`)}</div></th>`).join('');
  const rows = group.consonants.map(c => {
    const cells = group.vowels.map(v => {
      const syllable = compose(c.index, v.index);
      return `<td><div class="syllable-item"><span class="syllable">${syllable}</span><span class="cell-roman">${reading(c.roman, v.roman)}</span>${soundButton(syllable, `朗读音节 ${syllable}`)}</div></td>`;
    }).join('');
    return `<tr><th scope="row"><div class="axis-item consonant"><span class="axis-jamo">${c.jamo}</span><span class="axis-roman">${c.roman || '不发音'}</span>${soundButton(c.demo, `朗读辅音 ${c.jamo}，示范音 ${c.demo}`)}</div></th>${cells}</tr>`;
  }).join('');
  return `<section class="group-card" id="grid-${group.id}"><div class="group-head"><div><span class="group-index">${String(group.number).padStart(2,'0')}</span><h3>${group.title}</h3></div><p>${group.tag}</p></div><div class="table-scroll"><table><caption>${group.title}｜横轴元音，纵轴辅音；小字为标准罗马字</caption><thead><tr><th scope="col" class="corner-cell"><span>辅音 ↓<br>元音 →</span></th>${head}</tr></thead><tbody>${rows}</tbody></table></div><p class="grid-note">点击小喇叭听韩语发音。辅音按钮播放旁注的示范音节，不把字母名称当作辅音音值。</p></section>`;
}

export function renderLessons(group) {
  const cards = group.lessons.map((lesson, index) => `<article class="lesson-card"><div class="lesson-top"><span class="lesson-count">${String(index + 1).padStart(2,'0')}</span><span class="seed-chip">起点音节 <b>${lesson.seed}</b></span></div><div class="lesson-word"><div><span class="lesson-korean">${lesson.word}</span><span class="lesson-roman">${lesson.wordRoman}</span></div>${soundButton(lesson.word, `朗读单词 ${lesson.word}`)}</div><p class="meaning">${lesson.meaning}</p><div class="lesson-divider"><span>加深拼读</span><i></i></div><div class="lesson-sentence"><div><span class="lesson-korean sentence-text">${lesson.sentence}</span><span class="lesson-roman">${lesson.sentenceRoman}</span></div>${soundButton(lesson.sentence, `朗读句子 ${lesson.sentence}`)}</div><p class="translation">${lesson.translation}</p></article>`).join('');
  return `<section class="lesson-group" id="lesson-${group.id}"><div class="lesson-group-head"><span class="group-index">${String(group.number).padStart(2,'0')}</span><div><h3>${group.title}</h3><p>从熟悉的音节，走到真实表达。</p></div><button class="text-link" type="button" data-grid="${group.id}">查看拼读表 ↗</button></div><div class="lesson-grid">${cards}</div></section>`;
}

export function renderVideos(videos) {
  return videos.map((video, index) => `<article class="video-card"><div class="video-art video-art-${index + 1}" aria-hidden="true"><span>${String(index + 1).padStart(2,'0')}</span><b>가나다</b></div><div class="video-copy"><span class="video-stage">${video.stage}</span><h3>${video.title}</h3><p class="video-source">${video.source}</p><p class="video-description">${video.description}</p><div class="video-actions">${video.embed ? `<button type="button" class="primary-small" data-embed="${escapeHtml(video.embed)}" data-title="${escapeHtml(video.title)}">在页面播放</button>` : ''}<a href="${escapeHtml(video.url)}" target="_blank" rel="noopener noreferrer">打开原视频 ↗</a></div></div></article>`).join('');
}
