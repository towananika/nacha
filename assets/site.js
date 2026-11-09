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
