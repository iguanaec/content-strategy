// ================= subtítulos pequeños por palabras =================
const wrap=document.getElementById('wrap');
const KEY=/^(noviembre|diciembre|22|ventas|mensaje|diez|ochenta|horas|cuatro|nadie|respondio|iguana|instante|agenda|tranquilo|familia|demo|gratis|promo|friday|cupo|hora)$/;
const SUBS=[];
for(const c of TL.clauses){const ws=c.words||[];let cur=[];const flush=()=>{if(!cur.length)return;SUBS.push({a:cur[0].s,e:cur[cur.length-1].e,words:cur});cur=[]};
 ws.forEach((w,i)=>{cur.push(w);const last=/[,.?!]$/.test(w.w);if(cur.length>=3||last||(cur.length===2&&ws[i+1]&&nrm(ws[i+1].w).length>7))flush()});flush()}
SUBS.sort((a,b)=>a.a-b.a);SUBS.forEach((s,i)=>{const nx=SUBS[i+1];s.b=nx?Math.min(nx.a,s.e+.32):s.e+.32;if(nx&&nx.a-s.e<.32)s.b=nx.a;
 s.html=s.words.map(w=>{const t=w.w.replace(/[¿¡]/g,m=>m);const k=KEY.test(nrm(w.w));return k?`<span class="k">${t}</span>`:t}).join(' ')});
const subEl=document.createElement('div');subEl.className='sub';wrap.appendChild(subEl);
function drawSubs(t){const s=SUBS.find(x=>t>=x.a-.04&&t<x.b);if(!s||t>=B9-.02){subEl.style.display='none';return}
 if(subEl._k!==s.html){subEl.innerHTML=s.html;subEl._k=s.html}const lt=t-s.a;subEl.style.display='block';subEl.style.opacity=String(clamp((lt+.04)/.08));subEl.style.transform=`translateY(${(1-eo(lt/.14))*14}px) scale(${.96+.04*eb(lt/.2)})`}
// tarjeta final (lima)
const endEl=document.createElement('div');endEl.style.cssText='position:absolute;left:0;top:0;width:1080px;height:1920px;background:#FFFFFF;display:none;text-align:center;font-family:M,sans-serif';
endEl.innerHTML='<img src="assets/logo_green.png" style="position:absolute;left:190px;top:560px;width:700px"><div id="e1" style="position:absolute;left:0;top:1010px;width:1080px;font-weight:900;font-size:92px;color:#2a2a2a;letter-spacing:-1px">Recupera tus horas<span style="display:block;width:560px;height:20px;background:#A7FF6B;border-radius:6px;margin:14px auto 0"></span></div><div id="e2" style="position:absolute;left:210px;top:1180px;width:660px;height:110px;border-radius:55px;background:#2a2a2a;color:#A7FF6B;font-weight:800;font-size:44px;line-height:110px">Agenda tu demo gratis</div>';
wrap.appendChild(endEl);
function drawEnd(t){const on=t>=B9-.02;endEl.style.display=on?'block':'none';if(!on)return;const l=t-B9;const e1=endEl.querySelector('#e1'),e2=endEl.querySelector('#e2'),lg=endEl.querySelector('img');
 lg.style.transform=`scale(${eb(l/.45)})`;e1.style.transform=`translateY(${(1-eo((l-.15)/.3))*40}px)`;e1.style.opacity=String(clamp((l-.1)/.2));e2.style.transform=`scale(${eb((l-.9)/.4)*(1+Math.sin(l*6)*.012)})`}
