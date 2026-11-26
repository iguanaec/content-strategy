import json,numpy as np,soundfile as sf
from supertonic import TTS
C=json.load(open('clauses.json'));tts=TTS();st=tts.get_voice_style(voice_name='F3');sr=tts.sample_rate
def trim(w,th=0.008):
    a=np.abs(w);idx=np.where(a>th)[0]
    if len(idx)==0:return w
    s=max(0,idx[0]-int(.02*sr));e=min(len(w),idx[-1]+int(.06*sr));return w[s:e]
parts=[np.zeros(int(.3*sr))];t=.3;out=[];prev_seg=None
for seg,cid,txt in C:
    if prev_seg is not None:
        gap=.55 if seg!=prev_seg else (.42 if txt.startswith(('¿',)) or prev_txt.endswith(('?','!')) else .34)
        parts.append(np.zeros(int(gap*sr)));t+=gap
    w,_=tts.synthesize(text=txt,voice_style=st,total_steps=10,speed=1.12,lang='es');w=trim(np.asarray(w).squeeze())
    out.append({'seg':seg,'id':seg+cid,'text':txt,'start':round(t,3),'dur':round(len(w)/sr,3)});parts.append(w);t+=len(w)/sr;prev_seg=seg;prev_txt=txt
parts.append(np.zeros(int(1.6*sr)));t+=1.6
y=np.concatenate(parts);y=y/np.abs(y).max()*.9;sf.write('audio/voice3.wav',y,sr)
json.dump({'clauses':out,'total':round(t,3)},open('audio/timeline3.json','w'),ensure_ascii=False,indent=1)
print(round(t,2));[print(c['id'],c['start'],c['dur']) for c in out]
