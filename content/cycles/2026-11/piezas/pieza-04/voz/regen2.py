import json,re,unicodedata,numpy as np,soundfile as sf,torch
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from faster_whisper import WhisperModel
X='/tmp/claude-0/-home-user-content-strategy/1f8ae1c1-2f60-57f0-a7ce-e8960b87395c/scratchpad'
TL={c['id']:c for c in json.load(open(X+'/vs/audio/timeline5.json'))['clauses']}
m=ChatterboxMultilingualTTS.from_pretrained(device='cpu');sr=m.sr;wm=WhisperModel('small',device='cpu',compute_type='int8')
norm=lambda s:re.sub(r'[^a-z0-9 ]','',unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode())
NUM={'veintidos por ciento':'22','ochenta':'80','diez':'10','once':'11','seis':'6','cuatro':'4'}
def speech_dur(w):
    fr=int(.01*sr);n=len(w)//fr;e=np.array([np.sqrt((w[i*fr:(i+1)*fr]**2).mean()) for i in range(n)]);act=e>max(.004,e.max()*.025);return act.sum()*.01
def ok(path,txt):
    tr=norm(' '.join(s.text for s in wm.transcribe(path,language='es')[0]));t=norm(txt)
    for k,v in NUM.items():t=t.replace(k,v);tr=tr.replace(k,v)
    tw,rw=t.split(),tr.replace('%',' ').split();return sum(1 for w in tw if w in rw)/len(tw)
PARTS=[('s4a1','Atiende con una mano,',.75,.3,3),('s4a2','y contesta con la otra.',.75,.3,3)]
for cid,txt,ex,cfg,n in PARTS:
    best=None
    for k in range(n):
        torch.manual_seed(300+k);w=m.generate(txt,language_id='es',audio_prompt_path=X+'/v10/voz24.wav',exaggeration=ex,cfg_weight=cfg).squeeze().numpy()
        sf.write('/tmp/_r.wav',w,sr);h=ok('/tmp/_r.wav',txt);d=speech_dur(w);tot=len(w)/sr;print(cid,k,round(h,2),round(d,2),round(tot,2),flush=True)
        if h>=.95 and (best is None or tot<best[0]):best=(tot,w)
    if best:sf.write(f'{X}/v10/clip_{cid}.wav',best[1],sr);print('picked',cid,round(best[0],2))
print('DONE')
