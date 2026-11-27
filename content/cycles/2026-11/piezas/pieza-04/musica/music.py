import json,sys,numpy as np,soundfile as sf
from pedalboard import Pedalboard,Reverb,LowpassFilter,HighpassFilter,Compressor,Chorus,Gain,Limiter,Delay
SR=44100;rng=np.random.default_rng(7)
TL=json.load(open(sys.argv[1]));OUT=sys.argv[2]
CL={c['id']:c for c in TL['clauses']};DUR=TL['total']+0.6
seg0=lambda s:min(c['start'] for c in TL['clauses'] if c['seg']==s)
SEGS=['s1','s2','s3','s4','s5','s6','s7','s8','s9'];B={s:seg0(s) for s in SEGS}
N=int(DUR*SR);BPM=104;beat=60/BPM;s16=beat/4
bus={k:np.zeros(N) for k in ['drums','bass','keys','pluck','pad','fx']}
def add(k,t,x,g=1.0):
    i=int(t*SR)
    if i>=N or i+len(x)<=0:return
    j=min(N,i+len(x));bus[k][max(i,0):j]+=g*x[max(0,-i):j-i]
mid=lambda m:440*2**((m-69)/12)
def env(n,a=.005,d=.2,sus=0.,r=.05,L=None):
    t=np.arange(n)/SR;e=np.minimum(1,t/max(a,1e-4))*((1-sus)*np.exp(-np.maximum(0,t-a)/d)+sus)
    rl=max(1,min(n,int(r*SR)));e[-rl:]*=np.linspace(1,0,rl);return e
def kick():
    n=int(.45*SR);t=np.arange(n)/SR;f=45+80*np.exp(-t*28);ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t*7)+.3*np.exp(-t*300)*rng.standard_normal(n)*.3
def clap():
    n=int(.25*SR);t=np.arange(n)/SR;x=rng.standard_normal(n);e=np.exp(-t*22)
    for d in [.0,.011,.022]:e+=np.where(t>d,np.exp(-(t-d)*90),0)*.6
    return np.convolve(x*e,[1,-1],'same')*.5
def hat(o=False):
    n=int((.18 if o else .05)*SR);t=np.arange(n)/SR;x=np.diff(rng.standard_normal(n+1));return x*np.exp(-t*(18 if o else 70))*.35
def ks(f,dur=1.2,b=.996):
    n=int(dur*SR);p=max(2,int(SR/f));buf=rng.uniform(-1,1,p);out=np.zeros(n)
    for i in range(n):
        out[i]=buf[i%p];buf[i%p]=b*.5*(buf[i%p]+buf[(i+1)%p])
    return out*env(n,.001,dur*.5,0,.05)
def saw(f,n,det=0):
    t=np.arange(n)/SR;return sum(2*((t*f*(1+d))%1)-1 for d in [-det,0,det])/3
def bassn(m,dur):
    n=int(dur*SR);t=np.arange(n)/SR;f=mid(m);x=np.sin(2*np.pi*f*t)+.35*np.sin(4*np.pi*f*t)+.15*saw(f,n);return x*env(n,.004,dur*.8,.6,.03)
def bell(m,dur=1.5):
    n=int(dur*SR);t=np.arange(n)/SR;f=mid(m);x=np.sin(2*np.pi*f*t+2.2*np.exp(-t*4)*np.sin(2*np.pi*f*3.5*t));return x*env(n,.002,.5,0,.1)
def padc(ms,dur,det=.006):
    n=int(dur*SR);x=sum(saw(mid(m),n,det) for m in ms)/len(ms);return x*env(n,.35,9,1,.4)
