function frame(t){CURT=t;hide();const s=SH.find(x=>t>=x.a&&t<x.b)||SH[SH.length-1];
 shopRefs.door.userData.open(doorAng(t));{const op=t>T_OPEN+.6&&t<T_LOCK;if(shopRefs.sign._op!==op){shopRefs.sign._op=op;shopRefs.sign.userData.set(op)}}shopRefs.clock.userData.set(hourOf(t));P3.phone.userData&&0;regS.userData.drawer(0);
 s.f(t,t-s.a,clamp((t-s.a)/(s.b-s.a)));
 bubs.forEach(b=>{if(b.visible)b.quaternion.copy(cam.quaternion)});
 R.render(scene,cam)}
window.render=function(t){frame(t);drawSubs(t);drawEnd(t);return true};
window.DUR=DUR;window.SHOTS=SH.map(s=>[+s.a.toFixed(2),+s.b.toFixed(2)]);window.ready=true;

window.dbgShot=(mode,k,pos,look,fov,setup)=>{hide();setEnv(mode,k);shopRefs.door.userData.open(0);shotFn(pos,look,fov);if(setup)setup();R.render(scene,cam);return true};
function shotFn(pos,look,fov){shot(pos,look,{fov})}
window.__ctx={dani,cliA,cliB,cliC,mom,kid,pose,POSES,walk,hold,P3,where,place,bubs,shopRefs,houseRefs,homeRefs,stool,banner,cal,t22,drawPhone,THREE,setEnv,hide};
