# Korean Course Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Korean pronunciation page into a GitHub Pages-ready course site named “零基础韩语课”, with document-style navigation and three independent beginner grammar lessons.

**Architecture:** Keep the existing dependency-free HTML/CSS/JavaScript application. Add structured grammar data to `data.js`, render the course directory and lesson body from that data, and use hash routes such as `#lesson-1` so direct links work under the GitHub Pages `/korean-learning/` project path. Preserve the current pronunciation grids, vocabulary cards, videos, bundled MP3 player, speed control, repeat control, and browser TTS fallback.

**Tech Stack:** HTML5, CSS3, JavaScript ES modules, Node.js 22 built-in test runner, GitHub Pages.

## Global Constraints

- The public title is `零基础韩语课` and the subtitle is `从韩文字母、发音到日常语法与练习`.
- Only Korean course content is visible.
- The top navigation labels are `课程首页`, `韩文字母`, `单词与句子`, `语法课程`, and `视频学习`.
- Grammar lessons use explicit titles: `第 01 课｜礼貌表达与“去某地”`, `第 02 课｜谁在哪里？主语与位置表达`, and `第 03 课｜在哪里做过什么？场所与过去时`.
- Every grammar lesson contains learning goals, concise rules, examples, exercises, a collapsed answer section, and previous/next navigation.
- Desktop uses a top header, left course directory, center content, and a right lesson outline. Mobile hides both sidebars and opens the course directory from a button.
- Use hash routes and relative asset URLs so the site works at `https://bobvincent666.github.io/korean-learning/` without server-side routing.
- Do not add a framework, package dependency, database, account system, search, language switcher, or dark mode.
- Preserve the existing 149-file audio corpus. Grammar text does not receive new sound buttons in this change because the current local model's mechanical voice is a separate quality decision.
- Invalid or malformed hashes render the course home instead of a blank page.
- With JavaScript disabled, the page still shows the site title, subtitle, and basic course introduction.

---

## File Map

- Modify `data.js`: add the three structured grammar lessons.
- Modify `render.js`: render grammar navigation, grammar index, lesson body, and lesson outline.
- Create `route.js`: resolve top-level and lesson hash routes without touching the DOM.
- Modify `index.html`: add the five-item header, three-column course shell, five content panels, mobile directory controls, and right outline container.
- Modify `app.js`: wire rendering, hash navigation, selected states, mobile directory behavior, and existing audio/video behavior.
- Modify `styles.css`: style the document layout, grammar content, navigation states, and responsive drawer while retaining existing learning-card/table styles.
- Modify `tests/render.test.js`: verify course navigation and lesson HTML.
- Create `tests/route.test.js`: verify valid, invalid, empty, and malformed routes.
- Modify `tests/server.test.js`: assert the new title and all relative production entry points.
- Modify `README.md`: document the course structure and GitHub Pages publication steps.
- Create `.nojekyll`: tell GitHub Pages to serve static files unchanged.

---

### Task 1: Add the three grammar lessons and render them

**Files:**
- Modify: `data.js`
- Modify: `render.js`
- Modify: `tests/render.test.js`

**Interfaces:**
- `grammarLessons` is an ordered array of `{id, number, title, summary, goals, sections, exercises}` objects.
- Each section is `{id, title, explanation, rules, examples}`; each example is `{ko, zh}`.
- Each exercise is `{question, answer}`.
- `renderGrammarNav(lessons)` returns left-sidebar lesson links.
- `renderGrammarIndex(lessons)` returns the grammar-course landing list.
- `renderGrammarLesson(lesson, lessons)` returns one complete lesson and previous/next links.
- `renderLessonOutline(lesson)` returns right-sidebar section links.

- [ ] **Step 1: Add failing rendering tests**

Append these imports and tests to `tests/render.test.js`:

```js
import {
  renderGrammarIndex,
  renderGrammarLesson,
  renderGrammarNav,
  renderLessonOutline
} from '../render.js';
import { grammarLessons } from '../data.js';

test('grammar data contains three explicitly named beginner lessons', () => {
  assert.deepEqual(grammarLessons.map(lesson => lesson.id), ['lesson-1', 'lesson-2', 'lesson-3']);
  assert.deepEqual(grammarLessons.map(lesson => lesson.title), [
    '礼貌表达与“去某地”',
    '谁在哪里？主语与位置表达',
    '在哪里做过什么？场所与过去时'
  ]);
  assert.ok(grammarLessons.every(lesson => lesson.goals.length > 0));
  assert.ok(grammarLessons.every(lesson => lesson.sections.length > 0));
  assert.ok(grammarLessons.every(lesson => lesson.exercises.length > 0));
});

test('grammar navigation and index are generated from lesson data', () => {
  const nav = renderGrammarNav(grammarLessons);
  const index = renderGrammarIndex(grammarLessons);
  assert.match(nav, /href="#lesson-1"/);
  assert.match(nav, /第 03 课/);
  assert.match(index, /礼貌表达与“去某地”/);
  assert.equal((index.match(/class="grammar-index-card"/g) || []).length, 3);
});

test('grammar lesson renders rules, exercises, collapsed answers and neighbors', () => {
  const html = renderGrammarLesson(grammarLessons[1], grammarLessons);
  assert.match(html, /第 02 课/);
  assert.match(html, /id="subject-marker"/);
  assert.match(html, /<details class="answer-box">/);
  assert.match(html, /<summary>查看参考答案<\/summary>/);
  assert.match(html, /href="#lesson-1"/);
  assert.match(html, /href="#lesson-3"/);
  assert.match(renderLessonOutline(grammarLessons[1]), /href="#subject-marker"/);
});
```

