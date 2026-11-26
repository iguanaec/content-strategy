// ---------- hair styles
function buildHair(head,style,c,skin){const H=new THREE.Group();head.add(H);const mat=M(c,.75);const mix=new THREE.Color(c).lerp(new THREE.Color(skin),.45);const fadeM=M('#'+mix.getHexString(),.8);
 const blob=(r,p,s=[1,1,1],rot=[0,0,0],m=mat)=>{const b=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),m);b.position.set(...p);b.scale.set(...s);b.rotation.set(...rot);b.castShadow=true;H.add(b);return b};
 const capM=(r,th,m,y=.235,rx=-.28)=>{const h=new THREE.Mesh(new THREE.SphereGeometry(r,36,20,0,Math.PI*2,0,Math.PI*th),m);h.position.set(0,y,-.015);h.rotation.x=rx;H.add(h);return h};
 if(style==='quiff'){
  const col=new THREE.Color(c);
  const W=1024,Hh=512;
  const alpha=document.createElement('canvas');alpha.width=W;alpha.height=Hh;const ax=alpha.getContext('2d');ax.fillStyle='#000';ax.fillRect(0,0,W,Hh);
  ax.filter='blur(2px)';ax.fillStyle='#fff';ax.beginPath();
  const U=u=>u*W,V=v=>v*Hh;
  // región del cabello: cráneo completo, línea frontal alta, patillas cortas y nuca
  ax.moveTo(U(.5),V(0));ax.lineTo(U(1),V(0));ax.lineTo(U(1),V(.5));ax.lineTo(U(0),V(.5));ax.lineTo(U(0),V(0));ax.closePath();ax.fill();
  ax.beginPath();ax.rect(0,0,W,Hh*.5);ax.fill();
  ax.fillStyle='#000';ax.filter='blur(4px)';
  // frente despejada: recorta una "V" en el frente (u≈.25)
  ax.beginPath();ax.moveTo(U(.25-.17),V(.62));ax.lineTo(U(.25-.17),V(.36));ax.bezierCurveTo(U(.25-.15),V(.30),U(.25-.07),V(.285),U(.25),V(.30));ax.bezierCurveTo(U(.25+.07),V(.285),U(.25+.15),V(.30),U(.25+.17),V(.36));ax.lineTo(U(.25+.17),V(.62));ax.closePath();ax.fill();
  // patillas bajan por los lados (ambas orejas) y nuca
  ax.filter='blur(5px)';ax.fillStyle='#fff';[[.08,.48],[.42,.48]].forEach(([u,v])=>{ax.beginPath();ax.ellipse(U(u),V(v+.045),W*.035,Hh*.1,0,0,7);ax.fill()});
  ax.beginPath();ax.rect(U(.55),V(.4),W*.9,Hh*.13);ax.fill();ax.beginPath();ax.rect(0,V(.4),U(.08),Hh*.13);ax.fill();
  const alphaT=new THREE.CanvasTexture(alpha);
  const cv=document.createElement('canvas');cv.width=W;cv.height=Hh;const cx=cv.getContext('2d');
  cx.fillStyle='#'+col.getHexString();cx.fillRect(0,0,W,Hh);
  // brillo y hebras peinadas hacia atrás
  for(let i=0;i<260;i++){const u=.25+(Math.random()-.5)*.5,v=.3+Math.random()*.2;cx.strokeStyle=`rgba(190,150,140,${.03+Math.random()*.05})`;cx.lineWidth=1+Math.random()*2.2;cx.beginPath();cx.moveTo(U(u),V(v));cx.quadraticCurveTo(U(u+(u-.25)*.25),V(v-.12),U(u+(u-.25)*.5),V(v-.27-Math.random()*.1));cx.stroke()}
  // degradado: laterales y nuca más claros (rapado)
  const gr=cx.createLinearGradient(0,V(.36),0,V(.52));gr.addColorStop(0,'rgba(120,95,90,0)');gr.addColorStop(1,'rgba(150,115,100,.5)');cx.fillStyle=gr;cx.fillRect(0,V(.36),U(.07),V(.2));cx.fillRect(U(.43),V(.36),U(.14),V(.2));cx.fillRect(U(.93),V(.36),U(.07),V(.2));
  const colT=new THREE.CanvasTexture(cv);colT.colorSpace=THREE.SRGBColorSpace;
  const g=new THREE.SphereGeometry(.246,72,48);const pos=g.attributes.position;const v=new THREE.Vector3();
  const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);const d=v.clone().normalize();
   const f=sm(.2,.92,d.y)*sm(-.25,.85,d.z),side=sm(.2,.8,d.y)*(1-Math.abs(d.x))*.0;
   const wave=.006*Math.sin(34*d.x+7*d.z)*sm(.3,.8,d.y);
   const out=.058*f+wave;v.addScaledVector(d,out);v.y+=.032*f;v.z+=.03*f-.012*sm(.2,.7,-d.z)*sm(.3,.8,d.y);pos.setXYZ(i,v.x,v.y,v.z)}
  g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:colT,alphaMap:alphaT,transparent:true,alphaTest:.35,roughness:.62,metalness:.04}));m.position.set(0,.22,-.004);m.rotation.x=-.12;m.castShadow=true;H.add(m)}
 else if(style==='long'){capM(.248,.52,mat);blob(.21,[0,.06,-.13],[1.05,2.2,.72]);[-1,1].forEach(s=>blob(.06,[s*.205,.12,.02],[.7,2.3,.8]));blob(.07,[-.06,.47,.12],[1.5,.5,1],[-.4,0,.3])}
 else if(style==='bun'){capM(.246,.52,mat);blob(.1,[0,.47,-.16],[1,1,1]);blob(.06,[0,.4,-.2],[1.6,.5,.8]);blob(.06,[-.17,.3,.12],[.6,1.2,.7],[0,0,.3]);blob(.06,[.17,.3,.12],[.6,1.2,.7],[0,0,-.3])}
 else if(style==='spiky'){capM(.244,.5,mat);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const sp=new THREE.Mesh(new THREE.ConeGeometry(.045,.13,8),mat);sp.position.set(Math.cos(a)*.11,.44,Math.sin(a)*.1+.02);sp.rotation.set(Math.sin(a)*.6,0,-Math.cos(a)*.6);H.add(sp)}const top=new THREE.Mesh(new THREE.ConeGeometry(.05,.15,8),mat);top.position.set(0,.5,.04);H.add(top)}
 else if(style==='curly'){capM(.244,.5,mat);for(let i=0;i<22;i++){const a=i*2.39996,yy=.3+((i*37)%17)/17*.2;const rr_=Math.sqrt(Math.max(0,.245*.245-(yy-.22)*(yy-.22)))+.01;blob(.058,[Math.cos(a)*rr_,yy,Math.sin(a)*rr_-.02],[1,1,1])}}
 else{ // short side-part
  capM(.245,.5,mat);blob(.11,[-.06,.42,.1],[1.5,.55,1.1],[-.4,0,.25]);blob(.1,[.08,.43,.06],[1.3,.5,1.1],[-.4,0,-.2]);[-1,1].forEach(s=>blob(.026,[s*.215,.19,.06],[.6,1.7,.9]))}
 return H}

