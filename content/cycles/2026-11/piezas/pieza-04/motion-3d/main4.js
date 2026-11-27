const POSES={
 wave:(lt)=>({arz:2.5,aer:.4+Math.sin(lt*11)*.45,alz:.1,hdz:Math.sin(lt*3)*.08,dy:Math.abs(Math.sin(lt*4))*.015}),
 surprised:(lt)=>({arz:.5,alz:.5,aer:.6,ael:.6,tx:-.06,hdx:-.08,dy:Math.abs(Math.sin(lt*6))*.01}),
 megaphone:(lt)=>({arx:-1.25,arz:.25,aer:.9,alz:.45,ael:.6,tx:-.08,dy:Math.abs(Math.sin(lt*7))*.04,hdx:-.12}),
 phone:(lt)=>({arx:-1.15,alx:-1.05,arz:.12,alz:.12,aer:1.55,ael:1.5,tx:.06,hdx:.32,look:[0,-1]}),
 phoneUp:(lt)=>({arx:-1.35,arz:.05,aer:1.9,alz:.1,ael:.2,tx:.02,hdx:.12,look:[.2,-.6]}),
 headhands:(lt)=>({arz:2.55,alz:2.55,aer:2.45,ael:2.45,arx:-.25,alx:-.25,tz:Math.sin(lt*24)*.03,hdz:Math.sin(lt*24)*.05,dy:Math.abs(Math.sin(lt*12))*.015}),
 give:(lt)=>({alx:-1.3,ael:.25,alz:-.1,arx:-1.1,aer:1.6,arz:.1,hdy:.35,tx:.04,look:[.8,-.2]}),
 giveCalm:(lt)=>({alx:-1.3,ael:.25,alz:-.1,arz:.1,hdy:.25,look:[.6,0]}),
 slump:()=>({tx:.3,hdx:.45,arx:.05,alx:.05,aer:.15,ael:.15,dy:-.03,look:[0,-1]}),
 chin:(lt)=>({arx:-1.95,aer:2.35,arz:.1,alz:.2,ael:.5,alx:-.5,hdz:.14,hdy:Math.sin(lt*1.5)*.12,look:[.6,.5]}),
 lean:(lt)=>({arx:-.6,alx:-.6,aer:1.9,ael:1.9,arz:-.2,alz:-.2,tx:-.05,hdz:Math.sin(lt*1.4)*.06,dy:Math.sin(lt*2)*.005}),
 cheer:(lt)=>({arz:2.7,alz:2.7,aer:.35,ael:.35,dy:Math.abs(Math.sin(lt*6))*.06,hdz:Math.sin(lt*5)*.08}),
 hug:(lt)=>({arz:1.45,alz:1.45,arx:-.6,alx:-.6,aer:.6,ael:.6,dy:Math.abs(Math.sin(lt*4))*.02}),
 wait:(lt)=>({arx:-1.25,aer:1.75,alz:.08,hlL:Math.abs(Math.sin(lt*7))*.18,hdx:.25,look:[0,-1]}),
 waitImp:(lt)=>({arx:-.2,alx:-.2,arz:.25,alz:.25,aer:1.4,ael:1.4,hlL:Math.abs(Math.sin(lt*8))*.2,hdy:Math.sin(lt*3)*.25,look:[-.6,0]}),
 stand:()=>({}),
};
const dani=makePerson({apron:LIME,style:'quiff'});const cliA=makePerson({shirt:'#5b6470',pants:'#2f3a52',skin:'#D9A47A',hair:'#6b3f22'});const cliB=makePerson({shirt:'#e9e4d8',pants:'#4a4a4a',skin:'#C98F68',hair:'#3a2418',style:'curly'});
const mom=makePerson({shirt:LIME,pants:INK,skin:'#C98F68',hair:'#3a2418',style:'bun'});const kid=makePerson({shirt:GREEN,pants:INK,skin:'#E9B48A',hair:'#2B2B2B',style:'spiky'});kid.root.scale.setScalar(.62);
// set
const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshBasicMaterial({color:'#F1F2EC'}));floor.rotation.x=-Math.PI/2;scene.add(floor);
const shadowPl=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.ShadowMaterial({opacity:.18}));shadowPl.rotation.x=-Math.PI/2;shadowPl.position.y=.002;shadowPl.receiveShadow=true;scene.add(shadowPl);
const wall=new THREE.Mesh(new THREE.PlaneGeometry(60,30),new THREE.MeshBasicMaterial({color:PAPER}));wall.position.set(0,15,-1.8);scene.add(wall);
const disc=new THREE.Mesh(new THREE.CircleGeometry(1.15,48),new THREE.MeshBasicMaterial({color:'#E6FBD2'}));disc.position.set(0,1.3,-1.78);scene.add(disc);
const counter=new THREE.Group();{const b=new THREE.Mesh(new RoundedBoxGeometry(1.1,.9,.55,5,.06),M('#ffffff'));b.position.y=.45;counter.add(b);const top=new THREE.Mesh(new RoundedBoxGeometry(1.2,.06,.65,3,.02),M('#ffffff',.5));top.position.y=.93;counter.add(top);const strip=new THREE.Mesh(new RoundedBoxGeometry(1.1,.1,.02,2,.01),M(LIME,.45));strip.position.set(0,.78,.28);counter.add(strip);
 const st=new THREE.Mesh(new THREE.PlaneGeometry(.42,.26),new THREE.MeshStandardMaterial({map:canvasTex(420,260,(x,w,h)=>{x.fillStyle=GREEN;rr(x,0,0,w,h,40);x.fill();x.fillStyle='#fff';x.font='900 76px M';x.textAlign='center';x.textBaseline='middle';x.fillText('ABIERTO',w/2,h/2+6)}),transparent:true}));st.position.set(-.3,1.11,.08);st.rotation.y=.25;counter.add(st);
 const leg=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.14,8),M(INK));leg.position.set(-.3,1.0,.07);counter.add(leg)}shadowed(counter);scene.add(counter);
