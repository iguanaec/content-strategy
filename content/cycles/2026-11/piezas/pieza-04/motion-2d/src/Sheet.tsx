import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Dani, DANI, CLIENT_A, CLIENT_B, MOM, KID, Expr} from './char/Dani';
import {Fonts} from './Fonts';

const Head: React.FC<{e: Expr; label: string; look?: [number, number]}> = ({e, label, look}) => (
  <div style={{width: 230, textAlign: 'center'}}>
    <svg width={225} height={240} viewBox="-140 -640 280 300"><circle cx={0} cy={-480} r={140} fill="#E9FFD9" /><Dani expr={e} look={look} /></svg>
    <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 22, color: '#383838', marginTop: -6}}>{label}</div>
  </div>
);
const Full: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
  <div style={{width: 300, textAlign: 'center'}}>
    <svg width={300} height={420} viewBox="-190 -640 380 680"><circle cx={0} cy={-300} r={230} fill="#E9FFD9" />{children}</svg>
    <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 22, color: '#383838'}}>{label}</div>
  </div>
);
export const Sheet: React.FC = () => (
  <AbsoluteFill style={{background: '#F8F8F6', padding: 40}}>
    <Fonts />
    <div style={{fontFamily: 'Anton', fontSize: 64, color: '#383838', letterSpacing: 1}}>DANI <span style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 26, color: '#39713E'}}>· dueño-operador de un micronegocio</span></div>
    <div style={{display: 'flex', gap: 14, marginTop: 8}}>
      <Full label="reposo"><Dani expr="happy" /></Full>
      <Full label="atiende (celular en mano)"><Dani expr="worry" hr={[40, -262]} holdR="phone" holdRot={[0, 0]} hl={[-40, -250]} /></Full>
      <Full label="saluda"><Dani expr="grin" hr={[150, -500]} look={[0.3, 0]} /></Full>
      <Full label="abrumado"><Dani expr="panic" hl={[-76, -520]} hr={[76, -520]} /></Full>
      <Full label="tranquilo"><Dani expr="calm" hl={[-118, -250]} hr={[118, -250]} /></Full>
    </div>
    <div style={{display: 'flex', flexWrap: 'wrap', marginTop: 0}}>
      {(['happy', 'grin', 'worry', 'panic', 'sad', 'surprise'] as Expr[]).map((e) => <Head key={e} e={e} label={e} />)}
    </div>
    <div style={{display: 'flex', gap: 6, position: 'absolute', right: 20, top: 640}}>
      {[[CLIENT_A, 'curly'], [CLIENT_B, 'spiky'], [MOM, 'bun'], [KID, 'quiff']].map(([p, h], i) => (
        <svg key={i} width={120} height={250} viewBox="-150 -640 300 680"><Dani pal={p as any} hair={h as any} expr="happy" /></svg>
      ))}
    </div>
  </AbsoluteFill>
);
