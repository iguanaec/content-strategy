const {chromium}=require('playwright');const path=require('path');const {spawn}=require('child_process');
(async()=>{const FPS=30,N=30*FPS;
const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',String(FPS),'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-preset','medium','-movflags','+faststart',path.join(__dirname,'motion.mp4')],{stdio:['pipe','inherit','inherit']});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+path.join(__dirname,'index.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/FPS);const buf=await p.screenshot({type:'jpeg',quality:95});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done')})();