- [ ] **Step 2: Verify the new tests fail**

Run:

```powershell
node --test tests/render.test.js
```

Expected: failure because `grammarLessons` and the four grammar render functions are not exported.

- [ ] **Step 3: Add the lesson data**

Append this export to `data.js`:

```js
export const grammarLessons = [
  {
    id: 'lesson-1',
    number: 1,
    title: '礼貌表达与“去某地”',
    summary: '学会用礼貌语尾描述日常动作，并表达“去某个地方”。',
    goals: ['把动词变成 -아요/-어요/-해요', '用“地点 + 에 가요”表达去向'],
    sections: [
      {
        id: 'polite-ending',
        title: '1. -아요 / -어요 / -해요：礼貌表达',
        explanation: '去掉词典形结尾 다，再按词干最后一个元音选择语尾。',
        rules: [
          '词干最后元音是 ㅏ 或 ㅗ：加 -아요，例如 가다 → 가요。',
          '其他元音：加 -어요，例如 먹다 → 먹어요。',
          '하다：变成 해요，例如 공부하다 → 공부해요。'
        ],
        examples: [
          { ko: '저는 매일 공부해요.', zh: '我每天学习。' },
          { ko: '커피를 마셔요.', zh: '我喝咖啡。' }
        ]
      },
      {
        id: 'destination',
        title: '2. 地点 + 에 가요：去某地',
        explanation: '에 接在地点名词后，表示移动的目的地。',
        rules: ['地点 + 에 + 가요', '问句常用 어디에 가요?（去哪里？）'],
        examples: [
          { ko: '회사에 가요.', zh: '去公司。' },
          { ko: '주말에 공원에 가요.', zh: '周末去公园。' }
        ]
      }
    ],
    exercises: [
      { question: '가다 → ______', answer: '가요' },
      { question: '먹다 → ______', answer: '먹어요' },
      { question: '공부하다 → ______', answer: '공부해요' },
      { question: '“我去学校。”→ 저는 ______ 가요.', answer: '학교에' }
    ]
  },
  {
    id: 'lesson-2',
    number: 2,
    title: '谁在哪里？主语与位置表达',
    summary: '用 이/가 标出句子的主语，并用 에 있다/없다 描述位置。',
    goals: ['根据有无收音选择 이/가', '用“地点 + 에 있어요/없어요”说明位置'],
    sections: [
      {
        id: 'subject-marker',
        title: '1. 이 / 가：标出主语',
        explanation: '이/가 接在名词后，表示“谁”或“什么”是句子的主语。',
        rules: ['名词有收音：加 이，例如 책 → 책이。', '名词没有收音：加 가，例如 의자 → 의자가。'],
        examples: [
          { ko: '펜이 있어요.', zh: '有一支笔。' },
          { ko: '유키 씨가 있어요.', zh: '由纪在。' }
        ]
      },
      {
        id: 'location-state',
        title: '2. 地点 + 에 있어요 / 없어요',
        explanation: '에 接在地点后，表示人或物所在的位置；있어요 表示“在/有”，없어요 表示“不在/没有”。',
        rules: ['主语 + 地点에 + 있어요/없어요', '问位置：어디에 있어요?（在哪里？）'],
        examples: [
          { ko: '가방이 침대 위에 있어요.', zh: '包在床上。' },
          { ko: '투이 씨가 집에 없어요.', zh: '翠不在家。' },
          { ko: '투이 씨가 학교에 있어요.', zh: '翠在学校。' }
        ]
      }
    ],
    exercises: [
      { question: '책___ 있어요.（书在。）', answer: '이' },
      { question: '의자___ 있어요.（椅子在。）', answer: '가' },
      { question: '가방이 어디___ 있어요?', answer: '에' },
      { question: '“朋友不在家。”→ 친구가 집에 ______.', answer: '없어요' }
    ]
  },
  {
    id: 'lesson-3',
    number: 3,
    title: '在哪里做过什么？场所与过去时',
    summary: '用 에서 表示动作发生的地点，并用 았어요/었어요/했어요 说过去发生的事。',
    goals: ['区分表示目的地的 에 和动作场所的 에서', '把常用动词变成礼貌过去时'],
    sections: [
      {
        id: 'action-place',
        title: '1. 地点 + 에서：动作发生的场所',
        explanation: '에서 接在地点名词后，表示动作在哪里发生。',
        rules: ['地点 + 에서 + 动作', '에 表示去向或位置；에서 表示做动作的地方。'],
        examples: [
          { ko: '커피숍에서 친구를 만났어요.', zh: '在咖啡店见了朋友。' },
          { ko: '공원에서 운동해요.', zh: '在公园运动。' }
        ]
      },
      {
        id: 'past-tense',
        title: '2. -았어요 / -었어요 / -했어요：过去时',
        explanation: '去掉 다，再根据词干元音选择过去时语尾。',
        rules: [
          '词干最后元音是 ㅏ 或 ㅗ：-았어요，例如 가다 → 갔어요。',
          '其他元音：-었어요，例如 읽다 → 읽었어요。',
          '하다：-했어요，例如 공부하다 → 공부했어요。'
        ],
        examples: [
          { ko: '어제 책을 읽었어요.', zh: '昨天读了书。' },
          { ko: '시장에서 우유를 샀어요.', zh: '在市场买了牛奶。' },
          { ko: '도서관에서 공부했어요.', zh: '在图书馆学习了。' }
        ]
      }
    ],
    exercises: [
      { question: '공원___ 운동했어요.', answer: '에서' },
      { question: '가다 → ______（过去时）', answer: '갔어요' },
      { question: '읽다 → ______（过去时）', answer: '읽었어요' },
      { question: '“在图书馆学习了。”→ 도서관에서 ______.', answer: '공부했어요' }
    ]
  }
];
```

