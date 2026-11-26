// ================= personajes =================
const dani=makePerson({apron:LIME,shirt:'#3F5F86',pants:'#2b2b2b',skin:'#C48A5E',hair:'#1b1517',style:'quiff',beard:true,beardColor:'#1d1618',shoe:'#efefef'});
const cliA=makePerson({shirt:'#D2523F',pants:'#3b4f7a',skin:'#E4B08A',hair:'#4a2a1a',style:'long'});
const cliB=makePerson({shirt:'#E2B33A',pants:'#34404f',skin:'#B97A52',hair:'#2a1a14',style:'short',beard:true,beardColor:'#2a1a14'});
const cliC=makePerson({shirt:'#2F8F9D',pants:'#4a3f55',skin:'#D2986E',hair:'#241a16',style:'curly'});
const mom=makePerson({shirt:'#E36A5D',pants:'#47506b',skin:'#C98F68',hair:'#2a1a14',style:'long'});
const kid=makePerson({shirt:'#F2C14E',pants:'#35507a',skin:'#D9A478',hair:'#2B2B2B',style:'spiky'});kid.root.scale.setScalar(.62);
const people=[dani,cliA,cliB,cliC,mom,kid];
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
POSES.sit=(lt)=>({dy:-.43,hlL:1.5,hlR:1.5,klL:1.5,klR:1.5,tx:.12,hdx:.1,arx:-.7,alx:-.4,aer:1.3,ael:1.0,arz:.2,alz:.1,hdz:Math.sin(lt*1.4)*.03});
POSES.typeBoth=(lt)=>({arx:-1.25,alx:-1.2,arz:.1,alz:.1,aer:1.75,ael:1.7,tx:.07,hdx:.28,look:[0,-1]});
POSES.lean2=(lt)=>({arx:-.5,alx:-.15,aer:1.3,ael:.4,arz:.15,alz:.2,tz:.05,hdz:Math.sin(lt*1.6)*.07,tx:.04});
POSES.hello=(lt)=>({arx:-.2,alx:-.2,aer:.3,ael:.3,arz:.35,alz:.35,hdz:Math.sin(lt*3)*.05});
POSES.hug2=(lt)=>({arx:-1.2,alx:-1.2,arz:.55,alz:.55,aer:.9,ael:.9,tx:.08});
POSES.key=(lt)=>({arx:-1.35,aer:1.2,arz:.1,alx:-.2,alz:.2,ael:.3,tx:.06,hdx:.1,look:[.2,-.4]});
POSES.slumpB=()=>({tx:.32,hdx:.45,arx:.05,alx:.05,aer:.12,ael:.12,dy:-.03,look:[0,-1]});
// ================= props sueltos =================
const WATEX=await new THREE.TextureLoader().loadAsync('assets/user_whatsapp.png');WATEX.colorSpace=THREE.SRGBColorSpace;
const P3={phone:makePhone(),phoneB:makePhone(),mega:makeMegaphone(),hg:makeHourglass(),check:makeCheck(),
 bagA:makeBag(LIME,'%'),bagB:makeBag(GREEN,''),bagC:makeBag('#ffffff',''),bagH:makeBag(LIME,''),
 wa:(()=>{const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.PlaneGeometry(.3,.303),new THREE.MeshBasicMaterial({map:WATEX,transparent:true,alphaTest:.02,toneMapped:false})));return g})(),
 hearts:[makeHeart(),makeHeart(),makeHeart()],stool:null};
const stool=new THREE.Group();stool.add(cyl(.22,.22,.06,'#2a2a2a',0,.47,0,24,.5));[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>stool.add(cyl(.018,.018,.47,'#9aa0a5',a*.14,.235,b*.14,8,.3)));stool.add(cyl(.2,.2,.012,LIME,0,.5,0,24,.5));scene.add(stool);
const bubs=['¿Hay cupo hoy?','¿Cuánto cuesta?','¿Hasta qué hora?','¿Me separan uno?','¿Dónde están?','¿Abren hoy?'].map(t=>{const b=makeBubble(t);b.traverse(o=>{if(o.material){o.material.depthTest=false;o.renderOrder=10}});scene.add(b);return b});
Object.values(P3).flat().forEach(o=>{if(o)scene.add(o)});
// banner Black Friday (cinta lima)
const banner=new THREE.Group();{const t=canvasTex(1024,256,(x,w,h)=>{x.fillStyle=LIME;x.beginPath();x.moveTo(0,20);x.lineTo(w,20);x.lineTo(w-50,h/2);x.lineTo(w,h-20);x.lineTo(0,h-20);x.lineTo(50,h/2);x.closePath();x.fill();x.strokeStyle=INK;x.lineWidth=8;x.stroke();x.fillStyle=INK;x.font='900 120px M';x.textAlign='center';x.fillText('Black Friday',w/2,h/2+42)});banner.add(new THREE.Mesh(new THREE.PlaneGeometry(1.9,.475),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide})))}scene.add(banner);
// calendario de pared que pasa de hoja
const cal=new THREE.Group();{const mkp=(t,n)=>canvasTex(512,560,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle=LIME;x.fillRect(0,0,w,150);x.fillStyle=INK;x.font='900 82px M';x.textAlign='center';x.fillText(t,w/2,105);for(let r=0;r<4;r++)for(let c=0;c<5;c++){x.fillStyle=(r==2&&c==n)?GREEN:'#E6EAE0';rr(x,34+c*88,190+r*84,72,66,12);x.fill()}});
 const back=new THREE.Mesh(new RoundedBoxGeometry(.62,.68,.03,3,.02),M('#2b2b2b'));cal.add(back);
 const p2=new THREE.Mesh(new THREE.PlaneGeometry(.56,.61),new THREE.MeshBasicMaterial({map:mkp('diciembre',1)}));p2.position.set(0,-.01,.02);cal.add(p2);
 const hinge=new THREE.Group();hinge.position.set(0,.3,.03);const p1=new THREE.Mesh(new THREE.PlaneGeometry(.56,.61),new THREE.MeshBasicMaterial({map:mkp('noviembre',3),side:THREE.DoubleSide}));p1.position.set(0,-.305,0);hinge.add(p1);cal.add(hinge);cal.userData.flip=a=>{hinge.rotation.x=-a}}scene.add(cal);
