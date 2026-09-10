import * as THREE from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';

export function createSpacecraft(){
 const ship=new THREE.Group();ship.name='Avishkar explorer';
 const ivory=new THREE.MeshPhysicalMaterial({color:0xd7dce4,metalness:.48,roughness:.29,clearcoat:.7});
 const blue=new THREE.MeshPhysicalMaterial({color:0x2923e8,metalness:.35,roughness:.24,clearcoat:1});
 const metal=new THREE.MeshStandardMaterial({color:0x626e80,metalness:.9,roughness:.27});
 const dark=new THREE.MeshStandardMaterial({color:0x151e30,metalness:.55,roughness:.37});
 const wallMat=new THREE.MeshStandardMaterial({color:0xa3afc3,metalness:.35,roughness:.5});
 const light=new THREE.MeshBasicMaterial({color:0xc4efff});
 const blueLight=new THREE.MeshBasicMaterial({color:0x4c66ff});
 const rounded=new RoundedBoxGeometry(1,1,1,2,.10);
 function box(parent,mat,xyz,scale,rot=[0,0,0]){const m=new THREE.Mesh(rounded,mat);m.position.set(...xyz);m.scale.set(...scale);m.rotation.set(...rot);parent.add(m);return m;}
 function ring(parent,r,t,z,mat,sides=96){const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,sides),mat);m.position.z=z;parent.add(m);return m;}
 // Open-ended fuselage: the camera enters the engine-side hatch and leaves the forward window.
 const profile=[[-12.3,1.45],[-11.9,1.68],[-10.7,2.05],[-8,2.6],[-4,3.05],[0,3.12],[2.5,2.9],[4,2.43]].map(([z,r])=>new THREE.Vector2(r,z));
 const hull=new THREE.Mesh(new THREE.LatheGeometry(profile,96),ivory);hull.rotation.x=Math.PI/2;ship.add(hull);
 const innerProfile=profile.map(p=>new THREE.Vector2(p.x-.13,p.y));
 const innerHull=new THREE.Mesh(new THREE.LatheGeometry(innerProfile,64),new THREE.MeshStandardMaterial({color:0x77859c,metalness:.4,roughness:.45,side:THREE.BackSide}));innerHull.rotation.x=Math.PI/2;ship.add(innerHull);
 for(const [z,r] of [[-10.7,2.06],[-8,2.61],[-4,3.06],[0,3.13],[2.5,2.91]])ring(ship,r,.032,z,metal);
 for(let side of [-1,1]){
  const shape=new THREE.Shape();shape.moveTo(side*2.4,-8);shape.lineTo(side*3.4,-5);shape.lineTo(side*7.3,2.7);shape.lineTo(side*6.7,4.2);shape.lineTo(side*2.65,1.7);shape.closePath();
  const wing=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.20,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.10,bevelThickness:.08}),ivory);wing.rotation.x=Math.PI/2;wing.position.y=-.65;ship.add(wing);
  box(ship,blue,[side*5.1,-.69,1.8],[2.6,.22,.52],[0,side*.63,0]);
  box(ship,metal,[side*3.2,-.8,.1],[.3,.32,4.7],[0,side*.3,0]);
  // Exterior service panels and long blue accents.
  for(let j=0;j<5;j++){box(ship,metal,[side*3.075,0,1-j*1.15],[.026,.56,.75]);box(ship,blueLight,[side*3.10,.35,1-j*1.15],[.03,.035,.58]);}
 }
 const finShape=new THREE.Shape();finShape.moveTo(-3,.5);finShape.lineTo(2.7,.5);finShape.lineTo(2.4,4);finShape.lineTo(.9,3.8);finShape.closePath();
 const fin=new THREE.Mesh(new THREE.ExtrudeGeometry(finShape,{depth:.18,bevelEnabled:true,bevelSize:.06,bevelThickness:.05,bevelSegments:2}),blue);fin.rotation.y=-Math.PI/2;fin.position.set(0,2.4,1);ship.add(fin);
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const gc=glowCanvas.getContext('2d'),grad=gc.createRadialGradient(64,64,2,64,64,64);grad.addColorStop(0,'#f8ffff');grad.addColorStop(.15,'#87c4ff');grad.addColorStop(.45,'#324dffa0');grad.addColorStop(1,'#0812ff00');gc.fillStyle=grad;gc.fillRect(0,0,128,128);
 const glowTex=new THREE.CanvasTexture(glowCanvas);
 for(let i=0;i<4;i++){
  const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a)*2.53,y=Math.sin(a)*2.53;
  const bell=new THREE.Mesh(new THREE.CylinderGeometry(.53,.88,1.55,40,1,true),metal);bell.rotation.x=Math.PI/2;bell.position.set(x,y,4.25);ship.add(bell);
  const rim=ring(ship,.87,.075,5.025,metal);rim.position.x=x;rim.position.y=y;
  const inner=ring(ship,.56,.045,4.82,blueLight);inner.position.x=x;inner.position.y=y;
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));glow.position.set(x,y,4.73);ship.add(glow);
 }
 ring(ship,2.12,.23,4.05,metal);ring(ship,1.94,.045,4.12,light);ring(ship,2.38,.06,3.9,blue);
 // Eight-sided passage, wall cassettes, pressure bulkheads and continuous light strips.
 for(let k=0;k<7;k++){
  const z=3.2-k*1.65;
  for(let i=0;i<8;i++){
   const a=i/8*Math.PI*2,r=1.85;
   box(ship,i===4?dark:wallMat,[Math.sin(a)*r,Math.cos(a)*r,z],[1.43,.105,1.52],[0,0,-a]);
   if(i%2===1)box(ship,light,[Math.sin(a)*1.76,Math.cos(a)*1.76,z],[.045,.045,1.44],[0,0,-a]);
   if(i===2||i===6){box(ship,metal,[Math.sin(a)*1.78,.1,z],[.05,.9,.84]);}
  }
  const brace=ring(ship,1.92,.065,z+.77,metal,8);brace.rotation.z=Math.PI/8;
 }
 function screenTexture(title){const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#031122';ctx.fillRect(0,0,1024,512);ctx.strokeStyle='#315370';ctx.lineWidth=2;
  for(let x=32;x<1024;x+=64){ctx.beginPath();ctx.moveTo(x,75);ctx.lineTo(x,460);ctx.stroke();}for(let y=90;y<500;y+=58){ctx.beginPath();ctx.moveTo(32,y);ctx.lineTo(992,y);ctx.stroke();}
  ctx.fillStyle='#b5e8ff';ctx.font='26px monospace';ctx.fillText(title,35,46);ctx.font='16px monospace';ctx.fillText('AVISHKAR / FLIGHT SYSTEMS',35,489);
  for(let i=0;i<5;i++){ctx.fillStyle=i===4?'#7072ff':'#65c4e9';ctx.fillRect(48,120+i*59,150+((i*173)%350),10);ctx.fillStyle='#83a6c5';ctx.fillText(['HULL INTEGRITY','LIFE SUPPORT','NAVIGATION','PROPULSION','LAUNCH SEQUENCE'][i],50,110+i*59);}
  ctx.strokeStyle='#89dcff';ctx.lineWidth=3;for(let r of [50,85,115]){ctx.beginPath();ctx.arc(800,265,r,0,Math.PI*2);ctx.stroke();}ctx.beginPath();ctx.moveTo(680,265);ctx.lineTo(920,265);ctx.moveTo(800,145);ctx.lineTo(800,385);ctx.stroke();
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
 const screenMat=new THREE.MeshBasicMaterial({map:screenTexture('SYSTEMS NOMINAL'),side:THREE.DoubleSide});
 for(let side of [-1,1])for(let z of [-1,-4.3]){const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.22,.66),screenMat);screen.position.set(side*1.75,.13,z);screen.rotation.y=-side*Math.PI/2;ship.add(screen);}
 // Cockpit: twin seats, flight console, curved canopy frame and a clear central flight path.
 for(let side of [-1,1]){
  box(ship,dark,[side*.92,-1.06,-8.7],[.65,.22,.70]);box(ship,dark,[side*.92,-.59,-8.36],[.66,.91,.17],[-.13,0,0]);box(ship,blue,[side*.92,-.30,-8.25],[.48,.32,.05],[-.13,0,0]);box(ship,metal,[side*.92,-1.35,-8.7],[.18,.55,.32]);
 }
 box(ship,dark,[0,-1,-10.35],[2.8,.38,.78],[-.18,0,0]);
 box(ship,dark,[0,-1.51,-9.3],[3.3,.12,4.1]);
 const consoleScreen=new THREE.Mesh(new THREE.PlaneGeometry(2.5,.55),new THREE.MeshBasicMaterial({map:screenTexture('READY FOR EXPLORATION'),side:THREE.DoubleSide}));consoleScreen.position.set(0,-.78,-10.17);consoleScreen.rotation.x=-.52;ship.add(consoleScreen);
 const canopy=ring(ship,1.48,.11,-12.25,metal,64);canopy.scale.set(1.03,1.02,1);ring(ship,1.34,.022,-12.22,light);
 for(let side of [-1,1])box(ship,metal,[side*1.02,.55,-11.8],[.06,1.6,.08],[0,0,side*.40]);
 const window=new THREE.Mesh(new THREE.CircleGeometry(1.36,64),new THREE.MeshBasicMaterial({color:0x8ac9ff,transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false}));window.position.z=-12.27;ship.add(window);
 const logoTexture=new THREE.TextureLoader().load('./assets/logo-white.png');logoTexture.colorSpace=THREE.SRGBColorSpace;logoTexture.offset.set(.0425,.425);logoTexture.repeat.set(.9065,.18);
 const decal=new THREE.Mesh(new THREE.PlaneGeometry(2.7,.54),new THREE.MeshBasicMaterial({map:logoTexture,color:0x2727da,transparent:true,depthWrite:false}));decal.position.set(3.145,.9,-2.6);decal.rotation.y=Math.PI/2;ship.add(decal);
 ship.userData.window=window;return ship;
}