- [ ] **Step 4: Add the four render functions**

Append the following functions to `render.js`, reusing the existing `escapeHtml` helper:

```js
const lessonLabel = lesson => `第 ${String(lesson.number).padStart(2, '0')} 课`;

export function renderGrammarNav(lessons) {
  return lessons.map(lesson =>
    `<a class="course-link" href="#${escapeHtml(lesson.id)}" data-route>${lessonLabel(lesson)}<span>${escapeHtml(lesson.title)}</span></a>`
  ).join('');
}

export function renderGrammarIndex(lessons) {
  return `<div class="grammar-index">${lessons.map(lesson =>
    `<a class="grammar-index-card" href="#${escapeHtml(lesson.id)}" data-route><span>${lessonLabel(lesson)}</span><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.summary)}</p><b>开始学习 →</b></a>`
  ).join('')}</div>`;
}

export function renderGrammarLesson(lesson, lessons) {
  const index = lessons.findIndex(item => item.id === lesson.id);
  const sections = lesson.sections.map(section => `
    <section class="grammar-section" id="${escapeHtml(section.id)}">
      <h2>${escapeHtml(section.title)}</h2>
      <p>${escapeHtml(section.explanation)}</p>
      <ul class="rule-list">${section.rules.map(rule => `<li>${escapeHtml(rule)}</li>`).join('')}</ul>
      <div class="example-list">${section.examples.map(example => `<div class="grammar-example"><b lang="ko">${escapeHtml(example.ko)}</b><span>${escapeHtml(example.zh)}</span></div>`).join('')}</div>
    </section>`).join('');
  const questions = lesson.exercises.map((exercise, exerciseIndex) => `<li><span>${exerciseIndex + 1}.</span>${escapeHtml(exercise.question)}</li>`).join('');
  const answers = lesson.exercises.map((exercise, exerciseIndex) => `<li><span>${exerciseIndex + 1}.</span>${escapeHtml(exercise.answer)}</li>`).join('');
  const previous = lessons[index - 1];
  const next = lessons[index + 1];

  return `<article class="grammar-lesson">
    <header class="lesson-title"><span>${lessonLabel(lesson)}</span><h1>${escapeHtml(lesson.title)}</h1><p>${escapeHtml(lesson.summary)}</p></header>
    <section class="lesson-goals" id="lesson-goals"><h2>本课学什么</h2><ul>${lesson.goals.map(goal => `<li>${escapeHtml(goal)}</li>`).join('')}</ul></section>
    ${sections}
    <section class="exercise-section" id="lesson-exercises"><h2>练习题</h2><ol>${questions}</ol><details class="answer-box"><summary>查看参考答案</summary><ol>${answers}</ol></details></section>
    <nav class="lesson-pagination" aria-label="课程前后导航">
      ${previous ? `<a href="#${previous.id}" data-route>← ${lessonLabel(previous)}<span>${escapeHtml(previous.title)}</span></a>` : '<span></span>'}
      ${next ? `<a href="#${next.id}" data-route>${lessonLabel(next)} →<span>${escapeHtml(next.title)}</span></a>` : '<span></span>'}
    </nav>
  </article>`;
}

export function renderLessonOutline(lesson) {
  return `<p>本课目录</p><a href="#lesson-goals" data-outline="lesson-goals">本课学什么</a>${lesson.sections.map(section => `<a href="#${escapeHtml(section.id)}" data-outline="${escapeHtml(section.id)}">${escapeHtml(section.title.replace(/^\d+\.\s*/, ''))}</a>`).join('')}<a href="#lesson-exercises" data-outline="lesson-exercises">练习题</a>`;
}
```

