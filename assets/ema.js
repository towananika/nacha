// みんなの絵馬: ナチャへのひとことを掛ける掲示板。
// 読むのはだれでも（GET /nacha/ema）、書くのはログインした人だけ（POST /nacha/ema）。
// ふさわしくない絵馬は管理者が外せる（POST /nacha/ema/hide）。
// 投稿数やランキングは見せない（NACHA_CORE.md「サイトの目標」）。
(function(){
  var API='https://remitech-chores.jaykim-can.workers.dev/nacha', KEY='nacha-auth', HUBKEY='remitech-auth', MAX=140;
  var $=function(id){return document.getElementById(id)};
  function read(k){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v&&v.token&&v.exp>Date.now()?v:null}catch(e){return null}}
  var state=read(KEY)||read(HUBKEY);
  var user=(state&&state.user)||{};
  var cursor=null, loading=false;

  // ナチャと仲間からのひとこと。絵馬ごとに決まった一つを返す（毎回同じ）
  var REPLIES=['ナチャ：ちゃんと読んだよ。ありがとう！','ナチャ：はなまる満点！','ナチャ：その気持ち、いっしょに祈っておくね。','白衣観音：うんうん、聞いていますよ。','不動明王：よし、迷いは俺が焼き払ってやる！','南極老人：ほっほっ、良いご縁がありますように。','ナチャ：また話しに来てね。'];
  function replyFor(id){var h=0,s=String(id);for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return REPLIES[h%REPLIES.length]}

  function ago(ms){
    var d=(Date.now()-ms)/1000;
    if(d<60)return 'たった今';if(d<3600)return Math.floor(d/60)+'分前';if(d<86400)return Math.floor(d/3600)+'時間前';
    var t=new Date(ms);return (t.getMonth()+1)+'月'+t.getDate()+'日';
  }
  function hdr(){return state?{'Authorization':'Bearer '+state.token}:{}}

  function card(it){
    var el=document.createElement('article');el.className='ema';el.dataset.id=it.id;
    var p=document.createElement('p');p.textContent=it.text;el.appendChild(p);
    var by=document.createElement('span');by.className='by';by.textContent=(it.name||'だれか')+' · '+ago(it.at);el.appendChild(by);
    var r=document.createElement('span');r.className='reply';r.textContent=replyFor(it.id);el.appendChild(r);
    if(user.admin){
      var b=document.createElement('button');b.type='button';b.className='btn ghost hide';b.textContent='外す';
      b.addEventListener('click',function(){hide(it.id,el)});el.appendChild(b);
    }
    return el;
  }

  function load(){
    if(loading)return;loading=true;
    var url=API+'/ema?limit=30'+(cursor?'&before='+encodeURIComponent(cursor):'');
    fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw r.status;return r.json()}).then(function(j){
      var items=j.items||[], board=$('board');
      items.forEach(function(it){board.appendChild(card(it))});
      cursor=items.length?items[items.length-1].at:cursor;
      $('more').hidden=!j.more;
      $('empty').hidden=board.children.length>0;
      ready(true);
    }).catch(function(){ if(!$('board').children.length)ready(false) }).then(function(){loading=false});
  }

  // サーバーが絵馬に対応していないあいだは「準備中」を見せ、書けないようにする
  function ready(ok){
    $('offline').hidden=ok;
    $('write').hidden=!ok;
  }

  function hide(id,el){
    fetch(API+'/ema/hide',{method:'POST',headers:Object.assign({'Content-Type':'application/json'},hdr()),body:JSON.stringify({id:id})})
      .then(function(r){if(r.ok)el.remove()});
  }

  var ta=$('emaText'), send=$('emaSend'), msg=$('msg');
  function update(){var n=ta.value.trim().length;$('count').textContent=ta.value.length+' / '+MAX;send.disabled=!state||n===0||ta.value.length>MAX}
  if(!state){ta.disabled=true;$('loginNote').hidden=false}
  else{$('acct').textContent='マイページ'}
  ta.addEventListener('input',update);update();

  send.addEventListener('click',function(){
    var text=ta.value.trim();if(!text||!state)return;
    send.disabled=true;msg.className='msg';msg.textContent='';
    fetch(API+'/ema',{method:'POST',headers:Object.assign({'Content-Type':'application/json'},hdr()),body:JSON.stringify({text:text})})
      .then(function(r){return r.json().catch(function(){return {}}).then(function(j){j.status=r.status;return j})})
      .then(function(j){
        if(j.item){
          var board=$('board');board.insertBefore(card(j.item),board.firstChild);$('empty').hidden=true;
          ta.value='';msg.textContent='絵馬を掛けたよ。ナチャが読んでくれるはず！';
        }else{
          msg.className='msg err';
          msg.textContent=j.status===401?'ログインが切れました。もう一度ログインしてね。':j.status===429?'少し時間をおいてから、また書いてね。':'うまく掛けられませんでした。時間をおいて試してね。';
        }
      },function(){msg.className='msg err';msg.textContent='うまく掛けられませんでした。時間をおいて試してね。'})
      .then(update);
  });

  $('more').addEventListener('click',load);
  load();
})();
