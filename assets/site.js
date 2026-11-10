(function(){
  var LANGS={ja:'ja',en:'en',ko:'ko',zh:'zh-Hant',zhs:'zh-Hans',th:'th',km:'km',id:'id'};
  window.nachaT=function(k){var l=document.documentElement.lang;l=l==='zh-Hant'?'zh':l==='zh-Hans'?'zhs':l;var D=window.NACHA_I18N||{};return (D[l]||{})[k]||(l!=='ja'&&(D.en||{})[k])||(D.ja||{})[k]||k};
  var D=window.NACHA_I18N||{},W=window.NACHA_WORDS||[];
  var els=[].slice.call(document.querySelectorAll('[data-i]'));
  els.forEach(function(e){e.dataset.ja=e.textContent});
  function set(l){
    var d=D[l]||{};
    document.documentElement.lang=LANGS[l]||l;
    els.forEach(function(e){e.textContent=l==='ja'?e.dataset.ja:(d[e.dataset.i]||(D.en||{})[e.dataset.i]||e.dataset.ja)});
    [].forEach.call(document.querySelectorAll('[data-i18n-ph]'),function(e){var k=e.dataset.i18nPh;if(!e.dataset.jaPh)e.dataset.jaPh=e.placeholder;e.placeholder=l==='ja'?e.dataset.jaPh:((D[l]||{})[k]||(D.en||{})[k]||e.dataset.jaPh)});
    document.dispatchEvent(new CustomEvent('nacha-lang',{detail:l}));
    [].forEach.call(document.querySelectorAll('#langMenu button'),function(b){b.setAttribute('aria-current',b.dataset.l===l)});
  }
  function pick(){
    try{var s=localStorage.getItem('nacha-lang');if(s&&D[s])return s}catch(e){}
    var n=(navigator.language||'ja').toLowerCase();
    if(n.indexOf('zh')===0)return /hant|tw|hk|mo/.test(n)?'zh':'zhs';
    var p=n.split('-')[0];if(p==='ms')p='id';
    return D[p]?p:(p==='ja'?'ja':'en');
  }
  var btn=document.getElementById('langBtn'),menu=document.getElementById('langMenu');
  function close(){if(menu){menu.hidden=true;btn.setAttribute('aria-expanded','false')}}
  if(btn){
    btn.addEventListener('click',function(ev){ev.stopPropagation();menu.hidden=!menu.hidden;btn.setAttribute('aria-expanded',String(!menu.hidden))});
    menu.addEventListener('click',function(ev){var b=ev.target.closest('button');if(!b)return;try{localStorage.setItem('nacha-lang',b.dataset.l)}catch(e){}set(b.dataset.l);close()});
    document.addEventListener('click',close);
    document.addEventListener('keydown',function(ev){if(ev.key==='Escape')close()});
  }
  set(pick());
  // 授与所の装備アイテム（着せ替え・オーラ・称号）の反映
  function applyEquipped() {
    if (!window.NachaCoins) return;
    var avatar = NachaCoins.getEquipped('avatar');
    var aura = NachaCoins.getEquipped('aura');
    var title = NachaCoins.getEquipped('title');
    var img = document.getElementById('nachaImg');
    var wrap = document.getElementById('nachaBtn');
    if (img && avatar) {
      var map = {
        'pray': 'assets/nacha-pray.webp',
        'wheels': 'assets/nacha-wheels.webp',
        'spear': 'assets/nacha-spear.webp',
        'wink': 'assets/nacha-wink.webp'
      };
      if (map[avatar]) img.src = map[avatar];
    }
    if (wrap) {
      wrap.classList.toggle('has-gold-halo', aura === 'gold_halo');
      wrap.classList.toggle('has-lotus-aura', aura === 'lotus_aura');
    }
    if (title) {
      var marker = document.querySelector('.temple-shrine-marker');
      var titleBadge = document.getElementById('userTitleBadge');
      if (marker && !titleBadge) {
        var tEl = document.createElement('span');
        tEl.id = 'userTitleBadge';
        tEl.className = 'user-title-badge';
        tEl.textContent = '【' + title + '】';
        marker.appendChild(tEl);
      } else if (titleBadge) {
        titleBadge.textContent = '【' + title + '】';
      }
    }
  }
  applyEquipped();
  window.addEventListener('nacha-equip-change', applyEquipped);

  // tap Nacha (公式の画像だけを使う)
  var nb=document.getElementById('nachaBtn');
  if(nb){
    var P=['assets/nacha-wink.webp','assets/nacha-spear.webp','assets/nacha-pray.webp','assets/nacha-wheels.webp'];
    var L=[
      "大丈夫、ナチャが見守ってるよ！",
      "今日も生きててくれてありがとうね。はなまる満点だよ！",
      "疲れたら何もしなくていいんだよ。お堂で休んでいってね。",
      "当落ドキドキするよね、一緒に祈ろう！",
      "その本気の好きって気持ち、すっごく尊いよ！",
      "泣いちゃう日があってもいいんだよ。僕はずっと君の味方さ。",
      "席が遠くても、愛はステージに届いてるさ！",
      "内緒だけど、君に最強の加護かけといたよ！🪷✨"
    ];
    var pi=0,li=0,img=document.getElementById('nachaImg'),bb=document.getElementById('bubble');
    P.forEach(function(u){var i=new Image();i.src=u});
    nb.addEventListener('click',function(ev){
      if (window.markPilgrimStep) window.markPilgrimStep('nacha');
      if(navigator.vibrate)try{navigator.vibrate(18)}catch(e){}
      var hr=new Date().getHours();
      var pool=L;
      if(hr>=22||hr<5){
        pool=L.concat([
          "こんな夜遅くまで本当にお疲れさま。今日はもう休もうね🌙",
          "眠れない夜は、こころの休憩所でお茶でも飲んでいってね🪷"
        ]);
      }
      pi=(pi+1)%P.length;li=(li+1)%pool.length;img.src=P[pi];bb.textContent=pool[li];
      nb.classList.remove('hop');void nb.offsetWidth;nb.classList.add('hop');
      var r=nb.getBoundingClientRect();
      for(var k=0;k<6;k++){var s=document.createElement('span');s.className='spark';s.textContent=['✨','🔥','🪷','⭐'][k%4];
        s.style.left=(ev.clientX-r.left||r.width/2)+'px';s.style.top=(ev.clientY-r.top||r.height/2)+'px';
        s.style.setProperty('--dx',(Math.random()*120-60)+'px');s.style.setProperty('--dy',(-Math.random()*90-20)+'px');
        nb.appendChild(s);setTimeout(function(x){return function(){x.remove()}}(s),800)}
    });
  }
  // NACHA fortune
  var db=document.getElementById('drawBtn');
  if(db&&W.length){
    var LUCK=['🔥 Lucky item: a red ribbon','🪷 Lucky item: a lotus','🏮 Lucky item: a lantern','📿 Lucky item: prayer beads','🍂 Lucky item: a red leaf','🛞 Lucky item: wheels'];
    db.addEventListener('click',function(){
      var box=document.getElementById('omikuji'),wt=document.getElementById('wordText'),lk=document.getElementById('luck');
      box.classList.remove('shake');void box.offsetWidth;box.classList.add('shake');
      setTimeout(function(){wt.textContent=W[Math.floor(Math.random()*W.length)];lk.textContent=LUCK[Math.floor(Math.random()*LUCK.length)];lk.hidden=false},450);
    });
  }
  // share
  var sb=document.getElementById('shareBtn'),toast=document.getElementById('toast');
  if(sb)sb.addEventListener('click',function(){
    var url=location.href.split('#')[0],data={title:document.title,url:url};
    if(navigator.share){navigator.share(data).catch(function(){});return}
    var done=function(){toast.hidden=false;setTimeout(function(){toast.hidden=true},1800)};
    if(navigator.clipboard)navigator.clipboard.writeText(url).then(done,function(){});else done();
  });
  // 煩悩やきシェアボタン
  var burnForm=document.getElementById('burnForm'),burnShareBtn=document.getElementById('burnShareBtn');
  var lastBurnWord='';
  if(burnForm){
    burnForm.addEventListener('submit',function(){
      setTimeout(function(){
        lastBurnWord=document.getElementById('burnIn').value||'';
        if(window.NachaCoins){
          var res = window.NachaCoins.earn('burn', 5);
          if(res.success){
            var toast=document.getElementById('toast');
            if(toast){
              toast.textContent = '煩悩を焼き払った！ +5 ナチャコイン獲得';
              toast.hidden = false;
              setTimeout(function(){toast.hidden=true;}, 2400);
            }
          }
        }
      },100);
    });
  }
  if(burnShareBtn){
    burnShareBtn.hidden=true; // 最初は非表示
    // 焼いた後に表示する
    var burnRes=document.getElementById('burnRes');
    if(burnRes){
      var bObs=new MutationObserver(function(){if(burnRes.textContent.trim())burnShareBtn.hidden=false;});
      bObs.observe(burnRes,{childList:true,characterData:true,subtree:true});
    }
    burnShareBtn.addEventListener('click',function(){
      var word=lastBurnWord||document.getElementById('burnIn').value||'モヤモヤ';
      var url='https://towananika.github.io/nacha/';
      var text='\xf0\x9f\x94\xa5 \u300c'+word+'\u300d\u3092\u30ca\u30c1\u30e3\u306e\u706b\u7130\u69cd\u3067\u713c\u304d\u306f\u3089\u3063\u305f\uff01 #NACHA #\u7169\u60a9\u3084\u304d '+url;
      var xUrl='https://x.com/intent/tweet?text='+encodeURIComponent('\ud83d\udd25 \u300c'+word+'\u300d\u3092\u30ca\u30c1\u30e3\u306e\u706b\u7130\u69cd\u3067\u713c\u304d\u306f\u3089\u3063\u305f\uff01 #NACHA #\u7169\u60a9\u3084\u304d '+url);
      window.open(xUrl,'_blank','noopener');
    });
  }
  // reveal
  var rv=[].slice.call(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1});
    rv.forEach(function(e){io.observe(e)});
  }else rv.forEach(function(e){e.classList.add('in')});
})();

