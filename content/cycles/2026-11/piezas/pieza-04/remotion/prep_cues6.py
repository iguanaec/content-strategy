import json,os,shutil
X='/tmp/claude-0/-home-user-content-strategy/1f8ae1c1-2f60-57f0-a7ce-e8960b87395c/scratchpad'
OUT=X+'/rem/public'
# ---- 2) cue sheet (clause timeline)
TL=json.load(open(X+'/v10/timeline6.json'));CLs={c['id']:c for c in TL['clauses']}
C=lambda i:CLs[i]['start']
import unicodedata,re
nrm=lambda z:re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFD',z.lower()).encode('ascii','ignore').decode())
def at(i,w):
    c=CLs[i];k=nrm(w)
    for x in c.get('words',[]):
        if nrm(x['w']).startswith(k):return x['s']
    j=c['text'].lower().find(w.lower());return c['start']+c['dur']*(max(j,0)/len(c['text']))
seg0=lambda s:[c for c in TL['clauses'] if c['seg']==s][0]['start']
kit=json.load(open(X+'/sfx/kit/sounds.json'));S={s['id']:s for s in kit['sounds']}
for f in os.listdir(OUT+'/sfx'):os.remove(OUT+'/sfx/'+f)
cues=[]
def cue(sid,t,vol=0.5):
    s=S[sid];start=max(0,t-s['sync']['at']);fn=os.path.basename(s['file'])
    if not os.path.exists(OUT+'/sfx/'+fn):shutil.copy(X+'/sfx/kit/'+s['file'],OUT+'/sfx/'+fn)
    cues.append({'id':sid,'file':'sfx/'+fn,'start':round(start,3),'vol':vol,'dur':s['duration']})
for i,sg in enumerate(['s2','s3','s4','s5','s6','s7','s8']):cue(['whoosh-fast-medium','whoosh-medium-medium','swish-medium'][i%3],seg0(sg)-0.04,0.42)
cut=lambda t:cue('swish-soft',t,0.22)
cue('writing-highlighter',C('s1a')+.02,.32);cue('pop-medium-in',C('s1a')+.05,.4);cue('pop-medium-in',C('s1a')+.3,.35);cue('click-snap-soft',at('s1a','noviembre'),.3)
cue('riser-1s-soft',at('s1a','veintidós'),.28);cue('impact-medium-hard',at('s1a','veintidós'),.5);cue('bass-808-short',at('s1a','veintidós'),.35);cue('swish-soft',at('s1a','veintidós')+.1,.25)
cue('props-shop-bell',C('s2a')+.35,.3);cue('pop-small-in',C('s2a')+.02,.38);cue('writing-highlighter',at('s2a','pequeño'),.3)
cut(C('s2b'));cue('cinematic-slam-big',at('s2b','Black'),.42);cue('boom-hit-medium',at('s2b','Black'),.28);cue('whoosh-fast-soft',at('s2b','y lanza'),.3);cue('pop-large-in',at('s2b','y lanza')+.05,.32)
cue('phone-vibrate-table',C('s3a'),.4);cue('notification-message-in-soft',C('s3a')+.05,.42)
cut(C('s3b'));cue('phone-vibrate-table',C('s3b'),.42)
for d in [.12,.32]:cue('pop-medium-bubble',C('s3b')+d,.26)
cut(C('s3c'));cue('click-snap-soft',at('s3c','once'),.28)
t80=at('s3c','ochenta');cue('riser-1s-strong',t80,.28);cue('impact-heavy-hard',t80,.5);cue('bass-sub-drop-short',t80,.42)
cue('whoosh-fast-medium',t80+.9,.32);cue('phone-vibrate-hand',t80+.9,.3)
for d in [0,.1,.2,.3]:cue('pop-small-bubble',t80+.9+d,.3)
cue('writing-highlighter',C('s4a')+.02,.3);cue('foley-plastic-touch',C('s4a')+.4,.35);cut(at('s4a','y contesta'));cue('phone-keypad',at('s4a','y contesta')+.15,.25)
cut(C('s4b'));cue('impact-deep-hard',at('s4b','cuatro'),.5);cue('time-clock-fast',at('s4b','cuatro')+.1,.2)
cue('phone-keypad',C('s5a')+.1,.25);cue('pop-medium-bubble',C('s5a')+.75,.3)
cut(C('s5b'));cue('time-clock',C('s5b'),.22);cue('notification-failure-low',at('s5b','pero'),.42);cue('impact-deep-soft',at('s5b','pero'),.38)
cut(C('s5c'));cue('whoosh-slow-soft',C('s5c')+.2,.28);cue('faller-1s-soft',C('s5c')+.9,.2)
cue('time-clock',C('s6a'),.26);cue('impact-light-firm',at('s6a','una hora'),.32)
cue('shimmer-medium-bright',C('s7a')+.02,.3);cue('pop-medium-in',C('s7a')+.15,.36);cue('notification-message-in-clear',C('s7a')+.35,.34);cue('notification-message-in-soft',C('s7a')+1.15,.3);cue('notification-message-in-clear',C('s7a')+1.9,.3);cue('notification-message-in-soft',C('s7a')+2.6,.26)
cue('zip-in-medium',at('s7a','al instante'),.28);cut(at('s7a','y la cita'));cue('notification-success-chime',at('s7a','y la cita')+.05,.45);cue('pop-medium-bubble',at('s7a','y la cita')+.05,.3);cue('click-tap-firm',at('s7a','y la cita')+.4,.28)
cue('writing-highlighter',C('s8a')+.02,.3);cue('foley-paper-touch',C('s8a')+.35,.33);cut(C('s8b'));cue('time-alarm',C('s8b')+.25,.16)
cue('whoosh-medium-soft',at('s8b','llega'),.3);cue('shimmer-short-sparkle',at('s8b','familia'),.3)
for d in [.9,1.1,1.3]:cue('pop-small-in',at('s8b','llega')+d,.26)
cue('whoosh-medium-soft',at('s9a','recupera')-.25,.3);cue('sting-warm-short',at('s9a','recupera')-.05,.42);cue('writing-highlighter',at('s9a','recupera')+.2,.3);cue('pop-large-in',at('s9a','horas')+.12,.38)
json.dump({'fps':30,'total':TL['total'],'cues':cues},open(OUT+'/cues.json','w'),indent=1)
print(len(cues),'cues')