- [ ] **Step 5: Run the rendering tests**

Run:

```powershell
node --test tests/render.test.js
```

Expected: all rendering tests pass.

- [ ] **Step 6: Commit the lesson data and renderers**

```powershell
git add data.js render.js tests/render.test.js
git commit -m "feat: add beginner Korean grammar lessons"
```

---

### Task 2: Add tested hash routing

**Files:**
- Create: `route.js`
- Create: `tests/route.test.js`

**Interfaces:**
- `resolveRoute(hash, lessonIds)` returns `{page, lessonId}`.
- Top-level pages are `home`, `hangul`, `words`, `grammar`, and `videos`.
- Lesson hashes return `{page:'grammar', lessonId:'lesson-N'}`.

- [ ] **Step 1: Write the route tests**

Create `tests/route.test.js`:

```js
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
```

- [ ] **Step 2: Verify the route tests fail**

Run:

```powershell
node --test tests/route.test.js
```

Expected: failure because `route.js` does not exist.

- [ ] **Step 3: Implement the route resolver**

Create `route.js`:

```js
const pages = new Set(['home', 'hangul', 'words', 'grammar', 'videos']);

export function resolveRoute(hash, lessonIds) {
  let value;
  try {
    value = decodeURIComponent(String(hash).replace(/^#/, ''));
  } catch {
    return { page: 'home', lessonId: null };
  }
  if (lessonIds.includes(value)) return { page: 'grammar', lessonId: value };
  if (pages.has(value)) return { page: value, lessonId: null };
  return { page: 'home', lessonId: null };
}
```

- [ ] **Step 4: Run the route tests**

Run:

```powershell
node --test tests/route.test.js
```

Expected: all three route tests pass.

- [ ] **Step 5: Run all JavaScript tests**

Run:

```powershell
npm test
```

Expected: all tests pass; no audio manifest count changes because grammar lessons add no sound buttons.

- [ ] **Step 6: Commit the route resolver**

```powershell
git add route.js tests/route.test.js
git commit -m "feat: add Korean course hash routing"
```

---

### Task 3: Build the document-style course shell and responsive layout

**Files:**
- Modify: `app.js`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `tests/server.test.js`

**Interfaces:**
- Content panels use `data-panel="home|hangul|words|grammar|videos"`.
- Header links use `data-page` and hash URLs.
- The mobile menu button controls `#course-sidebar`; `#course-backdrop` closes the drawer.
- Existing render targets remain `#grids`, `#lessons`, and `#videos`; new targets are `#grammar-nav`, `#grammar-content`, and `#page-outline`.

- [ ] **Step 1: Update the HTTP page test before changing markup**

Replace the first HTML assertion in `tests/server.test.js` and add relative-asset assertions:

```js
    const page = await fetch(base);
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /零基础韩语课/);
    assert.match(html, /从韩文字母、发音到日常语法与练习/);
    assert.match(html, /href="\.\/styles\.css"/);
    assert.match(html, /src="\.\/app\.js"/);
    assert.match(html, /id="grammar-nav"/);
```

- [ ] **Step 2: Verify the server test fails on the new title**

Run:

```powershell
node --test tests/server.test.js
```

Expected: failure because the current title is `한글，慢慢读` and the course directory container does not exist.

- [ ] **Step 3: Replace the page shell in `index.html`**

Keep the existing `<head>` asset URLs, but set:

```html
<title>零基础韩语课｜从韩文字母到日常语法</title>
<meta name="description" content="从韩文字母、发音到日常语法与练习的零基础韩语课程。">
```

Replace the `<body>` content with the complete shell below:

