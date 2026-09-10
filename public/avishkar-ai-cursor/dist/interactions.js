import {ParticleWorld} from './particle-physics.js';
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduce.matches;
const motion=document.querySelector('#motion');
function setMotion(value){paused=value;document.documentElement.classList.toggle('motion-paused',paused);motion.setAttribute('aria-pressed',String(paused));motion.innerHTML=paused?'Resume motion <span aria-hidden="true">▷</span>':'Pause motion <span aria-hidden="true">Ⅱ</span>';document.dispatchEvent(new CustomEvent('motionchange',{detail:paused}));}
motion.addEventListener('click',()=>setMotion(!paused));reduce.addEventListener('change',e=>setMotion(e.matches));setMotion(paused);

const cards=[...document.querySelectorAll('.playing-card')],deckScroll=document.querySelector('.deck-scroll'),deckStage=document.querySelector('.deck-stage'),mobile=matchMedia('(max-width:800px)');
let dealt=false,deckProgress=0,deckVisible=false,cardHover=-1,last=0;
const manual=new Map();
function setFace(card,back){card.classList.toggle('is-back',back);card.querySelector('button').setAttribute('aria-pressed',String(back));card.querySelector('.card-content').setAttribute('aria-hidden',String(back));}
function arrangeCards(dt=1/60){
 const rect=deckScroll.getBoundingClientRect();let target=paused||mobile.matches||dealt?1:Math.max(0,Math.min(1,(innerHeight*.35-rect.top)/(Math.max(1,deckScroll.offsetHeight-innerHeight)*.68)));
 deckProgress+=(target-deckProgress)*(1-Math.exp(-7*dt));
 const spread=deckProgress*deckProgress*(3-2*deckProgress);
 cards.forEach((card,i)=>{
  if(!mobile.matches){
   const gap=Math.min(innerWidth*.185,286),offset=(i-2),x=offset*gap*spread+offset*4*(1-spread),angle=offset*(1-spread)*9;
   const raise=cardHover===i?-25:0,y=(Math.abs(offset)*20*(1-spread))+raise;
   card.style.transform=`translate(calc(-50% + ${x}px),${y}px) rotateZ(${angle}deg) rotateX(${(1-spread)*14}deg)`;
   card.style.zIndex=String(cardHover===i?20:5+i);
  }else card.style.removeProperty('transform');
  const autoBack=!(mobile.matches||paused||spread>.34+i*.085);
  setFace(card,manual.has(i)?manual.get(i):autoBack);
 });
}
cards.forEach((card,i)=>{
 const btn=card.querySelector('button');btn.addEventListener('click',()=>{dealt=true;manual.set(i,!card.classList.contains('is-back'));arrangeCards();});
 card.addEventListener('pointerenter',()=>cardHover=i);card.addEventListener('pointerleave',()=>cardHover=-1);
 btn.addEventListener('focus',()=>{dealt=true;cardHover=i;arrangeCards();});btn.addEventListener('blur',()=>cardHover=-1);
});
document.querySelector('#deal-cards').addEventListener('click',()=>{dealt=true;manual.clear();arrangeCards();cards[0].querySelector('button').focus({preventScroll:true});});
new IntersectionObserver(es=>{deckVisible=es[0].isIntersecting;if(deckVisible)arrangeCards();},{rootMargin:'200px'}).observe(deckScroll);
mobile.addEventListener('change',()=>{manual.clear();arrangeCards();});

const confetti=document.querySelector('#confetti'),footer=document.querySelector('.collaborate'),ctx=confetti.getContext('2d',{alpha:true});
let world,footerVisible=false,simTime=0,oldPointer={x:0,y:0,time:0};
function resizePhysics(){const r=footer.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,1.75);confetti.width=Math.round(r.width*dpr);confetti.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 if(!world)world=new ParticleWorld(r.width,r.height,Math.round(Math.min(r.width<700?850:2600,r.width*1.85)));else world.resize(r.width,r.height);renderParticles();}
function renderParticles(){if(!world)return;ctx.clearRect(0,0,world.width,world.height);
 for(const p of world.particles){const r=p.r*.82;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle=p.type===4?'#bdbaff':'#f7f7ff';ctx.beginPath();
  if(p.type===0)ctx.arc(0,0,r,0,Math.PI*2);
  else if(p.type===1)ctx.rect(-r*.8,-r*.8,r*1.6,r*1.6);
  else if(p.type===2){ctx.moveTo(0,-r);ctx.lineTo(r*.92,r*.65);ctx.lineTo(-r*.92,r*.65);ctx.closePath();}
  else if(p.type===3){ctx.rect(-r,-r*.26,r*2,r*.52);ctx.rect(-r*.26,-r,r*.52,r*2);}
  else{ctx.moveTo(0,-r);ctx.lineTo(r*.7,0);ctx.lineTo(0,r);ctx.lineTo(-r*.7,0);ctx.closePath();}
  ctx.fill();ctx.restore();
 }
}
footer.addEventListener('pointermove',e=>{const rect=footer.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,now=performance.now(),dt=Math.max(.016,(now-oldPointer.time)/1000);world.pointer={x,y,vx:Math.max(-1000,Math.min(1000,(x-oldPointer.x)/dt)),vy:Math.max(-1000,Math.min(1000,(y-oldPointer.y)/dt)),active:!paused};oldPointer={x,y,time:now};},{passive:true});
footer.addEventListener('pointerleave',()=>{if(world)world.pointer.active=false;});
footer.addEventListener('pointercancel',()=>{if(world)world.pointer.active=false;});
footer.addEventListener('pointerup',e=>{if(e.pointerType==='touch'&&world)world.pointer.active=false;});
footer.addEventListener('pointerdown',e=>{if(e.target.closest('a,button')||paused)return;const r=footer.getBoundingClientRect();world.burst(e.clientX-r.left,e.clientY-r.top);});
document.querySelector('#confetti-burst').addEventListener('click',()=>{if(paused)setMotion(false);world.burst();});
new IntersectionObserver(es=>{footerVisible=es[0].isIntersecting;},{rootMargin:'100px'}).observe(footer);
new ResizeObserver(resizePhysics).observe(footer);
function frame(t){const dt=Math.min(.035,(t-last)/1000||1/60);last=t;
 if(!document.hidden){if(deckVisible)arrangeCards(dt);if(footerVisible&&!paused&&world){simTime+=dt;while(simTime>=1/60){world.step(1/60);simTime-=1/60;}renderParticles();}}
 requestAnimationFrame(frame);
}
window.addEventListener('resize',()=>arrangeCards());document.addEventListener('motionchange',()=>{manual.clear();arrangeCards();if(world){world.pointer.active=false;renderParticles();}});
resizePhysics();arrangeCards();requestAnimationFrame(frame);
document.querySelector('#subscribe').addEventListener('submit',e=>{e.preventDefault();const email=document.querySelector('#email').value;const body=`Please subscribe ${email} to Build notes.\n\nTo unsubscribe, I can email either contact address.`;location.href='mailto:arpit@avishkarai.com,shivang@avishkarai.com?subject=Build%20notes%20subscription&body='+encodeURIComponent(body);document.querySelector('#subscribe-status').textContent='Send the request from your email app to complete your subscription request.';});
