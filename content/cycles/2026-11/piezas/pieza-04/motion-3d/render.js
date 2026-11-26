const {chromium}=require('playwright');const path=require('path');const {spawn}=require('child_process');
(async()=>{const FPS=30,N=Math.round(43.79*FPS);
const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',String(FPS),'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-preset','medium','-movflags','+faststart',path.join(__dirname,'m3d_silent.mp4')],{stdio:['pipe','inherit','inherit']});
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('err:',e.message));
await p.goto('http://localhost:8765/scene2.html');await p.waitForFunction(()=>window.ready,null,{timeout:60000});
for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/FPS);const buf=await p.screenshot({type:'jpeg',quality:95});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%100==0)console.log('frame',i,flush=1)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done')})();
