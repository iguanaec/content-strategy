const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('err:',e.message));p.on('console',m=>{const t=m.text();if(!/GPU stall|GL Driver/.test(t))console.log('con:',t)});
await p.goto('http://localhost:8765/scene4.html');await p.waitForFunction(()=>window.ready,null,{timeout:60000});
for(const t of process.argv.slice(2)){await p.evaluate(t=>render(t),+t);await p.screenshot({path:path.join(__dirname,`f_${t}.png`)});}
await b.close()})();
