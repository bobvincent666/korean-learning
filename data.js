const v = (jamo, roman, index) => ({ jamo, roman, index });
const c = (jamo, roman, index, demo) => ({ jamo, roman, index, demo });

export const groups = [
  {
    id: 'plain', number: 1, title: '基本元音 × 松音', tag: '先从这里开始',
    vowels: [v('ㅏ','a',0),v('ㅓ','eo',4),v('ㅗ','o',8),v('ㅜ','u',13),v('ㅡ','eu',18)],
    consonants: [c('ㄱ','g',0,'가'),c('ㄷ','d',3,'다'),c('ㅂ','b',7,'바'),c('ㅅ','s',9,'사'),c('ㅈ','j',12,'자')],
    lessons: [
      { seed:'가', word:'가다', wordRoman:'gada', meaning:'去', sentence:'제가 가요.', sentenceRoman:'jega gayo', translation:'我去。' },
      { seed:'바', word:'바다', wordRoman:'bada', meaning:'大海', sentence:'바다가 보여요.', sentenceRoman:'badaga boyeoyo', translation:'能看到大海。' },
      { seed:'서', word:'서다', wordRoman:'seoda', meaning:'站立', sentence:'여기 서요.', sentenceRoman:'yeogi seoyo', translation:'站在这里。' }
    ]
  },
  {
    id: 'tense', number: 2, title: 'ㅣ·ㅐ·ㅔ × 紧音', tag: '听出更紧的声音',
    vowels: [v('ㅣ','i',20),v('ㅐ','ae',1),v('ㅔ','e',5)],
    consonants: [c('ㄲ','kk',1,'까'),c('ㄸ','tt',4,'따'),c('ㅃ','pp',8,'빠'),c('ㅆ','ss',10,'싸'),c('ㅉ','jj',13,'짜')],
    lessons: [
      { seed:'깨', word:'깨끗하다', wordRoman:'kkaekkeuthada', meaning:'干净', sentence:'책상이 깨끗해요.', sentenceRoman:'chaeksangi kkaekkeutaeyo', translation:'桌子很干净。' },
      { seed:'때', word:'그때', wordRoman:'geuttae', meaning:'那时候', sentence:'그때 만나요.', sentenceRoman:'geuttae mannayo', translation:'到时候见。' },
      { seed:'빼', word:'빼다', wordRoman:'ppaeda', meaning:'去掉、拿出', sentence:'이름을 빼 주세요.', sentenceRoman:'ireumeul ppae juseyo', translation:'请把名字去掉。' }
    ]
  },
  {
    id: 'aspirated', number: 3, title: 'Y 行元音及 ㅢ × 送气音', tag: '留意呼出的气',
    vowels: [v('ㅑ','ya',2),v('ㅕ','yeo',6),v('ㅛ','yo',12),v('ㅠ','yu',17),v('ㅒ','yae',3),v('ㅖ','ye',7),v('ㅢ','ui',19)],
    consonants: [c('ㅋ','k',15,'카'),c('ㅌ','t',16,'타'),c('ㅍ','p',17,'파'),c('ㅎ','h',18,'하'),c('ㅊ','ch',14,'차')],
    lessons: [
      { seed:'차', word:'차', wordRoman:'cha', meaning:'茶；车', sentence:'차를 마셔요.', sentenceRoman:'chareul masyeoyo', translation:'喝茶。' },
      { seed:'켜', word:'켜다', wordRoman:'kyeoda', meaning:'打开（电器）', sentence:'불을 켜요.', sentenceRoman:'bureul kyeoyo', translation:'开灯。' },
      { seed:'펴', word:'펴다', wordRoman:'pyeoda', meaning:'展开、翻开', sentence:'책을 펴요.', sentenceRoman:'chaegeul pyeoyo', translation:'把书翻开。' }
    ]
  },
  {
    id: 'compound', number: 4, title: 'W 行元音 × 其他辅音', tag: '把两个元音连起来',
    vowels: [v('ㅘ','wa',9),v('ㅝ','wo',14),v('ㅟ','wi',16),v('ㅚ','oe',11),v('ㅞ','we',15),v('ㅙ','wae',10)],
    consonants: [c('ㄴ','n',2,'나'),c('ㅁ','m',6,'마'),c('ㄹ','r',5,'라'),c('ㅇ','',11,'아')],
    lessons: [
      { seed:'와', word:'오다', wordRoman:'oda', meaning:'来', sentence:'동료가 와요.', sentenceRoman:'dongnyoga wayo', translation:'同事来了。' },
      { seed:'위', word:'위', wordRoman:'wi', meaning:'上面', sentence:'책이 위에 있어요.', sentenceRoman:'chaegi wie isseoyo', translation:'书在上面。' },
      { seed:'뭐', word:'뭐', wordRoman:'mwo', meaning:'什么', sentence:'이건 뭐예요?', sentenceRoman:'igeon mwoyeyo', translation:'这是什么？' },
      { seed:'왜', word:'왜', wordRoman:'wae', meaning:'为什么', sentence:'왜요?', sentenceRoman:'waeyo', translation:'为什么呢？' }
    ]
  }
];

export const videos = [
  {
    title: '누구나 쉽게 배우는 문자, 한글ㅣ한국어를 만나다(Dive into Korean) 1편',
    source: 'King Sejong Institute Foundation',
    stage: '01 / 认识韩文',
    description: '认识韩文字母的设计与构成，再进入拼读练习。',
    url: 'https://www.youtube.com/watch?v=iOard-x3mKc',
    embed: 'https://www.youtube-nocookie.com/embed/iOard-x3mKc'
  },
  {
    title: 'Basic Consonants & Combining Vowels',
    source: 'Study Korean – Jae Hee TV / 世宗学堂课程复习',
    stage: '02 / 拼读练习',
    description: '复习基本元音，练习辅音与元音组合。',
    url: 'https://www.youtube.com/watch?v=pdPLhBWTy68',
    embed: 'https://www.youtube-nocookie.com/embed/pdPLhBWTy68'
  },
  {
    title: 'Sejong Korean Conversation 1 · Introducing',
    source: 'King Sejong Institute Foundation',
    stage: '03 / 基础对话',
    description: '以自我介绍为主题，开始听和说完整的韩语表达。',
    url: 'https://www.youtube.com/watch?v=dM1dWUQm3uE',
    embed: 'https://www.youtube-nocookie.com/embed/dM1dWUQm3uE'
  }
];

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
