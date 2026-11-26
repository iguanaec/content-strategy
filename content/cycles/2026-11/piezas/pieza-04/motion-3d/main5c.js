// ================= línea de tiempo narrativa =================
const B9=segStart('s9'),S2=segStart('s2'),S3=segStart('s3'),S4=segStart('s4'),S5=segStart('s5'),S6=segStart('s6'),S7=segStart('s7'),S8=segStart('s8');
const T_OPEN=S2+(C('s2b')-S2)*.55,T_PERO=at('s5b','pero'),T_80=at('s3c','ochenta'),T_BOOK=at('s7a','agenda'),T_LLEGA=at('s8b','llega'),T_LOCK=C('s8b')+(T_LLEGA-C('s8b'))*.55;
const hourOf=t=>t<C('s3c')?9.2:t<S4?11+eio((t-C('s3c'))/(S4-C('s3c')))*.05:t<S5?lerp(11.1,15,eio((t-C('s4b'))/(S5-C('s4b')))):t<S8?15.2+Math.min(1,(t-S5)/(S8-S5))*1.6:t<C('s8b')?17.4:lerp(17.5,18,eio((t-C('s8b'))/(T_LLEGA-C('s8b'))));
const todOf=t=>t<C('s4b')?0:t<S5?lerp(0,.62,eio((t-C('s4b'))/(S5-C('s4b')))):t<S8?.62:1;
const doorAng=t=>t<T_OPEN?0:t<T_OPEN+.5?eio((t-T_OPEN)/.5)*1.6:t<T_OPEN+2.2?1.6:t<T_OPEN+2.7?lerp(1.6,0,eio((t-T_OPEN-2.2)/.5)):0;
const SH=[];const S=(a,b,f)=>SH.push({a,b,f});
const hide=()=>{people.forEach(p=>p.root.visible=false);Object.values(P3).flat().forEach(o=>{if(o)o.visible=false});bubs.forEach(b=>b.visible=false);stool.visible=false;banner.visible=false;cal.visible=false;t22.visible=false};
const DZ=-.95,DX=2.05;
const daniAt=(ry=0)=>where(dani,DX,DZ,ry);
const regS=window.__reg=shopRefs.reg;
// ---- 1. gancho: noviembre + diciembre = 22 %
S(0,at('s1a','llegan'),(t,lt,p)=>{setEnv('shop',0);cal.visible=true;cal.position.set(3.44,1.9,-.8);cal.rotation.y=-Math.PI/2;cal.userData.flip(eio((t-at('s1a','diciembre')+.05)/.5)*3.0);
 shot([lerp(1.2,2.0,p),lerp(1.95,1.9,p),-.8+lt*.05],[3.4,1.9,-.8],{fov:34})});
S(at('s1a','llegan'),at('s1a','veintid')-.1,(t,lt,p)=>{setEnv('shop',0);const ps=[[.95,1.03,.0],[1.45,1.03,.05],[1.2,1.03,.45]];place(P3.bagA,ps[0],{s:1.25,rot:[0,.5,0],t});place(P3.bagB,ps[1],{s:1.25,rot:[0,-.4,0],t,ph:1});place(P3.bagC,ps[2],{s:1.15,rot:[0,.2,0],t,ph:2});
 shot(orb([1.2,1,.1],2.6,lerp(1.25,1.05,p),lerp(.95,.2,p)),[1.2,1.2,.1],{fov:32,roll:.04})});
S(at('s1a','veintid')-.1,S2,(t,lt,p)=>{setEnv('shop',0);t22.visible=true;const pp=eb(lt/.5);t22.position.set(-2.0,1.75,-1.7);t22.rotation.set(0,(1-pp)*-1.4+Math.sin(t*1.2)*.05,0);t22.scale.setScalar(.12+eb(lt/.5)*.38);
 shot([lerp(-1.0,-1.95,p),1.72,lerp(2.9,2.1,p)],[-2,1.75,-1.7],{fov:34})});
