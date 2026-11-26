import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Dani, CLIENT_A, CLIENT_B, MOM, KID, Expr} from './char/Dani';
import {Fonts} from './Fonts';

const Head: React.FC<{e: Expr; label: string}> = ({e, label}) => (
  <div style={{width: 230, textAlign: 'center'}}>
    <svg width={220} height={230} viewBox="-68 -612 136 142"><circle cx={0} cy={-535} r={66} fill="#E9FFD9" /><Dani expr={e} /></svg>
    <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 22, color: '#383838'}}>{label}</div>
  </div>
);
const Full: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
  <div style={{width: 300, textAlign: 'center'}}>
    <svg width={300} height={430} viewBox="-150 -610 300 630"><circle cx={0} cy={-300} r={250} fill="#E9FFD9" />{children}</svg>
    <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 22, color: '#383838'}}>{label}</div>
  </div>
);
export const Sheet: React.FC = () => (
  <AbsoluteFill style={{background: '#F8F8F6', padding: 40}}>
    <Fonts />
    <div style={{fontFamily: 'Anton', fontSize: 64, color: '#383838', letterSpacing: 1}}>DANI <span style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 26, color: '#39713E'}}>· dueño-operador de un micronegocio</span></div>
    <div style={{display: 'flex', gap: 10, marginTop: 4}}>
      <Full label="reposo"><Dani expr="happy" /></Full>
      <Full label="atiende (celular)"><Dani expr="worry" hr={[28, -372]} holdR="phone" hl={[-30, -368]} handL="point" /></Full>
      <Full label="saluda"><Dani expr="grin" hr={[118, -560]} handR="open" look={[0.3, 0]} /></Full>
      <Full label="abrumado"><Dani expr="panic" hl={[-36, -556]} hr={[36, -556]} handL="open" handR="open" /></Full>
      <Full label="entrega pedido"><Dani expr="calm" hl={[150, -380]} holdL="bag" hr={[70, -300]} handR="fist" /></Full>
    </div>
    <div style={{display: 'flex', flexWrap: 'wrap', marginTop: 0}}>
      {(['happy', 'grin', 'worry', 'panic', 'sad', 'surprise'] as Expr[]).map((e) => <Head key={e} e={e} label={e} />)}
      {[[CLIENT_A, 'curly'], [CLIENT_B, 'spiky'], [MOM, 'bun'], [KID, 'short']].map(([p, h], i) => (
        <svg key={i} width={118} height={250} viewBox="-90 -610 180 630"><Dani pal={p as any} hair={h as any} expr="happy" /></svg>
      ))}
    </div>
  </AbsoluteFill>
);
