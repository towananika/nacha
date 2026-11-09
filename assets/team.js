// 関係者ページ: とわないか統合ログイン。アカウントとログインの鍵はハブ（REMITECH HUB）と共通、権限は NACHA 用（サーバーの /nacha/auth/*）。
// 資料そのものは公開リポジトリに置かず、ログインした関係者（member）にだけサーバーの /internal/nachadev から渡す。
(function(){
  var API='https://remitech-chores.jaykim-can.workers.dev/nacha', KEY='nacha-auth', HUBKEY='remitech-auth', DOC='nachadev';
  var $=function(id){return document.getElementById(id)};
  var t=window.nachaT||function(k){return k};
  var state=null, mode='login', doc=null;
  function read(k){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v&&v.token&&v.exp>Date.now()?v:null}catch(e){return null}}
  state=read(KEY);
  // ハブでログイン済みなら、その鍵をそのまま使う（権限は下の renew で NACHA 用に取り直す）
  var hub=read(HUBKEY);if(hub&&(!state||state.token!==hub.token))state={token:hub.token,exp:hub.exp,user:{id:(hub.user||{}).id||'',member:false,admin:false}};
  function save(){try{if(state)localStorage.setItem(KEY,JSON.stringify(state));else localStorage.removeItem(KEY)}catch(e){}}
  // ハブにも同じログインを渡す（ハブは開いたときに自分の権限を取り直す）
  function shareHub(){try{var h=read(HUBKEY);if(state&&(!h||h.token!==state.token))localStorage.setItem(HUBKEY,JSON.stringify({token:state.token,exp:state.exp,user:{id:state.user.id,member:false,admin:false}}))}catch(e){}}
  function hdr(){return state?{'Authorization':'Bearer '+state.token}:{}}
  function call(op,body){
    return fetch(API+'/auth/'+op,{method:'POST',cache:'no-store',headers:Object.assign({'Content-Type':'application/json'},hdr()),body:JSON.stringify(body||{})})
      .then(function(r){return r.json().catch(function(){return {}}).then(function(j){j.status=r.status;return j})});
  }
  var ERR={wrong:{ja:'ID・メールかパスワードが違います',en:'Wrong ID/email or password',ko:'ID·이메일 또는 비밀번호가 달라요',zh:'ID／電子郵件或密碼錯誤'},
    taken:{ja:'このIDは使われています',en:'This ID is taken',ko:'이미 사용 중인 ID예요',zh:'此 ID 已被使用'},
    id:{ja:'IDは英数字3〜20文字です',en:'ID: 3–20 letters/numbers',ko:'ID는 영문·숫자 3~20자예요',zh:'ID 須為 3–20 個英數字'},
    pw:{ja:'パスワードは8〜64文字です',en:'Password: 8–64 characters',ko:'비밀번호는 8~64자예요',zh:'密碼須為 8–64 個字元'},
    'pw-id':{ja:'IDと同じパスワードは使えません',en:'Password must differ from ID',ko:'ID와 같은 비밀번호는 쓸 수 없어요',zh:'密碼不可與 ID 相同'},
    'too-many':{ja:'試行が多すぎます。しばらく待ってください',en:'Too many tries. Please wait.',ko:'시도가 너무 많아요. 잠시 기다려 주세요',zh:'嘗試次數過多，請稍候'},
    ready:{ja:'ログインの受付を準備中です。しばらくしてからもう一度お試しください',en:'Login is being set up. Please try again later.',ko:'로그인을 준비 중이에요. 잠시 후 다시 시도해 주세요',zh:'登入功能準備中，請稍後再試'},
    net:{ja:'通信できませんでした',en:'Could not connect',ko:'연결할 수 없어요',zh:'無法連線'},
    none:{ja:'資料はまだ登録されていません',en:'No documents yet',ko:'아직 등록된 자료가 없어요',zh:'尚未登錄資料'}};
  function lang(){var l=document.documentElement.lang;return l==='zh-Hant'?'zh':(ERR.wrong[l]?l:(l==='ja'?'ja':'en'))}
  function err(k){return k!=='none'&&window.nachaWhy?nachaWhy(k):(ERR[k]||ERR.net)[lang()]}
  function render(){
    var u=state&&state.user;
    $('authBox').hidden=!!u; $('meBox').hidden=!u; $('ptT').hidden=!u;
    document.body.classList.toggle('authmode',!u);
    $('docBox').hidden=!(u&&u.member&&doc);
    $('aSubmitL').textContent=t(mode==='login'?'tm_login':'tm_reg');
    
    if($('dashAdmin')) $('dashAdmin').hidden=!(u&&u.admin);
    if($('dashDev')) $('dashDev').hidden=!(u&&(u.admin||u.owner));
    if($('dashDocs')) $('dashDocs').hidden=!(u&&u.member&&doc);

    if(u){
      var r=u.owner?'owner':u.admin?'admin':u.member?'member':'user';
      $('meId').textContent=u.id;$('meMail').textContent=u.google||u.email||'';
      $('meAv').textContent=(u.id[0]||'?').toUpperCase();$('meAv').className='mav r-'+r;
      $('meRole').textContent=t(roleKey(u));$('meRole').className='rbadge r-'+r;
      $('meDesc').textContent=t('ad_d_'+r);
      // Google だけで作ったアカウントは、今のパスワードなしで初めのパスワードを決める
      $('pwCurL').hidden=u.hasPassword===false;$('pwSum').textContent=t(u.hasPassword===false?'pw_set':'pw_change');
    }
    gSetup();
  }
  function roleKey(u){return u.owner?'adm_owner':u.admin?'adm_admin':u.member?'tm_member':'tm_user'}
  function load(){
    if(!(state&&state.user&&state.user.member))return render();
    fetch(API+'/internal/'+DOC,{cache:'no-store',headers:hdr()}).then(function(r){
      if(r.status===401){state=null;save();return null}
      if(r.status===403){state.user.member=false;save();return null}
      if(r.status===404){$('aMsg').textContent='';showNone();return null}
      return r.ok?r.json():null;
    }).then(function(j){if(j){doc=j;draw()}render()},function(){render()});
  }
  function showNone(){var g=$('generalNote');g.hidden=false;g.firstElementChild.textContent=err('none')}
var currentModalIdx = 0, allSlides = [];

  function getChapterName(slide, prevChapter) {
    var lines = slide.lines || [];
    for (var i = 0; i < lines.length; i++) {
      var m = /^(\d{2}\s*\/[^\n\r]+)/.exec(lines[i]);
      if (m) return m[1].trim();
    }
    return prevChapter || '01 / OVERVIEW';
  }

  function openSlideModal(idx) {
    if (!allSlides || !allSlides.length) return;
    if (idx < 0) idx = 0;
    if (idx >= allSlides.length) idx = allSlides.length - 1;
    currentModalIdx = idx;

    var s = allSlides[idx];
    $('modalTitle').textContent = (s.n ? s.n + '. ' : '') + (s.title || '無題');
    
    var body = $('modalBody');
    body.innerHTML = '';
    (s.lines || []).forEach(function(line) {
      var p = document.createElement('p');
      p.textContent = line;
      body.appendChild(p);
    });

    $('modalPage').textContent = (idx + 1) + ' / ' + allSlides.length;
    $('modalPrev').disabled = (idx === 0);
    $('modalNext').disabled = (idx === allSlides.length - 1);

    var modal = $('slideModal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeSlideModal() {
    var modal = $('slideModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  var modalBound = false;
  function setupModalEvents() {
    if (modalBound) return;
    modalBound = true;
    var closeBtn = $('modalClose'), modal = $('slideModal');
    if (closeBtn) closeBtn.addEventListener('click', closeSlideModal);
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) closeSlideModal();
      });
    }
    var prevBtn = $('modalPrev'), nextBtn = $('modalNext');
    if (prevBtn) prevBtn.addEventListener('click', function() { openSlideModal(currentModalIdx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function() { openSlideModal(currentModalIdx + 1); });

    document.addEventListener('keydown', function(e) {
      if (!modal || !modal.classList.contains('active')) return;
      if (e.key === 'Escape') closeSlideModal();
      else if (e.key === 'ArrowLeft') openSlideModal(currentModalIdx - 1);
      else if (e.key === 'ArrowRight') openSlideModal(currentModalIdx + 1);
    });
  }

  function draw() {
    $('docTitle').textContent = doc.title || '';
    allSlides = doc.slides || [];
    setupModalEvents();

    var container = $('chaptersContainer');
    if (!container) return;
    container.innerHTML = '';

    // 章ごとにスライドをグループ化
    var chapters = [], curChapter = null, lastChapterName = '';
    allSlides.forEach(function(s, idx) {
      s._globalIndex = idx;
      var cName = getChapterName(s, lastChapterName);
      if (!curChapter || curChapter.name !== cName) {
        curChapter = { name: cName, slides: [] };
        chapters.push(curChapter);
        lastChapterName = cName;
      }
      curChapter.slides.push(s);
    });

    // 章アコーディオンとボードの生成
    chapters.forEach(function(ch, chIdx) {
      var details = document.createElement('details');
      details.className = 'chapter-accordion';
      if (chIdx < 2) details.open = true; // 最初の2章を開く

      var summary = document.createElement('summary');
      summary.className = 'chapter-summary';
      summary.innerHTML = '<div class="chapter-title-wrap"><span class="chapter-icon">📑</span><span>' + 
        ch.name + '</span><span class="chapter-badge">' + ch.slides.length + '件</span></div>' +
        '<span class="chapter-arrow">▶</span>';
      details.appendChild(summary);

      var grid = document.createElement('div');
      grid.className = 'board-grid';

      ch.slides.forEach(function(s) {
        var card = document.createElement('div');
        card.className = 'slide-card';
        card.dataset.q = ((s.title || '') + ' ' + (s.lines || []).join(' ')).toLowerCase();

        var previewLines = (s.lines || []).filter(function(l) {
          return !/^\d{2}\s*\//.test(l) && l.length > 2;
        }).slice(0, 3).join(' / ');

        card.innerHTML = 
          '<div class="slide-card-head">' +
            '<span class="slide-card-num">#' + (s.n || (s._globalIndex + 1)) + '</span>' +
          '</div>' +
          '<h4>' + (s.title || '無題スライド') + '</h4>' +
          '<p class="slide-card-preview">' + (previewLines || 'スライド内容を確認') + '</p>' +
          '<span class="slide-card-cta">詳細を見る &rarr;</span>';

        card.addEventListener('click', function() {
          openSlideModal(s._globalIndex);
        });

        grid.appendChild(card);
      });

      details.appendChild(grid);
      container.appendChild(details);
    });

    filter();
  }

  function filter() {
    var q = $('docSearch').value.trim().toLowerCase();
    var accordions = document.querySelectorAll('.chapter-accordion');
    accordions.forEach(function(acc) {
      var cards = acc.querySelectorAll('.slide-card');
      var matchedCount = 0;
      cards.forEach(function(card) {
        var match = !q || card.dataset.q.indexOf(q) >= 0;
        card.hidden = !match;
        if (match) matchedCount++;
      });
      if (q) {
        acc.open = (matchedCount > 0);
        acc.hidden = (matchedCount === 0);
      } else {
        acc.hidden = false;
      }
    });
    }
  $('docSearch').addEventListener('input',filter);
  $('authForm').addEventListener('submit',function(ev){
    ev.preventDefault();
    var b=$('aSubmit');b.disabled=true;$('aMsg').textContent='';
    call(mode,{id:$('aId').value.trim().toLowerCase(),pw:$('aPw').value}).then(function(j){
      b.disabled=false;
      if(j.ok&&j.token){state={token:j.token,exp:j.exp,user:j.user};save();shareHub();$('aPw').value='';load()}
      else $('aMsg').textContent=err(j.error||(j.service?'ready':'net'));
    },function(){b.disabled=false;$('aMsg').textContent=err('net')});
  });

  // Googleでログイン / ログイン中は「Googleをつなぐ」
  var gShown='';
  function gSetup(){
    if(!window.nachaGoogle)return;
    var u=state&&state.user, want=u?(u.google?'':'link'):'login';
    $('gLinked').hidden=!(u&&u.google);$('gLinkHint').hidden=!(u&&!u.google);if(u&&u.google)$('gLinked').textContent='✓ '+t('g_linked')+' · '+u.google;
    if(want===gShown)return;gShown=want;
    $('gLink').textContent='';$('gBtn').textContent='';
    if(want==='login')nachaGoogle($('gBtn'),function(cred){
      $('gMsg').textContent='';
      call('google',{credential:cred}).then(function(j){
        if(j.ok&&j.token){state={token:j.token,exp:j.exp,user:j.user};save();shareHub();load()}
        else $('gMsg').textContent=err(j.error||(j.service?'ready':'google'));
      },function(){$('gMsg').textContent=err('net')});
    },'continue_with').then(function(ok){$('gBtn').hidden=!ok});
    if(want==='link')nachaGoogle($('gLink'),function(cred){
      call('googlelink',{credential:cred}).then(function(j){
        if(j.ok){state.user=j.user;save();render()}else alert(err(j.error||'google'));
      });
    },'signin_with');
  }
  // パスワードを変える・初めて決める（サーバーの /auth/password。済んだら新しいログインの鍵に替わる）
  $('pwForm').addEventListener('submit',function(ev){
    ev.preventDefault();
    var cur=$('pwCur').value,pw=$('pwNew').value,pw2=$('pwNew2').value,m=$('pwMsg');m.textContent='';
    if(pw.length<8||pw.length>64){m.textContent=err('pw');return}
    if(pw!==pw2){m.textContent=t('pw_mismatch');return}
    call('password',{current:cur,pw:pw}).then(function(j){
      if(j.ok&&j.token){state={token:j.token,exp:j.exp,user:j.user};save();try{localStorage.setItem(HUBKEY,JSON.stringify({token:j.token,exp:j.exp,user:{id:j.user.id,member:false,admin:false}}))}catch(e){}
        $('pwCur').value=$('pwNew').value=$('pwNew2').value='';m.textContent=t('pw_done');render()}
      else m.textContent=err(j.error||'net');
    },function(){m.textContent=err('net')});
  });
  $('logoutBtn').addEventListener('click',function(){
    var h=hdr(),tok=state&&state.token;state=null;doc=null;save();render();
    try{var hb=read(HUBKEY);if(hb&&hb.token===tok)localStorage.removeItem(HUBKEY)}catch(e){}
    fetch(API+'/auth/logout',{method:'POST',headers:h}).catch(function(){});
  });
  document.addEventListener('nacha-lang',render);
  // 1日1回だけ、サーバーで最新の権限を確かめる（ハブと同じ /auth/renew）
  if(state){call('renew').then(function(j){if(j.ok){state.exp=j.exp;state.user=j.user;save()}else if(j.status===401){state=null;save()}load()},function(){load()})}
  else render();
})();