const shelf=makeShelf();shelf.position.set(0,0,-1.6);scene.add(shelf);
const table=new THREE.Group();{const t=new THREE.Mesh(new RoundedBoxGeometry(1.7,.08,.9,3,.03),M('#ffffff'));t.position.y=.72;table.add(t);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(p=>{const l=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.72,8),M(GREEN));l.position.set(p[0]*.75,.36,p[1]*.35);table.add(l)});for(let i=-1;i<=1;i++){const pl=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.02,24),M(LIME));pl.position.set(i*.5,.77,.1);table.add(pl)}}shadowed(table);scene.add(table);
const pedestal=shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.55,.6,.12,48),M('#ffffff',.5)));pedestal.position.y=.06;scene.add(pedestal);
// props
const WATEX=await new THREE.TextureLoader().loadAsync('assets/user_whatsapp.png');WATEX.colorSpace=THREE.SRGBColorSpace;
const P3={bagA:makeBag(LIME,'%'),bagB:makeBag(GREEN,''),bagH:makeBag(LIME,''),phone:makePhone(),phoneC:makePhone(),mega:makeMegaphone(),clock:makeClock(),hg:makeHourglass(),cal:makeCalendar(),wa:(()=>{const g=new THREE.Group();const pl=new THREE.Mesh(new THREE.PlaneGeometry(.3,.303),new THREE.MeshBasicMaterial({map:WATEX,transparent:true,alphaTest:.02,toneMapped:false}));g.add(pl);return g})(),check:makeCheck(),hearts:[makeHeart(),makeHeart(),makeHeart()]};
Object.values(P3).flat().forEach(o=>scene.add(o));
const bubs=['¿Hay cupo hoy?','¿Cuánto cuesta?','¿Hasta qué hora?','¿Me separan uno?','¿Dónde están?'].map(t=>{const b=makeBubble(t);b.traverse(o=>{if(o.material){o.material.depthTest=false;o.renderOrder=10}});scene.add(b);return b});
// 3D "22%"
const ttf=await new Promise(r=>new TTFLoader().load('assets/montserrat-latin-900-normal.woff',r));const font=new Font(ttf);
const mkText=(s,col)=>{const g=new TextGeometry(s,{font,size:.42,depth:.12,curveSegments:10,bevelEnabled:true,bevelThickness:.018,bevelSize:.012,bevelSegments:4});g.computeBoundingBox();const m=new THREE.Mesh(g,[M(col,.35),M(col==LIME?'#7fd447':'#262626',.5)]);return m};
const t22=new THREE.Group();{const a=mkText('22',INK),b=mkText('%',GREEN);const wa=a.geometry.boundingBox.max.x,wb=b.geometry.boundingBox.max.x;a.position.x=-(wa+wb+.04)/2;b.position.x=a.position.x+wa+.04;t22.add(a,b)}shadowed(t22);scene.add(t22);
// camera rig: target region (center, height h) placed at px y 690..1470; dir from target to camera
const v3=new THREE.Vector3(),tmpQ=new THREE.Quaternion();
let CAM=null;
function camShot(c,h,dir,{up=[0,1,0],roll=0,orbit=0}={}){const d=h*3.904;const D=new THREE.Vector3(...dir).normalize();if(orbit){D.applyAxisAngle(new THREE.Vector3(0,1,0),orbit)}
 const T=new THREE.Vector3(...c);cam.position.copy(T).addScaledVector(D,d);cam.up.set(...up);cam.lookAt(T);cam.updateMatrixWorld(true);
 const k=1920/(2*d*Math.tan(THREE.MathUtils.degToRad(17.5)));const u=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);const aim=T.clone().addScaledVector(u,120/k);cam.lookAt(aim);if(roll)cam.rotateZ(roll);cam.updateMatrixWorld(true);cam.updateProjectionMatrix();CAM={k,d}}
