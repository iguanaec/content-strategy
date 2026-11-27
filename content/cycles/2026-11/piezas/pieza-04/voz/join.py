import json,numpy as np,soundfile as sf
d=json.load(open('audio/F3_dur.json'));gap=0.15;t=0.25;starts={};parts=[np.zeros(int(44100*t))]
sr=44100
for k in sorted(d):
    w,s=sf.read(f'audio/F3_{k}.wav');assert s==sr
    starts[k]=round(t,3);parts.append(w);t+=len(w)/sr
    parts.append(np.zeros(int(sr*gap)));t+=gap
tail=np.zeros(int(sr*0.8));parts.append(tail);t+=0.8
y=np.concatenate(parts);y=y/ max(1e-6,np.abs(y).max())*0.9
sf.write('audio/voice.wav',y,sr)
json.dump({'starts':starts,'dur':d,'total':round(t,3)},open('audio/timeline.json','w'))
print(json.dumps({'starts':starts,'total':round(t,2)}))
