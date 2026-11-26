// ================= helpers de escenografía =================
const box=(w,h,d,col,x=0,y=0,z=0,r=.8,m=0)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(col,r,m));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;return o};
const rbox=(w,h,d,col,x=0,y=0,z=0,rad=.03,r=.7)=>{const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,rad),M(col,r));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;return o};
const cyl=(rt,rb,h,col,x=0,y=0,z=0,seg=24,r=.7)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),M(col,r));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;return o};
const sph=(rad,col,x=0,y=0,z=0,r=.8)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(rad,20,14),M(col,r));o.position.set(x,y,z);o.castShadow=true;return o};
const pln=(w,h,mat,x=0,y=0,z=0,ry=0,rx=0)=>{const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);o.position.set(x,y,z);o.rotation.set(rx,ry,0);return o};
const glow=(c,i=1)=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:i,roughness:.6});
const rnd=(()=>{let s=7;return()=>{s=(s*16807)%2147483647;return s/2147483647}})();
const plankTex=(a,b)=>{const t=canvasTex(512,512,(x,w,h)=>{x.fillStyle=a;x.fillRect(0,0,w,h);for(let i=0;i<8;i++){x.fillStyle=`rgba(${rnd()>.5?'255,230,190':'60,40,20'},${.06+rnd()*.1})`;x.fillRect(i*64,0,64,h);x.fillStyle=b;x.fillRect(i*64,0,3,h);for(let k=0;k<5;k++){x.fillRect(i*64,rnd()*h,64,2)}}});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t};
const skyTex=(c0,c1,stars,sun)=>canvasTex(512,512,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,c0);g.addColorStop(1,c1);x.fillStyle=g;x.fillRect(0,0,w,h);if(stars)for(let i=0;i<140;i++){x.fillStyle=`rgba(255,255,255,${.3+rnd()*.7})`;x.fillRect(rnd()*w,rnd()*h*.7,1+rnd()*1.6,1+rnd()*1.6)}if(sun){x.fillStyle='rgba(255,244,200,.95)';x.beginPath();x.arc(sun[0]*w,sun[1]*h,26,0,7);x.fill()}});
const cityTex=(cols,lit,wins=true)=>canvasTex(1024,512,(x,w,h)=>{x.clearRect(0,0,w,h);let px=0;while(px<w){const bw=70+rnd()*110,bh=140+rnd()*300;x.fillStyle=cols[Math.floor(rnd()*cols.length)];x.fillRect(px,h-bh,bw,bh);if(wins)for(let yy=h-bh+16;yy<h-16;yy+=34)for(let xx=px+10;xx<px+bw-18;xx+=30){x.fillStyle=lit&&rnd()>.5?'#ffd98a':'rgba(40,60,90,.55)';x.fillRect(xx,yy,16,20)}px+=bw+4}});

function makeDoor(w,h,wood,glassMat,hand='#d8dde2'){const piv=new THREE.Group();const panel=new THREE.Group();panel.position.x=-w/2;piv.add(panel);
 panel.add(box(w,h,.07,wood,0,h/2,0,.6));
 if(glassMat){const gl=new THREE.Mesh(new THREE.PlaneGeometry(w*.64,h*.52),glassMat);gl.position.set(0,h*.62,.04);panel.add(gl);panel.add(box(w*.7,.05,.09,wood,0,h*.62-h*.27,0));panel.add(box(w*.7,.05,.09,wood,0,h*.62+h*.27,0));panel.add(box(.05,h*.56,.09,wood,-w*.33,h*.62,0));panel.add(box(.05,h*.56,.09,wood,w*.33,h*.62,0))}
 else{[[.2,.72],[.2,.28]].forEach(([_,yy])=>panel.add(box(w*.7,h*.28,.03,wood,0,h*yy+(yy>.5?.0:.0),.045,.5)))}
 const kn=sph(.04,hand,-w*.4,h*.5,.09,.25);panel.add(kn);piv.userData.open=a=>{piv.rotation.y=a};piv.userData.panel=panel;return piv}

