import json,numpy as np,soundfile as sf,noisereduce as nr,pyloudnorm as pyln
from pedalboard import Pedalboard,HighpassFilter,PeakFilter,HighShelfFilter,LowShelfFilter,Compressor,Limiter,Gain
X='/tmp/claude-0/-home-user-content-strategy/1f8ae1c1-2f60-57f0-a7ce-e8960b87395c/scratchpad'
TL=json.load(open(X+'/vs/audio/timeline5.json'))['clauses']
sr=24000;meter=pyln.Meter(sr)
def tighten(w,maxp=.2):
    fr=int(.01*sr);n=len(w)//fr;e=np.array([np.sqrt((w[i*fr:(i+1)*fr]**2).mean()) for i in range(n)]);th=max(.004,e.max()*.025);sil=e<th
    keep=[];i=0
    while i<n:
        j=i
        while j<n and sil[j]==sil[i]:j+=1
        if sil[i] and (j-i)*fr>maxp*sr and i>0 and j<n:
            k=int(maxp*sr/fr);a=i+k//2;b=j-(k-k//2);keep+=[(i,a),(b,j)]
        else:keep.append((i,j))
        i=j
    return np.concatenate([w[a*fr:b*fr] for a,b in keep])
def prep(w,target=-23.0):
    w=np.asarray(w,dtype=np.float32)
    a=np.abs(w);idx=np.where(a>.01)[0];w=w[max(0,idx[0]-int(.04*sr)):min(len(w),idx[-1]+int(.12*sr))]
    w=tighten(w);L=meter.integrated_loudness(w);return pyln.normalize.loudness(w,L,target) if L>-60 else w
real,_=sf.read(X+'/v10/voz24.wav');real=real if real.ndim==1 else real.mean(1)
parts=[np.zeros(int(.12*sr))];t=.12;out=[];prev=None
for c in TL:
    if c['id']=='s1a':w=prep(real[:int(4.45*sr)])
    elif c['id']=='s4a':
        a1,_=sf.read(X+'/v10/clip_s4a1.wav');a2,_=sf.read(X+'/v10/clip_s4a2.wav');w=np.concatenate([prep(a1),np.zeros(int(.16*sr)),prep(a2)])
    else:
        w,_=sf.read(f"{X}/v10/clip_{c['id']}.wav");w=prep(w)
    if prev:
        g=.3 if c['seg']!=prev else .14;parts.append(np.zeros(int(g*sr)));t+=g
    out.append({'seg':c['seg'],'id':c['id'],'text':c['text'],'start':round(t,3),'dur':round(len(w)/sr,3)});parts.append(w);t+=len(w)/sr;prev=c['seg']
parts.append(np.zeros(int(1.2*sr)));t+=1.2
v=np.concatenate(parts).astype(np.float32)
sf.write(X+'/v10/voice6_raw.wav',v,sr)
json.dump({'clauses':out,'total':round(t,3)},open(X+'/v10/timeline6_nowords.json','w'),ensure_ascii=False,indent=1)
# limpieza + cadena de voz
v=nr.reduce_noise(y=v,sr=sr,stationary=True,prop_decrease=.3)
board=Pedalboard([HighpassFilter(70),LowShelfFilter(cutoff_frequency_hz=160,gain_db=-1),PeakFilter(cutoff_frequency_hz=3000,gain_db=2.0,q=.9),PeakFilter(cutoff_frequency_hz=6500,gain_db=-1.5,q=2.5),Compressor(threshold_db=-22,ratio=2.8,attack_ms=6,release_ms=90),Gain(3),Limiter(threshold_db=-2,release_ms=60)])
v=board(v,sr);L=meter.integrated_loudness(v);v=pyln.normalize.loudness(v,L,-16.0);v=Pedalboard([Limiter(threshold_db=-1.5,release_ms=50)])(v.astype(np.float32),sr);v=pyln.normalize.loudness(v,meter.integrated_loudness(v),-16.0)
sf.write(X+'/v10/voice_clean6.wav',np.stack([v,v],1),sr,subtype='PCM_24')
print('total',round(t,2),'peak',round(20*np.log10(np.abs(v).max()),1))
for c in out:print(c['id'],c['start'],c['dur'])