function buildBeard(head,c,full){const W=1024,Hh=512;const U=u=>u*W,V=v=>v*Hh;
 const al=document.createElement('canvas');al.width=W;al.height=Hh;const ax=al.getContext('2d');ax.fillStyle='#000';ax.fillRect(0,0,W,Hh);ax.filter='blur(4px)';ax.fillStyle='#fff';
 // barba: patillas -> mejillas -> mentón (sin tapar la boca)
 ax.beginPath();ax.moveTo(U(.5-.465),V(.46));ax.bezierCurveTo(U(.045),V(.64),U(.12),V(.80),U(.19),V(.855));ax.bezierCurveTo(U(.22),V(.885),U(.28),V(.885),U(.31),V(.855));ax.bezierCurveTo(U(.38),V(.80),U(.455),V(.64),U(.465),V(.46));
 ax.bezierCurveTo(U(.44),V(.50),U(.42),V(.575),U(.375),V(.6));ax.bezierCurveTo(U(.34),V(.585),U(.30),V(.575),U(.25),V(.585));ax.bezierCurveTo(U(.20),V(.575),U(.16),V(.585),U(.125),V(.6));ax.bezierCurveTo(U(.08),V(.575),U(.06),V(.5),U(.035),V(.46));ax.closePath();ax.fill();
 // bigote
 ax.beginPath();ax.moveTo(U(.25),V(.572));ax.bezierCurveTo(U(.235),V(.55),U(.20),V(.56),U(.19),V(.585));ax.bezierCurveTo(U(.21),V(.605),U(.24),V(.60),U(.25),V(.598));ax.bezierCurveTo(U(.26),V(.60),U(.29),V(.605),U(.31),V(.585));ax.bezierCurveTo(U(.30),V(.56),U(.265),V(.55),U(.25),V(.572));ax.fill();
 // ventana de la boca
 ax.globalCompositeOperation='destination-out';ax.beginPath();ax.ellipse(U(.25),V(.645),W*.047,Hh*.034,0,0,7);ax.fill();
 const cv=document.createElement('canvas');cv.width=W;cv.height=Hh;const cx=cv.getContext('2d');cx.fillStyle='#'+new THREE.Color(c).lerp(new THREE.Color('#4a3a38'),.12).getHexString();cx.fillRect(0,0,W,Hh);
 for(let i=0;i<3200;i++){cx.fillStyle=`rgba(${Math.random()>.5?'255,255,255':'0,0,0'},${.03+Math.random()*.06})`;cx.fillRect(Math.random()*W,Math.random()*Hh,1.5,5+Math.random()*7)}
 const colT=new THREE.CanvasTexture(cv);colT.colorSpace=THREE.SRGBColorSpace;const alT=new THREE.CanvasTexture(al);
 const m=new THREE.Mesh(new THREE.SphereGeometry(.2365,64,40),new THREE.MeshStandardMaterial({map:colT,alphaMap:alT,transparent:true,alphaTest:.04,roughness:.95}));m.position.set(0,.22,0);m.castShadow=true;head.add(m);return m}