function makeRegister(){const g=new THREE.Group();
 g.add(rbox(.5,.16,.42,'#2c2f33',0,.08,0,.03,.5));
 const scr=new THREE.Mesh(new THREE.PlaneGeometry(.26,.16),new THREE.MeshBasicMaterial({map:canvasTex(260,160,(x,w,h)=>{x.fillStyle=LIME;rr(x,0,0,w,h,14);x.fill();x.fillStyle=INK;x.font='800 34px M';x.textAlign='center';x.fillText('listo ✓',w/2,h/2+12)})}));
 const tilt=new THREE.Group();tilt.position.set(0,.3,-.05);tilt.rotation.x=-.35;tilt.add(rbox(.32,.22,.03,'#1f2124',0,0,0,.015));scr.position.z=.018;tilt.add(scr);g.add(tilt);g.add(box(.04,.18,.04,'#1f2124',0,.2,-.06));
 const keys=new THREE.Group();keys.position.set(0,.165,.07);keys.rotation.x=-.12;for(let r=0;r<3;r++)for(let c=0;c<5;c++)keys.add(rbox(.05,.012,.045,(r+c)%4==0?LIME:'#e9e9e4',(c-2)*.065,0,(r-1)*.06,.005));g.add(keys);
 const drawer=new THREE.Group();drawer.add(rbox(.46,.09,.38,'#3a3e44',0,0,0,.015));const cash=rbox(.3,.012,.24,'#8fd16a',0,.05,0,.004);drawer.add(cash);drawer.position.set(0,.05,0);g.add(drawer);
 g.userData.drawer=p=>{drawer.position.z=.04+p*.3;drawer.position.y=.05-.0};shadowed(g);return g}

function makeSign(){const g=new THREE.Group();const cv=[];const mk=(rot)=>{const t=canvasTex(500,260,()=>{});const m=new THREE.Mesh(new THREE.PlaneGeometry(.5,.26),new THREE.MeshBasicMaterial({map:t}));m.rotation.y=rot;m.position.z=rot?-.012:.012;g.add(m);cv.push(t);return m};mk(0);mk(Math.PI);
 const draw=open=>{cv.forEach(t=>{const x=t._x,w=500,h=260,bg=open?LIME:'#2a2a2a',fg=open?'#2a2a2a':LIME;x.fillStyle=bg;rr(x,0,0,w,h,26);x.fill();x.strokeStyle=fg;x.lineWidth=8;rr(x,14,14,w-28,h-28,18);x.stroke();x.fillStyle=fg;x.font='900 88px M';x.textAlign='center';x.fillText(open?'abierto':'cerrado',w/2,h/2+30);t.needsUpdate=true})};
 g.add(cyl(.006,.006,.12,'#555',-.18,.19,0,8));g.add(cyl(.006,.006,.12,'#555',.18,.19,0,8));g.userData.set=draw;draw(false);return g}

