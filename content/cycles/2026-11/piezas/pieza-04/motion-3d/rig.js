// ---------- person rig v2
function makePerson(o={}){
 const shirt=o.shirt||GREEN,apron=o.apron,pants=o.pants||INK,skin=o.skin||'#E9B48A',hairc=o.hair||'#2B2B2B';
 const root=new THREE.Group();scene.add(root);const P={root};
 const cap=(r,l,c)=>{const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,l,6,12),M(c,.6));m.castShadow=true;return m};
 const hips=new THREE.Group();hips.position.y=.9;root.add(hips);P.hips=hips;
 const pel=new THREE.Mesh(new RoundedBoxGeometry(.42,.2,.26,4,.07),M(pants));pel.castShadow=true;hips.add(pel);
 const leg=sx=>{const hip=new THREE.Group();hip.position.set(sx*.12,-.05,0);hips.add(hip);const th=cap(.08,.26,pants);th.position.y=-.2;hip.add(th);const knee=new THREE.Group();knee.position.y=-.4;hip.add(knee);const sh=cap(.07,.26,pants);sh.position.y=-.19;knee.add(sh);const ft=new THREE.Mesh(new RoundedBoxGeometry(.14,.08,.24,3,.035),M('#ffffff'));ft.position.set(0,-.41,.05);ft.castShadow=true;knee.add(ft);return {hip,knee}};
 P.lL=leg(-1);P.lR=leg(1);
 const torso=new THREE.Group();torso.position.y=.08;hips.add(torso);P.torso=torso;
 const tm=new THREE.Mesh(new RoundedBoxGeometry(.52,.6,.32,5,.12),M(shirt));tm.position.y=.31;tm.castShadow=true;torso.add(tm);
 if(apron){const ap=new THREE.Mesh(new RoundedBoxGeometry(.36,.44,.03,3,.012),M(apron));ap.position.set(0,.24,.165);torso.add(ap);const st=new THREE.Mesh(new RoundedBoxGeometry(.05,.22,.02,2,.01),M(apron));[-1,1].forEach(s=>{const c=st.clone();c.position.set(s*.13,.55,.16);torso.add(c)})}
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,.1,12),M(skin));neck.position.y=.64;torso.add(neck);
 const head=new THREE.Group();head.position.y=.68;torso.add(head);P.head=head;
 const hm=new THREE.Mesh(new THREE.SphereGeometry(.23,32,24),M(skin,.7));hm.position.y=.22;hm.castShadow=true;head.add(hm);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.245,32,20,0,Math.PI*2,0,Math.PI*.5),M(hairc,.8));hair.position.set(0,.235,-.015);hair.rotation.x=-.28;head.add(hair);
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