```html
<a class="skip-link" href="#main">跳到主要内容</a>
<header class="site-header">
  <a class="brand" href="#home" data-route aria-label="零基础韩语课，返回课程首页">
    <span class="brand-mark">ㅎ</span>
    <span><b>零基础韩语课</b><small>从韩文字母、发音到日常语法与练习</small></span>
  </a>
  <nav class="top-nav" aria-label="主要课程导航">
    <a href="#home" data-page="home" data-route>课程首页</a>
    <a href="#hangul" data-page="hangul" data-route>韩文字母</a>
    <a href="#words" data-page="words" data-route>单词与句子</a>
    <a href="#grammar" data-page="grammar" data-route>语法课程</a>
    <a href="#videos" data-page="videos" data-route>视频学习</a>
  </nav>
  <button id="course-menu-button" class="course-menu-button" type="button" aria-controls="course-sidebar" aria-expanded="false">课程目录</button>
</header>

<div id="course-shell" class="course-shell">
  <button id="course-backdrop" class="course-backdrop" type="button" aria-label="关闭课程目录"></button>
  <aside id="course-sidebar" class="course-sidebar" aria-label="课程目录">
    <div class="sidebar-group"><p>开始学习</p><a class="course-link" href="#home" data-route>课程首页</a></div>
    <div class="sidebar-group"><p>入门基础</p><a class="course-link" href="#hangul" data-route>韩文字母与拼读</a></div>
    <div class="sidebar-group"><p>日常语法</p><div id="grammar-nav"></div></div>
    <div class="sidebar-group"><p>练习资源</p><a class="course-link" href="#words" data-route>单词与句子</a><a class="course-link" href="#videos" data-route>视频学习</a></div>
  </aside>

  <main id="main" class="course-main">
    <div id="workspace-header" class="workspace-top">
      <div><p class="section-kicker" id="workspace-kicker">START HERE</p><h1 id="workspace-title">从零开始，建立你的韩语课程路径</h1><p id="workspace-description">先学字母和发音，再进入单词、句子与日常语法。</p></div>
      <div id="audio-controls" class="audio-controls" hidden>
        <label class="speed-control"><span>发音速度</span><select id="speed-select"><option value="normal">正常</option><option value="slow">慢速</option></select></label>
        <button type="button" id="repeat-button" class="repeat-button" aria-label="重复上一次发音">↻ <span>再听一次</span></button>
      </div>
    </div>
    <div id="speech-status" class="speech-status" role="status" aria-live="polite" hidden></div>

    <section data-panel="home">
      <section class="hero" id="top" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow"><span class="eyebrow-dot"></span> 零基础 · 韩语第一步</p>
          <h1 id="hero-title">从一个音节，<br><em>读懂一句韩语。</em></h1>
          <p class="hero-description">看字形、听发音，再把熟悉的音节放进真实的单词和句子里。每天一点，慢慢读出自己的韩语。</p>
          <div class="hero-actions">
            <a class="hero-primary" href="#hangul" data-route>开始拼读 <span aria-hidden="true">↗</span></a>
            <a class="hero-secondary" href="#words" data-route>看看实际怎么说 <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div class="hero-demo" aria-label="示范：辅音 ㄱ 加元音 ㅏ 组成 가">
          <div class="demo-top"><span>今日第一声</span><span class="demo-wave" aria-hidden="true">▂ ▄ ▆ ▄ ▂</span></div>
          <div class="demo-formula"><span>ㄱ</span><i>+</i><span>ㅏ</span><i>=</i><strong>가</strong></div>
          <div class="demo-bottom"><span>ga <small>·</small> 去：가다</span><button class="demo-sound" type="button" data-speak="가" aria-label="朗读音节 가"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Zm12-1.5a6 6 0 0 1 0 9m2.5-11.5a9 9 0 0 1 0 14"/></svg><span>听一听</span></button></div>
        </div>
      </section>
      <section class="course-overview" aria-label="课程路径">
        <a href="#hangul" data-route><span>01</span><h2>韩文字母与拼读</h2><p>认识元音、辅音和 99 个基础组合。</p></a>
        <a href="#words" data-route><span>02</span><h2>单词与句子</h2><p>把音节放进真实的日常表达。</p></a>
        <a href="#grammar" data-route><span>03</span><h2>日常语法</h2><p>每课一个主题，学完马上练习。</p></a>
      </section>
    </section>
    <section data-panel="hangul" hidden><div class="panel-intro"><span class="intro-rule"></span><p>四组拼读表，共 <strong>99</strong> 个音节。浅绿色是元音，浅红色是辅音；小字是标准罗马字提示。</p></div><div class="group-list" id="grids"></div></section>
    <section data-panel="words" hidden><div class="panel-intro"><span class="intro-rule"></span><p>不是每个音节都要硬背成单词。先学有用的，再把它放进一句话里。</p></div><div class="lesson-list" id="lessons"></div></section>
    <section data-panel="grammar" hidden><div id="grammar-content"></div></section>
    <section data-panel="videos" hidden><div class="panel-intro"><span class="intro-rule"></span><p>跟着真实的讲解练一遍。先看字母，再练拼读，最后进入对话。</p></div><div id="video-player" class="video-player" hidden></div><div class="video-list" id="videos"></div><p class="video-note">视频来自外部教学机构。若页面内无法播放，请使用“打开原视频”。</p></section>
  </main>

  <aside id="page-outline" class="page-outline" aria-label="本课目录" hidden></aside>
</div>
<footer class="site-footer"><span>零基础韩语课</span><p>先听，再读；先读，再说。</p><small>罗马字仅用于辅助入门，发音请以韩语语音为准。</small></footer>
```

- [ ] **Step 4: Replace tab state in `app.js` with hash-route state**

Update the imports:

```js
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
```

After the existing grid/word/video rendering, add:

```js
$('#grammar-nav').innerHTML = renderGrammarNav(grammarLessons);
```

Delete the existing `tabs`, `panelCopy`, `activateTab`, tab click, and tab keyboard blocks. Replace them with:

