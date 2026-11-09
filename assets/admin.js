// 会員の管理（管理者・オーナーだけ）。とわないか統合ログインの鍵で /nacha/auth/users を読む。区分は NACHA 用
(function(){
  var API='https://remitech-chores.jaykim-can.workers.dev/nacha', KEY='nacha-auth', HUBKEY='remitech-auth';
  var $=function(id){return document.getElementById(id)};
  var t=window.nachaT||function(k){return k};
  function read(k){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v&&v.token&&v.exp>Date.now()?v:null}catch(e){return null}}
  var state=read(KEY)||read(HUBKEY), users=[], me=null, filter='all';
  function hdr(){return state?{'Authorization':'Bearer '+state.token}:{}}
  function post(op,body){return fetch(API+'/auth/'+op,{method:'POST',cache:'no-store',headers:Object.assign({'Content-Type':'application/json'},hdr()),body:JSON.stringify(body||{})}).then(function(r){return r.json().catch(function(){return {}})})}
  function gate(k){var g=$('adGate');g.hidden=false;g.innerHTML='';var p=document.createElement('span');p.textContent=t(k);g.appendChild(p);
    if(k==='ad_need_login'){var a=document.createElement('a');a.href='../team/';a.className='btn sm';a.style.marginLeft='8px';a.textContent=t('tm_login');g.appendChild(a)}}
  function role(u){return u.owner?'owner':u.admin?'admin':u.member?'member':'user'}
  var RK={owner:'adm_owner',admin:'adm_admin',member:'tm_member',user:'tm_user'};
  function day(s){if(!s)return '—';var d=new Date(s);return isNaN(d)?'—':d.toLocaleDateString(document.documentElement.lang||'ja',{year:'numeric',month:'short',day:'numeric'})}
  function load(){
    fetch(API+'/auth/users',{cache:'no-store',headers:hdr()}).then(function(r){return r.json().then(function(j){j.status=r.status;return j})}).then(function(j){
      if(j.status===401){gate('ad_need_login');return}
      if(j.status===403||!j.users){gate('ad_need_admin');return}
      users=j.users;$('adBox').hidden=false;draw();
    },function(){gate('ad_net')});
  }
  function chips(){
    var c=$('chips');c.textContent='';
    var n={all:users.length,user:0,member:0,admin:0,owner:0};users.forEach(function(u){n[role(u)]++});
    [['all','ad_all'],['user','tm_user'],['member','tm_member'],['admin','adm_admin'],['owner','adm_owner']].forEach(function(x){
      var b=document.createElement('button');b.type='button';b.className='chip'+(filter===x[0]?' on':'');b.setAttribute('role','tab');b.setAttribute('aria-selected',filter===x[0]);
      b.innerHTML='<span></span><b></b>';b.firstChild.textContent=t(x[1]);b.lastChild.textContent=n[x[0]];
      b.addEventListener('click',function(){filter=x[0];draw()});c.appendChild(b);
    });
  }
  function draw(){
    chips();
    var q=$('adSearch').value.trim().toLowerCase(), ul=$('mlist');ul.textContent='';
    var list=users.filter(function(u){return (filter==='all'||role(u)===filter)&&(!q||(u.id+' '+(u.email||'')+' '+(u.google||'')).toLowerCase().indexOf(q)>=0)});
    list.sort(function(a,b){return (b.lastAt||b.joined||b.created||'')<(a.lastAt||a.joined||a.created||'')?-1:1});
    if(!list.length){var e=document.createElement('li');e.className='mempty';e.textContent=t('ad_none');ul.appendChild(e)}
    list.forEach(function(u){
      var li=document.createElement('li');li.className='mrow';
      var av=document.createElement('span');av.className='mav r-'+role(u);av.textContent=(u.id[0]||'?').toUpperCase();li.appendChild(av);
      var info=document.createElement('div');info.className='minfo';
      var top=document.createElement('div');top.className='mtop';var b=document.createElement('b');b.textContent=u.id;top.appendChild(b);
      if(u.id===me.id){var y=document.createElement('span');y.className='tag';y.textContent=t('ad_you');top.appendChild(y)}
      if(u.google){var g=document.createElement('span');g.className='tag g';g.textContent='Google';top.appendChild(g)}
      if(u.hasPassword){var m=document.createElement('span');m.className='tag';m.textContent=t('ad_pw');top.appendChild(m)}
      info.appendChild(top);
      if(u.email||u.google){var em=document.createElement('small');em.textContent=u.google||u.email;info.appendChild(em)}
      var dt=document.createElement('small');dt.className='mdate';dt.textContent=t('ad_joined')+' '+day(u.joined||u.created)+' · '+t('ad_last')+' '+day(u.lastAt);info.appendChild(dt);
      li.appendChild(info);
      var r=role(u), locked=u.owner||(u.admin&&!me.owner)||u.id===me.id;
      if(locked){var bd=document.createElement('span');bd.className='rbadge r-'+r;bd.textContent=t(RK[r]);li.appendChild(bd)}
      else{
        var sel=document.createElement('select');sel.className='rsel r-'+r;sel.setAttribute('aria-label',u.id);
        ['user','member','admin'].forEach(function(k){var o=document.createElement('option');o.value=k;o.textContent=t(RK[k]);sel.appendChild(o)});
        sel.value=r;sel.addEventListener('change',function(){change(u,r,sel)});li.appendChild(sel);
      }
      ul.appendChild(li);
    });
  }
  function change(u,cur,sel){
    var next=sel.value;
    if(next==='admin'&&!confirm(t('ad_confirm_admin').replace('{id}',u.id))){sel.value=cur;return}
    sel.disabled=true;
    var p=cur==='admin'?post('admin',{id:u.id,admin:false}):Promise.resolve({ok:true});
    p.then(function(j){if(!j.ok)return j;return next==='admin'?post('admin',{id:u.id,admin:true}):post('member',{id:u.id,member:next==='member'})})
     .then(function(j){if(!j.ok)alert(window.nachaWhy?nachaWhy(j.error||'net'):j.error);load()},function(){load()});
  }
  $('adSearch').addEventListener('input',draw);
  document.addEventListener('nacha-lang',function(){if(users.length)draw()});
  if(!state){gate('ad_need_login');return}
  post('renew').then(function(j){
    if(!j.ok){gate('ad_need_login');return}
    me=j.user;state.user=j.user;try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
    if(!me.admin){gate('ad_need_admin');return}
    load();
  },function(){gate('ad_net')});
})();
