import * as THREE from './vendor/three.module.js';
import {createSpacecraft} from './spacecraft.js';
import {flightPath as route} from './flight-path.js';
const canvas=document.querySelector('#scene'),stage=document.querySelector('.prototype-stage'),journey=document.querySelector('.hero-journey');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),clamp=THREE.MathUtils.clamp;
const smooth=(a,b,t)=>THREE.MathUtils.smoothstep(t,a,b);
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.outputColorSpace=THREE.SRGBColorSpace;}catch{stage.classList.add('scene-unavailable');}
if(renderer){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#02040c');
 const camera=new THREE.PerspectiveCamera(43,1,.035,800);scene.add(camera);
 const room=new THREE.Scene();room.background=new THREE.Color('#535b70');
 [[-6,5,4,4],[6,2,3,2],[0,8,-4,3]].forEach(([x,y,z,power])=>{const panel=new THREE.Mesh(new THREE.PlaneGeometry(12,7),new THREE.MeshBasicMaterial({color:new THREE.Color(power,power,power),side:THREE.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);room.add(panel);});
 const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.05);scene.environment=environment.texture;pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xb7c6ed,0x09132f,1.5));
 [[0xffffff,3,-8,9,8],[0x3c50ff,3,5,-4,2],[0xb6ccff,2,1,5,-16]].forEach(([c,i,x,y,z])=>{const l=new THREE.DirectionalLight(c,i);l.position.set(x,y,z);scene.add(l);});
 const cabinLight=new THREE.PointLight(0xc4e1ff,12,18,1.3);camera.add(cabinLight);cabinLight.position.set(0,.4,-.3);
 const frontLight=new THREE.PointLight(0x7391ff,10,18,1.4);frontLight.position.set(0,.5,-9);scene.add(frontLight);
 const ship=createSpacecraft();scene.add(ship);
 const galaxyTexture=new THREE.TextureLoader().load('./assets/galaxy-panorama.png',()=>draw());galaxyTexture.colorSpace=THREE.SRGBColorSpace;galaxyTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const galaxy=new THREE.Mesh(new THREE.PlaneGeometry(720,360),new THREE.MeshBasicMaterial({map:galaxyTexture,color:0xcdd5ff}));galaxy.position.set(4,6,-250);scene.add(galaxy);
 const starCount=6500,positions=new Float32Array(starCount*3),colors=new Float32Array(starCount*3);
 for(let i=0;i<starCount;i++){const angle=i*2.399963,rad=12+(i*37%280),y=(i*53%180)-90;positions[i*3]=Math.cos(angle)*rad;positions[i*3+1]=y;positions[i*3+2]=-20-Math.abs(Math.sin(angle))*300;const c=new THREE.Color(i%7===0?'#adb4ff':i%13===0?'#ffe0b7':'#e6f2ff');colors.set([c.r,c.g,c.b],i*3);}
 const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));starGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));
 scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({size:.14,vertexColors:true,transparent:true,opacity:.85,sizeAttenuation:true,depthWrite:false})));
 // A continuous route from the underside, through the lower hatch and cabin, past the cockpit and into space.
 let pointer=new THREE.Vector2(),softPointer=new THREE.Vector2(),progress=0,time=0,last=0,visible=true,paused=reduced.matches;
 const phase=document.querySelector('#scene-phase'),word=document.querySelector('#journey-word'),description=document.querySelector('#journey-description');
 const words=['BUILD.','LAUNCH.','EXPLORE.'],descriptions=['A bold idea. Built to go further.','Every system ready. Every detail considered.','Your next possibility is out there.'];
 const clockEmbed=document.body.dataset.embed==='clock';
 function draw(){
  const position=route.getPoint(progress),outside=1-smooth(.1,.26,progress);
  const panX=clockEmbed?1.4:.38,panY=clockEmbed?.95:.28;
  position.x+=softPointer.x*panX*outside;position.y+=softPointer.y*panY*outside;
  camera.position.copy(position);
  const target=progress<.19?new THREE.Vector3(0,0,-4):new THREE.Vector3(position.x*.3,.25+smooth(.76,1,progress)*6,position.z-15);
  camera.lookAt(target);camera.rotation.z=Math.sin(progress*Math.PI)*.045+softPointer.x*(clockEmbed?.07:.018)*outside;
  if(clockEmbed){ship.rotation.y=softPointer.x*.48;ship.rotation.x=-softPointer.y*.26;ship.rotation.z=softPointer.x*.09;}
  camera.fov=THREE.MathUtils.lerp(innerWidth<650?54:43,59,smooth(.75,.98,progress));camera.updateProjectionMatrix();
  cabinLight.intensity=THREE.MathUtils.lerp(3,15,smooth(.17,.34,progress))*(1-smooth(.72,.84,progress));
  ship.userData.window.material.opacity=.07*(1-smooth(.62,.72,progress));
  const step=progress<.28?0:progress<.77?1:2;phase.textContent=`0${step+1} / ${words[step].replace('.','')}`;word.textContent=words[step];description.textContent=descriptions[step];
  const caption=progress>.79?smooth(.82,.93,progress):0;
  stage.style.setProperty('--journey',progress);stage.style.setProperty('--caption',caption);stage.style.setProperty('--opening',1-smooth(.05,.20,progress));
  stage.dataset.flightPhase=step===0?'build':step===1?'launch':'explore';renderer.render(scene,camera);
 }
 function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;if(document.body.dataset.embed==='clock'&&r.width>=700){camera.setViewOffset(r.width*1.62,r.height,0,0,r.width,r.height);}else{camera.clearViewOffset();}camera.updateProjectionMatrix();draw();}
 function frame(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;if(visible&&!document.hidden&&!paused){time+=dt;const target=clamp(-journey.getBoundingClientRect().top/Math.max(1,journey.offsetHeight-stage.offsetHeight),0,1);progress=THREE.MathUtils.damp(progress,target,5,dt);softPointer.lerp(pointer,1-Math.exp(-(clockEmbed?12:4)*dt));draw();}requestAnimationFrame(frame);}
 stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);},{passive:true});stage.addEventListener('pointerleave',()=>pointer.set(0,0));
 document.addEventListener('motionchange',e=>{paused=e.detail;if(paused){progress=0;draw();}});
 window.__setClockPointer=(x,y)=>{pointer.set(x,y);};
 window.addEventListener('message',e=>{const d=e.data;if(!d||typeof d!=='object')return;if(d.type==='pointer'){pointer.set(d.x,d.y);return;}if(d.type==='motionchange'){paused=!!d.paused;if(paused){progress=0;draw();}}});
 new IntersectionObserver(es=>visible=es[0].isIntersecting,{rootMargin:'100px'}).observe(stage);new ResizeObserver(resize).observe(stage);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stage.classList.add('scene-unavailable');});canvas.addEventListener('webglcontextrestored',()=>{stage.classList.remove('scene-unavailable');resize();});
 resize();stage.classList.add('scene-ready');requestAnimationFrame(frame);
}
