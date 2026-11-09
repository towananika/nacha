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
  function err(k){return (ERR[k]||ERR.net)[lang()]}
  function render(){
    var u=state&&state.user;
    $('authBox').hidden=!!u; $('meBox').hidden=!u; $('ptT').hidden=$('ptS').hidden=!u;
    $('generalNote').hidden=!(u&&!u.member);
    $('docBox').hidden=!(u&&u.member&&doc);
    $('aSubmitL').textContent=t(mode==='login'?'tm_login':'tm_reg');
    $('admBox').hidden=!(u&&u.admin);
    if(u){$('meId').textContent=u.id;$('meRole').textContent=t(roleKey(u));$('meRole').className='badge'+(u.member?' on':'')}
    if(u&&u.admin&&users)drawUsers();
    gSetup();
  }
  function roleKey(u){return u.owner?'adm_owner':u.admin?'adm_admin':u.member?'tm_member':'tm_user'}
  var users=null;
  function getJson(path){return fetch(API+path,{cache:'no-store',headers:hdr()}).then(function(r){return r.json().catch(function(){return {}}).then(function(j){j.status=r.status;return j})})}
  function loadUsers(){
    if(!(state&&state.user&&state.user.admin))return;
    getJson('/auth/users').then(function(j){if(j.users){users=j.users;drawUsers()}},function(){});
  }
  function drawUsers(){
    var me=state.user,ul=$('ulist');ul.textContent='';
    users.forEach(function(x){
      var li=document.createElement('li');li.className='urow';
      var info=document.createElement('div');info.className='uinfo';
      var b=document.createElement('b');b.textContent=x.id;info.appendChild(b);
      if(x.email){var e=document.createElement('small');e.textContent=x.email;info.appendChild(e)}
      li.appendChild(info);
      if(x.owner||(x.admin&&!me.owner)||x.id===me.id){
        var bd=document.createElement('span');bd.className='badge'+(x.member?' on':'');bd.textContent=t(roleKey(x));li.appendChild(bd);
      }else{
        var sel=document.createElement('select');sel.setAttribute('aria-label',x.id);
        [['user','tm_user'],['member','tm_member'],['admin','adm_admin']].forEach(function(o){var op=document.createElement('option');op.value=o[0];op.textContent=t(o[1]);sel.appendChild(op)});
        var cur=x.admin?'admin':x.member?'member':'user';sel.value=cur;
        sel.addEventListener('change',function(){setRole(x,cur,sel.value,sel)});
        li.appendChild(sel);
      }
      ul.appendChild(li);
    });
  }
  function post(op,body){return call(op,body)}
  function setRole(x,cur,next,sel){
    sel.disabled=true;
    var p=Promise.resolve({ok:true});
    if(cur==='admin')p=post('admin',{id:x.id,admin:false});
    p.then(function(j){
      if(!j.ok)return j;
      if(next==='admin')return post('admin',{id:x.id,admin:true});
      return post('member',{id:x.id,member:next==='member'});
    }).then(function(j){sel.disabled=false;loadUsers();if(!j.ok)alert(j.error||'error')},function(){sel.disabled=false;loadUsers()});
  }
  function load(){
    loadUsers();
    if(!(state&&state.user&&state.user.member))return render();
    fetch(API+'/internal/'+DOC,{cache:'no-store',headers:hdr()}).then(function(r){
      if(r.status===401){state=null;save();return null}
      if(r.status===403){state.user.member=false;save();return null}
      if(r.status===404){$('aMsg').textContent='';showNone();return null}
      return r.ok?r.json():null;
    }).then(function(j){if(j){doc=j;draw()}render()},function(){render()});
  }
  function showNone(){var g=$('generalNote');g.hidden=false;g.firstElementChild.textContent=err('none')}
  function draw(){
    $('docTitle').textContent=doc.title||'';
    var ol=$('slides');ol.textContent='';
    (doc.slides||[]).forEach(function(s){
      var li=document.createElement('li');li.className='slide';
      var h=document.createElement('h4');h.textContent=(s.n?s.n+'. ':'')+(s.title||'');li.appendChild(h);
      (s.lines||[]).forEach(function(x){var p=document.createElement('p');p.textContent=x;li.appendChild(p)});
      li.dataset.q=((s.title||'')+' '+(s.lines||[]).join(' ')).toLowerCase();
      ol.appendChild(li);
    });
    filter();
  }
  function filter(){var q=$('docSearch').value.trim().toLowerCase();[].forEach.call(document.querySelectorAll('.slide'),function(li){li.hidden=!!q&&li.dataset.q.indexOf(q)<0})}
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
    $('gLinked').hidden=!(u&&u.google);if(u&&u.google)$('gLinked').textContent='✓ '+t('g_linked')+' · '+u.google;
    if(want===gShown)return;gShown=want;
    $('gLink').textContent='';$('gBtn').textContent='';
    if(want==='login')nachaGoogle($('gBtn'),function(cred){
      $('aMsg').textContent='';
      call('google',{credential:cred}).then(function(j){
        if(j.ok&&j.token){state={token:j.token,exp:j.exp,user:j.user};save();shareHub();load()}
        else $('aMsg').textContent=t('g_err')+' ('+(j.error||j.status)+')';   // 原因が分かるように理由も出す
      },function(){$('aMsg').textContent=err('net')});
    },'continue_with').then(function(ok){$('gBox').hidden=!ok});
    if(want==='link')nachaGoogle($('gLink'),function(cred){
      call('googlelink',{credential:cred}).then(function(j){
        if(j.ok){state.user=j.user;save();render()}else alert(t(j.error==='google-used'?'g_used':'g_err'));
      });
    },'signin_with');
  }
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