const proj=(p)=>{v3.copy(p).project(cam);return [(v3.x+1)/2*1080,(1-v3.y)/2*1920]};
function keepSafe(o,r,{top=700,bottom=1480,left=110,right=930}={}){for(let i=0;i<3;i++){const p=o.position;const c=proj(p);const dist=cam.position.distanceTo(p);const kk=1920/(2*dist*Math.tan(THREE.MathUtils.degToRad(17.5)));const rp=r*kk*o.scale.x;
 let dx=0,dy=0;if(c[0]-rp<left)dx=left-(c[0]-rp);if(c[0]+rp>right)dx=right-(c[0]+rp);if(c[1]-rp<top)dy=top-(c[1]-rp);if(c[1]+rp>bottom)dy=bottom-(c[1]+rp);if(!dx&&!dy)break;
 const R_=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0),U=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);p.addScaledVector(R_,dx/kk).addScaledVector(U,-dy/kk)}}
function place(o,pos,{s=1,rot=[0,0,0],spin=0,bob=0,t=0,ph=0}={}){o.visible=true;if(o.parent!==scene)scene.attach(o);o.position.set(pos[0],pos[1]+Math.sin(t*2.2+ph)*bob,pos[2]);o.rotation.set(rot[0],rot[1]+Math.sin(t*1.3+ph)*spin,rot[2]);o.scale.setScalar(Math.max(.001,s))}
function hold(o,P,side,pos=[0,-.02,.06],rot=[0,0,0],s=1){const h=(side==='L'?P.aL:P.aR).hand;o.visible=true;if(o.parent!==h){h.add(o)}o.position.set(...pos);o.rotation.set(...rot);o.scale.setScalar(s)}
// ---------- DOM captions: word-by-word, mixed type (Montserrat + DM Serif italic), tight leading
const wrap=document.getElementById('wrap');const tracks=[];
function mk(html){const d=document.createElement('div');d.className='e';d.innerHTML=html;wrap.appendChild(d);d.style.display='block';d._w=d.offsetWidth;d.style.display='none';d._fit=Math.min(1,820/d._w);return d}
function put(d,x=0,y=0,o={}){const s=(o.s??1)*(d._fit||1);d.style.opacity=o.o??1;d.style.transform=`translate(-50%,-50%) translate(${x}px,${y}px) rotate(${o.r||0}deg) scale(${s})`}
const PILL=(txt,bg,fg,size=60)=>`<div style="background:${bg};color:${fg};padding:.2em .75em;border-radius:70px;font-weight:800;font-size:${size}px;line-height:1.1">${txt}</div>`;
const shake=(lt,amp=10,dec=6)=>Math.sin(lt*70)*amp*Math.exp(-lt*dec);
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,'');
const CAPS=[];
function cap(a,b,src,clause,{pos='top',size=80,slam=false}={}){const d=document.createElement('div');d.className='cap';d.style.fontSize=size+'px';wrap.appendChild(d);
 const toks=src.match(/(\[[^\]]+\]|\*[^*]+\*)[,.…?!:]*|\S+/g);const cl=clause?CL[clause]:null;const ntext=cl?norm(cl.text):'';let from=0,last=a;const words=[];
 for(const tk of toks){let type='w',txt=tk,pn='';const mm=tk.match(/^([\[*])(.+)([\]*])([,.…?!:]*)$/);if(mm){type=mm[1]==='['?'h':'a';txt=mm[2];pn=mm[4]}
  const sp=document.createElement('span');sp.className='w'+(type==='a'?' a':type==='h'?' h':'');sp.innerHTML=(type==='h'?`<i></i><b>${txt}</b>`:txt)+(pn?`<u style="text-decoration:none;font-family:M;font-weight:800;color:#383838;font-size:${type==='a'?'.85em':'1em'}">${pn}</u>`:'');d.appendChild(sp);
  let tt=last+.08;if(cl){const key=norm(txt).split(' ')[0];const i=key?ntext.indexOf(key,from):-1;if(i>=0){tt=cl.start+cl.dur*(i/ntext.length);from=i+key.length}}tt=Math.max(a,Math.min(tt,b-.25));if(tt<last)tt=last;last=tt;words.push({sp,t:tt,type})}
 d.style.display='flex';const W=d.scrollWidth,H=d.offsetHeight;d.style.display='none';const fit=Math.min(1,880/W,310/H);
 CAPS.push({d,a,b,words,fit,y:pos==='top'?430:1390,slam})}
