/* NACHA — 追補の翻訳辞書（ホームの未翻訳箇所と「今日の一礼」）
   既存の NACHA_I18N にマージする。en は全キーを埋め、他言語が欠けても
   日本語に落ちないようにする（site.js のフォールバック順が en → ja のため）。 */
(function (a) {
  for (var l in a) Object.assign(window.NACHA_I18N[l] = window.NACHA_I18N[l] || {}, a[l]);
})({
  "ja": {
    "cta_meet": "ナチャと仲間に会う",
    "quiz_title": "今日の守護神診断",
    "quiz_lead1": "今のあなたを見守る神様はだれ？",
    "quiz_lead2": "3つの質問に答えて、ナチャたちからのひとことを受け取ろう。",
    "quiz_btn": "診断をはじめる",
    "mem_save": "この言葉を思い出に残す",
    "mem_saved": "残したよ！",
    "mem_list": "残した思い出",
    "nav_amulet": "お守り",
    "acct_link": "ログイン・マイページ",
    "pray_title": "今日の一礼",
    "pray_lead": "灯明をともして、今日の無事に手を合わせる。",
    "pray_btn": "手を合わせる",
    "pray_done": "お参りしました。また明日、灯りをともそうね。",
    "pray_again": "今日はもうお参りしたよ。ゆっくりしていってね。",
    "mem_1": "今日も生きていてくれて、ありがとう。はなまる満点だよ！",
    "mem_2": "小さな一歩も、ナチャはちゃんと見てるよ。",
    "mem_3": "疲れたら、ここで少し休んでいってね。",
    "mem_4": "君の笑顔が、僕の宝物だよ。",
    "mem_5": "内緒だけど、今日も加護をかけておいたからね。",
    "mem_6": "大丈夫、ナチャがそばにいるよ。",
    "mem_7": "今日のあなたは、十分頑張っているよ。"
  },
  "en": {
    "cta_meet": "Meet Nacha and friends",
    "quiz_title": "Today's guardian reading",
    "quiz_lead1": "Which guardian is watching over you right now?",
    "quiz_lead2": "Answer three questions and receive a word from Nacha and friends.",
    "quiz_btn": "Start the reading",
    "mem_save": "Keep this word as a memory",
    "mem_saved": "Saved!",
    "mem_list": "Saved memories",
    "nav_amulet": "Charms",
    "acct_link": "Log in · My page",
    "pray_title": "A daily bow",
    "pray_lead": "Light a lantern and bow for today's peace.",
    "pray_btn": "Bow",
    "pray_done": "You've bowed. Let's light it again tomorrow.",
    "pray_again": "You already bowed today. Take your time.",
    "mem_1": "Thank you for being here today. Full marks — a perfect score!",
    "mem_2": "Nacha notices every small step you take.",
    "mem_3": "If you're tired, rest here for a while.",
    "mem_4": "Your smile is my treasure.",
    "mem_5": "Don't tell anyone — I cast a blessing on you again today.",
    "mem_6": "It's okay. Nacha is right here with you.",
    "mem_7": "You have done more than enough today."
  },
  "ko": {
    "cta_meet": "나차와 친구들을 만나기",
    "quiz_title": "오늘의 수호신 진단",
    "quiz_lead1": "지금 당신을 지켜보는 신은 누구일까요?",
    "quiz_lead2": "세 가지 질문에 답하고 나차들이 건네는 한마디를 받아 보세요.",
    "quiz_btn": "진단 시작하기",
    "mem_save": "이 말을 기억으로 남기기",
    "mem_saved": "남겼어!",
    "mem_list": "남긴 기억",
    "nav_amulet": "부적",
    "acct_link": "로그인 · 마이페이지",
    "pray_title": "오늘의 배례",
    "pray_lead": "등불을 밝히고 오늘의 평안에 두 손을 모아요.",
    "pray_btn": "두 손 모으기",
    "pray_done": "참배했어요. 내일 또 등불을 밝혀요.",
    "pray_again": "오늘은 이미 참배했어요. 천천히 쉬다 가요.",
    "mem_1": "오늘도 살아 있어 줘서 고마워. 백점 만점이야!",
    "mem_2": "작은 한 걸음도 나차는 제대로 보고 있어.",
    "mem_3": "지치면 여기서 잠깐 쉬다 가.",
    "mem_4": "네 웃음이 내 보물이야.",
    "mem_5": "비밀인데, 오늘도 가호를 걸어 두었어.",
    "mem_6": "괜찮아, 나차가 곁에 있어.",
    "mem_7": "오늘의 너는 충분히 잘하고 있어."
  },
  "zh": {
    "cta_meet": "與哪吒和夥伴見面",
    "quiz_title": "今日守護神診斷",
    "quiz_lead1": "現在守護你的是哪位神明？",
    "quiz_lead2": "回答三個問題，接收哪吒他們的一句話。",
    "quiz_btn": "開始診斷",
    "mem_save": "把這句話留作回憶",
    "mem_saved": "留下了！",
    "mem_list": "留下的回憶",
    "nav_amulet": "護符",
    "acct_link": "登入・我的頁面",
    "pray_title": "今日的一禮",
    "pray_lead": "點亮燈明，為今天的平安合掌。",
    "pray_btn": "合掌",
    "pray_done": "參拜完成了。明天再一起點燈吧。",
    "pray_again": "今天已經參拜過了。慢慢休息吧。",
    "mem_1": "謝謝你今天也好好活著。滿分，一百分！",
    "mem_2": "小小的一步，哪吒也都好好看著喔。",
    "mem_3": "累了的話，就在這裡稍微休息一下吧。",
    "mem_4": "你的笑容，是我的寶物。",
    "mem_5": "偷偷跟你說，今天也替你加了護佑。",
    "mem_6": "沒事的，哪吒就在你身邊。",
    "mem_7": "今天的你，已經很努力了。"
  },
  "zhs": {
    "cta_meet": "与哪吒和伙伴见面",
    "quiz_title": "今日守护神诊断",
    "quiz_lead1": "现在守护你的是哪位神明？",
    "quiz_lead2": "回答三个问题，接收哪吒他们的一句话。",
    "quiz_btn": "开始诊断",
    "mem_save": "把这句话留作回忆",
    "mem_saved": "留下了！",
    "mem_list": "留下的回忆",
    "nav_amulet": "护符",
    "acct_link": "登录・我的页面",
    "pray_title": "今日的一礼",
    "pray_lead": "点亮灯明，为今天的平安合掌。",
    "pray_btn": "合掌",
    "pray_done": "参拜完成了。明天再一起点灯吧。",
    "pray_again": "今天已经参拜过了。慢慢休息吧。",
    "mem_1": "谢谢你今天也好好活着。满分，一百分！",
    "mem_2": "小小的一步，哪吒也都好好看着喔。",
    "mem_3": "累了的话，就在这里稍微休息一下吧。",
    "mem_4": "你的笑容，是我的宝物。",
    "mem_5": "偷偷跟你说，今天也替你加了护佑。",
    "mem_6": "没事的，哪吒就在你身边。",
    "mem_7": "今天的你，已经很努力了。"
  }
});

