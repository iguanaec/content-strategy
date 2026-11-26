import json,re,unicodedata,difflib
from faster_whisper import WhisperModel
X='/tmp/claude-0/-home-user-content-strategy/1f8ae1c1-2f60-57f0-a7ce-e8960b87395c/scratchpad'
m=WhisperModel('small',device='cpu',compute_type='int8')
segs,_=m.transcribe(X+'/v10/voice6_raw.wav',language='es',word_timestamps=True)
W=[{'w':w.word.strip(),'s':w.start,'e':w.end} for s in segs for w in s.words]
json.dump(W,open('whisper_raw.json','w'),ensure_ascii=False)
nrm=lambda z:re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFD',z.lower()).encode('ascii','ignore').decode())
EXP={'22':['veintidos'],'%':['por','ciento'],'10':['diez'],'11':['once'],'80':['ochenta'],'4':['cuatro'],'6':['seis'],'free':['fri'],'day':['day']}
tl=json.load(open('timeline6_nowords.json'))
for c in tl['clauses']:
    sw=c['text'].split();sn=[nrm(x) for x in sw]
    # script 'Friday' -> split to match 'free'+'day'
    cand=[w for w in W if c['start']-.12<=(w['s']+w['e'])/2<=c['start']+c['dur']+.12]
    ww=[];
    for w in cand:
        k=nrm(w['w'])
        ex=EXP.get(k,[k])
        d=(w['e']-w['s'])/len(ex)
        for i,e in enumerate(ex):ww.append({'k':e,'s':w['s']+i*d,'e':w['s']+(i+1)*d})
    wk=[x['k'] for x in ww]
    # merge 'fri'+'day' with script friday
    sm=difflib.SequenceMatcher(None,sn,wk,autojunk=False);tm=[None]*len(sn)
    for a,b,n in sm.get_matching_blocks():
        for i in range(n):tm[a+i]=(ww[b+i]['s'],ww[b+i]['e'])
    # fuzzy: unmatched script word vs unmatched whisper word with same first 3 letters
    used={id(x) for x in []}
    for i,t in enumerate(tm):
        if t is None:
            for x in ww:
                if x['k'][:3]==sn[i][:3] and all(tm[j] is None or abs(tm[j][0]-x['s'])>.01 for j in range(len(sn))):tm[i]=(x['s'],x['e']);break
    # interpolate missing
    lo=c['start'];hi=c['start']+c['dur']
    for i in range(len(sn)):
        if tm[i] is None:
            p=i-1
            while p>=0 and tm[p] is None:p-=1
            q=i+1
            while q<len(sn) and tm[q] is None:q+=1
            t0=tm[p][1] if p>=0 else lo;t1=tm[q][0] if q<len(sn) else hi
            cnt=(q-p-1);k=i-p-1;d=(t1-t0)/cnt if cnt else 0
            tm[i]=(t0+k*d,t0+(k+1)*d)
    c['words']=[{'w':sw[i],'s':round(tm[i][0],3),'e':round(tm[i][1],3)} for i in range(len(sw))]
    print(c['id'],[(x['w'],x['s']) for x in c['words']][:14])
json.dump(tl,open('timeline6.json','w'),ensure_ascii=False,indent=1)