// ---- 2. Dani abre el negocio
S(S2,T_OPEN,(t,lt,p)=>{setEnv('shop',0);const L=T_OPEN-S2;mover(dani,[-4.3,-3.15],[-.05,-3.15],eo(lt/L),t,9);const dx=lerp(-4.3,-.05,eo(lt/L));
 shot([dx-.7,1.3,-7.6],[dx-.05,1.25,-3.1],{fov:38,roll:-.03})});
S(T_OPEN,C('s2b'),(t,lt,p)=>{setEnv('shop',0);const L=C('s2b')-T_OPEN;mover(dani,[-.05,-3.3],[.3,-.3],eo(lt/L),t,9);if(lt/L>.75)pose(dani,{...POSES.hello(lt),mood:'happy'},t);
 shot([lerp(-.4,.3,lt/L),1.35,2.4],[-.05,1.2,-1.9],{fov:40})});
S(C('s2b'),at('s2b','lanza')-.15,(t,lt,p)=>{setEnv('shop',0);banner.visible=true;const bp=eb(lt/.55);banner.position.set(-2.0,lerp(3.0,2.25,bp),-2.05);banner.rotation.z=(1-bp)*.12;daniAt();pose(dani,{...POSES.surprised(lt),mood:'surprise'},t);dani.root.position.set(-.5,0,-1.2);
 shot([lerp(-.6,-1.2,p),.8,2.2],[-1.9,2.0,-2.0],{fov:40,roll:.06})});
S(at('s2b','lanza')-.15,S3,(t,lt,p)=>{setEnv('shop',0);banner.visible=true;banner.position.set(-2.0,2.25,-2.05);daniAt();pose(dani,{...POSES.megaphone(lt),mood:'grin'},t);hold(P3.mega,dani,'R',[.02,-.03,.06],[0,-1.2,0]);
 shot([lerp(.1,.9,p),.65,3.0],[DX,1.5,DZ],{fov:42,roll:.06})});
// ---- 3. mensajes
S(S3,C('s3b'),(t,lt,p)=>{setEnv('shop',0);place(P3.phone,[1.55+Math.sin(t*90)*.003,1.0,.15],{rot:[-Math.PI/2,0,.5]});drawPhone(P3.phone,{mode:'notif',dark:true,n:1,time:'10:52'});daniAt();pose(dani,{...POSES.lean2(lt),mood:'happy',look:[-.6,-.6]},t);
 shot([lerp(1.0,1.3,p),1.55,lerp(1.1,.95,p)],[1.6,1.0,.15],{fov:32,roll:-.12})});
S(C('s3b'),C('s3c'),(t,lt,p)=>{setEnv('shop',0);daniAt();pose(dani,{...POSES.phoneUp(lt),mood:lt<.25?'surprise':'worry'},t);hold(P3.phone,dani,'R',[0,-.02,.07],[.3,0,0],1);drawPhone(P3.phone,{mode:'notif',dark:true,n:10,time:'10:58'});
 [[DX-.42,2.65,.3],[DX+.5,2.3,.3],[DX-.55,1.6,.3]].forEach(([x,y,z],i)=>{if(lt>.04+i*.12)place(bubs[i],[x,y,z],{s:.85*eb((lt-.04-i*.12)/.25)})});
 shot([lerp(.9,1.4,p),1.55,4.3],[DX,1.6,DZ],{fov:38,roll:.04})});
S(C('s3c'),T_80,(t,lt,p)=>{setEnv('shop',0);const bs=[[1.95,3.45],[2.2,3.2],[1.9,2.15],[2.2,1.9],[1.95,1.65],[2.25,1.4]];bs.forEach(([x,y],i)=>{if(lt>.08+i*.1)place(bubs[i],[x,y,-1.6],{s:.5*eb((lt-.08-i*.1)/.25)})});
 shot([lerp(1.7,2.05,p),lerp(2.3,2.5,p),lerp(2.4,1.8,p)],[2.05,2.65,-1.98],{fov:38,roll:lerp(-.08,.05,p)})});