// ---------- person rig v2
function makePerson(o={}){
 const shirt=o.shirt||GREEN,apron=o.apron,pants=o.pants||INK,skin=o.skin||'#E9B48A',hairc=o.hair||'#2B2B2B';
 const root=new THREE.Group();scene.add(root);const P={root};
 const cap=(r,l,c)=>{const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,l,6,12),M(c,.6));m.castShadow=true;return m};
 const hips=new THREE.Group();hips.position.y=.9;root.add(hips);P.hips=hips;
 const pel=new THREE.Mesh(new RoundedBoxGeometry(.42,.2,.26,4,.07),M(pants));pel.castShadow=true;hips.add(pel);
 const leg=sx=>{const hip=new THREE.Group();hip.position.set(sx*.12,-.05,0);hips.add(hip);const th=cap(.08,.26,pants);th.position.y=-.2;hip.add(th);const knee=new THREE.Group();knee.position.y=-.4;hip.add(knee);const sh=cap(.07,.26,pants);sh.position.y=-.19;knee.add(sh);const ft=new THREE.Mesh(new RoundedBoxGeometry(.14,.08,.24,3,.035),M(o.shoe||'#ffffff'));ft.position.set(0,-.41,.05);ft.castShadow=true;knee.add(ft);return {hip,knee}};
 P.lL=leg(-1);P.lR=leg(1);
 const torso=new THREE.Group();torso.position.y=.08;hips.add(torso);P.torso=torso;
 const tm=new THREE.Mesh(new RoundedBoxGeometry(.52,.6,.32,5,.12),M(shirt));tm.position.y=.31;tm.castShadow=true;torso.add(tm);
 if(apron){const ap=new THREE.Mesh(new RoundedBoxGeometry(.36,.44,.03,3,.012),M(apron));ap.position.set(0,.24,.165);torso.add(ap);const st=new THREE.Mesh(new RoundedBoxGeometry(.05,.22,.02,2,.01),M(apron));[-1,1].forEach(s=>{const c=st.clone();c.position.set(s*.13,.55,.16);torso.add(c)})}
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,.1,12),M(skin));neck.position.y=.64;torso.add(neck);
 const head=new THREE.Group();head.position.y=.68;torso.add(head);P.head=head;
 const hm=new THREE.Mesh(new THREE.SphereGeometry(.23,32,24),M(skin,.7));hm.position.y=.22;hm.castShadow=true;head.add(hm);
 buildHair(head,o.style||'short',hairc,skin);if(o.beard)buildBeard(head,o.beardColor||hairc);
 [-1,1].forEach(s=>{const ear=new THREE.Mesh(new THREE.SphereGeometry(.045,12,10),M(skin));ear.position.set(s*.225,.2,0);head.add(ear)});
 const W=M('#ffffff',.3),K=M('#262626',.3);
 P.scl=[-1,1].map(s=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.05,16,12),W);e.scale.set(1,1.2,.45);e.position.set(s*.085,.24,.195);head.add(e);return e});
 P.pup=[-1,1].map(s=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.03,16,12),M('#4a2c1a',.3));e.scale.z=.5;e.position.set(s*.085,.235,.212);head.add(e);const pu=new THREE.Mesh(new THREE.SphereGeometry(.016,12,10),K);pu.position.z=.022;e.add(pu);const cl=new THREE.Mesh(new THREE.SphereGeometry(.0075,8,6),new THREE.MeshBasicMaterial({color:'#ffffff'}));cl.position.set(.01,.011,.04);e.add(cl);return e});
 P.happyEyes=[-1,1].map(s=>{const e=new THREE.Mesh(new THREE.TorusGeometry(.035,.011,8,16,Math.PI),K);e.position.set(s*.085,.225,.212);e.visible=false;head.add(e);return e});
 P.brows=[-1,1].map(s=>{const b=new THREE.Mesh(new RoundedBoxGeometry(.1,.02,.02,2,.008),M(hairc));b.position.set(s*.085,.315,.205);head.add(b);return b});
 P.cheeks=[-1,1].map(s=>{const c=new THREE.Mesh(new THREE.CircleGeometry(.035,16),new THREE.MeshBasicMaterial({color:'#f2a39b',transparent:true,opacity:.75}));c.position.set(s*.14,.16,.205);c.rotation.y=s*.5;head.add(c);return c});
 const mo=(geo,mat,y)=>{const m=new THREE.Mesh(geo,mat);m.position.set(0,y,.222);m.visible=false;head.add(m);return m};
 const MD=M('#7a2d24',.5);
 P.mouths={smile:mo(new THREE.TorusGeometry(.06,.014,8,20,Math.PI),MD,.13),frown:mo(new THREE.TorusGeometry(.05,.013,8,20,Math.PI),MD,.095),o:mo(new THREE.CircleGeometry(.035,20),M('#5a1f19',.5),.115),worry:mo(new THREE.TorusGeometry(.035,.012,8,16,Math.PI),MD,.1)};
 P.mouths.smile.rotation.z=Math.PI;P.mouths.o.scale.set(1,1.3,1);P.mouths.worry.scale.set(1.3,.7,1);
 const grin=new THREE.Group();grin.position.set(0,.135,.222);grin.visible=false;head.add(grin);const gb=new THREE.Mesh(new THREE.CircleGeometry(.08,24,Math.PI,Math.PI),M('#5a1f19',.5));grin.add(gb);const gt=new THREE.Mesh(new THREE.PlaneGeometry(.12,.025),W);gt.position.set(0,-.017,.002);grin.add(gt);P.mouths.grin=grin;
 P.sweat=[0,1].map(i=>{const d=new THREE.Mesh(new THREE.SphereGeometry(.028,12,10),new THREE.MeshStandardMaterial({color:'#9fd8ff',roughness:.2}));d.scale.set(1,1.5,1);head.add(d);d.visible=false;return d});
 const arm=sx=>{const sh=new THREE.Group();sh.position.set(sx*.33,.52,0);torso.add(sh);const ua=cap(.058,.19,shirt);ua.position.y=-.15;sh.add(ua);const el=new THREE.Group();el.position.y=-.3;sh.add(el);const fa=cap(.05,.19,skin);fa.position.y=-.13;el.add(fa);const hd=new THREE.Mesh(new THREE.SphereGeometry(.065,14,12),M(skin));hd.position.y=-.29;hd.castShadow=true;el.add(hd);return {sh,el,hand:hd,sx}};
 P.aL=arm(-1);P.aR=arm(1);return P}