function drawCaps(t){for(const c of CAPS){const on=t>=c.a&&t<c.b;c.d.style.display=on?'flex':'none';if(!on)continue;const out=clamp((t-(c.b-.16))/.16);
 c.d.style.transform=`translate(-50%,-50%) translateY(${c.y-960+960}px) scale(${c.fit})`;c.d.style.top='0px';c.d.style.opacity=1-out;
 for(const w of c.words){const lt=t-w.t;if(lt<0){w.sp.style.opacity=0;continue}const k=eb(lt/.26);w.sp.style.opacity=eo(lt/.1);
  const sl=c.slam&&w.type==='h'?shake(lt,8,6):0;w.sp.style.transform=`translate(${sl}px,${(1-k)*34-out*30}px) scale(${.75+.25*k}) rotate(${(1-k)*(w.type==='a'?-6:4)}deg)`;
  if(w.type==='h')w.sp.querySelector('i').style.transform=`scaleX(${eo((lt-.04)/.2)})`}}}
const SEND=s=>{const i=SEGS.indexOf(s);return i<SEGS.length-1?segStart(SEGS[i+1]):DUR};
cap(C('s1a'),at('s1a','veintidós'),'¿Sabías que *noviembre* y *diciembre*…','s1a',{size:84});
cap(at('s1a','veintidós')+.15,SEND('s1'),'de tus [ventas] *del año*','s1a',{size:86});
{const src=mk(`<div style="font-weight:600;font-size:30px;color:#6b6f68">Fuente: Cámara de Comercio de Guayaquil</div>`);tracks.push({d:src,a:at('s1a','veintidós')+.3,b:SEND('s1'),fn:(d,lt)=>put(d,0,-330,{o:clamp(lt/.25)})})}
cap(C('s2a'),C('s2b'),'*Dani* tiene un [pequeño negocio]','s2a',{size:80});
cap(C('s2b'),SEND('s2'),'Llega [Black Friday] y lanza su *promo*','s2b',{size:80,slam:true});
cap(C('s3a'),C('s3b'),'Primero, llega [1 mensaje]','s3a',{size:84});
cap(C('s3b'),C('s3c'),'Luego… [10] *mensajes*','s3b',{size:92});
cap(C('s3c'),at('s3c','ochenta'),'A las *11:00*, ya son…','s3c',{size:88});
cap(at('s3c','ochenta')+.9,SEND('s3'),'[80] *mensajes*','s3c',{size:120,slam:true});
cap(C('s4a'),C('s4b'),'Atiende con *una mano*, y contesta con *la otra*','s4a',{size:76});
cap(C('s4b'),SEND('s4'),'[4 horas] pegado al *celular*','s4b',{size:86,slam:true});
cap(C('s5a'),C('s5b'),'Alguien preguntó: *¿hay cupo hoy?*','s5a',{size:76});
cap(C('s5b'),C('s5c'),'Esperó… pero [nadie respondió]','s5b',{size:84,slam:true});
cap(C('s5c'),SEND('s5'),'y se fue con *la competencia*','s5c',{size:80});
cap(C('s6a'),SEND('s6'),'¿Cuánto vale [una hora] de *tu día*?','s6a',{size:84});
cap(C('s7a'),at('s7a','y la cita'),'Con [Iguana], cada mensaje se responde *al instante*','s7a',{size:74});
cap(at('s7a','y la cita'),SEND('s7'),'y la cita queda [agendada sola]','s7a',{size:80});
cap(C('s8a'),C('s8b'),'Dani atiende *tranquilo*','s8a',{size:88});
cap(C('s8b'),SEND('s8'),'a las [6:00 pm], llega a cenar con *su familia*','s8b',{size:80});
{const a=C('s9a'),b=DUR+1;const logo=mk(`<img src="assets/logo_green.png" style="width:700px;display:block">`);tracks.push({d:logo,a,b,fn:(d,lt)=>put(d,0,-230,{s:eb(lt/.4),o:clamp(lt/.1)})});
 cap(a+.15,b,'Recupera *tus horas.*','s9a',{size:96});CAPS[CAPS.length-1].y=950;
 const j2=mk(PILL('Agenda tu demo gratis',INK,PAPER,56));tracks.push({d:j2,a:C('s9b'),b,fn:(d,lt)=>put(d,0,180+Math.sin(lt*5)*5,{s:eb(lt/.35)*(1+Math.sin(lt*6)*.015),o:clamp(lt/.1)})})}