```js
const panelCopy = {
  home: ['START HERE', '从零开始，建立你的韩语课程路径', '先学字母和发音，再进入单词、句子与日常语法。'],
  hangul: ['01 / HANGUL', '韩文字母与拼读', '先认横轴元音，再认纵轴辅音。每一个交叉格都可以点开听。'],
  words: ['02 / WORDS & SENTENCES', '从一个字，走进一句话', '挑真实常用的词，顺着音节一步步读到完整表达。'],
  grammar: ['03 / GRAMMAR', '日常语法课程', '每课只学少量规则，并马上用练习巩固。'],
  videos: ['04 / WATCH & PRACTICE', '视频学习', '先看韩文如何组成，再把声音放进真实对话。']
};

const lessonIds = grammarLessons.map(lesson => lesson.id);
const panels = [...document.querySelectorAll('[data-panel]')];

function closeCourseMenu() {
  $('#course-shell').classList.remove('menu-open');
  $('#course-menu-button').setAttribute('aria-expanded', 'false');
}

function applyRoute() {
  const route = resolveRoute(window.location.hash, lessonIds);
  const lesson = route.lessonId ? grammarLessons.find(item => item.id === route.lessonId) : null;
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
}

$('#course-menu-button').addEventListener('click', () => {
  const open = $('#course-shell').classList.toggle('menu-open');
  $('#course-menu-button').setAttribute('aria-expanded', String(open));
});
$('#course-backdrop').addEventListener('click', closeCourseMenu);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeCourseMenu();
});
window.addEventListener('hashchange', applyRoute);
```

In the delegated click handler, remove the `data-switch` branch and replace the `data-grid` branch with:

```js
  const outlineLink = event.target.closest('[data-outline]');
  if (outlineLink) {
    event.preventDefault();
    document.getElementById(outlineLink.dataset.outline)?.scrollIntoView({ behavior:'smooth', block:'start' });
    return;
  }
  const gridButton = event.target.closest('[data-grid]');
  if (gridButton) {
    event.preventDefault();
    window.location.hash = 'hangul';
    requestAnimationFrame(() => $(`#grid-${gridButton.dataset.grid}`).scrollIntoView({ behavior:'smooth', block:'start' }));
    return;
  }