// 22 % en 3D
const ttf=await new Promise(r=>new TTFLoader().load('assets/montserrat-latin-900-normal.woff',r));const font=new Font(ttf);
const t22=new THREE.Group();{const mk=(s,col,side)=>new THREE.Mesh(new TextGeometry(s,{font,size:.62,depth:.18,curveSegments:10,bevelEnabled:true,bevelThickness:.025,bevelSize:.016,bevelSegments:4}),[M(col,.35),M(side,.5)]);
 const a=mk('22',LIME,'#6fbf3a'),b=mk('%',GREEN,'#244a29');a.geometry.computeBoundingBox();b.geometry.computeBoundingBox();const wa=a.geometry.boundingBox.max.x,wb=b.geometry.boundingBox.max.x;a.position.x=-(wa+wb+.06)/2;b.position.x=a.position.x+wa+.06;t22.add(a,b);shadowed(t22)}scene.add(t22);
// ================= luces / entorno =================
const sunT=new THREE.Object3D();scene.add(sunT);sun.target=sunT;
function setEnv(mode,k=0){ // mode: shop|house|home ; k = hora del día 0..1 (mediodía→atardecer)
 SHOP.visible=mode==='shop';HOUSE.visible=mode==='house';HOME.visible=mode==='home';
 const c=(a,b,t)=>new THREE.Color(a).lerp(new THREE.Color(b),t);
 if(mode==='shop'){hemi.color.copy(c('#fff6e6','#ffd9a8',k));hemi.groundColor.set('#c9b08a');hemi.intensity=lerp(1.25,.95,k);sun.color.copy(c('#fff2d8','#ff9a52',k));sun.intensity=lerp(2.3,2.6,k);
  sun.position.set(lerp(-2.5,-6,k),lerp(6,1.8,k),lerp(-4,-3,k));sunT.position.set(1.5,0,0);sun.castShadow=true;rim.intensity=0;
  shopRefs.sky.material.map=k>.5?SKY_EVE:SKY_DAY;scene.background.set(c('#bfe3ff','#ffb27a',k));
  shopRefs.city.material.map=cityDay;}
 else if(mode==='house'){hemi.color.set('#4a5ca0');hemi.groundColor.set('#1a2030');hemi.intensity=1.0;sun.color.set('#a9bcff');sun.intensity=.95;sun.position.set(-4,7,6);sunT.position.set(60,0,0);sun.castShadow=false;rim.intensity=0;scene.background.set('#0a1030')}
 else{hemi.color.set('#2f3560');hemi.groundColor.set('#1a1010');hemi.intensity=.45;sun.intensity=0;sun.castShadow=false;rim.intensity=0;scene.background.set('#120c0a')}}
const SKY_DAY=skyTex('#8fd0ff','#e9f6ff'),SKY_EVE=skyTex('#ff8a4d','#ffd9a0',false,[.35,.7]);const cityDay=shopRefs.city.material.map;
// ================= cámara =================
const v3=new THREE.Vector3();
let CURT=0;function shot(pos,look,{roll=0,fov=35}={}){cam.fov=fov;cam.position.set(pos[0]+Math.sin(CURT*1.7)*.006,pos[1]+Math.cos(CURT*2.3)*.005,pos[2]+Math.sin(CURT*1.1)*.006);cam.up.set(0,1,0);const T=new THREE.Vector3(...look);cam.lookAt(T);cam.updateMatrixWorld(true);
 const d=cam.position.distanceTo(T),k=Math.tan(THREE.MathUtils.degToRad(fov/2))*.075*d;const u=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);cam.lookAt(T.clone().addScaledVector(u,-k));cam.rotateZ(roll+Math.sin(CURT*1.3)*.004);cam.updateMatrixWorld(true);cam.updateProjectionMatrix()}
const orb=(c,r,h,a)=>[c[0]+Math.sin(a)*r,h,c[2]+Math.cos(a)*r];
function place(o,pos,{s=1,rot=[0,0,0],spin=0,bob=0,t=0,ph=0}={}){o.visible=true;if(o.parent!==scene)scene.attach(o);o.position.set(pos[0],pos[1]+Math.sin(t*2.2+ph)*bob,pos[2]);o.rotation.set(rot[0],rot[1]+Math.sin(t*1.3+ph)*spin,rot[2]);o.scale.setScalar(Math.max(.001,s))}
function hold(o,P,side,pos=[0,-.02,.06],rot=[0,0,0],s=1){const h=(side==='L'?P.aL:P.aR).hand;o.visible=true;if(o.parent!==h)h.add(o);o.position.set(...pos);o.rotation.set(...rot);o.scale.setScalar(s)}
const where=(P,x,z,ry=0)=>{P.root.visible=true;P.root.position.set(x,0,z);P.root.rotation.y=ry};
function mover(P,a,b,p,t,sp=10){const x=lerp(a[0],b[0],p),z=lerp(a[1],b[1],p);P.root.visible=true;P.root.position.set(x,0,z);P.root.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);pose(P,{...walk(t*sp),mood:'happy'},t)}