S(T_80,S4,(t,lt,p)=>{setEnv('shop',0);daniAt();pose(dani,{...POSES.phoneUp(lt),mood:'panic',look:[0,0]},t);hold(P3.phone,dani,'R',[0,-.02,.07],[.3,0,0],1);drawPhone(P3.phone,{mode:'notif',dark:true,n:80,time:'11:00'});
 const e=new THREE.Vector3();dani.head.localToWorld(e.set(0,.235,.2));shot([e.x+.05,e.y+.02,e.z+lerp(1.5,1.15,p)],[e.x,e.y,e.z],{fov:30,roll:-.06})});
// ---- 4. una mano, la otra
S(S4,at('s4a','contesta'),(t,lt,p)=>{setEnv('shop',0);daniAt();where(cliA,1.0,.65,2.5);pose(dani,{...POSES.give(lt),mood:'worry'},t);pose(cliA,{arx:-1.1,aer:.5,mood:'happy',look:[-.2,0]},t);
 hold(P3.bagH,dani,'L',[0,-.2,.05],[0,0,0],.75);hold(P3.phone,dani,'R',[0,-.02,.07],[.3,0,0],1);drawPhone(P3.phone,{mode:'notif',dark:true,n:80,time:'11:20'});
 shot([lerp(.2,.9,p),1.5,3.6],[1.55,1.4,-.1],{fov:38,roll:-.05})});
S(at('s4a','contesta'),C('s4b'),(t,lt,p)=>{setEnv('shop',0);daniAt();pose(dani,{...POSES.typeBoth(lt),mood:'worry'},t);hold(P3.phone,dani,'R',[0,-.02,.07],[.3,0,0],1);
 drawPhone(P3.phone,{mode:'chat',title:'Clientes',msgs:[{t:'¿Hay cupo hoy?'},{t:'¿Precio?'},{t:'Ya le respondo…',me:true}],typing:true,t});
 shot([lerp(.7,1.4,p),1.65,lerp(1.5,1.2,p)],[2.0,1.35,-.8],{fov:36,roll:.1})});
S(C('s4b'),S5,(t,lt,p)=>{setEnv('shop',todOf(t));daniAt();pose(dani,{...POSES.typeBoth(lt),mood:p<.5?'worry':'sad',hdx:.28+p*.3},t);
 hold(P3.phone,dani,'R',[0,-.02,.07],[.3,0,0],1);drawPhone(P3.phone,{mode:'notif',dark:true,n:80,time:['11:20','12:40','13:55','15:10'][Math.min(3,Math.floor(p*4))]});
 shot([lerp(.9,1.5,p),lerp(1.6,1.45,p),lerp(2.6,1.9,p)],[lerp(1.8,DX,p),1.55,lerp(-1.2,DZ,p)],{fov:34,roll:lerp(.05,-.04,p)})});
// ---- 5. el cliente que se fue
S(S5,C('s5b'),(t,lt,p)=>{setEnv('shop',todOf(t));mover(cliB,[-3.2,-3.4],[-2.0,-3.2],eo(lt/.8),t,8);if(lt>.8){where(cliB,-2.0,-3.2,0);pose(cliB,{...POSES.phone(lt),mood:'happy'},t);hold(P3.phone,cliB,'R',[0,-.02,.07],[.3,0,0],1);drawPhone(P3.phone,{mode:'chat',title:'Negocio',msgs:[],dark:false})}
 if(lt>.85)place(bubs[0],[-2.0,2.4,-3.2],{s:1.1*eb((lt-.85)/.3)});shot([lerp(-1.0,-1.7,p),1.5,1.2],[-2.0,1.5,-3.2],{fov:34})});
S(C('s5b'),T_PERO,(t,lt,p)=>{setEnv('shop',todOf(t));where(cliB,-2.0,-3.2,0);pose(cliB,{...POSES.waitImp(lt),mood:'think'},t);place(P3.hg,[-1.2,1.6,-3.0],{s:1.2*eb(lt/.25),rot:[0,0,Math.sin(t*2)*.05],t});P3.hg.userData.set(clamp(lt/.8));
 shot([lerp(-2.6,-1.9,p),.8,.4],[-1.8,1.4,-3.2],{fov:38,roll:.08})});
