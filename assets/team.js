// 関係者ページ: ハブ（REMITECH HUB）と同じログインを使う。
// 資料そのものは公開リポジトリに置かず、ログインした関係者（member）にだけサーバーの /internal/nachadev から渡す。
(function(){
  var API='https://remitech-chores.jaykim-can.workers.dev', KEY='remitech-auth', DOC='nachadev';
  var $=function(id){return document.getElementById(id)};
  var t=window.nachaT||function(k){return k};
  var state=null, mode='login', doc=null;
  try{state=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){state=null}
  if(state&&!(state.token&&state.exp>Date.now()))state=null;
  function save(){try{if(state)localStorage.setItem(KEY,JSON.stringify(state));else localStorage.removeItem(KEY)}catch(e){}}
  function hdr(){return state?{'Authorization':'Bearer '+state.token}:{}}
  function call(op,body){
    return fetch(API+'/auth/'+op,{method:'POST',cache:'no-store',headers:Object.assign({'Content-Type':'application/json'},hdr()),body:JSON.stringify(body||{})})
      .then(function(r){return r.json().catch(function(){return {}}).then(function(j){j.status=r.status;return j})});
  }
  var ERR={wrong:{ja:'IDかパスワードが違います',en:'Wrong ID or password',ko:'ID 또는 비밀번호가 달라요',zh:'ID 或密碼錯誤'},
    taken:{ja:'このIDは使われています',en:'This ID is taken',ko:'이미 사용 중인 ID예요',zh:'此 ID 已被使用'},
    id:{ja:'IDは英数字3〜20文字です',en:'ID: 3–20 letters/numbers',ko:'ID는 영문·숫자 3~20자예요',zh:'ID 須為 3–20 個英數字'},
    pw:{ja:'パスワードは8〜64文字です',en:'Password: 8–64 characters',ko:'비밀번호는 8~64자예요',zh:'密碼須為 8–64 個字元'},
    'pw-id':{ja:'IDと同じパスワードは使えません',en:'Password must differ from ID',ko:'ID와 같은 비밀번호는 쓸 수 없어요',zh:'密碼不可與 ID 相同'},
    'too-many':{ja:'試行が多すぎます。しばらく待ってください',en:'Too many tries. Please wait.',ko:'시도가 너무 많아요. 잠시 기다려 주세요',zh:'嘗試次數過多，請稍候'},
    net:{ja:'通信できませんでした',en:'Could not connect',ko:'연결할 수 없어요',zh:'無法連線'},
    none:{ja:'資料はまだ登録されていません',en:'No documents yet',ko:'아직 등록된 자료가 없어요',zh:'尚未登錄資料'}};
  function lang(){var l=document.documentElement.lang;return l==='zh-Hant'?'zh':(ERR.wrong[l]?l:'ja')}
  function err(k){return (ERR[k]||ERR.net)[lang()]}
  function render(){
    var u=state&&state.user;
    $('authBox').hidden=!!u; $('meBox').hidden=!u;
    $('generalNote').hidden=!(u&&!u.member);
    $('docBox').hidden=!(u&&u.member&&doc);
    $('aSubmitL').textContent=t(mode==='login'?'tm_login':'tm_reg');
    $('aMode').firstElementChild.textContent=t(mode==='login'?'tm_toreg':'tm_tologin');
    $('aPw').autocomplete=mode==='login'?'current-password':'new-password';
    if(u){$('meId').textContent=u.id;$('meRole').textContent=t(u.member?'tm_member':'tm_user');$('meRole').className='badge'+(u.member?' on':'')}
  }
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
  $('aMode').addEventListener('click',function(){mode=mode==='login'?'register':'login';$('aMsg').textContent='';render()});
  $('authForm').addEventListener('submit',function(ev){
    ev.preventDefault();
    var b=$('aSubmit');b.disabled=true;$('aMsg').textContent='';
    call(mode,{id:$('aId').value.trim().toLowerCase(),pw:$('aPw').value}).then(function(j){
      b.disabled=false;
      if(j.ok&&j.token){state={token:j.token,exp:j.exp,user:j.user};save();$('aPw').value='';load()}
      else $('aMsg').textContent=err(j.error);
    },function(){b.disabled=false;$('aMsg').textContent=err('net')});
  });
  $('logoutBtn').addEventListener('click',function(){
    var h=hdr();state=null;doc=null;save();render();
    fetch(API+'/auth/logout',{method:'POST',headers:h}).catch(function(){});
  });
  document.addEventListener('nacha-lang',render);
  // 1日1回だけ、サーバーで最新の権限を確かめる（ハブと同じ /auth/renew）
  if(state){call('renew').then(function(j){if(j.ok){state.exp=j.exp;state.user=j.user;save()}else if(j.status===401){state=null;save()}load()},function(){load()})}
  else render();
})();