// ================= TIENDA (interior + fachada + calle) =================
const SHOP=new THREE.Group();scene.add(SHOP);
const shopRefs={};
(function(){
 const g=SHOP;const SAND='#F0E5CF',GRN='#2F5D3F',WOOD='#B98E63';
 const fl=pln(16,12,new THREE.MeshStandardMaterial({map:Object.assign(plankTex('#DDC299','#cdb088'),{}),roughness:.65}),0,0,0,0,-Math.PI/2);fl.material.map.repeat.set(6,5);fl.receiveShadow=true;g.add(fl);
 g.add(pln(16,12,new THREE.MeshStandardMaterial({color:'#EFE6D6',roughness:.9,side:THREE.DoubleSide}),0,3.15,0,0,Math.PI/2));
 const WZ=-2.2,TH=.26;
 const wallBox=(x0,x1,y0,y1)=>{const w=x1-x0,h=y1-y0;const m=[M(SAND),M(SAND),M(SAND),M(SAND),M(SAND),M(GRN)];const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,TH),m);o.position.set((x0+x1)/2,(y0+y1)/2,WZ);o.castShadow=true;o.receiveShadow=true;g.add(o)};
 wallBox(-3.62,-3.0,0,3.15);wallBox(-3.0,-1.0,0,.95);wallBox(-3.0,-1.0,2.45,3.15);wallBox(-1.0,-.6,0,3.15);wallBox(-.6,.4,2.2,3.15);wallBox(.4,3.62,0,3.15);
 // zócalo verde interior
 [[-3.62,-3.0],[-3.0,-1.0],[-1.0,-.6],[.4,3.62]].forEach(([a,b])=>g.add(box(b-a,.95,.03,'#6E9D7E',(a+b)/2,.475,WZ+TH/2+.016)));

 // paredes laterales
 [[-3.62,1],[3.62,-1]].forEach(([x,s])=>{g.add(box(.26,3.15,6.2,SAND,x,1.575,.8));g.add(box(.03,.95,6.2,'#6E9D7E',x-s*.145,.475,.8));g.add(box(.06,.05,6.2,'#E8D9B8',x-s*.14,.97,.8))});
 // ventana
 const glass=new THREE.MeshStandardMaterial({color:'#bfe6f5',transparent:true,opacity:.16,roughness:.05,metalness:.1});
 g.add(pln(2.0,1.5,glass,-2.0,1.7,WZ+.02));
 [[0,1.7,2.1,.07],[0,2.45,2.1,.07],[0,.95,2.1,.07]].forEach(([_,y,w,h])=>g.add(box(w,h,.1,'#F4F1EA',-2.0,y,WZ+.03)));[-3.0,-1.0].forEach(x=>g.add(box(.07,1.5,.1,'#F4F1EA',x,1.7,WZ+.03)));g.add(box(.05,1.5,.08,'#F4F1EA',-2.0,1.7,WZ+.03));
 g.add(box(2.3,.06,.28,'#F4F1EA',-2.0,.93,WZ+.16));
 // puerta
 const doorGlass=new THREE.MeshStandardMaterial({color:'#bfe6f5',transparent:true,opacity:.22,roughness:.05});
 const door=makeDoor(1.0,2.2,'#6B4A2E',doorGlass);door.position.set(.4,0,WZ+.04);g.add(door);shopRefs.door=door;
 g.add(box(.08,2.2,.12,'#F4F1EA',-.6,1.1,WZ+.04));g.add(box(.08,2.2,.12,'#F4F1EA',.4,1.1,WZ+.04));g.add(box(1.08,.08,.12,'#F4F1EA',-.1,2.22,WZ+.04));
 const sign=makeSign();sign.position.set(-.1,1.55,WZ+.12);g.add(sign);shopRefs.sign=sign;
 g.add(box(1.1,.04,.5,'#4b3a2a',-.1,.02,WZ+.4));
 // estantes con productos
 const cols=['#F5F0E4','#E3EBD9','#D5E6C4','#EDE3CE','#A7FF6B','#F5F0E4'];
 [1.05,1.65].forEach((y,i)=>{g.add(rbox(2.7,.05,.32,'#F3EEE2',2.05,y,WZ+.28,.015));for(let k=0;k<7;k++){const c=cols[Math.floor(rnd()*cols.length)],h=.18+rnd()*.1;const b=rnd()>.5?rbox(.12,h,.14,c,.95+k*.34+rnd()*.02,y+h/2+.03,WZ+.28,.02):cyl(.045,.045,h,c,.95+k*.34,y+h/2+.03,WZ+.28,16);g.add(b)}});
 
 // reloj de pared
 const clk=makeClock();clk.position.set(2.05,2.78,WZ+.22);clk.scale.setScalar(1.15);g.add(clk);shopRefs.clock=clk;
 // mostrador
 const ct=new THREE.Group();ct.add(box(2.6,.92,.7,GRN,0,.46,0,.7));ct.add(box(2.6,.1,.7,LIME,0,.5,.0,.5));ct.children[1].position.z=.0;ct.add(rbox(2.76,.07,.84,WOOD,0,.955,0,.02,.5));ct.add(box(2.6,.06,.72,'#F4F1EA',0,.03,0));ct.position.set(1.95,0,0);g.add(ct);shopRefs.counter=ct;
 const reg=makeRegister();reg.position.set(2.55,.99,-.02);reg.rotation.y=.75;g.add(reg);shopRefs.reg=reg;
 // lámparas colgantes
 [-.9,1.6].forEach(x=>{g.add(cyl(.006,.006,.7,'#333',x,2.8,.3,6));const l=new THREE.Mesh(new THREE.SphereGeometry(.16,20,14,0,Math.PI*2,0,Math.PI*.6),glow('#FFD9A0',1.1));l.rotation.x=Math.PI;l.position.set(x,2.42,.3);g.add(l);g.add(sph(.07,'#fff3d6',x,2.42,.3,.2))});
 // planta, póster, cuadros
 g.add(cyl(.2,.15,.38,'#C8553D',-3.2,.19,-1.7,16));for(let i=0;i<9;i++){const a=i/9*6.28;const lf=sph(.14,'#3C8D40',-3.2+Math.cos(a)*.17,.7+rnd()*.5,-1.7+Math.sin(a)*.17);lf.scale.set(.7,1.5,.7);g.add(lf)}
 // calle detrás de la fachada
 const st=new THREE.Group();g.add(st);shopRefs.street=st;
 st.add(box(30,.1,1.6,'#cfc9bd',0,.05,-3.1));st.add(box(30,.12,.16,'#a9a498',0,.06,-3.95));
 st.add(pln(30,9,new THREE.MeshStandardMaterial({color:'#3a3d42',roughness:.9}),0,.01,-8.5,0,-Math.PI/2));
 for(let i=-6;i<6;i++)st.add(pln(1.2,.14,new THREE.MeshBasicMaterial({color:'#e8e4d0'}),i*2.4,.015,-8.4,0,-Math.PI/2));
 const bld=pln(34,9.5,new THREE.MeshBasicMaterial({map:cityTex(['#DCE7E8','#EAE2D4','#D3E0E2','#EFE6D8'],false,false),transparent:true}),0,4.7,-13);st.add(bld);shopRefs.city=bld;
 const sky=pln(80,40,new THREE.MeshBasicMaterial({map:skyTex('#8fd0ff','#e9f6ff')}),0,14,-24);st.add(sky);shopRefs.sky=sky;
 // árbol y poste de luz
 // toldo exterior
 const aw=new THREE.Group();for(let i=0;i<10;i++)aw.add(box(.72,.05,.9,i%2?'#ffffff':LIME,-3.4+i*.72+.36,0,0));aw.position.set(0,2.62,WZ-.5);aw.rotation.x=.25;g.add(aw);
})();
// bolsas y objetos que se mueven se agregan como props en main5

