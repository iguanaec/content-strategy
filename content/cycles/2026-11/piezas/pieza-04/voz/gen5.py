import json,re,unicodedata,numpy as np,soundfile as sf,torch
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from faster_whisper import WhisperModel
X='/tmp/claude-0/-home-user-content-strategy/1f8ae1c1-2f60-57f0-a7ce-e8960b87395c/scratchpad'
TL=json.load(open(X+'/vs/audio/timeline5.json'))['clauses']
m=ChatterboxMultilingualTTS.from_pretrained(device='cpu');sr=m.sr;wm=WhisperModel('small',device='cpu',compute_type='int8')
norm=lambda s:re.sub(r'[^a-z0-9 ]','',unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode())
NUM={'veintidos por ciento':'22','ochenta':'80','diez':'10','once':'11','seis':'6','cuatro':'4'}
EX={'s2b':.8,'s3c':.85,'s4b':.8,'s5b':.75,'s5c':.7,'s6a':.7,'s8a':.5,'s8b':.6,'s9a':.7,'s9b':.8}
def trim(w,th=0.012):
    a=np.abs(w);idx=np.where(a>th)[0]
    return w if len(idx)==0 else w[max(0,idx[0]-int(.03*sr)):min(len(w),idx[-1]+int(.08*sr))]
def ok(path,txt):
    tr=norm(' '.join(s.text for s in wm.transcribe(path,language='es')[0]));t=norm(txt)
    for k,v in NUM.items():t=t.replace(k,v)
    tw,rw=t.split(),tr.replace('%',' ').split();return sum(1 for w in tw if w in rw)/len(tw),tr,len(rw)<=len(tw)+2
out={}
for c in TL:
    if c['id']=='s1a':continue
    best=None
    for k in range(4):
        torch.manual_seed(200+k)
        w=m.generate(c['text'],language_id='es',audio_prompt_path=X+'/v10/voz24.wav',exaggeration=EX.get(c['id'],.65),cfg_weight=.4).squeeze().numpy();w=trim(w)
        sf.write('/tmp/_c5.wav',w,sr);h,tr,nl=ok('/tmp/_c5.wav',c['text']);sc=h-(0 if nl else .3)
        print(c['id'],k,round(h,2),round(len(w)/sr,2),tr,flush=True)
        if best is None or sc>best[0]:best=(sc,w)
        if h>=.95 and nl:break
    out[c['id']]=best[1];sf.write(f"{X}/v10/clip_{c['id']}.wav",best[1],sr)
print('DONE')
