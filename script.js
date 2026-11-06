(function(){
  var fine=matchMedia('(hover:hover)').matches;
  /* sound */
  var ac;
  function snd(type){
    try{
      ac=ac||new (window.AudioContext||window.webkitAudioContext)();
      var t=ac.currentTime,g=ac.createGain();g.connect(ac.destination);
      var f=type==='open'?[196,247,294,392]:type==='hover'?[660]:type==='err'?[110,117]:[220,330];
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(type==='hover'?.015:.07,t+.04);
      g.gain.exponentialRampToValueAtTime(.0001,t+(type==='open'?3:.9));
      f.forEach(function(v,i){var o=ac.createOscillator();o.type='sine';o.frequency.value=v;o.connect(g);o.start(t+i*.06);o.stop(t+3.1)});
    }catch(e){}
  }
  /* cursor */
  var dot=document.getElementById('dot'),tr=document.getElementById('trail'),mx=innerWidth/2,my=innerHeight/2,tx=mx,ty=my;
  addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px'});
  (function loop(){tx+=(mx-tx)*.12;ty+=(my-ty)*.12;tr.style.left=tx+'px';tr.style.top=ty+'px';requestAnimationFrame(loop)})();
  document.querySelectorAll('a,button').forEach(function(el){
    el.addEventListener('pointerenter',function(){dot.classList.add('ring');snd('hover')});
    el.addEventListener('pointerleave',function(){dot.classList.remove('ring')});
    el.addEventListener('click',function(){snd('click')});
  });
  /* entry + music: track starts at 8s, intro lasts 10s, so the drop (18s) lands on the reveal */
  var SRC='assets/music.mp3',OFF=8,LEN=8.95,done=false,bgm=new Audio(),entry=document.getElementById('entry'),pl=document.getElementById('player'),vol=document.getElementById('vol');
  var W=['«Он','продал','душу,','чтобы спасти','чужую.»'];
  if(SRC){bgm.src=SRC;bgm.loop=true;bgm.preload='auto';bgm.volume=.7}
  var mq=document.getElementById('mq');mq.innerHTML=new Array(9).join('<span>Моя вина — твоё спасение</span><span>Русский реализм</span>');
  function drop(){
    if(done)return;done=true;
    document.getElementById('flash').classList.add('on');
    setTimeout(function(){
      entry.remove();document.body.classList.remove('locked');
      document.querySelector('main').classList.add('dropin');
      if(SRC){pl.classList.add('show','playing')}
    },300);
  }
  function typeIt(){
    var el=document.getElementById('wline'),ops=[['t','«Он продал жизнь'],['p',700],['e',5],['p',450],['t','душу, чтобы спасти чужую.»']],txt='',oi=0,ci=0;
    (function step(){
      if(done||oi>=ops.length)return;var o=ops[oi];
      if(o[0]=='p'){oi++;return setTimeout(step,o[1])}
      if(o[0]=='t'){if(ci<o[1].length){txt+=o[1][ci++];el.textContent=txt;return setTimeout(step,110+Math.random()*80)}oi++;ci=0;return step()}
      if(ci<o[1]){txt=txt.slice(0,-1);el.textContent=txt;ci++;return setTimeout(step,70)}oi++;ci=0;return step();
    })();
  }
  document.getElementById('skip').addEventListener('click',drop);
  document.getElementById('pulse').addEventListener('click',function(){
    entry.classList.add('go');
    typeIt();
    var t0=performance.now(),bar=document.querySelector('#ibar i');
    if(SRC){try{bgm.currentTime=OFF}catch(e){}bgm.play().catch(function(){})}
    (function tick(){
      var el=(SRC&&!bgm.paused&&bgm.currentTime>=OFF)?bgm.currentTime-OFF:(performance.now()-t0)/1000;
      bar.style.width=Math.min(100,el/LEN*100)+'%';
      if(el>=LEN)drop();else if(!done)requestAnimationFrame(tick);
    })();
  });
  document.getElementById('pp').addEventListener('click',function(){
    if(bgm.paused){bgm.play();pl.classList.add('playing')}else{bgm.pause();pl.classList.remove('playing')}
  });
  vol.addEventListener('input',function(){bgm.volume=vol.value});
  addEventListener('pointermove',function(e){var g=e.target.closest&&e.target.closest('.glass');if(g){var r=g.getBoundingClientRect();g.style.setProperty('--mx',(e.clientX-r.left)+'px');g.style.setProperty('--my',(e.clientY-r.top)+'px')}});
  /* reveal */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.2});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
  /* tilt */
  if(fine)document.querySelectorAll('.tilt').forEach(function(el){
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(900px) rotateY('+x*10+'deg) rotateX('+-y*10+'deg)'});
    el.addEventListener('pointerleave',function(){el.style.transform=''});
  });
  /* parallax */
  var art=document.getElementById('art');
  addEventListener('scroll',function(){art.style.transform='translateY('+scrollY*.25+'px) scale(1.05)'},{passive:true});
  /* carousel */
  var tk=document.getElementById('track');
  document.getElementById('next').onclick=function(){tk.scrollBy({left:tk.clientWidth*.8,behavior:'smooth'})};
  document.getElementById('prev').onclick=function(){tk.scrollBy({left:-tk.clientWidth*.8,behavior:'smooth'})};
  /* glitch card + error */
  (function(){
    var m=document.querySelector('.card.mom'),im=m.querySelector('img'),er=document.getElementById('err');
    ['g1','g2'].forEach(function(c){var k=im.cloneNode();k.className=c;im.parentNode.insertBefore(k,m.querySelector('.noise'))});
    function open(){er.hidden=false;er.style.animation='none';void er.offsetWidth;er.style.animation='';snd('err')}
    m.addEventListener('click',open);
    m.addEventListener('keydown',function(e){if(e.key==='Enter')open()});
    m.addEventListener('pointerenter',function(){dot.classList.add('ring')});m.addEventListener('pointerleave',function(){dot.classList.remove('ring')});
    var ok=document.getElementById('eok');ok.addEventListener('click',function(){er.hidden=true;snd('click')});
    ok.addEventListener('pointerenter',function(){dot.classList.add('ring')});ok.addEventListener('pointerleave',function(){dot.classList.remove('ring')});
  })();
  /* hero sky */
  var sk=document.getElementById('sky'),sx=sk.getContext('2d'),S=[];
  function rk(){sk.width=sk.offsetWidth;sk.height=sk.offsetHeight}rk();addEventListener('resize',rk);
  for(var j=0;j<320;j++)S.push({x:Math.random(),y:Math.random(),r:Math.random()*1.3+.2,f:Math.random()*6,v:Math.random()*2+.6});
  var sp=document.getElementById('sparks');
  for(var k=0;k<42;k++){var d=document.createElement('i');d.className='sp';d.style.cssText='left:'+Math.random()*100+'%;top:'+Math.random()*80+'%;--s:'+(6+Math.random()*14)+'px;--d:'+(2.5+Math.random()*4)+'s;--l:-'+Math.random()*6+'s';sp.appendChild(d)}
  (function sky(){
    var t=Date.now()/1000;sx.clearRect(0,0,sk.width,sk.height);
    S.forEach(function(o){var a=.35+.65*Math.abs(Math.sin(t*o.v+o.f));sx.beginPath();sx.arc(o.x*sk.width,o.y*sk.height,o.r,0,7);sx.fillStyle='rgba(215,230,255,'+a+')';sx.fill()});
    requestAnimationFrame(sky)
  })();
  /* particles */
  var c=document.getElementById('bg'),x=c.getContext('2d'),P=[];
  function rs(){c.width=innerWidth;c.height=innerHeight}rs();addEventListener('resize',rs);
  for(var i=0;i<170;i++)P.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.8+.4,s:Math.random()*.25+.05,a:Math.random()*.5+.15});
  (function draw(){
    x.clearRect(0,0,c.width,c.height);
    P.forEach(function(p){p.y-=p.s;p.x+=Math.sin(p.y/60)*.15;if(p.y<-5){p.y=c.height+5;p.x=Math.random()*c.width}
      x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fillStyle='rgba(150,190,255,'+(p.a*(.55+.45*Math.sin(Date.now()/450+p.x)))+')';x.shadowColor='#0059FF';x.shadowBlur=10;x.fill()});
    requestAnimationFrame(draw)
  })();
})();