```

At the end of `app.js`, call:

```js
applyRoute();
```

- [ ] **Step 5: Replace structural CSS and add course/grammar styles**

Retain the existing color variables, reset, grid-table, word-card, video-card, audio-button, and footer rules. Replace the current header/hero/workspace responsive layout rules with:

```css
.site-header{position:sticky;top:0;z-index:20;min-height:72px;display:flex;align-items:center;gap:34px;padding:0 clamp(18px,4vw,56px);background:rgba(255,255,255,.96);border-bottom:1px solid var(--line);backdrop-filter:blur(12px)}
.brand{display:flex;align-items:center;gap:11px;min-width:250px;text-decoration:none}.brand-mark{display:grid;place-items:center;width:40px;height:40px;border-radius:11px;background:var(--ink);color:#fff;font:800 23px/1 "Noto Sans KR",sans-serif}.brand b{display:block;font-size:17px}.brand small{display:block;margin-top:3px;color:#7b8b82;font-size:10px;font-weight:600}
.top-nav{display:flex;align-self:stretch;gap:4px}.top-nav a{position:relative;display:flex;align-items:center;padding:0 15px;color:#65756c;font-size:13px;font-weight:700;text-decoration:none}.top-nav a:hover,.top-nav a[aria-current="page"]{color:var(--green)}.top-nav a[aria-current="page"]:after{content:"";position:absolute;left:14px;right:14px;bottom:0;height:3px;border-radius:3px 3px 0 0;background:var(--green)}
.course-menu-button{display:none;margin-left:auto;border:1px solid var(--line);border-radius:8px;background:#fff;padding:9px 12px;color:var(--ink);font-size:12px;font-weight:800}
.course-shell{display:grid;grid-template-columns:238px minmax(0,1fr);max-width:1600px;min-height:calc(100vh - 72px);margin:auto}.course-shell.has-outline{grid-template-columns:238px minmax(0,1fr) 210px}
.course-sidebar{position:sticky;top:72px;height:calc(100vh - 72px);overflow:auto;padding:30px 22px;border-right:1px solid var(--line);background:#f8faf7}.sidebar-group+.sidebar-group{margin-top:28px}.sidebar-group>p{margin:0 0 9px;color:#87958d;font:800 10px/1.2 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase}.course-link{display:block;margin:2px 0;padding:8px 10px;border-radius:7px;color:#4e6257;font-size:13px;line-height:1.45;text-decoration:none}.course-link span{display:block;margin-top:2px;color:#75877c;font-size:11px}.course-link:hover,.course-link.is-active{background:#e8f3eb;color:var(--green)}
.course-main{min-width:0;padding:42px clamp(24px,4vw,64px) 80px;background:#fff}.workspace-top{display:flex;justify-content:space-between;align-items:end;gap:24px;margin:0 0 28px}.workspace-top h1{max-width:800px;margin:0 0 9px;font-size:clamp(28px,3vw,44px);letter-spacing:-.05em}.workspace-top>div>p:last-child{max-width:760px;margin:0;color:var(--muted);font-size:14px;line-height:1.7}
.page-outline{position:sticky;top:72px;height:calc(100vh - 72px);padding:34px 20px;border-left:1px solid var(--line);background:#fff}.page-outline p{margin:0 0 12px;color:#87958d;font:800 10px Arial,sans-serif;letter-spacing:.14em}.page-outline a{display:block;padding:6px 0;color:#65756c;font-size:12px;line-height:1.45;text-decoration:none}.page-outline a:hover{color:var(--green)}
.course-backdrop{display:none}
.hero{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(320px,.92fr);align-items:center;gap:clamp(28px,5vw,72px);padding:28px 0 58px}.hero h1{font-size:clamp(40px,5vw,68px)}.hero-primary,.hero-secondary{display:inline-flex;align-items:center;text-decoration:none}
.course-overview,.grammar-index{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.course-overview a,.grammar-index-card{display:block;padding:23px;border:1px solid var(--line);border-radius:12px;background:#fff;color:inherit;text-decoration:none;transition:border-color .18s,transform .18s,box-shadow .18s}.course-overview a:hover,.grammar-index-card:hover{transform:translateY(-2px);border-color:#aec9b7;box-shadow:var(--shadow)}.course-overview span,.grammar-index-card>span{color:var(--red);font:800 11px Arial,sans-serif;letter-spacing:.12em}.course-overview h2,.grammar-index-card h3{margin:11px 0 8px;font-size:19px}.course-overview p,.grammar-index-card p{margin:0;color:var(--muted);font-size:13px;line-height:1.7}.grammar-index-card b{display:block;margin-top:18px;color:var(--green);font-size:12px}
.grammar-lesson{max-width:820px}.lesson-title{padding-bottom:26px;border-bottom:1px solid var(--line)}.lesson-title>span{color:var(--red);font-size:12px;font-weight:800}.lesson-title h1{margin:10px 0 10px;font-size:36px;letter-spacing:-.045em}.lesson-title p{margin:0;color:var(--muted);line-height:1.8}.lesson-goals,.grammar-section,.exercise-section{scroll-margin-top:96px;margin-top:36px}.lesson-goals{padding:20px 22px;border-radius:10px;background:var(--mint)}.lesson-goals h2,.grammar-section h2,.exercise-section h2{margin:0 0 14px;font-size:21px}.lesson-goals ul,.rule-list{margin:0;padding-left:20px}.lesson-goals li,.rule-list li{margin:7px 0;line-height:1.7}.grammar-section>p{color:var(--muted);line-height:1.8}.example-list{display:grid;gap:9px;margin-top:18px}.grammar-example{display:flex;justify-content:space-between;gap:20px;padding:14px 16px;border-left:3px solid var(--green);background:#f8faf7}.grammar-example b{font:700 17px "Noto Sans KR",sans-serif}.grammar-example span{color:var(--muted);font-size:13px}.exercise-section>ol,.answer-box ol{padding-left:0;list-style:none}.exercise-section li{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #edf1ed;line-height:1.7}.exercise-section li span{color:var(--red);font-weight:800}.answer-box{margin-top:18px;border:1px solid var(--line);border-radius:9px;padding:0 16px}.answer-box summary{cursor:pointer;padding:14px 0;color:var(--green);font-weight:800}.answer-box ol{margin-top:0}.lesson-pagination{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:42px;padding-top:24px;border-top:1px solid var(--line)}.lesson-pagination a{padding:14px;border:1px solid var(--line);border-radius:9px;color:var(--green);font-size:12px;font-weight:800;text-decoration:none}.lesson-pagination a:last-child{text-align:right}.lesson-pagination a span{display:block;margin-top:5px;color:var(--ink);font-size:13px}
@media(max-width:1120px){.top-nav{display:none}.course-menu-button{display:block}.course-shell,.course-shell.has-outline{grid-template-columns:minmax(0,1fr)}.course-sidebar{position:fixed;z-index:31;top:0;left:0;width:min(320px,86vw);height:100vh;transform:translateX(-102%);transition:transform .2s ease;box-shadow:18px 0 50px rgba(15,45,35,.16)}.course-shell.menu-open .course-sidebar{transform:translateX(0)}.course-backdrop{position:fixed;z-index:30;inset:0;border:0;background:rgba(12,33,26,.34)}.course-shell.menu-open .course-backdrop{display:block}.page-outline{display:none}.course-main{padding:34px 26px 70px}}
@media(max-width:720px){.site-header{min-height:64px;padding:10px 15px}.brand{min-width:0}.brand-mark{width:36px;height:36px}.brand small{font-size:9px}.course-main{padding:28px 16px 60px}.workspace-top{display:block}.workspace-top h1{font-size:29px}.audio-controls{margin-top:18px}.hero{grid-template-columns:1fr;padding:10px 0 38px}.hero-demo{transform:none}.course-overview,.grammar-index,.lesson-grid,.video-list{grid-template-columns:1fr}.lesson-title h1{font-size:29px}.grammar-example{display:block}.grammar-example span{display:block;margin-top:5px}.lesson-pagination{grid-template-columns:1fr}.group-card{margin-right:-16px;border-radius:10px 0 0 10px}}
@media(prefers-reduced-motion:reduce){.course-sidebar{transition:none}}
```

Remove obsolete rules that assume `.workspace` wraps the whole page or that `.top-nav` contains `<button>` elements. Keep one existing `prefers-reduced-motion` block and merge the drawer transition into it.

- [ ] **Step 6: Run the server and full test suites**

Run:

```powershell
node --test tests/server.test.js
npm test
```

Expected: all tests pass, including 149 audio assets.

- [ ] **Step 7: Perform browser verification**

Run:

```powershell
npm start
```

Open `http://127.0.0.1:8765/` and verify:

- Desktop shows the left directory and, on a lesson, the right lesson outline.
- `#lesson-1`, `#lesson-2`, and `#lesson-3` survive refresh and show the matching title.
- `#unknown` and `#%E0%A4%A` show the course home.
- Answer sections begin closed and open from their summaries.
- Previous/next links change lessons.
- A pronunciation cell, word, sentence, slow mode, and repeat still play.
- A video embeds only after clicking its button, and “打开原视频” remains present.
- At 390 px width, the directory opens, closes from the backdrop, closes with Escape, and closes after selecting a route.
- Browser console has no errors.

- [ ] **Step 8: Commit the layout**

```powershell
git add app.js index.html styles.css tests/server.test.js
git commit -m "feat: build responsive Korean course layout"
```

---

### Task 4: Prepare and verify GitHub Pages publication

**Files:**
- Create: `.nojekyll`
- Modify: `README.md`

**Interfaces:**
- GitHub Pages deploys the repository root from the `main` branch.
- All runtime asset references stay relative: `./styles.css`, `./app.js`, and `new URL('./audio/manifest.json', import.meta.url)`.

- [ ] **Step 1: Add `.nojekyll`**

Create an empty `.nojekyll` file at the repository root. This keeps GitHub Pages from applying Jekyll processing to the static site.

- [ ] **Step 2: Replace the README title and add publication instructions**

Use this opening and deployment section while retaining the existing audio-generation and testing documentation:

```markdown
# 零基础韩语课

从韩文字母、发音到日常语法与练习的静态课程网站。内容包括四组韩文拼读表、单词与句子、三节日常语法课、练习题和入门视频。

## 发布到 GitHub Pages

本项目使用纯静态文件，无需构建命令。提交并推送 `main` 分支：

```powershell
git status
git add .
git commit -m "feat: publish Korean course site"
git push -u origin main
```

然后在 GitHub 仓库打开 `Settings → Pages`：

1. `Source` 选择 `Deploy from a branch`。
2. `Branch` 选择 `main` 和 `/(root)`。
3. 保存后访问 <https://bobvincent666.github.io/korean-learning/>。

页面使用 `#lesson-1` 形式的课程地址，因此刷新和分享课程链接不需要服务器路由。
```

- [ ] **Step 3: Verify the project-path deployment locally**

From the repository root, serve its parent directory:

```powershell
python -m http.server 8766 --directory ..
```

Open `http://127.0.0.1:8766/korean-learning/#lesson-1` and confirm the page, stylesheet, JavaScript modules, `audio/manifest.json`, and a pronunciation MP3 return HTTP 200. Confirm the lesson title is `第 01 课｜礼貌表达与“去某地”` and there are no console errors.

- [ ] **Step 4: Run final verification**

Run:

```powershell
npm test
node tools/verify-audio.mjs
git diff --check
git status --short --branch
```

Expected:

- `npm test` reports zero failures.
- Audio verification reports exactly 149 valid assets.
- `git diff --check` prints nothing.
- Status lists only the intended README and `.nojekyll` changes before the final commit.

- [ ] **Step 5: Commit publication documentation**

```powershell
git add .nojekyll README.md
git commit -m "docs: add GitHub Pages publishing guide"
```

- [ ] **Step 6: Review the final history without pushing**

Run:

```powershell
git log --oneline --decorate -6
git status --short --branch
```

Expected: the design-spec commit plus four implementation commits are present, the worktree is clean, and `main` is ahead of `origin/main`. Do not push; the user will publish from their machine.

---

## Plan Self-Review

- Spec coverage: the four-panel legacy content, three grammar lessons, explicit titles, document layout, mobile drawer, hash sharing, collapsed answers, course pagination, relative assets, fallback behavior, and GitHub Pages instructions are each assigned to a task.
- Scope: no framework migration, database, account system, search, CMS, service worker, new audio generation, or server route was introduced.
- Interface consistency: lesson IDs are `lesson-1` through `lesson-3`; route page names are `home`, `hangul`, `words`, `grammar`, and `videos`; DOM render targets and imports match across all tasks.
- Risk check: existing audio corpus inputs are unchanged, no user data is written or deleted, and publication remains a user-run push plus GitHub Pages setting.