function face(P,m,t,look=[0,0]){
 for(const k in P.mouths)P.mouths[k].visible=false;
 const mm={happy:'smile',grin:'grin',relax:'grin',worry:'worry',sad:'frown',think:'worry',surprise:'o',panic:'o'}[m]||'smile';P.mouths[mm].visible=true;
 if(m==='panic'){P.mouths.o.scale.set(1.2,1.6+Math.sin(t*20)*.2,1)}else P.mouths.o.scale.set(1,1.3,1);
 const closed=(m==='relax');const bl=((t+P.root.id*.7)%3.3)<.1;
 P.scl.forEach(e=>{e.visible=!closed;e.scale.y=bl?.15:(m==='surprise'||m==='panic'?1.45:1.2)});P.pup.forEach((e,i)=>{e.visible=!closed&&!bl;e.position.x=(i?1:-1)*.085+look[0]*.018;e.position.y=.235+look[1]*.018;e.children[0].scale.setScalar(m==='panic'?.5:(m==='surprise'?.75:1))});
 P.happyEyes.forEach(e=>e.visible=closed);
 const cfg={happy:[0,.315],grin:[.05,.325],relax:[0,.32],worry:[.38,.33],sad:[.35,.31],think:[.12,.325],surprise:[0,.345],panic:[.42,.34]}[m]||[0,.315];
 P.brows[0].rotation.z=cfg[0];P.brows[1].rotation.z=-cfg[0];P.brows.forEach(b=>b.position.y=cfg[1]);if(m==='think'){P.brows[0].position.y=.345;P.brows[0].rotation.z=-.1}
 P.cheeks.forEach(c=>c.visible=(m==='happy'||m==='grin'||m==='relax'));
 const sw=(m==='worry'||m==='panic');P.sweat.forEach((d,i)=>{d.visible=sw;const ph=((t*1.2+i*.5)%1);d.position.set((i?1:-1)*.2,.36-ph*.25,.12);d.scale.set(1-ph*.3,1.5-ph*.4,1-ph*.3)})}
