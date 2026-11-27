import json,numpy as np,soundfile as sf
TL=json.load(open('assets/timeline.json'));ST=TL['starts'];sr=44100
v,_=sf.read('assets/voice.wav');total=int(sr*(TL['total']+0.1))
y=np.zeros(total);y[:len(v)]+=v
rng=np.random.default_rng(3)
def add(t,s,g=1.0):
    i=int(t*sr);n=min(len(s),total-i)
    if n>0:y[i:i+n]+=s[:n]*g
def whoosh():
    n=int(.45*sr);x=rng.standard_normal(n);k=np.ones(40)/40
    x=np.convolve(x,k,'same');env=np.sin(np.linspace(0,np.pi,n))**2;return x*env*0.6
def thump():
    n=int(.35*sr);t=np.arange(n)/sr;return np.sin(2*np.pi*(90-60*t)*t)*np.exp(-t*12)*0.9
def ding():
    n=int(.8*sr);t=np.arange(n)/sr;return (np.sin(2*np.pi*1318*t)+.5*np.sin(2*np.pi*1975*t))*np.exp(-t*5)*0.4
def pop():
    n=int(.12*sr);t=np.arange(n)/sr;return np.sin(2*np.pi*(500+900*t*8)*t)*np.exp(-t*35)*0.5
for k in list(ST)[1:]:add(ST[k]-0.3,whoosh(),0.5)
for t in [ST['s2']+2.3,ST['s4']+2.4,ST['s5']+2.0,ST['s6']+0.45,ST['s9']+0.7]:add(t,thump(),0.55)
add(ST['s7']+3.5,ding(),0.6)
for t in [ST['s1']+1.5,ST['s2']+.45,ST['s2']+1.1,ST['s2']+3.6,ST['s7']+.4,ST['s7']+1.4]:add(t,pop(),0.4)
for i in range(8):add(ST['s3']+.1+i*.22,pop(),0.25)
y=y/max(1,np.abs(y).max())*0.92
sf.write('final_audio.wav',y,sr)