// ================= CASA: fachada de noche =================
const HOUSE=new THREE.Group();HOUSE.position.set(60,0,0);scene.add(HOUSE);const houseRefs={};
(function(){
 const g=HOUSE,WZ=-2.4;
 g.add(pln(40,26,new THREE.MeshStandardMaterial({color:'#1f3b2c',roughness:1}),0,0,-4,0,-Math.PI/2));
 g.add(box(1.5,.06,9,'#8a8f94',0,.03,3.2));for(let i=0;i<9;i++)g.add(box(1.5,.07,.02,'#6e7378',0,.05,-1.1+i*.95));
 const wall=box(9,3.6,.34,'#B5573A',0,1.8,WZ,.95);g.add(wall);
 g.add(box(9.4,.34,1.7,'#2f2424',0,3.78,WZ+.4,.9));
 for(let i=0;i<9;i++)g.add(box(9,.015,.352,'#9a4630',0,.4+i*.4,WZ+.001));
 // puerta y su vano iluminado
 g.add(pln(1.0,2.2,glow('#FFC878',1.15),0,1.1,WZ+.176));
 const door=makeDoor(1.0,2.2,'#5A3A24',null,'#d8b46a');door.position.set(.5,0,WZ+.2);g.add(door);houseRefs.door=door;
 g.add(box(.1,2.3,.14,'#EDE6D8',-.55,1.15,WZ+.2));g.add(box(.1,2.3,.14,'#EDE6D8',.55,1.15,WZ+.2));g.add(box(1.2,.1,.14,'#EDE6D8',0,2.3,WZ+.2));
 g.add(box(1.5,.14,.7,'#9aa0a5',0,.07,WZ+.5));g.add(box(1.8,.14,.5,'#8a9096',0,.0,WZ+.85));
 g.add(box(.9,.02,.6,'#2F5D3F',0,.16,WZ+.6));
 // ventanas con luz cálida
 [-2.6,2.6].forEach(x=>{g.add(pln(1.5,1.2,glow('#FFC070',1.0),x,1.6,WZ+.176));g.add(box(1.7,.08,.1,'#EDE6D8',x,2.25,WZ+.2));g.add(box(1.7,.08,.1,'#EDE6D8',x,.97,WZ+.2));[-.85,.85].forEach(d=>g.add(box(.08,1.3,.1,'#EDE6D8',x+d,1.6,WZ+.2)));g.add(box(.05,1.2,.08,'#EDE6D8',x,1.6,WZ+.2));g.add(box(1.5,.05,.08,'#EDE6D8',x,1.6,WZ+.2));
  g.add(pln(.5,1.1,new THREE.MeshBasicMaterial({color:'#C8553D',transparent:true,opacity:.75}),x-.5,1.6,WZ+.19));g.add(pln(.5,1.1,new THREE.MeshBasicMaterial({color:'#C8553D',transparent:true,opacity:.75}),x+.5,1.6,WZ+.19))});
 // farol del porche y luz
 g.add(sph(.13,'#fff3d0',1.15,2.0,WZ+.4,.2).clone());const pl=new THREE.Mesh(new THREE.SphereGeometry(.12,16,12),glow('#fff0c0',2));pl.position.set(1.15,2.0,WZ+.35);g.add(pl);
 const porch=new THREE.PointLight('#ffd9a0',6,9,1.4);porch.position.set(.8,2.0,WZ+1.2);g.add(porch);houseRefs.porch=porch;
 const hall=new THREE.PointLight('#ffb866',0,7,1.6);hall.position.set(0,1.5,WZ+.9);g.add(hall);houseRefs.hall=hall;
 // plantas, buzón
 // cielo nocturno
 g.add(pln(90,46,new THREE.MeshBasicMaterial({map:skyTex('#070d24','#26356b',true,[.72,.18])}),0,16,-26));
 g.add(pln(50,8,new THREE.MeshBasicMaterial({map:cityTex(['#1d2a4d','#223259'],false,false),transparent:true}),0,3.5,-18));
 // faroles de calle
})();

