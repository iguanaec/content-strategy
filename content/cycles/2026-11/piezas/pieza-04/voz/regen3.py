import json,re,unicodedata,numpy as np,soundfile as sf,torch
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from faster_whisper import WhisperModel
X='/tmp/claude-0/-home-user-content-strategy/1f8ae1c1-2f60-57f0-a7ce-e8960b87395c/scratchpad'
m=ChatterboxMultilingualTTS.from_pretrained(device='cpu');sr=m.sr;wm=WhisperModel('small',device='cpu',compute_type='int8')
norm=lambda s:re.sub(r'[^a-z0-9 ]','',unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode())
txt='Con Iguana, recupera tus horas.'
best=None
for k,(ex,cfg) in enumerate([(.7,.3),(.75,.3),(.65,.35),(.8,.3)]):
    torch.manual_seed(500+k);w=m.generate(txt,language_id='es',audio_prompt_path=X+'/v10/voz24.wav',exaggeration=ex,cfg_weight=cfg).squeeze().numpy()
    sf.write('/tmp/_r3.wav',w,sr);tr=norm(' '.join(s.text for s in wm.transcribe('/tmp/_r3.wav',language='es')[0]));ok=all(a in tr for a in ['iguana','recupera','horas'])
    a=np.abs(w);idx=np.where(a>.01)[0];d=(idx[-1]-idx[0])/sr
    print(k,ok,round(d,2),tr,flush=True)
    if ok and (best is None or d<best[0]):best=(d,w)
if best:sf.write(X+'/v10/clip_s9a_new.wav',best[1],sr);print('picked',round(best[0],2))
print('DONE')
