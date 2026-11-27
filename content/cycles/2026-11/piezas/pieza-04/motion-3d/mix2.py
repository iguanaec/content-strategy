import json,numpy as np,soundfile as sf
TL=json.load(open('assets/timeline.json'));SEG=json.load(open('assets/segs.json'));ST=TL['starts'];DU=TL['dur'];sr=44100
def at(k,w):s=SEG[k];i=s.find(w);return ST[k]+DU[k]*(max(i,0)/len(s))
v,_=sf.read('assets/voice.wav');total=int(sr*(TL['total']+0.1));y=np.zeros(total);y[:len(v)]+=v
rng=np.random.default_rng(3)
def add(t,s,g):
    i=int(t*sr);n=min(len(s),total-i)
    if n>0 and i>=0:y[i:i+n]+=s[:n]*g
n=lambda d:int(d*sr)
def whoosh():x=np.convolve(rng.standard_normal(n(.4)),np.ones(40)/40,'same');return x*np.sin(np.linspace(0,np.pi,len(x)))**2*.6
def thump():t=np.arange(n(.35))/sr;return np.sin(2*np.pi*(90-60*t)*t)*np.exp(-t*12)
def ding():t=np.arange(n(.8))/sr;return (np.sin(2*np.pi*1318*t)+.5*np.sin(2*np.pi*1975*t))*np.exp(-t*5)*.4
def pop():t=np.arange(n(.12))/sr;return np.sin(2*np.pi*(500+7200*t)*t)*np.exp(-t*35)*.5
for k in list(ST)[1:]:add(ST[k]-.28,whoosh(),.5)
for t in [at('s1','veintidós'),at('s2','Black'),at('s3','ochenta'),at('s4','cuatro'),at('s5','Nadie')]:add(t,thump(),.55)
add(at('s7','agendada'),ding(),.6)
t10=at('s3','diez');t80=at('s3','ochenta')
for t in [at('s3','un mensaje'),t10,t10+.2,t80,t80+.12,at('s7','Iguana')+.25]:add(t,pop(),.35)
y=y/max(1,np.abs(y).max())*.92;sf.write('final_audio2.wav',y,sr)