// ================= CASA: interior de noche =================
const HOME=new THREE.Group();HOME.position.set(120,0,0);scene.add(HOME);const homeRefs={};
(function(){
 const g=HOME,WZ=-2.6;
 const wl=new THREE.MeshStandardMaterial({color:'#E6D3B6',roughness:.95});
 const fl=pln(14,12,new THREE.MeshStandardMaterial({map:plankTex('#B8956A','#a68459'),roughness:.55}),0,0,0,0,-Math.PI/2);fl.material.map.repeat.set(5,4);fl.receiveShadow=true;g.add(fl);
 g.add(pln(14,12,new THREE.MeshStandardMaterial({color:'#E8D9BF',roughness:1}),0,3.1,0,0,Math.PI/2));
 const bw=new THREE.Mesh(new THREE.PlaneGeometry(14,3.1),wl);bw.position.set(0,1.55,WZ);bw.receiveShadow=true;g.add(bw);
 [[-3.6,Math.PI/2],[3.6,-Math.PI/2]].forEach(([x,ry])=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(12,3.1),wl);w.position.set(x,1.55,0);w.rotation.y=ry;w.receiveShadow=true;g.add(w)});
 g.add(box(14,.9,.04,'#7FA68D',0,.45,WZ+.02));
 // ventana nocturna
 g.add(pln(1.9,1.4,new THREE.MeshBasicMaterial({map:skyTex('#0a1030','#2b3a74',true,[.7,.25])}),-1.8,1.75,WZ+.02));
 [[0,1.05,2.0,.08],[0,2.45,2.0,.08]].forEach(([_,y,w,h])=>g.add(box(w,h,.08,'#F4F1EA',-1.8,y,WZ+.05)));[-2.78,-.82,-1.8].forEach(x=>g.add(box(.07,1.4,.08,'#F4F1EA',x,1.75,WZ+.05)));
 g.add(pln(.6,1.5,new THREE.MeshBasicMaterial({color:'#B5573A'}),-3.1,1.75,WZ+.06));g.add(pln(.6,1.5,new THREE.MeshBasicMaterial({color:'#B5573A'}),-.5,1.75,WZ+.06));
 // sofá y mesa
 const tb=new THREE.Group();tb.add(rbox(2.2,.08,1.1,'#9a6a3f',0,.76,0,.03));[[-1,-.45],[1,-.45],[-1,.45],[1,.45]].forEach(([a,b])=>tb.add(cyl(.05,.045,.76,'#6b4a2e',a*.95,.38,b)));
 [-.7,0,.7].forEach((x,i)=>{tb.add(cyl(.2,.17,.025,'#ffffff',x,.8,.18,28,.3));tb.add(cyl(.14,.12,.03,i==1?'#E4C27A':'#D9803A',x,.82,.18,20,.9));tb.add(cyl(.2,.17,.025,'#ffffff',x,.8,-.2,28,.3))});
 tb.add(cyl(.05,.06,.18,LIME,0,.9,0,16,.4));tb.position.set(-.2,0,.5);g.add(tb);homeRefs.table=tb;
 [[-.9,1.2],[.5,1.2]].forEach(([x,z])=>{g.add(rbox(.45,.08,.45,'#C8553D',x-.2,.46,z+.3,.02));g.add(rbox(.45,.5,.06,'#C8553D',x-.2,.72,z+.52,.02));[[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]].forEach(([a,b])=>g.add(cyl(.02,.02,.46,'#6b4a2e',x-.2+a,.23,z+.3+b,6)))});
 // lámpara sobre la mesa
 g.add(cyl(.005,.005,1.4,'#222',-.2,2.4,.5,6));const lamp=new THREE.Mesh(new THREE.SphereGeometry(.28,20,14,0,Math.PI*2,0,Math.PI*.55),glow('#FFD590',1.3));lamp.rotation.x=Math.PI;lamp.position.set(-.2,1.78,.5);g.add(lamp);g.add(sph(.1,'#fff4d6',-.2,1.78,.5,.2));
 const pt=new THREE.PointLight('#ffd09a',7,10,1.3);pt.position.set(-.2,1.6,.6);pt.castShadow=false;g.add(pt);homeRefs.lamp=pt;
 const pt2=new THREE.PointLight('#ffd6a8',2.5,8,1.4);pt2.position.set(2.2,1.3,-1);g.add(pt2);
 // cuadros familiares
 // puerta de entrada (pared izquierda)
 const door=makeDoor(1.0,2.2,'#5A3A24',null,'#d8b46a');const dwrap=new THREE.Group();dwrap.rotation.y=Math.PI/2;dwrap.position.set(-3.55,0,1.8);dwrap.add(door);g.add(dwrap);homeRefs.door=door;
 g.add(pln(1.0,2.2,glow('#6e86c8',.5),-3.58,1.1,1.3,Math.PI/2));
})();
// luces interiores de la tienda: relleno suave desde varios puntos, sin sombras
(function(){const pts=[[-2.4,2.6,1.2,5],[0,2.7,1.0,6],[2.2,2.6,.8,6],[1.2,2.4,-.8,4],[-1.4,2.4,-.6,4]];pts.forEach(([x,y,z,i])=>{const l=new THREE.PointLight('#fff2dc',i,9,1.2);l.position.set(x,y,z);SHOP.add(l)})})();
