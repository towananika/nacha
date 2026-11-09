(function(){
  window.nachaT=function(k){var l=document.documentElement.lang;l=l==='zh-Hant'?'zh':l;var D=window.NACHA_I18N||{};return (D[l]||D.ja||{})[k]||(D.ja||{})[k]||k};
  var D=window.NACHA_I18N||{},W=window.NACHA_WORDS||[];
  var els=[].slice.call(document.querySelectorAll('[data-i]'));
  els.forEach(function(e){e.dataset.ja=e.textContent});
  function set(l){
    var d=D[l]||{};
    document.documentElement.lang=l==='zh'?'zh-Hant':l;
    els.forEach(function(e){e.textContent=l==='ja'?e.dataset.ja:(d[e.dataset.i]||e.dataset.ja)});
    [].forEach.call(document.querySelectorAll('[data-i18n-ph]'),function(e){var k=e.dataset.i18nPh;if(!e.dataset.jaPh)e.dataset.jaPh=e.placeholder;e.placeholder=l==='ja'?e.dataset.jaPh:((D[l]||{})[k]||e.dataset.jaPh)});
    document.dispatchEvent(new CustomEvent('nacha-lang',{detail:l}));
    [].forEach.call(document.querySelectorAll('#langMenu button'),function(b){b.setAttribute('aria-current',b.dataset.l===l)});
  }
  function pick(){
    try{var s=localStorage.getItem('nacha-lang');if(s&&D[s])return s}catch(e){}
    var n=(navigator.language||'ja').toLowerCase();
    return n.indexOf('ko')===0?'ko':n.indexOf('zh')===0?'zh':n.indexOf('en')===0?'en':'ja';
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
  // word of the day
  var wt=document.getElementById('wordText');
  if(wt&&W.length){var day=Math.floor(Date.now()/864e5);wt.textContent=W[day%W.length]}
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
