const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('err:',e.message));
await p.goto('http://localhost:8765/scene5.html');await p.waitForFunction(()=>window.ready,null,{timeout:60000});
const specs=require(path.resolve(process.argv[2]));
for(const [i,s] of specs.entries()){await p.evaluate(({s})=>{const c=window.__ctx;const f=new Function('c','with(c){'+s.setup+'}');window.dbgShot(s.mode||'shop',s.k||0,s.pos,s.look,s.fov||35,()=>f(c))},{s});await p.screenshot({path:path.join(__dirname,`d_${String(i).padStart(2,'0')}.png`)})}
await b.close()})();
