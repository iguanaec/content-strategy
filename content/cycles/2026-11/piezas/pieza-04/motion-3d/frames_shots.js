const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('err:',e.message));
await p.goto('http://localhost:8765/scene5.html');await p.waitForFunction(()=>window.ready,null,{timeout:60000});
const sh=await p.evaluate(()=>window.SHOTS);const off=+process.argv[2]||.5;
let i=0;for(const [a,b2] of sh){const t=a+(Math.min(b2,a+8)-a)*off;await p.evaluate(t=>render(t),t);await p.screenshot({path:path.join(__dirname,`f_${t.toFixed(2)}.png`)});i++}
console.log(sh.length,'shots');await b.close()})();
