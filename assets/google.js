// Googleでログイン（とわないか統合ログイン）。ボタン用の ID はサーバーから受け取る。ID がまだなければボタンを出さない
(function(){
  var API='https://remitech-chores.jaykim-can.workers.dev/nacha', ready=null, handler=null;
  function load(){
    if(ready)return ready;
    ready=fetch(API+'/auth/google-config',{cache:'no-store'}).then(function(r){return r.json()}).then(function(c){
      if(!c||!c.clientId)return null;
      return new Promise(function(ok,ng){var s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=function(){
        google.accounts.id.initialize({client_id:c.clientId,callback:function(res){if(handler&&res&&res.credential)handler(res.credential)}});ok(true)};s.onerror=ng;document.head.appendChild(s)});
    }).catch(function(){return null});
    return ready;
  }
  // el にボタンを描く。押されて Google が済んだら onCred(credential)。使えなければ false で終わる
  window.nachaGoogle=function(el,onCred,text){
    return load().then(function(ok){
      if(!ok||!el)return false;
      el.textContent='';
      google.accounts.id.renderButton(el,{theme:'outline',size:'large',shape:'pill',text:text||'continue_with',locale:document.documentElement.lang||'ja',width:Math.min(320,el.parentNode.clientWidth||320)});
      handler=onCred;   // 画面に出るボタンは一度に1つ（ログイン前はログイン、ログイン後はつなぐ）
      return true;
    });
  };
})();