const bar=mk('<div style="width:1080px;height:10px;background:#A7FF6B;transform-origin:left"></div>');bar.style.cssText+='left:0;top:0;transform:none;display:block';
const wp=mk(`<div style="width:1300px;height:1920px;background:${LIME}"></div>`);wp.style.cssText+='left:0;top:0;transform:none;z-index:50';const wipes=SEGS.slice(1).map(segStart);
// ---------- shots
const people=[dani,cliA,cliB,mom,kid];
function reset(){scene.fog=null;people.forEach(p=>p.root.visible=false);[counter,table,shelf,pedestal,t22].forEach(o=>o.visible=false);Object.values(P3).flat().forEach(o=>{o.visible=false});bubs.forEach(b=>b.visible=false);disc.visible=true}
const head=P=>{const p=new THREE.Vector3();P.head.getWorldPosition(p);return p};
const eyes=P=>{const p=new THREE.Vector3();P.head.localToWorld(p.set(0,.235,.2));return p};
const SH=[];const S=(a,b,f)=>SH.push({a,b,f});
const shop=(cx=.6)=>{counter.visible=true;counter.position.set(cx,0,-.3);counter.rotation.y=0;shelf.visible=true};
const notifN=t=>t<C('s3b')?1:(t<C('s3c')?10:(t<at('s3c','ochenta')?24:80));
// S1
S(0,at('s1a','veintidós'),(t,lt)=>{pedestal.visible=true;disc.visible=false;place(P3.bagA,[-.16,.12,0],{s:eb(lt/.5),rot:[0,.35,0],spin:.08,t});place(P3.bagB,[.2,.12,-.1],{s:eb((lt-.25)/.5),rot:[0,-.4,0],spin:.08,t,ph:1});
 camShot([0,.4,0],.9,[0,.18,1],{orbit:-.5+lt*.12})});
S(at('s1a','veintidós'),segStart('s2'),(t,lt)=>{pedestal.visible=true;disc.visible=false;place(P3.bagA,[-.42,.12,.25],{s:.8,rot:[0,.6,0],t});place(P3.bagB,[.44,.12,.2],{s:.8,rot:[0,-.6,0],t,ph:1});
 t22.visible=true;const p=eb(lt/.45);t22.position.set(0,.62+(1-p)*.8,-.05);t22.rotation.set(0,(1-p)*1.6+Math.sin(t)*.08,0);t22.scale.setScalar(.85+p*.15);camShot([0,.62,0],1.25,[0,.1,1],{orbit:Math.sin(lt*.6)*.1})});
// S2
S(segStart('s2'),C('s2b'),(t,lt)=>{shop(.62);dani.root.visible=true;const w=clamp(lt/1.1);dani.root.position.set(lerp(-1.5,-.12,eo(w)),0,.25);dani.root.rotation.y=lerp(.9,.15,eo(w));
 pose(dani,lt<1.15?{...walk(lt*9),mood:'happy'}:{...POSES.wave(lt),mood:'grin'},t);camShot([.1,1.2,.2],2.55,[0,.12,1],{orbit:Math.sin(lt*.4)*.1})});
S(C('s2b'),at('s2b','y lanza'),(t,lt)=>{shop(.62);dani.root.visible=true;dani.root.position.set(-.12,0,.25);dani.root.rotation.y=lerp(.15,0,eo(lt/.3));
 pose(dani,{...POSES.surprised(lt),mood:lt<.35?'surprise':'grin'},t);camShot([-.12,1.4,.25],1.85,[0,.05,1])});
S(at('s2b','y lanza'),segStart('s3'),(t,lt)=>{shop(.62);dani.root.visible=true;dani.root.position.set(-.12,0,.25);dani.root.rotation.y=.25;pose(dani,{...POSES.megaphone(lt),mood:'grin'},t);
 hold(P3.mega,dani,'R',[.02,-.03,.06],[0,-1.2,0]);camShot([-.05,1.55,.25],1.25,[.25,-.42,1],{roll:.07})});
// S3
S(segStart('s3'),C('s3b'),(t,lt)=>{shop(-.15);const v=Math.sin(t*90)*.004*(lt<.8?1:.3);place(P3.phone,[.22+v,.97,-.15],{rot:[-Math.PI/2,0,.4+v*3]});drawPhone(P3.phone,{mode:'notif',dark:true,n:1,time:'10:52'});
 camShot([.22,.97,-.15],.23,[.1,1.1,.75],{orbit:lt*.06})});
