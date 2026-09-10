import {CatmullRomCurve3,Vector3,MathUtils} from './vendor/three.module.js';

const canvas=document.querySelector('#scroll-ribbon');
const context=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let points=[],shown=0,last=0,start=0,end=0,width=0,height=0;
let paused=reduced.matches;
const color='#625cff';

function build(){
 width=innerWidth;height=innerHeight;
 const ratio=Math.min(devicePixelRatio,2);
 canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
 context.setTransform(ratio,0,0,ratio,0,0);
 // A screen-space stroke keeps both edges the same distance apart, even on tight turns.
 context.lineWidth=width<700?16:28;
 context.lineCap='round';context.lineJoin='round';context.strokeStyle=color;
 const hero=document.querySelector('.hero-journey'),copy=document.querySelector('.hero-copy'),work=document.querySelector('#work');
 const top=element=>element.getBoundingClientRect().top+scrollY;
 const heroEnd=top(hero)+hero.offsetHeight,copyEnd=top(copy)+copy.offsetHeight,workTop=top(work),workBottom=workTop+work.offsetHeight;
 start=heroEnd-120;end=workBottom-35;
 const curve=new CatmullRomCurve3([
  new Vector3(width*.76,start,0),
  new Vector3(width*.87,heroEnd+100,0),
  new Vector3(width*.96,copyEnd-15,0),
  new Vector3(width*.64,workTop+22,0),
  new Vector3(width*.10,workTop+48,0),
  new Vector3(width*.018,workTop+200,0),
  new Vector3(width*.020,workTop+work.offsetHeight*.45,0),
  new Vector3(width*.012,workTop+work.offsetHeight*.72,0),
  new Vector3(-width*.10,end,0)
 ],false,'centripetal');
 points=curve.getSpacedPoints(1200);draw(1);
}

function draw(dt){
 context.clearRect(0,0,width,height);
 if(paused||!points.length||scrollY>end+40||scrollY+height<start)return;
 const headY=scrollY+height*.82;
 let target=0;
 for(let i=0;i<points.length;i++)if(points[i].y<=headY)target=i;
 shown=MathUtils.damp(shown,target,8,dt);
 const limit=Math.min(points.length-1,Math.floor(shown));
 if(limit<1)return;
 context.beginPath();context.moveTo(points[0].x,points[0].y-scrollY);
 for(let i=1;i<=limit;i++)context.lineTo(points[i].x,points[i].y-scrollY);
 context.stroke();
}

function frame(t){const dt=Math.min(.05,(t-last)/1000||.016);last=t;if(!document.hidden)draw(dt);requestAnimationFrame(frame);}
let resizeTimer;
const queue=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(build,100);};
new ResizeObserver(queue).observe(document.querySelector('main'));
window.addEventListener('resize',queue);
document.fonts.ready.then(build);
document.addEventListener('motionchange',e=>{paused=e.detail;queue();});
build();requestAnimationFrame(frame);
