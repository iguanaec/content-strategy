# tighten internal pauses of each clause (natural punctuation pauses kept short) and rebuild timeline
import json,numpy as np,soundfile as sf,sys
X='/tmp/claude-0/-home-user-content-strategy/1f8ae1c1-2f60-57f0-a7ce-e8960b87395c/scratchpad'
y,sr=sf.read(X+'/vs/audio/voice4.wav');TL=json.load(open(X+'/vs/audio/timeline4.json'))
MAXP=float(sys.argv[1]) if len(sys.argv)>1 else .24
SPD=float(sys.argv[2]) if len(sys.argv)>2 else 1.0
from pedalboard import time_stretch
def tighten(w):
    fr=int(.01*sr);n=len(w)//fr;e=np.array([np.sqrt((w[i*fr:(i+1)*fr]**2).mean()) for i in range(n)]);th=max(.006,e.max()*.03);sil=e<th
    keep=[];i=0
    while i<n:
        j=i
        while j<n and sil[j]==sil[i]:j+=1
        L=j-i
        if sil[i] and L*fr>MAXP*sr and i>0 and j<n:
            k=int(MAXP*sr/fr);a=i+k//2;b=j-(k-k//2);keep.append((i,a));keep.append((b,j))
        else:keep.append((i,j))
        i=j
    out=np.concatenate([w[a*fr:b*fr] for a,b in keep]+[w[n*fr:]]);return out
parts=[np.zeros(int(.3*sr))];t=.3;out=[];prev=None
for c in TL['clauses']:
    w=y[int(c['start']*sr):int((c['start']+c['dur'])*sr)];w=tighten(w)
    if SPD!=1:w=time_stretch(w.astype(np.float32)[None,:],sr,stretch_factor=SPD,high_quality=True,transient_mode='mixed').squeeze()
    if prev is not None:
        gap=.45 if c['seg']!=prev else (.36 if c['text'].startswith('¿') or prev_txt.endswith('?') else .26)
        parts.append(np.zeros(int(gap*sr)));t+=gap
    out.append({**c,'start':round(t,3),'dur':round(len(w)/sr,3)});parts.append(w);t+=len(w)/sr;prev=c['seg'];prev_txt=c['text']
parts.append(np.zeros(int(1.6*sr)));t+=1.6
sf.write(X+'/vs/audio/voice4t.wav',np.concatenate(parts),sr);json.dump({'clauses':out,'total':round(t,3)},open(X+'/vs/audio/timeline4t.json','w'),ensure_ascii=False,indent=1)
print('before',TL['total'],'after',round(t,2));[print(c['id'],c['dur']) for c in out]
