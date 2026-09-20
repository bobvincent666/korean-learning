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
