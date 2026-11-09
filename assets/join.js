// 会員登録: 登録した人は一般ユーザー。とわないか統合ログインのアカウント（ハブと共通。権限はサイト別）
(function(){
  var API='https://remitech-chores.jaykim-can.workers.dev/nacha', KEY='nacha-auth', HUBKEY='remitech-auth';
  var $=function(id){return document.getElementById(id)};
  var M={id:{ja:'IDは英数字3〜20文字です',en:'ID: 3–20 letters/numbers',ko:'ID는 영문·숫자 3~20자예요',zh:'ID 須為 3–20 個英數字'},
    pw:{ja:'パスワードは8〜64文字です',en:'Password: 8–64 characters',ko:'비밀번호는 8~64자예요',zh:'密碼須為 8–64 個字元'},
    pw2:{ja:'確認用のパスワードが一致しません',en:'Passwords do not match',ko:'비밀번호가 일치하지 않아요',zh:'兩次密碼不一致'},
    'pw-id':{ja:'IDと同じパスワードは使えません',en:'Password must differ from ID',ko:'ID와 같은 비밀번호는 쓸 수 없어요',zh:'密碼不可與 ID 相同'},
    email:{ja:'メールアドレスの形が正しくありません',en:'Invalid email address',ko:'이메일 형식이 올바르지 않아요',zh:'電子郵件格式不正確'},
    taken:{ja:'このIDは使われています',en:'This ID is taken',ko:'이미 사용 중인 ID예요',zh:'此 ID 已被使用'},
    full:{ja:'登録できる人数の上限です',en:'Registration is full',ko:'가입 가능 인원이 가득 찼어요',zh:'註冊人數已滿'},
    'too-many':{ja:'試行が多すぎます。しばらく待ってください',en:'Too many tries. Please wait.',ko:'시도가 너무 많아요. 잠시 기다려 주세요',zh:'嘗試次數過多，請稍候'},
    ready:{ja:'登録の受付を準備中です。しばらくしてからもう一度お試しください',en:'Sign-up is being set up. Please try again later.'},
    net:{ja:'通信できませんでした',en:'Could not connect',ko:'연결할 수 없어요',zh:'無法連線'}};
  function msg(k){var l=document.documentElement.lang;l=l==='zh-Hant'?'zh':l;var m=M[k]||M.net;return m[l]||(l==='ja'?m.ja:m.en)}
  $('joinForm').addEventListener('submit',function(ev){
    ev.preventDefault();
    var id=$('jId').value.trim().toLowerCase(),em=$('jEmail').value.trim(),pw=$('jPw').value,pw2=$('jPw2').value;
    var bad=!/^[a-z0-9_.-]{3,20}$/.test(id)?'id':pw.length<8||pw.length>64?'pw':pw!==pw2?'pw2':pw.toLowerCase()===id?'pw-id':em&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)?'email':'';
    if(bad){$('jMsg').textContent=msg(bad);return}
    var b=$('jSubmit');b.disabled=true;$('jMsg').textContent='';
    fetch(API+'/auth/register',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id,pw:pw,email:em})})
      .then(function(r){return r.json().catch(function(){return {}})})
      .then(function(j){
        b.disabled=false;
        if(j.ok&&j.token){try{localStorage.setItem(KEY,JSON.stringify({token:j.token,exp:j.exp,user:j.user}));localStorage.setItem(HUBKEY,JSON.stringify({token:j.token,exp:j.exp,user:{id:j.user.id,member:false,admin:false}}))}catch(e){}location.href='../team/'}
        else $('jMsg').textContent=msg(j.error||(j.service?'ready':'net'));
      },function(){b.disabled=false;$('jMsg').textContent=msg('net')});
  });
})();