S(C('s3b'),C('s3c'),(t,lt)=>{camShot([-.05,1.45,.25],1.7,[.3,-.25,1],{orbit:lt*.05});shop(.7);dani.root.visible=true;dani.root.position.set(-.15,0,.25);dani.root.rotation.y=.2;pose(dani,{...POSES.phoneUp(lt),mood:lt<.25?'happy':'surprise',dy:-Math.max(0,.03-lt*.1)},t);hold(P3.phone,dani,'R',[0,-.02,.07],[.3,0,0],1);drawPhone(P3.phone,{mode:'notif',dark:true,n:10,time:'10:58'});
 const spots=[[.75,1.2],[-.9,.9]];bubs.slice(0,2).forEach((b,i)=>{const t0=.12+i*.2;if(lt>t0){place(b,[spots[i][0],spots[i][1],.8],{s:1.0*eb((lt-t0)/.28)});b.rotation.z=Math.sin(t*3+i)*.05;keepSafe(b,b.userData.r)}});
 });
S(C('s3c'),at('s3c','ochenta'),(t,lt)=>{shop(.6);dani.root.visible=true;dani.root.position.set(-.1,0,.25);dani.root.rotation.y=.05;pose(dani,{...POSES.phoneUp(lt),mood:lt<.4?'surprise':'worry'},t);hold(P3.phone,dani,'R',[0,-.02,.07],[.3,0,0],1.0);
 drawPhone(P3.phone,{mode:'notif',dark:true,n:24,time:'11:00'});const h=head(dani);camShot([h.x,h.y+.22,h.z],.85,[0,.02,1])});
S(at('s3c','ochenta'),at('s3c','ochenta')+.9,(t,lt)=>{shop(.6);dani.root.visible=true;dani.root.position.set(-.1,0,.25);dani.root.rotation.y=0;pose(dani,{...POSES.phoneUp(lt),mood:'panic',look:[0,0]},t);hold(P3.phone,dani,'R',[0,-.02,.07],[.3,0,0],1.0);
 const e=eyes(dani);camShot([e.x,e.y,e.z],.22+lt*.02,[0,0,1],{roll:-.05})});
S(at('s3c','ochenta')+.9,segStart('s4'),(t,lt)=>{camShot([-.05,1.2,.25],2.45,[0,.06,1],{roll:Math.sin(lt*3)*.05});shop(.65);dani.root.visible=true;dani.root.position.set(-.1,0,.25);dani.root.rotation.y=.05;pose(dani,{...POSES.headhands(lt),mood:'panic'},t);
 const spots=[[-.62,1.05],[.62,1.2],[-.58,1.65],[.6,1.72]];bubs.slice(0,4).forEach((b,i)=>{const t0=i*.1;if(lt>t0){place(b,[spots[i][0],spots[i][1],.6],{s:.9*eb((lt-t0)/.25)});b.rotation.z=Math.sin(t*3+i)*.04;keepSafe(b,b.userData.r)}});
 });
// S4
S(segStart('s4'),at('s4a','y contesta'),(t,lt)=>{shop(.25);dani.root.visible=true;cliA.root.visible=true;dani.root.position.set(-.38,0,.3);dani.root.rotation.y=.55;cliA.root.position.set(.55,0,.45);cliA.root.rotation.y=-.9;
 pose(dani,{...POSES.give(lt),mood:'worry'},t);pose(cliA,{arx:-1.1,aer:.5,mood:'happy',look:[-.6,0]},t);hold(P3.bagH,dani,'L',[0,-.2,.05],[0,0,0],.75);hold(P3.phone,dani,'R',[0,-.02,.07],[.3,0,0],1);drawPhone(P3.phone,{mode:'notif',dark:true,n:80,time:'11:20'});
 camShot([.05,1.5,.35],1.45,[-.55,.1,1])});
S(at('s4a','y contesta'),segStart('s4')+CL.s4a.dur+.3,(t,lt)=>{camShot([0,1.35,.25],1.6,[-.35,.18,1],{roll:-.09});shop(.6);dani.root.visible=true;dani.root.position.set(-.1,0,.25);dani.root.rotation.y=.35;const f=Math.sin(lt*38);pose(dani,{...POSES.phone(lt),aer:1.55+f*.08,ael:1.5-f*.08,hdz:Math.sin(lt*9)*.04,mood:'worry'},t);hold(P3.phone,dani,'R',[0,-.02,.07],[.3,0,0],1);
 bubs.slice(2,4).forEach((b,i)=>{const t0=i*.3;if(lt>t0){place(b,[[-1.0,.95][i],[.8,1.05][i],.7],{s:1.0*eb((lt-t0)/.25)});keepSafe(b,b.userData.r)}});
 });