// パスワードの表示・非表示（ログイン・会員登録）
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-eye]');if(!b)return;var i=b.parentNode.querySelector('input');i.type=i.type==='password'?'text':'password';b.classList.toggle('on',i.type==='text')});

// 「メールで続ける」を押したときだけ入力欄を開く
(function(){var b=document.getElementById('mailBtn');if(!b)return;var f=document.querySelector('.mform');
var g=b.closest('[data-solo]'),m=document.getElementById('gMsg');   // 会員登録はメールを選んだら Google などを隠す
b.addEventListener('click',function(){f.hidden=false;b.hidden=true;b.setAttribute('aria-expanded','true');if(g){g.hidden=true;if(m)m.textContent=''}var i=f.querySelector('input');if(i)i.focus()});
var back=f.querySelector('[data-back]');if(back)back.addEventListener('click',function(){f.hidden=true;b.hidden=false;b.setAttribute('aria-expanded','false');if(g)g.hidden=false})})();
// ログイン・登録のエラー: 「何が起きたか」と「考えられる原因」を出す（2026-11-09）
(function(){
  var W={
    wrong:{ja:['IDかパスワードが違います','打ち間違い、大文字・小文字、Googleで作ったアカウント（Googleボタンから入れます）を確かめてください'],en:['Wrong ID or password','Check for typos, caps lock, or whether you signed up with Google (use the Google button)'],ko:['ID 또는 비밀번호가 달라요','오타, 대소문자, Google로 가입했는지(Google 버튼 사용) 확인해 주세요']},
    'too-many':{ja:['少し待ってください','何度も失敗したので一時的に止めています。15分〜1時間後にもう一度どうぞ'],en:['Please wait a bit','Too many failed tries. Try again in 15–60 minutes'],ko:['잠시 기다려 주세요','실패가 많아 잠시 막았어요. 15분~1시간 후 다시 시도해 주세요']},
    net:{ja:['通信できませんでした','電波が弱い、広告ブロックなどがサーバーを止めている、またはサーバーが更新中かもしれません'],en:['Could not connect','Weak signal, an ad blocker, or the server is being updated'],ko:['연결할 수 없어요','신호가 약하거나, 광고 차단기, 또는 서버 업데이트 중일 수 있어요']},
    ready:{ja:['サーバーの準備がまだです','サーバーが古い版のままかもしれません（管理者がデプロイすると直ります）'],en:['Server not ready','The server may be on an old version (an admin needs to deploy)'],ko:['서버 준비가 안 됐어요','서버가 예전 버전일 수 있어요(관리자가 배포하면 해결)']},
    'google-off':{ja:['Googleログインは準備中です','サーバーにGoogleの設定がまだありません（管理者向け）'],en:['Google sign-in is not set up','The server has no Google client ID yet (for admins)'],ko:['Google 로그인 준비 중이에요','서버에 Google 설정이 아직 없어요(관리자용)']},
    'google-aud':{ja:['Googleの設定が合っていません','サイトとサーバーのGoogleクライアントIDが違います（管理者向け）'],en:['Google settings do not match','The site and server use different Google client IDs (for admins)'],ko:['Google 설정이 맞지 않아요','사이트와 서버의 Google 클라이언트 ID가 달라요(관리자용)']},
    'google-expired':{ja:['時間切れになりました','Googleの確認から時間がたちました。もう一度ボタンを押してください。続くなら端末の時計を確かめてください'],en:['It timed out','Press the button again. If it keeps happening, check your device clock'],ko:['시간이 초과됐어요','버튼을 다시 눌러 주세요. 계속되면 기기 시계를 확인해 주세요']},
    'google-unverified':{ja:['Googleのメールが未確認です','Googleアカウントのメールアドレスを確認してから、もう一度どうぞ'],en:['Google email not verified','Verify the email on your Google account, then try again'],ko:['Google 이메일이 미인증이에요','Google 계정 이메일을 인증한 뒤 다시 시도해 주세요']},
    'google-invalid':{ja:['Googleの確認を受け取れませんでした','ページを読み直して（Ctrl+Shift+R）もう一度。続くならサーバーが古い版かもしれません'],en:['Could not read the Google sign-in','Reload the page and try again. If it continues, the server may be outdated'],ko:['Google 확인을 받지 못했어요','페이지를 새로고침하고 다시 시도해 주세요. 계속되면 서버가 예전 버전일 수 있어요']},
    'google-net':{ja:['Googleに確認できませんでした','サーバーからGoogleにつながりませんでした。少ししてからもう一度どうぞ'],en:['Could not reach Google','The server could not reach Google. Try again shortly'],ko:['Google에 확인할 수 없었어요','서버가 Google에 연결하지 못했어요. 잠시 후 다시 시도해 주세요']},
    'google-used':{ja:['このGoogleは別のアカウントにつながっています','前にGoogleボタンでログインして、別のアカウントができているかもしれません'],en:['This Google is linked to another account','You may have created a separate account with the Google button before'],ko:['이 Google은 다른 계정에 연결되어 있어요','예전에 Google 버튼으로 다른 계정을 만들었을 수 있어요']},
    google:{ja:['Googleでログインできませんでした','ページを読み直して（Ctrl+Shift+R）もう一度。続くならサーバーが古い版かもしれません'],en:['Google sign-in failed','Reload the page and try again. The server may be outdated'],ko:['Google 로그인에 실패했어요','새로고침 후 다시 시도해 주세요. 서버가 예전 버전일 수 있어요']},
    taken:{ja:['このIDは使われています','別のIDにしてください'],en:['This ID is taken','Choose another ID'],ko:['이미 사용 중인 ID예요','다른 ID를 써 주세요']},
    'email-taken':{ja:['このメールは登録済みです','ログインから入ってください。パスワードを忘れたら管理者に再設定コードをもらえます'],en:['This email is already registered','Log in instead. If you forgot the password, ask an admin for a reset code'],ko:['이미 가입된 이메일이에요','로그인해 주세요. 비밀번호를 잊었다면 관리자에게 재설정 코드를 받으세요']},
    email:{ja:['メールアドレスの形が正しくありません','@や.の位置、余分な空白を確かめてください'],en:['Invalid email','Check the @, dots and extra spaces'],ko:['이메일 형식이 올바르지 않아요','@와 점, 공백을 확인해 주세요']},
    pw:{ja:['パスワードは8〜64文字です','8文字以上にしてください'],en:['Password must be 8–64 characters','Use at least 8 characters'],ko:['비밀번호는 8~64자예요','8자 이상으로 해 주세요']},
    'pw-id':{ja:['IDやメールと同じパスワードは使えません','別のパスワードにしてください'],en:['Password must differ from ID/email','Choose a different password'],ko:['ID·이메일과 같은 비밀번호는 안 돼요','다른 비밀번호로 해 주세요']},
    id:{ja:['IDの形が正しくありません','英数字3〜20文字、またはメールアドレスを入れてください'],en:['Invalid ID','Use 3–20 letters/numbers, or your email'],ko:['ID 형식이 올바르지 않아요','영문·숫자 3~20자 또는 이메일을 입력해 주세요']},
    'admin-user':{ja:['この人の区分は変えられません','オーナーは変えられません。管理者を外すのはオーナーだけです'],en:['This role cannot be changed','The owner cannot be changed; only the owner can remove admins'],ko:['이 사람의 구분은 바꿀 수 없어요','오너는 바꿀 수 없고, 관리자 해제는 오너만 가능해요']},
    owner:{ja:['オーナーだけができる操作です','管理者を外すときはオーナーに頼んでください'],en:['Only the owner can do this','Ask the owner to remove an admin'],ko:['오너만 할 수 있어요','관리자 해제는 오너에게 부탁해 주세요']},
    'no-user':{ja:['その会員が見つかりません','ほかの管理者が先に変えたかもしれません。読み直してください'],en:['Member not found','Someone may have changed it. Reload the page'],ko:['회원을 찾을 수 없어요','다른 관리자가 바꿨을 수 있어요. 새로고침해 주세요']},
    admin:{ja:['管理者だけができる操作です','あなたの区分が変わったかもしれません。読み直してください'],en:['Admins only','Your role may have changed. Reload the page'],ko:['관리자만 가능해요','구분이 바뀌었을 수 있어요. 새로고침해 주세요']},
    login:{ja:['ログインが切れました','もう一度ログインしてください'],en:['Your login expired','Please log in again'],ko:['로그인이 만료됐어요','다시 로그인해 주세요']},
    full:{ja:['登録できる人数の上限です','管理者に連絡してください'],en:['Registration is full','Please contact an admin'],ko:['가입 인원이 가득 찼어요','관리자에게 연락해 주세요']}
  };
  // code: サーバーの error。返事: 1行目が何が起きたか、2行目が考えられる原因
  window.nachaWhy=function(code){
    var l=document.documentElement.lang;l=l==='zh-Hant'||l==='zh-Hans'?'en':l;
    var w=W[code]||W.net, m=w[l]||(l==='ja'?w.ja:w.en)||w.ja;
    var pre=l==='ja'?'考えられる原因: ':l==='ko'?'예상 원인: ':'Likely cause: ';
    return m[0]+'\n'+pre+m[1]+(W[code]?'':' ('+code+')');
  };
})();

