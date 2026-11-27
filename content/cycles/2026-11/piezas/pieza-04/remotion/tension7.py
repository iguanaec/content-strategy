import numpy as np,soundfile as sf
def make(path,dur,sr=48000):
    n=int(dur*sr);t=np.arange(n)/sr;r=t/dur;rng=np.random.default_rng(7)
    env=lambda a,b:a+(b-a)*r**1.6
    # drone grave disonante (segunda menor) que sube lentamente de tono
    f0=55*(1+.22*r)
    d=np.zeros(n)
    for f,a in [(f0,1),(f0*1.0595,.7),(f0*2.0,.35),(f0*3.01,.18)]:
        ph=2*np.pi*np.cumsum(f)/sr;d+=a*np.tanh(1.6*np.sin(ph))
    d*=env(.25,.8)*(1+.15*np.sin(2*np.pi*(.5+1.5*r)*t))
    # ruido filtrado que sube (viento tenso)
    nz=rng.standard_normal(n);k=int(sr/200);nz=np.convolve(nz,np.ones(k)/k,'same');nz-=np.convolve(nz,np.ones(int(sr/60))/int(sr/60),'same')
    nz*=env(.0,.5)*3
    # agudos disonantes con trémolo (cuerdas) solo en la segunda mitad
    hi=(np.sin(2*np.pi*987.8*t)+np.sin(2*np.pi*1046.5*t)*.9)*np.clip((r-.45)/.55,0,1)**2*(.5+.5*np.sin(2*np.pi*(5+7*r)*t))*.12
    # latidos que se aceleran (lub-dub)
    hb=np.zeros(n);tt=0.0
    while tt<dur-.15:
        bpm=70+70*(tt/dur)**1.3;per=60/bpm;amp=env(.35,1.0)[min(n-1,int(tt*sr))]
        for off,g in [(0,1),(.17*per/.857,.7)]:
            i=int((tt+off)*sr);L=int(.16*sr)
            if i+L<n:
                x=np.arange(L)/sr;hb[i:i+L]+=amp*g*np.sin(2*np.pi*(52-60*x)*x)*np.exp(-x*26)*1.4
        tt+=per
    y=d*.5+nz*.35+hi+hb*.9
    tail=int(.45*sr);y=np.concatenate([y,np.zeros(tail)])
    # cola: corte seco con caída corta
    k=n;y[k:k+tail]=y[k-1]*np.exp(-np.arange(tail)/sr*9)*0 ;y[:int(.6*sr)]*=np.linspace(0,1,int(.6*sr))
    y[n-int(.05*sr):n]*=np.linspace(1,0,int(.05*sr))
    y=y/np.abs(y).max()*.9
    sf.write(path,np.stack([y,y],1).astype(np.float32),sr,subtype='PCM_16')
    return len(y)/sr