/* 静けさの設計（2026-11）で追加した見出し */
(function (a) {
  for (var l in a) Object.assign(window.NACHA_I18N[l] = window.NACHA_I18N[l] || {}, a[l]);
})({
  "ja": {
    "hero_t1": "小さな守護神、",
    "hero_t2": "ナチャ。",
    "hero_lead": "カンボジア・プノンペンの実在するお寺から生まれた神様です。忙しい毎日に、やさしい祈りと小さな笑顔を。",
    "gallery_h": "姿絵",
    "entry_quiz_desc": "三つの質問に答えて、ナチャたちからのひとことを。"
  },
  "en": {
    "hero_t1": "Nacha,",
    "hero_t2": "the small guardian.",
    "hero_lead": "A small god born from a real temple in Phnom Penh, Cambodia — bringing gentle prayers and small smiles to busy days.",
    "gallery_h": "Portraits",
    "entry_quiz_desc": "Three questions, and a word from Nacha and friends."
  },
  "ko": {
    "hero_t1": "작은 수호신,",
    "hero_t2": "나차.",
    "hero_lead": "캄보디아 프놈펜의 실제 사원에서 태어난 작은 신. 바쁜 일상에 다정한 기도와 작은 미소를.",
    "gallery_h": "그림",
    "entry_quiz_desc": "세 가지 질문에 답하고 나차들이 건네는 한마디를."
  },
  "zh": {
    "hero_t1": "小小的守護神，",
    "hero_t2": "哪吒。",
    "hero_lead": "誕生於柬埔寨金邊真實寺廟的小神明。為忙碌的日常帶來溫柔的祈禱與微小笑容。",
    "gallery_h": "畫像",
    "entry_quiz_desc": "回答三個問題，接收哪吒他們的一句話。"
  },
  "zhs": {
    "hero_t1": "小小的守护神，",
    "hero_t2": "哪吒。",
    "hero_lead": "诞生于柬埔寨金边真实寺庙的小神明。为忙碌的日常带来温柔的祈祷与微小笑容。",
    "gallery_h": "画像",
    "entry_quiz_desc": "回答三个问题，接收哪吒他们的一句话。"
  }
});

/* 名鑑ページの見出し */
(function (a) {
  for (var l in a) Object.assign(window.NACHA_I18N[l] = window.NACHA_I18N[l] || {}, a[l]);
})({
  "ja": { "wep_h": "持ち物と武器" },
  "en": { "wep_h": "Tools and weapons" },
  "ko": { "wep_h": "도구와 무기" },
  "zh": { "wep_h": "持有物與武器" },
  "zhs": { "wep_h": "持有物与武器" }
});