// ログイン中はヘッダーに自分のIDを出す
(function(){try{var v=JSON.parse(localStorage.getItem('nacha-auth')||'null');if(!(v&&v.token&&v.exp>Date.now()&&v.user&&v.user.id))return;
[].forEach.call(document.querySelectorAll('.barr .pill span'),function(s){s.removeAttribute('data-i');s.textContent=v.user.id})}catch(e){}})();

// 煩悩やき: 1文字ずつ火になって飛んでいく。数だけ端末に残す（言葉は残さない・送らない）
(function(){
  var f=document.getElementById('burnForm');if(!f)return;
  var inp=document.getElementById('burnIn'),res=document.getElementById('burnRes'),box=document.getElementById('burn'),t=window.nachaT||function(k){return k};
  var n=0;try{n=+localStorage.getItem('nacha-burned')||0}catch(e){}
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    var v=inp.value.trim();if(!v){res.textContent=t('bn_empty');inp.focus();return}
    var r=inp.getBoundingClientRect(),cs=getComputedStyle(inp),x=r.left+12,y=r.top+r.height/2-10;
    var ctx=document.createElement('canvas').getContext('2d');ctx.font=cs.fontSize+' '+cs.fontFamily;
    Array.from(v).forEach(function(ch,i){
      var s=document.createElement('span');s.className='bfly';s.textContent=ch;s.style.left=x+'px';s.style.top=y+'px';s.style.fontSize=cs.fontSize;
      s.style.setProperty('--dx',(Math.random()*40-20)+'px');s.style.setProperty('--r',(Math.random()*80-40)+'deg');s.style.animationDelay=(i*0.04)+'s';
      document.body.appendChild(s);x+=ctx.measureText(ch).width;setTimeout(function(){s.remove()},1400+i*40);
    });
    for(var k=0;k<6;k++)(function(k){var e=document.createElement('span');e.className='bfire';e.textContent='🔥';e.style.left=(r.left+r.width*(0.1+k*0.16))+'px';e.style.top=(r.top)+'px';e.style.animationDelay=(0.15+k*0.05)+'s';document.body.appendChild(e);setTimeout(function(){e.remove()},1300)})(k);
    inp.value='';box.classList.add('hit');setTimeout(function(){box.classList.remove('hit')},300);
    n++;try{localStorage.setItem('nacha-burned',n)}catch(e){}
    setTimeout(function(){res.textContent=t('bn_done')+'\n'+t('bn_count').replace('{n}',n)},700);
    if(navigator.vibrate)try{navigator.vibrate(30)}catch(e){}
  });
})();