S(T_PERO,C('s5c'),(t,lt,p)=>{setEnv('shop',todOf(t));where(cliB,-2.0,-3.2,0);pose(cliB,{...POSES.slumpB(),mood:'sad'},t);const e=new THREE.Vector3();cliB.head.localToWorld(e.set(0,.22,.2));P3.hg.visible=false;
 shot([e.x+.25,e.y+.02,e.z+lerp(1.5,1.2,p)],[e.x,e.y,e.z],{fov:32})});
S(C('s5c'),S6,(t,lt,p)=>{setEnv('shop',todOf(t));mover(cliB,[-2.5,-3.2],[-.4,-3.2],eio(p),t,9);pose(cliB,{...walk(t*9),mood:'sad'},t);
 shot([-1.6,1.45,1.2],[lerp(-1.9,-1.3,p),1.35,-3.2],{fov:36})});
// ---- 6. ¿cuánto vale una hora?
S(S6,S6+(S7-S6)*.55,(t,lt,p)=>{setEnv('shop',.62);stool.visible=true;stool.position.set(DX,0,DZ+.1);dani.root.visible=true;dani.root.position.set(DX,0,DZ+.1);dani.root.rotation.y=0;pose(dani,{...POSES.chin(lt),mood:'think',dy:-.4,hlL:1.5,hlR:1.5,klL:1.5,klR:1.5},t);
 const e=new THREE.Vector3();dani.head.localToWorld(e.set(0,.22,.2));shot([e.x+.35,e.y+.05,e.z+lerp(2.2,1.5,p)],[e.x,e.y,e.z],{fov:32})});
S(S6+(S7-S6)*.55,S7,(t,lt,p)=>{setEnv('shop',.62);place(P3.hg,[1.6,1.12,.2],{s:1.5,t});P3.hg.userData.set(clamp(lt/1.2));
 shot([lerp(1.2,1.9,p),lerp(2.55,2.75,p),lerp(-.2,.1,p)],[2.05,2.78,-1.98],{fov:28,roll:-.05})});
// ---- 7. Iguana
S(S7,S7+(S8-S7)*.4,(t,lt,p)=>{setEnv('shop',.62);place(P3.phone,[1.55,1.0,.12],{rot:[-Math.PI/2,0,.35]});const N=[];if(lt>.3)N.push({t:'Ana',s:'¿Te agendo hoy a las 4 pm?'});if(lt>.9)N.push({t:'Cita agendada ✓',s:'Ana · hoy 4 pm'});if(lt>1.45)N.push({t:'Luis',s:'Abrimos hasta las 8 pm'});
 drawPhone(P3.phone,{mode:'iguana',time:'11:42',notes:N,t:lt});place(P3.wa,[1.95,1.2+eo(lt/.5)*.07,.0],{s:eb((lt-.15)/.4)*.55,rot:[-.15,-.2+Math.sin(t*1.5)*.12,0],t,bob:.01});daniAt();pose(dani,{...POSES.giveCalm(lt),mood:'grin'},t);where(cliA,1.0,.95,Math.PI*.9);pose(cliA,{arx:-.2,mood:'happy',look:[-.4,0]},t);
 shot([lerp(1.3,1.6,p),lerp(1.5,1.3,p),lerp(.9,.65,p)],[1.55,1.0,.15],{fov:34,roll:-.1})});
S(S7+(S8-S7)*.4,T_BOOK-.05,(t,lt,p)=>{setEnv('shop',.62);daniAt();pose(dani,{...POSES.giveCalm(lt),mood:'grin'},t);where(cliA,1.1,.95,Math.PI*.92);pose(cliA,{...POSES.hello(lt),mood:'happy'},t);hold(P3.bagH,dani,'L',[0,-.2,.05],[0,0,0],.75);place(P3.phone,[1.55,1.0,.12],{rot:[-Math.PI/2,0,.35]});drawPhone(P3.phone,{mode:'iguana',time:'11:43',notes:[{t:'Sofi',s:'Turno de las 5 separado'},{t:'Cita agendada ✓',s:'Ana · hoy 4 pm'}],t:3});
 shot([lerp(.2,1.0,p),1.5,4.6],[1.85,1.45,-.2],{fov:36,roll:.03})});