function pose(P,o,t){const g=(k,d=0)=>o[k]===undefined?d:o[k];
 P.hips.position.y=.9+g('dy');P.hips.rotation.set(g('hx'),g('hy'),g('hz'));
 P.torso.rotation.set(g('tx'),g('ty'),g('tz'));P.head.rotation.set(g('hdx'),g('hdy'),g('hdz'));
 P.aL.sh.rotation.set(g('alx'),g('aly'),-g('alz'));P.aR.sh.rotation.set(g('arx'),g('ary'),g('arz'));
 P.aL.el.rotation.x=-g('ael');P.aR.el.rotation.x=-g('aer');
 P.lL.hip.rotation.x=-g('hlL');P.lR.hip.rotation.x=-g('hlR');P.lL.knee.rotation.x=g('klL');P.lR.knee.rotation.x=g('klR');
 face(P,o.mood||'happy',t,o.look||[0,0]);P.root.updateMatrixWorld(true)}
const walk=(ph,amp=.7)=>{const a=Math.sin(ph),b=Math.sin(ph+Math.PI);return {hlL:a*amp,hlR:b*amp,klL:Math.max(0,-a)*.9,klR:Math.max(0,-b)*.9,alx:-b*.6,arx:-a*.6,ael:.3,aer:.3,dy:Math.abs(Math.sin(ph))*.04,ty:Math.sin(ph)*.08}};