// ホームの非公式の帯は10秒で消す（下のフッターには常に残る）
(function(){var b=document.getElementById('unoffBar');if(!b)return;
  // その日の最初の1回だけ10秒出す。2回目からは最初から出さない（下のフッターには残る）
  var d=new Date().toISOString().slice(0,10),seen='';try{seen=localStorage.getItem('nacha-unoff')||'';localStorage.setItem('nacha-unoff',d)}catch(e){}
  if(seen===d){b.classList.add('gone');b.style.transition='none';return}
  setTimeout(function(){b.classList.add('gone')},10000)})();
// ==========================================
// 悠遊観音堂 境内の空気感演出 (Web Audio 参拝の鈴 & 蓮の微風)
// ==========================================
(function(){
  var audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // 528Hz 悠遊観音堂の参拝の鈴（おりん / シンギングボウル）
  window.playTempleBell = function(btn) {
    if (window.markPilgrimStep) window.markPilgrimStep("bell");
    if (btn) {
      btn.classList.remove('ringing');
      void btn.offsetWidth;
      btn.classList.add('ringing');
      var wave = document.createElement('span');
      wave.className = 'bell-wave';
      btn.appendChild(wave);
      setTimeout(function(){ wave.remove(); }, 1400);
    }
    if (navigator.vibrate) {
      try { navigator.vibrate([25, 45, 20]); } catch(e){}
    }
    var ctx = getAudioCtx();
    if (ctx) {
      var now = ctx.currentTime;
      var freqs = [528, 1056, 1584, 2112];
      var gains = [0.42, 0.16, 0.08, 0.035];
      var decays = [3.2, 2.4, 1.8, 1.1];
      freqs.forEach(function(f, i){
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        if (i > 0) osc.detune.setValueAtTime((Math.random() * 6 - 3), now);
        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(gains[i], now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + decays[i]);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + decays[i] + 0.05);
      });
    }

    var toast = document.getElementById('toast');
    if (window.NachaCoins) {
      var res = window.NachaCoins.earn('temple_bell', 1);
      if (toast) {
        if (res.success) {
          toast.textContent = '🔔 悠遊観音堂の鈴が響きました。心穏やかな参拝を 🪷 (+1コイン)';
        } else {
          toast.textContent = '🔔 悠遊観音堂の鈴が響きました。心穏やかな参拝を 🪷';
        }
        toast.hidden = false;
        setTimeout(function(){ toast.hidden = true; }, 2600);
      }
    } else if (toast) {
      toast.textContent = '🔔 悠遊観音堂の鈴が響きました。心穏やかな参拝を 🪷';
      toast.hidden = false;
      setTimeout(function(){ toast.hidden = true; }, 2400);
    }
  };

  // 🔔 参拝ボタンの自動バインド
  var bellBtn = document.getElementById('templeBellBtn');
  if (bellBtn) {
    bellBtn.addEventListener('click', function(){
      window.playTempleBell(bellBtn);
    });
  }

  // 境内を漂う蓮の花びら・光の微粒子（軽量）
  function setupAmbience() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.getElementById('templeAmbience')) return;
    var amb = document.createElement('div');
    amb.id = 'templeAmbience';
    amb.className = 'temple-ambience';
    amb.setAttribute('aria-hidden', 'true');
    var symbols = ['🪷', '🌸', '✨', '🍃', '🪷'];
    for (var i = 0; i < 5; i++) {
      var p = document.createElement('span');
      p.className = 'temple-petal';
      p.textContent = symbols[i];
      p.style.left = (10 + i * 20 + Math.random() * 6) + '%';
      p.style.animationDelay = (i * 3) + 's';
      p.style.animationDuration = (14 + Math.random() * 5) + 's';
      p.style.fontSize = (14 + (i % 3) * 3) + 'px';
      p.style.setProperty('--drift', ((i % 2 === 0 ? 1 : -1) * (30 + Math.random() * 40)) + 'px');
      amb.appendChild(p);
    }
    document.body.appendChild(amb);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAmbience);
  } else {
    setupAmbience();
  }

  // 時間帯に応じた境内の寄り添いお告げ（朝・昼・夕・夜）
  var hr = new Date().getHours();
  var bb = document.getElementById('bubble');
  if (bb) {
    if (hr >= 22 || hr < 5) {
      bb.textContent = '静寂の夜のお堂。不安な夜も、ナチャがそばにいるよ🌙';
    } else if (hr >= 17) {
      bb.textContent = '夕暮れの灯籠が灯りました。今日もお疲れさまでした🏮';
    } else if (hr >= 5 && hr < 11) {
      bb.textContent = '朝の清々しいお寺へようこそ。今日が見守られますように🌅';
    } else {
      bb.textContent = '陽だまりの境内。推しのこと、いっぱい祈っていってね🪷';
    }
  }
})();