S(segStart('s4')+CL.s4a.dur+.3,segStart('s5'),(t,lt)=>{dani.root.visible=true;shelf.visible=false;dani.root.position.set(-.25,0,.15);dani.root.rotation.y=.25;pose(dani,{...POSES.phone(lt),mood:'worry',tx:.12+lt*.03},t);hold(P3.phone,dani,'R',[0,-.02,.07],[.3,0,0],1);
 place(P3.clock,[.5,1.95,-1.55],{s:1.2});P3.clock.userData.set(lerp(11,15.2,eio(clamp(lt/1.9))));camShot([.15,1.55,0],1.75,[.15,.08,1])});
// S5 (client side)
S(segStart('s5'),C('s5b'),(t,lt)=>{camShot([.05,1.25,.3],2.0,[.25,.05,1],{orbit:-lt*.04});cliB.root.visible=true;cliB.root.position.set(.35,0,.3);cliB.root.rotation.y=-.35;pose(cliB,{...POSES.phone(lt),mood:'happy'},t);hold(P3.phoneC,cliB,'R',[0,-.02,.07],[.3,0,0],1);drawPhone(P3.phoneC,{mode:'chat',title:'Negocio de Dani',msgs:[]});
 const b=bubs[0];if(lt>.75){place(b,[-.75,1.15,.95],{s:1.15*eb((lt-.75)/.3)});b.rotation.z=.04;keepSafe(b,b.userData.r)}
 });
S(C('s5b'),C('s5c'),(t,lt)=>{const p=t>=at('s5b','pero');camShot([.05,1.3,.35],2.0,[-.15,.03,1],{orbit:p?.08:0});cliB.root.visible=true;cliB.root.position.set(.25,0,.35);cliB.root.rotation.y=-.4;pose(cliB,{...(p?POSES.slump():POSES.waitImp(lt)),mood:p?'sad':'think'},t);
 place(P3.hg,[-.45,1.75,.4],{s:eb(lt/.25)*1.1,rot:[0,0,Math.sin(t*2)*.05],t});P3.hg.userData.set(clamp(lt/1.3));keepSafe(P3.hg,.18) });
S(C('s5c'),segStart('s6'),(t,lt)=>{shop(-.35);dani.root.visible=true;cliB.root.visible=true;dani.root.position.set(-.55,0,0);dani.root.rotation.y=.3;pose(dani,{...POSES.slump(),mood:'sad'},t);
 const x=lerp(.35,2.2,eo(lt/1.5));cliB.root.position.set(x,0,.45);cliB.root.rotation.y=1.45;pose(cliB,{...walk(lt*10),mood:'sad'},t);camShot([0,1.2,.25],2.5,[0,.3,1])});
// S6
S(segStart('s6'),segStart('s7'),(t,lt)=>{dani.root.visible=true;shelf.visible=true;dani.root.position.set(0,0,.3);dani.root.rotation.y=-.1;pose(dani,{...POSES.chin(lt),mood:'think'},t);
 const h=head(dani);camShot([h.x,h.y+.28,h.z],.78-lt*.04,[.1,.02,1])});
// S7
window.S7={cam:[0,1.15,4.6],look:[0,1.45,0],ph:[.0,1.07,3.2],phs:1.55,ppl:-1.0,fog:[3.4,8]};
S(segStart('s7'),at('s7a','y la cita'),(t,lt)=>{const K=window.S7;scene.fog=new THREE.Fog(PAPER,K.fog[0],K.fog[1]);shelf.visible=true;table.visible=true;table.position.set(0,.17,K.ph[2]-.2);
 dani.root.visible=true;cliA.root.visible=true;dani.root.position.set(-.4,0,K.ppl);dani.root.rotation.y=.6;cliA.root.position.set(.4,0,K.ppl+.1);cliA.root.rotation.y=-.8;
 pose(dani,{...POSES.giveCalm(lt),mood:'grin'},t);hold(P3.bagH,dani,'L',[0,-.2,.05],[0,0,0],.75);pose(cliA,{arx:-1.1,aer:.4,mood:'grin',look:[-.6,0]},t);
 place(P3.phone,K.ph,{rot:[-.42,0,-.06],s:K.phs});const N=[];
 if(lt>.35)N.push({t:'Respondió a Ana',s:'¡Sí! Hoy 4 pm. ¿Te agendo?'});if(lt>1.15)N.push({t:'Respondió a Luis',s:'Abrimos hasta las 8 pm'});if(lt>1.9)N.push({t:'Cita agendada ✓',s:'Ana · hoy 4 pm'});if(lt>2.6)N.push({t:'Respondió a Sofi',s:'Te separo el turno de las 5'});
 drawPhone(P3.phone,{mode:'iguana',dark:true,time:'11:42',notes:N,t:lt});
 place(P3.wa,[K.ph[0]-.1,K.ph[1]+.12+eo(clamp(lt/.5))*.03,K.ph[2]+.06],{s:eb((lt-.1)/.4)*.42,rot:[-.1,-.2+Math.sin(t*1.5)*.1,-.08],t,bob:.006});
 cam.up.set(0,1,0);cam.position.set(K.cam[0]+Math.sin(lt*.4)*.02,K.cam[1],K.cam[2]-lt*.04);cam.lookAt(...K.look);cam.updateMatrixWorld(true);cam.updateProjectionMatrix()});