CH={'Am':[57,60,64],'F':[53,57,60],'C':[48,52,55],'G':[55,59,62],'Dm':[50,53,57],'E':[52,56,59],'Em':[52,55,59]}
ROOT={'Am':45,'F':41,'C':36,'G':43,'Dm':38,'E':40,'Em':40}
def section(t0,t1,prog,style):
    bar=beat*4;t=t0;k=0
    while t<t1-0.05:
        c=prog[k%len(prog)];bl=min(bar,t1-t)
        if style in('hook','sad','q'):
            add('pad',t,padc([m+12 for m in CH[c]],bl+.3),.16 if style!='q' else .1)
        if style=='hook':
            for i,st in enumerate([0,2,3,5,6,8,10,12,14]):
                if t+st*s16<t1:add('pluck',t+st*s16,ks(mid(CH[c][i%3]+24),.7),.22)
        if style=='sad':
            for st in [0,6]:
                if t+st*beat/2<t1:add('keys',t+st*beat/2,bell(CH[c][(st//2)%3]+12,2.0),.15)
        if style in('groove','chaos','bright','calm'):
            dens=4 if style in('groove','calm') else 8
            for b in range(4):
                tb=t+b*beat
                if tb>=t1:break
                if style!='calm' or b%2==0:add('drums',tb,kick(),.9)
                if b%2==1:add('drums',tb,clap(),.5 if style!='calm' else .3)
                for h in range(dens//2 if dens==4 else 4):
                    th=tb+h*(beat/(2 if dens==4 else 4))
                    if th<t1:add('drums',th,hat(),.35 if h%2 else .5)
                if style=='chaos':
                    for e in range(2):
                        te=tb+e*beat/2
                        if te<t1:add('bass',te,bassn(ROOT[c],beat/2*.9),.55)
                else:
                    for e in [0,1.5,2.5] if style!='calm' else [0,2]:
                        te=tb+e*beat/2
                        if te<t1 and b%2==0:add('bass',te,bassn(ROOT[c],beat*.7),.5)
            if style in('groove','bright','calm'):
                for i,st in enumerate([0,3,6,8,11,14] if style!='calm' else [0,4,8,12]):
                    if t+st*s16<t1:add('pluck',t+st*s16,ks(mid(CH[c][i%3]+24),.6),.18)
                add('keys',t,padc([m+12 for m in CH[c]],bl,0.003),.07)
            if style=='bright':
                for st in [0,6,10]:
                    if t+st*s16<t1:add('fx',t+st*s16,bell(CH[c][st%3]+36,.8),.05)
            if style=='chaos':add('pad',t,padc([m+12 for m in CH[c]],bl+.2,.012),.08)
        t+=bar;k+=1
section(0,B['s2'],['Am','F','C','G'],'hook')
section(B['s2'],B['s3'],['C','G','Am','F'],'groove')
section(B['s3'],B['s5'],['Am','F','Dm','E'],'chaos')
section(B['s5'],B['s6'],['Am','Em','F','E'],'sad')
section(B['s6'],B['s7'],['F'],'q')
section(B['s7'],B['s8'],['C','G','Am','F'],'bright')
section(B['s8'],B['s9'],['F','G','C','C'],'calm')
# riser into 80 and drop at end
t80=None
for c in TL['clauses']:
    if c['id']=='s3c':t80=c['start']+c['dur']*(c['text'].find('ochenta')/len(c['text']))
n=int(1.2*SR);tt=np.arange(n)/SR;rs=rng.standard_normal(n)*np.linspace(0,1,n)**2;add('fx',t80-1.2,rs,.12);add('drums',t80,kick(),1.2)
# ending: final chord hit + tail
te=B['s9'];add('drums',te,kick(),1.0);add('pad',te,padc([60,64,67,72],DUR-te,.006),.2);add('pluck',te,ks(mid(72),2.5,.998),.3);add('fx',te+.05,bell(84,3),.08)
P={'drums':Pedalboard([HighpassFilter(30),Compressor(-14,4,2,80)]),'bass':Pedalboard([LowpassFilter(900),Compressor(-18,3)]),'keys':Pedalboard([Chorus(),LowpassFilter(3500),Reverb(.5,.6,.25,.8)]),
'pluck':Pedalboard([HighpassFilter(200),Delay(beat*.75,.25,.18),Reverb(.4,.5,.2,.85)]),'pad':Pedalboard([LowpassFilter(2200),Chorus(),Reverb(.8,.7,.35,.7)]),'fx':Pedalboard([HighpassFilter(500),Reverb(.7,.6,.35,.7)])}
mix=sum(P[k](bus[k].astype(np.float32),SR) for k in bus)
# mid-section emphasis: duck slightly at s6 question start
m=Pedalboard([Compressor(-12,2.5,10,200),Limiter(-1)])(mix.astype(np.float32),SR)
fo=int(1.2*SR);m[-fo:]*=np.linspace(1,0,fo);m[:int(.05*SR)]*=np.linspace(0,1,int(.05*SR))
m=m/np.abs(m).max()*.89;sf.write(OUT,np.stack([m,m],1),SR);print('music',round(DUR,2))