// ナチャコイン残高のヘッダー自動連動同期
(function(){
  function syncCoins(val) {
    var els = document.querySelectorAll('#headerCoinCount');
    els.forEach(function(el){ el.textContent = val; });
  }
  if (window.NachaCoins) {
    syncCoins(NachaCoins.getBalance());
    NachaCoins.onChange(syncCoins);
  } else {
    window.addEventListener('DOMContentLoaded', function(){
      if (window.NachaCoins) {
        syncCoins(NachaCoins.getBalance());
        NachaCoins.onChange(syncCoins);
      }
    });
  }
})();


// ==========================================
// 本日の参拝めぐり（デイリーミニ巡礼ロジック）
// ==========================================
(function(){
  var STORAGE_KEY = 'nacha_daily_pilgrimage';
  function getTodayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function getPilgrimData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (data.date === getTodayStr()) return data;
      }
    } catch(e){}
    return { date: getTodayStr(), bell: false, nacha: false, visit: false, rewarded: false };
  }

  function savePilgrimData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch(e){}
    renderPilgrimUI();
  }

  window.markPilgrimStep = function(stepKey) {
    var data = getPilgrimData();
    if (!data[stepKey]) {
      data[stepKey] = true;
      if (data.bell && data.nacha && data.visit && !data.rewarded) {
        data.rewarded = true;
        savePilgrimData(data);
        if (window.NachaCoins) {
          NachaCoins.earn('pilgrimage_complete', 5);
          if (NachaCoins.showEarnToast) {
            NachaCoins.showEarnToast(5, '参拝満願成就！神様のご加護');
          }
        }
      } else {
        savePilgrimData(data);
      }
    }
  };

  // サブページを開いていたら自動的に 'visit' を達成
  var loc = window.location.href;
  if (loc.indexOf('/amulet/') >= 0 || loc.indexOf('/rest/') >= 0 || loc.indexOf('/ema/') >= 0 ||
      loc.indexOf('/goma/') >= 0 || loc.indexOf('/goshuin/') >= 0 || loc.indexOf('/arcade/') >= 0) {
    window.markPilgrimStep('visit');
  }

  function renderPilgrimUI() {
    var card = document.getElementById('pilgrimCard');
    if (!card) return;
    var data = getPilgrimData();
    var count = (data.bell ? 1 : 0) + (data.nacha ? 1 : 0) + (data.visit ? 1 : 0);

    var badge = document.getElementById('pilgrimBadge');
    if (badge) {
      badge.textContent = count === 3 ? '✨ 満願達成' : count + ' / 3';
    }

    var cBell = document.getElementById('pChipBell');
    if (cBell) cBell.classList.toggle('done', !!data.bell);

    var cNacha = document.getElementById('pChipNacha');
    if (cNacha) cNacha.classList.toggle('done', !!data.nacha);

    var cVisit = document.getElementById('pChipVisit');
    if (cVisit) cVisit.classList.toggle('done', !!data.visit);

    var blessing = document.getElementById('pilgrimBlessing');
    if (blessing) {
      blessing.hidden = (count < 3);
    }
    card.classList.toggle('completed', count === 3);
  }

  function initPilgrim() {
    renderPilgrimUI();
    var cBell = document.getElementById('pChipBell');
    if (cBell) cBell.addEventListener('click', function(){
      var bellBtn = document.getElementById('templeBellBtn');
      if (bellBtn) {
        window.playTempleBell(bellBtn);
      }
    });
    var cNacha = document.getElementById('pChipNacha');
    if (cNacha) cNacha.addEventListener('click', function(){
      var nachaBtn = document.getElementById('nachaBtn');
      if (nachaBtn) nachaBtn.click();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPilgrim);
  } else {
    initPilgrim();
  }
})();