S(at('s7a','y la cita'),segStart('s8'),(t,lt)=>{camShot([0,1.25,.3],2.0,[.1,-.28,1]);shop(.4);dani.root.visible=true;dani.root.position.set(-.35,0,.3);dani.root.rotation.y=.25;pose(dani,{...POSES.lean(lt),mood:'relax'},t);
 place(P3.cal,[.45,1.55,.25],{s:eb(lt/.35)*.95,rot:[0,-.3,0],t,bob:.015});place(P3.check,[.62,1.42,.35],{s:eb((lt-.35)/.3)*.9,t});keepSafe(P3.cal,.26) });
// S8
S(segStart('s8'),C('s8b'),(t,lt)=>{shop(0);dani.root.visible=true;cliA.root.visible=true;dani.root.position.set(-.42,0,.25);dani.root.rotation.y=.5;cliA.root.position.set(.48,0,.4);cliA.root.rotation.y=-.6;
 pose(dani,{...POSES.giveCalm(lt),mood:'grin'},t);hold(P3.bagH,dani,'L',[0,-.2,.05],[0,0,0],.75);pose(cliA,{arx:-1.2,aer:.3,mood:'grin',look:[-.6,0]},t);camShot([.03,1.45,.35],1.5,[.35,.06,1])});
S(C('s8b'),at('s8b','llega'),(t,lt)=>{disc.visible=false;place(P3.clock,[0,1.6,-1.6],{s:1.4,rot:[0,0,0]});P3.clock.userData.set(lerp(5.7,6.0,eo(lt/.6)));camShot([0,1.6,-1.6],.55,[0,0,1])});
S(at('s8b','llega'),segStart('s9'),(t,lt)=>{camShot([0,1.2,.3],2.5,[0,.12,1],{orbit:Math.sin(lt*.5)*.12});table.visible=true;table.position.set(0,0,-.4);[dani,mom,kid].forEach(p=>p.root.visible=true);const w=clamp(lt/.9);dani.root.position.set(lerp(-1.6,-.42,eo(w)),0,.3);dani.root.rotation.y=lerp(1.1,.3,eo(w));
 pose(dani,lt<.9?{...walk(lt*9),mood:'grin'}:{...POSES.hug(lt),mood:'relax'},t);mom.root.position.set(.45,0,.3);mom.root.rotation.y=-.3;pose(mom,{...POSES.hug(lt),mood:'relax'},t);kid.root.position.set(0,0,.55);pose(kid,{...POSES.cheer(lt),mood:'grin'},t);
 P3.hearts.forEach((h,i)=>{const t0=.9+i*.2;if(lt>t0){place(h,[-.5+i*.5,2.05+eo((lt-t0)/1)*.15,.6],{s:eb((lt-t0)/.3)*1.1,rot:[0,Math.sin(t*2+i)*.6,0],t});keepSafe(h,.13)}}) });
S(segStart('s9'),DUR+1,(t,lt)=>{disc.visible=false;camShot([0,1.2,0],2.5,[0,.1,1])});
function frame(t){reset();const s=SH.find(x=>t>=x.a&&t<x.b)||SH[SH.length-1];s.f(t,t-s.a);R.render(scene,cam)}
window.render=function(t){bar.firstChild.style.transform=`scaleX(${clamp(t/DUR)})`;frame(t);
 for(const k of tracks){const on=t>=k.a&&t<k.b;k.d.style.display=on?'block':'none';if(on)k.fn(k.d,t-k.a)}drawCaps(t);
 let sh=false,x=0;for(const w of wipes){const p=(t-(w-.24))/.4;if(p>=0&&p<=1){sh=true;x=-1300+2600*eio(p)}}
 wp.style.display=sh?'block':'none';wp.style.transform=`translateX(${x}px) skewX(-8deg)`;return true};
window.dbg=()=>bubs.map(b=>[b.visible,b.position.toArray().map(v=>+v.toFixed(2)),+b.scale.x.toFixed(2),proj(b.position).map(Math.round)]);window.DUR=DUR;window.SHOTS=SH.map(s=>[s.a,s.b]);window.ready=true;
</script></body></html>
