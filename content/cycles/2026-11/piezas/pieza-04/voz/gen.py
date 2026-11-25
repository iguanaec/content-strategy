import sys,json,time
import soundfile as sf, numpy as np
from supertonic import TTS
voice=sys.argv[1]; speed=float(sys.argv[2])
segs=json.load(open('segs.json'))
tts=TTS()
style=tts.get_voice_style(voice_name=voice)
out={}
for k,txt in segs.items():
    t=time.time()
    wav,_=tts.synthesize(text=txt,voice_style=style,total_steps=8,speed=speed,lang='es')
    w=np.asarray(wav).squeeze()
    sf.write(f'audio/{voice}_{k}.wav',w,tts.sample_rate)
    out[k]=len(w)/tts.sample_rate
    print(k,round(out[k],2),'s',round(time.time()-t,1),'s gen',flush=True)
json.dump(out,open(f'audio/{voice}_dur.json','w'))
