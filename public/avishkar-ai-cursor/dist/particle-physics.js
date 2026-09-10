export class ParticleWorld {
 constructor(width,height,count,random=Math.random){this.width=width;this.height=height;this.random=random;this.particles=[];this.pointer={x:-1000,y:-1000,vx:0,vy:0,active:false};this.time=0;this.cellSize=16;
  for(let i=0;i<count;i++){const r=3.8+random()*3;this.particles.push({x:r+random()*(width-2*r),y:height-r-random()*height*.38,vx:(random()-.5)*50,vy:(random()-.5)*30,r,angle:random()*6.28,spin:(random()-.5)*3,type:i%5});}
 }
 resize(width,height){const sx=width/this.width,sy=height/this.height;this.width=width;this.height=height;for(const p of this.particles){p.x=Math.max(p.r,Math.min(width-p.r,p.x*sx));p.y=Math.max(p.r,Math.min(height-p.r,p.y*sy));}}
 burst(x=this.width/2,y=this.height*.78){for(const p of this.particles){const dx=p.x-x,dy=p.y-y,d=Math.max(12,Math.hypot(dx,dy));p.vx+=dx/d*(200+this.random()*450);p.vy-=320+this.random()*600;p.spin+=(this.random()-.5)*8;}}
 step(dt){dt=Math.min(dt,1/30);this.time+=dt;const damping=Math.pow(.992,dt*60),pointer=this.pointer;
  for(const p of this.particles){
   p.vy+=710*dt;p.vx+=Math.sin(this.time*.7+p.y*.007)*11*dt;
   if(pointer.active){const dx=p.x-pointer.x,dy=p.y-pointer.y,d=Math.max(.001,Math.hypot(dx,dy)),radius=85+p.r;
    if(d<radius){const k=1-d/radius,force=2200*k;const nx=d<.01?1:dx/d,ny=d<.01?0:dy/d;p.vx+=(nx*force+pointer.vx*.9*k)*dt;p.vy+=(ny*force+pointer.vy*.9*k)*dt;p.x+=nx*k*2;p.y+=ny*k*2;p.spin+=k*(pointer.vx*.001+1)*dt;}
   }
   p.vx=Math.max(-1000,Math.min(1000,p.vx*damping));p.vy=Math.max(-1100,Math.min(1100,p.vy*damping));p.x+=p.vx*dt;p.y+=p.vy*dt;p.angle+=p.spin*dt;p.spin*=.995;
  }
  for(let iteration=0;iteration<2;iteration++){
   const bins=new Map(),size=this.cellSize;
   for(let i=0;i<this.particles.length;i++){const p=this.particles[i],cx=Math.floor(p.x/size),cy=Math.floor(p.y/size),key=cx+','+cy;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(i);}
   for(let i=0;i<this.particles.length;i++){
    const a=this.particles[i],cx=Math.floor(a.x/size),cy=Math.floor(a.y/size);
    for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){
     const neighbors=bins.get((cx+ox)+','+(cy+oy));if(!neighbors)continue;
     for(const j of neighbors){if(j<=i)continue;const b=this.particles[j],dx=b.x-a.x,dy=b.y-a.y,rr=a.r+b.r,ds=dx*dx+dy*dy;if(ds>=rr*rr)continue;
      const distance=Math.sqrt(ds),nx=distance>.001?dx/distance:1,ny=distance>.001?dy/distance:0,overlap=(rr-distance)*.51;
      a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
      const speed=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(speed<0){const impulse=-speed*.54;a.vx-=nx*impulse;a.vy-=ny*impulse;b.vx+=nx*impulse;b.vy+=ny*impulse;}
     }
    }
   }
   for(const p of this.particles){
    if(p.x<p.r){p.x=p.r;p.vx=Math.abs(p.vx)*.4;}if(p.x>this.width-p.r){p.x=this.width-p.r;p.vx=-Math.abs(p.vx)*.4;}
    if(p.y>this.height-p.r){p.y=this.height-p.r;p.vy=-Math.abs(p.vy)*.2;p.vx*=.96;p.spin*=.96;}
    if(p.y<-100){p.y=-100;p.vy=Math.abs(p.vy)*.5;}
   }
  }
 }
}
