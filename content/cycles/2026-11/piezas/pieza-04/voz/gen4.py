import json,numpy as np,soundfile as sf,torch,re,unicodedata
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from faster_whisper import WhisperModel
X='/tmp/claude-0/-home-user-content-strategy/1f8ae1c1-2f60-57f0-a7ce-e8960b87395c/scratchpad'
C=json.load(open(X+'/vs/clauses.json'))
m=ChatterboxMultilingualTTS.from_pretrained(device="cpu");sr=m.sr;wm=WhisperModel("small",device="cpu",compute_type="int8")
EX={'s3c':.85,'s4b':.8,'s5b':.75,'s5c':.75,'s6a':.7,'s8a':.5,'s8b':.55,'s9a':.7,'s9b':.75,'s2b':.8}
norm=lambda s:re.sub(r'[^a-z0-9 ]','',unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode())
NUM={'veintidos por ciento':'22','ochenta':'80','diez':'10','once':'11','seis':'6','cuatro':'4'}
def trim(w,th=0.012):
    a=np.abs(w);idx=np.where(a>th)[0]
    if len(idx)==0:return w
    s=max(0,idx[0]-int(.03*sr));e=min(len(w),idx[-1]+int(.08*sr));return w[s:e]
def ok(path,txt):
    tr=norm(' '.join(s.text for s in wm.transcribe(path,language='es')[0]));t=norm(txt)
    for k,v in NUM.items():t=t.replace(k,v)
    tw,rw=t.split(),tr.replace('%',' ').split();hit=sum(1 for w in tw if w in rw)/len(tw)
    return hit,tr,len(rw)<=len(tw)+2
parts=[np.zeros(int(.3*sr))];t=.3;out=[];prev=None;prev_txt=''
for seg,cid,txt in C:
    if prev is not None:
        gap=.45 if seg!=prev else (.36 if txt.startswith('¿') or prev_txt.endswith('?') else .26)
        parts.append(np.zeros(int(gap*sr)));t+=gap
    best=None
    for k in range(4):
        torch.manual_seed(100+k);w=m.generate(txt,language_id='es',audio_prompt_path='ref_M1.wav',exaggeration=EX.get(seg+cid,.62),cfg_weight=.45).squeeze().numpy();w=trim(w)
        sf.write('/tmp/_c.wav',w,sr);h,tr,nolong=ok('/tmp/_c.wav',txt);sc=h-(0 if nolong else .3)
        print(seg+cid,k,round(h,2),nolong,round(len(w)/sr,2),tr,flush=True)
        if best is None or sc>best[0]:best=(sc,w)
        if h>=.95 and nolong:break
    w=best[1];out.append({'seg':seg,'id':seg+cid,'text':txt,'start':round(t,3),'dur':round(len(w)/sr,3)});parts.append(w);t+=len(w)/sr;prev=seg;prev_txt=txt
parts.append(np.zeros(int(1.6*sr)));t+=1.6
y=np.concatenate(parts);y=y/np.abs(y).max()*.9;sf.write(X+'/vs/audio/voice4.wav',y,sr)
json.dump({'clauses':out,'total':round(t,3)},open(X+'/vs/audio/timeline4.json','w'),ensure_ascii=False,indent=1);print('TOTAL',round(t,2))