S(T_BOOK-.05,S8,(t,lt,p)=>{setEnv('shop',.62);regS.userData.drawer(clamp(lt/.25)*(lt<1.3?1:0));place(P3.check,[2.15,1.62,.05],{s:eb((lt-.2)/.35)*1.1,rot:[0,Math.sin(t*2)*.4,0],t});
 shot([lerp(2.6,2.35,p),lerp(1.5,1.35,p),lerp(1.2,1.1,p)],[2.5,1.05,-.02],{fov:30,roll:.07})});
// ---- 8. tranquilo y a casa
S(S8,C('s8b'),(t,lt,p)=>{setEnv('shop',.9);daniAt();pose(dani,{...POSES.lean2(lt),mood:'relax'},t);where(cliC,1.15,.9,Math.PI*.9);pose(cliC,{...POSES.hello(lt),mood:'grin'},t);
 shot(orb([DX,1,DZ],lerp(3.0,2.4,p),lerp(.7,.9,p),lerp(.55,.15,p)),[DX,1.35,DZ],{fov:38,roll:.04})});
S(C('s8b'),T_LOCK,(t,lt,p)=>{setEnv('shop',.95);shopRefs.clock.visible=true;shot([lerp(1.6,2.05,p),lerp(2.5,2.7,p),lerp(.3,-.3,p)],[2.05,2.78,-1.98],{fov:30,roll:.04})});
S(T_LOCK,T_LLEGA,(t,lt,p)=>{setEnv('shop',.95);where(dani,-.1,-1.4,Math.PI);pose(dani,{...POSES.key(lt),mood:'relax'},t);
 shot([lerp(1.9,1.5,p),1.55,.9],[-.2,1.35,-2.0],{fov:38,roll:-.04})});
S(T_LLEGA,T_LLEGA+(B9-T_LLEGA)*.5,(t,lt,p)=>{setEnv('house');const L=(B9-T_LLEGA)*.5;mover(dani,[62.8,5.2],[60.1,-1.0],eo(lt/(L*.8)),t,9);if(lt>L*.8)pose(dani,{...POSES.key(lt),mood:'relax'},t);houseRefs.door.userData.open(lt>L*.75?eio((lt-L*.75)/(L*.25))*1.5:0);houseRefs.hall.intensity=lt>L*.75?lerp(0,14,eio((lt-L*.75)/(L*.25))):0;
 shot([lerp(55.4,58.2,lt/L),lerp(.6,1.1,lt/L),lerp(6.4,5.6,lt/L)],[lerp(60,60.2,lt/L),1.2,-1.9],{fov:36,roll:-.04})});
S(T_LLEGA+(B9-T_LLEGA)*.5,B9,(t,lt,p)=>{setEnv('home');const L=B9-(T_LLEGA+(B9-T_LLEGA)*.5);homeRefs.door.userData.open(1.5);
 where(dani,117.2,1.8,Math.PI*.5);dani.root.position.x=lerp(116.5,118.3,eo(lt/.6));pose(dani,{...POSES.hug2(lt),mood:'grin'},t);where(kid,lerp(118.1,118.6,eo(lt/.5)),1.8,-Math.PI*.5);pose(kid,{...POSES.cheer(lt),mood:'grin'},t);where(mom,121,.8,-Math.PI*.7);pose(mom,{...POSES.hello(lt),mood:'happy'},t);
 P3.hearts.forEach((h,i)=>{const t0=.3+i*.2;if(lt>t0)place(h,[118.0+i*.5,2.1+eo((lt-t0)/1)*.15,1.5],{s:eb((lt-t0)/.3)*1.2,rot:[0,Math.sin(t*2+i)*.6,0],t})});
 shot([lerp(124,122.2,lt/L),1.5,lerp(5.0,4.2,lt/L)],[118.8,1.2,1.4],{fov:38,roll:.02})});
// ---- final
S(B9,DUR+1,(t,lt,p)=>{setEnv('shop',0);hide()});
