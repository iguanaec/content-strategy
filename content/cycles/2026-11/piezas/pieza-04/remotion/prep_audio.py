import json,os,shutil,numpy as np,soundfile as sf,noisereduce as nr,pyloudnorm as pyln
from pedalboard import Pedalboard,HighpassFilter,PeakFilter,HighShelfFilter,LowShelfFilter,Compressor,Limiter,Gain
X='/tmp/claude-0/-home-user-content-strategy/1f8ae1c1-2f60-57f0-a7ce-e8960b87395c/scratchpad'
OUT=X+'/rem/public'
# ---- 1) voice cleanup
v,sr=sf.read(X+'/vs/audio/voice.wav');v=v.astype(np.float32)
v=nr.reduce_noise(y=v,sr=sr,stationary=True,prop_decrease=0.6)
board=Pedalboard([HighpassFilter(85),LowShelfFilter(cutoff_frequency_hz=180,gain_db=-1.5),PeakFilter(cutoff_frequency_hz=300,gain_db=-2.5,q=1.0),
 PeakFilter(cutoff_frequency_hz=3200,gain_db=2.5,q=0.9),PeakFilter(cutoff_frequency_hz=6800,gain_db=-2.0,q=2.5),HighShelfFilter(cutoff_frequency_hz=10000,gain_db=1.5),
 Compressor(threshold_db=-22,ratio=3,attack_ms=6,release_ms=90),Gain(3),Limiter(threshold_db=-2,release_ms=60)])
v=board(v,sr)
meter=pyln.Meter(sr);L=meter.integrated_loudness(v);v=pyln.normalize.loudness(v,L,-16.0);v=Pedalboard([Limiter(threshold_db=-1.5,release_ms=50)])(v.astype(np.float32),sr)
v=pyln.normalize.loudness(v,meter.integrated_loudness(v),-16.0)
print('voice LUFS before/after',round(L,1),round(meter.integrated_loudness(v),1),'peak dB',round(20*np.log10(np.abs(v).max()),2))
sf.write(OUT+'/voice_clean.wav',np.stack([v,v],1),sr,subtype='PCM_24')
# ---- 2) cue sheet
TL=json.load(open(X+'/m3d/assets/timeline.json'));SEG=json.load(open(X+'/m3d/assets/segs.json'));ST=TL['starts'];DU=TL['dur']
def at(k,w):s=SEG[k];i=s.find(w);return ST[k]+DU[k]*(max(i,0)/len(s))
kit=json.load(open(X+'/sfx/kit/sounds.json'));S={s['id']:s for s in kit['sounds']}
cues=[]
def cue(sid,t,vol=0.5,dur=None):
    s=S[sid];start=max(0,t-s['sync']['at']);fn=os.path.basename(s['file'])
    if not os.path.exists(OUT+'/sfx/'+fn):shutil.copy(X+'/sfx/kit/'+s['file'],OUT+'/sfx/'+fn)
    cues.append({'id':sid,'file':'sfx/'+fn,'start':round(start,3),'vol':vol,'dur':dur or s['duration']})
ks=list(ST)
# transitions (wipe peak ~ scene start)
for i,k in enumerate(ks[1:]):cue(['whoosh-fast-medium','whoosh-medium-medium','swish-medium'][i%3],ST[k]-0.04,0.42)
# s1
cue('pop-medium-in',ST['s1']+0.3,0.45);cue('writing-highlighter',ST['s1']+0.02,0.35)
cue('click-snap-soft',at('s1','noviembre'),0.35);cue('riser-1s-soft',at('s1','veintidós'),0.28)
cue('impact-medium-hard',at('s1','veintidós'),0.5);cue('bass-808-short',at('s1','veintidós'),0.35);cue('swish-soft',at('s1','ventas'),0.3)
# s2
cue('pop-small-in',ST['s2']+0.05,0.4);cue('props-shop-bell',ST['s2']+0.6,0.3);cue('writing-highlighter',at('s2','pequeño'),0.32)
cue('cinematic-slam-big',at('s2','Black'),0.45);cue('boom-hit-medium',at('s2','Black'),0.3);cue('pop-large-in',at('s2','Black')+0.05,0.35);cue('swish-soft',at('s2','lanza'),0.3)
# s3
t10=at('s3','diez');t80=at('s3','ochenta')
cue('phone-vibrate-hand',at('s3','un mensaje'),0.32);cue('notification-message-in-soft',at('s3','un mensaje'),0.42)
for j,dt in enumerate([0,0.2,0.4]):cue('pop-small-bubble',t10+dt,0.35)
cue('notification-message-in-clear',t10,0.32);cue('click-snap-soft',at('s3','once'),0.3)
cue('riser-1s-strong',t80,0.3);cue('impact-heavy-hard',t80,0.5);cue('bass-sub-drop-short',t80,0.42);cue('phone-vibrate-table',t80+0.05,0.32)
cue('pop-medium-bubble',t80+0.02,0.3);cue('pop-small-bubble',t80+0.14,0.3)
# s4
cue('writing-highlighter',ST['s4']+0.02,0.3);cue('foley-plastic-touch',ST['s4']+0.5,0.35)
for dt in [1.0,1.7,2.4]:cue('notification-message-in-soft',ST['s4']+dt,0.25)
cue('impact-deep-hard',at('s4','cuatro'),0.5);cue('time-clock-fast',at('s4','cuatro')+0.1,0.22);cue('swish-soft',at('s4','pegado'),0.28)
# s5
cue('notification-message-in-clear',ST['s5']+0.02,0.4);cue('time-clock',at('s5','Esperó'),0.22)
cue('notification-failure-low',at('s5','Nadie'),0.42);cue('impact-deep-soft',at('s5','Nadie'),0.4);cue('whoosh-slow-soft',at('s5','se fue')+0.2,0.3);cue('faller-1s-soft',at('s5','se fue')+0.9,0.22)
# s6
cue('time-clock',ST['s6'],0.3);cue('impact-light-firm',ST['s6']+0.35,0.35)
# s7
cue('shimmer-medium-bright',ST['s7']+0.02,0.32);cue('pop-medium-in',ST['s7']+0.02,0.38);cue('notification-message-in-clear',ST['s7']+0.25,0.38)
cue('zip-in-medium',at('s7','instante'),0.3);cue('notification-success-chime',at('s7','agendada'),0.45);cue('pop-medium-bubble',at('s7','agendada'),0.3);cue('click-toggle-firm' if 'click-toggle-firm' in S else 'click-tap-firm',at('s7','agendada')+0.25,0.3)
# s8
cue('foley-paper-touch',ST['s8']+0.4,0.35);cue('writing-highlighter',ST['s8']+0.02,0.3);cue('click-snap-soft',at('s8','seis'),0.32)
cue('shimmer-short-sparkle',at('s8','familia'),0.3)
for j in range(3):cue('pop-small-in',at('s8','seis')+0.9+j*0.25,0.28)
# s9
cue('sting-warm-short',ST['s9']+0.02,0.42);cue('writing-highlighter',ST['s9']+0.25,0.3);cue('pop-large-in',at('s9','Agenda'),0.38)
json.dump({'fps':30,'total':TL['total'],'speech':[[ST[k],ST[k]+DU[k]] for k in ks],'cues':cues},open(OUT+'/cues.json','w'),indent=1)
print(len(cues),'cues')
