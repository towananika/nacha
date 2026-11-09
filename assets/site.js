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
  // tap Nacha (公式の画像だけを使う)
  var nb=document.getElementById('nachaBtn');
  if(nb){
    var P=['assets/nacha-wink.png','assets/nacha-spear.png','assets/nacha-pray.png','assets/nacha-wheels.png'];
    var L=["Hey, it's Nacha!","Let's play!","Fire spear, ready!","Don't tell them it was me.","Small god, big heart!","Wind-fire wheels, go!","Small steps. Strong spirit."];
    var pi=0,li=0,img=document.getElementById('nachaImg'),bb=document.getElementById('bubble');
    P.forEach(function(u){var i=new Image();i.src=u});
    nb.addEventListener('click',function(ev){
      pi=(pi+1)%P.length;li=(li+1)%L.length;img.src=P[pi];bb.textContent=L[li];
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
