import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Dani, DANI, CLIENT_A, CLIENT_B, MOM, KID} from './char/Dani';
import {Fonts} from './Fonts';
import TL from './timeline.json';
import cuesData from '../public/cues.json';
import {DISC, Floor, Disc, Shelf, Counter, WallClock, Hourglass, Bubble, Notif, PhoneBig, Bag, Heart, Table, Speed, LIME, GREEN, CHAR, PAPER, INK, clamp, lerp, eo, eio, pop} from './world';

const C = (id: string) => (TL.clauses.find((c) => c.id === id) as any).start as number;
const at = (id: string, w: string) => { const c = TL.clauses.find((x) => x.id === id) as any; const k = c.text.toLowerCase().indexOf(w.toLowerCase()); return c.start + c.dur * (Math.max(k, 0) / c.text.length); };
const segStart = (s: string) => Math.min(...TL.clauses.filter((c) => c.seg === s).map((c) => c.start));
const B = {s1: 0, s2: segStart('s2'), s2b: C('s2b'), s3: segStart('s3'), s3b: C('s3b'), s3c: C('s3c'), s4: segStart('s4'), s4b: C('s4b'), s5: segStart('s5'), s5b: C('s5b'), s5c: C('s5c'), s6: segStart('s6'), s7: segStart('s7'), s8: segStart('s8'), s8b: C('s8b'), s9: segStart('s9')};
const T80 = at('s3c', 'ochenta'), T_PERO = at('s5b', 'pero'), T_LLEGA = at('s8b', 'llega'), T_LANZA = at('s2b', 'lanza');
const BOUNDS = [B.s2, B.s2b, B.s3, B.s3b, B.s3c, T80, B.s4, B.s4b, B.s5, B.s5b, B.s5c, B.s6, B.s7, B.s8, B.s8b, T_LLEGA, B.s9];
const FY = 1470, DS = 1.45; // feet line + default character scale

type Cam = {s: number; cx: number; cy: number; rot: number};
const cam = (s = 1, cx = 540, cy = 960, rot = 0): Cam => ({s, cx, cy, rot});
const Backdrop: React.FC<{disc?: boolean; shelf?: boolean; counter?: boolean; floor?: boolean}> = ({disc = true, shelf = true, counter = false, floor = true}) => (
  <g>{disc && <Disc />}{shelf && <Shelf x={70} y={780} />}{floor && <Floor />}{counter && <Counter x={620} y={1230} />}</g>
);
const D: React.FC<any> = (p) => <Dani x={540} y={FY} scale={DS} {...p} />;

// ---- HUD (fixed, top safe band)
const Pill: React.FC<{x: number; label: string; value: string; good: boolean; k: number}> = ({x, label, value, good, k}) => (
  <g transform={`translate(${x} 262) scale(${1 + (1 - k) * 0.0})`}>
    <rect x={0} y={0} width={300} height={118} rx={26} fill={good ? LIME : '#2B2B2B'} stroke={INK} strokeWidth={6} />
    <text x={150} y={36} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={21} fill={good ? CHAR : '#C9D1C5'}>{label}</text>
    <text x={150} y={98} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={good ? CHAR : LIME} transform={`translate(0 ${-(1 - k) * 0}) scale(${k})`} style={{transformOrigin: '150px 80px'} as any}>{value}</text>
  </g>
);
const Hud: React.FC<{t: number}> = ({t}) => {
  if (t < B.s2 || t > B.s9) return null;
  const inS7 = t >= B.s7;
  const msgs = t < B.s3 ? 0 : t < B.s3b ? 1 : t < T80 ? (t < B.s3c ? 10 : Math.round(lerp(10, 47, clamp((t - B.s3c) / (T80 - B.s3c)))) ) : 80;
  const hrs = t < B.s4b ? 0 : Math.min(4, Math.floor(((t - B.s4b) / (B.s5 - B.s4b)) * 4.99));
  const lost = t < B.s5c ? 0 : 1;
  const down = clamp((t - (B.s7 + 0.9)) / 2.6);
  const left = inS7 ? Math.round(lerp(80, 0, eio(down))) : msgs;
  const booked = Math.round(lerp(0, 6, eio(clamp((t - (B.s7 + 1.4)) / 2.6))));
  const gain = t < B.s8 ? 0 : Math.min(4, Math.floor(((t - B.s8) / 2.4) * 4.99));
  const bump = (t0: number) => { const d = t - t0; return d >= 0 && d < 0.4 ? 1 + 0.25 * Math.sin((d / 0.4) * Math.PI) : 1; };
  const kL = inS7 ? 1 : Math.max(bump(B.s3), bump(B.s3b), bump(T80));
  const kM = inS7 ? bump(B.s8) : bump(B.s4b + 0.8);
  const kR = inS7 ? 1 : bump(B.s5c);
  const f = clamp((t - B.s2) / 0.4);
  return (
    <g transform={`translate(0 ${(1 - eo(f)) * -160})`}>
      <Pill x={60} label={inS7 ? 'SIN RESPONDER' : 'MENSAJES'} value={String(left)} good={inS7 && left < 20} k={kL} />
      <Pill x={390} label={t >= B.s8 ? 'HORAS GANADAS' : 'HORAS PERDIDAS'} value={t >= B.s8 ? `+${gain}` : `${hrs}h`} good={t >= B.s8} k={kM} />
      <Pill x={720} label={inS7 ? 'CITAS AGENDADAS' : 'CLIENTES PERDIDOS'} value={inS7 ? String(booked) : String(lost)} good={inS7} k={kR} />
    </g>
  );
};

// ---- scenes: return {cam, world}
const scene = (t: number): {cam: Cam; world: React.ReactNode; bg?: string} => {
  const lt = (a: number) => t - a;
  // S1 hook: NOV + DIC -> 22%
  if (t < B.s2) {
    const l = t, donut = clamp((l - 3.1) / 1.4), calOut = eio(clamp((l - 2.8) / 0.6));
    const cal = (x: number, m: string, d: number) => {
      const k = pop(l, d, 0.45);
      return (
        <g transform={`translate(${x} ${lerp(1000, 1000 - 40, 0)}) scale(${k * (1 - calOut * 0.45)}) translate(0 ${calOut * -230})`}>
          <rect x={-150} y={-160} width={300} height={320} rx={26} fill="#fff" stroke={INK} strokeWidth={8} />
          <path d="M -150 -134 a 26 26 0 0 1 26 -26 H 124 a 26 26 0 0 1 26 26 V -70 H -150 Z" fill={LIME} stroke={INK} strokeWidth={8} />
          <text x={0} y={-90} textAnchor="middle" fontFamily="Anton" fontSize={58} fill={CHAR}>{m}</text>
          {Array.from({length: 20}).map((_, i) => <circle key={i} cx={-100 + (i % 5) * 50} cy={-30 + Math.floor(i / 5) * 46} r={12} fill={i === 12 ? GREEN : '#E4E7DE'} />)}
        </g>
      );
    };
    const circ = 2 * Math.PI * 150;
    const k22 = pop(l, 4.2, 0.5);
    return {
      cam: cam(1 + clamp(l / 6.4) * 0.06),
      world: (
        <g>
          <Disc cy={1000} r={420} />
          {cal(340, 'NOV', 0.3)}{cal(740, 'DIC', 0.9)}
          {l > 3 && (
            <g transform={`translate(540 1000) scale(${eo(clamp((l - 3.1) / 0.6))})`}>
              <circle r={190} fill="#fff" stroke={INK} strokeWidth={8} />
              <circle r={150} fill="none" stroke="#E4E7DE" strokeWidth={70} />
              <circle r={150} fill="none" stroke={LIME} strokeWidth={70} strokeDasharray={`${circ * 0.22 * donut} ${circ}`} transform="rotate(-90)" />
              <circle r={186} fill="none" stroke={INK} strokeWidth={6} />
              <circle r={114} fill="none" stroke={INK} strokeWidth={6} />
              <text x={0} y={28} textAnchor="middle" fontFamily="Anton" fontSize={96} fill={CHAR} transform={`scale(${k22})`}>22%</text>
            </g>
          )}
          {l > 4.4 && <Bag x={240} y={1330} s={0.85 * pop(l, 4.5)} rot={-8} pct />}
          {l > 4.7 && <Bag x={850} y={1320} s={0.85 * pop(l, 4.8)} rot={9} c={GREEN} />}
          <Floor />
        </g>
      ),
    };
  }
  // S2a: Dani llega y saluda
  if (t < B.s2b) {
    const l = lt(B.s2), w = eo(l / 1.1), moving = l < 1.1;
    return {
      cam: cam(1, 540, 960),
      world: (<g><Backdrop counter />
        <D x={lerp(-160, 400, w)} walk={moving ? l * 9 : null} expr={moving ? 'happy' : 'grin'} hr={!moving ? [140 + Math.sin(l * 14) * 14, -480 + Math.sin(l * 14) * 18] : undefined} look={[0.4, 0]} />
      </g>),
    };
  }
  // S2b: Black Friday
  if (t < B.s3) {
    const l = lt(B.s2b), meg = t >= T_LANZA, ml = t - T_LANZA;
    const drop = pop(l, 0.35, 0.5);
    return {
      cam: cam(meg ? 1.1 : 1, meg ? 470 : 540, meg ? 1020 : 960, meg ? -2.5 + Math.sin(ml * 9) * 0.8 : 0),
      world: (<g><Backdrop counter />
        <g transform={`translate(540 ${lerp(300, 500, drop)}) rotate(${(1 - drop) * -6})`}>
          <path d="M -400 -62 H 400 L 370 0 L 400 62 H -400 L -370 0 Z" fill={LIME} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <text x={0} y={30} textAnchor="middle" fontFamily="Anton" fontSize={96} fill={CHAR} letterSpacing={4}>BLACK FRIDAY</text>
        </g>
        <D x={400} expr={meg ? 'grin' : l < 0.8 ? 'surprise' : 'happy'} hr={meg ? [118, -440] : undefined} holdR={meg ? 'mega' : null} holdRot={[0, -6]} hl={meg ? [-130, -300] : undefined} look={[0.3, 0]} />
        {meg && [0, 1, 2].map((i) => { const k = ((ml * 1.6 + i / 3) % 1); return <path key={i} d="M 0 -50 Q 40 0 0 50" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" transform={`translate(${650 + k * 150} 870) scale(${0.6 + k * 1.2})`} opacity={1 - k} />; })}
      </g>),
    };
  }
  // S3a: phone vibrating (close-up), then Dani glance
  if (t < B.s3b) {
    const l = lt(B.s3), phoneDur = B.s3b - B.s3 - 0.7;
    if (l < phoneDur) {
      const sh = Math.sin(l * 95) * 7 * Math.exp(-Math.max(0, l - 0.5) * 2.4);
      return {
        cam: cam(1.05, 540, 1010, -2 + l * 0.8),
        world: (<g><rect x={-100} y={1250} width={1300} height={700} fill="#E9E6DA" /><path d="M -100 1250 H 1200" stroke={INK} strokeWidth={6} />
          <ellipse cx={540} cy={1330} rx={300} ry={24} fill="#000" opacity={0.1} />
          {[-1, 1].map((s) => [0, 1].map((i) => <path key={`${s}${i}`} d={`M ${s * (250 + i * 50)} -70 Q ${s * (290 + i * 50)} 0 ${s * (250 + i * 50)} 70`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" transform={`translate(540 1000)`} opacity={l < 1.4 ? 1 : 0} />))}
          <PhoneBig x={540 + sh} y={960} rot={-4 + sh * 0.3} time="10:52">
            <Notif x={20} y={260 + (1 - pop(l, 0.35, 0.4)) * -80} title="Cliente nuevo" body="¿Hay cupo hoy?" k={pop(l, 0.35, 0.4)} wa />
          </PhoneBig>
        </g>),
      };
    }
    const g = t - (B.s3 + phoneDur);
    return {cam: cam(1.15, 540, 1000), world: (<g><Backdrop counter /><D x={420} expr="surprise" look={[-0.2, 0.6]} hr={[40, -262]} holdR="phone" hl={[-40, -250]} /></g>)};
  }
  // S3b: Luego, diez
  if (t < B.s3c) {
    const l = lt(B.s3b);
    return {
      cam: cam(1.05, 540, 1050, Math.sin(l * 6) * 1.2),
      world: (<g><Backdrop counter /><D x={430} expr={l < 0.5 ? 'surprise' : 'worry'} hr={[40, -262]} holdR="phone" hl={[-40, -250]} look={[0.2, 0.5]} />
        <Bubble x={820} y={1000} text="¿Precio?" s={pop(l, 0.08)} rot={4} side="l" />
        <Bubble x={780} y={820} text="¿Hay cupo hoy?" s={pop(l, 0.28)} rot={-4} />
        <Bubble x={250} y={880} text="¿Hasta qué hora?" s={pop(l, 0.48) } rot={-3} side="r" />
      </g>),
    };
  }
  // S3c-1: A las once (reloj) / S3c-2: 80
  if (t < T80) {
    const l = lt(B.s3c);
    const bs = ['¿Precio?', '¿Hay cupo?', '¿Dónde están?', '¿Abren hoy?', '¿Me separan?', '¿Hasta qué hora?'];
    return {
      cam: cam(1 + l * 0.08, 540, 1000),
      world: (<g><Disc cy={1010} r={380} /><WallClock x={540} y={1010} r={250} h={11 + l * 0.02} alarm /><Floor />
        {bs.map((b, i) => <Bubble key={i} x={[190, 880, 260, 860, 210, 850][i]} y={[760, 790, 1250, 1220, 1020, 1000][i]} text={b} s={0.78 * pop(l, 0.15 + i * 0.16)} rot={[-6, 6, 5, -5, -4, 5][i]} side={i % 2 ? 'r' : 'l'} />)}
      </g>),
    };
  }
  if (t < B.s4) {
    const l = lt(T80);
    return {
      cam: cam(2.35 + l * 0.12, 540, 880, Math.sin(l * 40) * 1.2),
      world: (<g><rect x={-1400} y={-1400} width={4000} height={4000} fill="#FFE9E4" /><Speed cx={540} cy={880} t={l} c="#FFD3CB" /><D x={540} expr="panic" look={[0, 0]} hl={[-80, -520]} hr={[80, -520]} bob={Math.sin(l * 50) * 3} /></g>),
    };
  }
  // S4a: atiende con una mano, contesta con la otra
  if (t < B.s4b) {
    const l = lt(B.s4);
    const type = Math.sin(l * 36) * 8;
    return {
      cam: cam(1.02, 540, 1010, -2.5),
      world: (<g><Backdrop disc shelf /><
        D x={350} expr="worry" hl={[160 + Math.sin(l * 5) * 6, -270]} holdL="bag" hr={[40, -262 + type]} holdR="phone" look={[0.5, 0.4]} />
        <D x={790} flip pal={CLIENT_A} hair="curly" expr="happy" hr={[150, -260 + Math.sin(l * 5) * 4]} look={[-0.5, 0]} seed={2} />
        <Bubble x={520} y={560} text="¿Precio?" s={0.8 * pop(l, 0.5)} rot={-6} side="r" /></g>),
    };
  }
  // S4b: cuatro horas
  if (t < B.s5) {
    const l = lt(B.s4b), type = Math.sin(l * 40) * 6, p = clamp(l / (B.s5 - B.s4b));
    return {
      cam: cam(lerp(1, 1.28, eio(p)), 540, lerp(1000, 960, p), Math.sin(l * 1.5) * 0.8),
      world: (<g><Backdrop disc shelf />
        <WallClock x={880} y={640} r={120} h={11 + p * 4} alarm />
        <D x={470} expr={p < 0.55 ? 'worry' : 'tired'} hl={[-34, -258 + type]} hr={[34, -262 - type]} holdR="phone" look={[0, 0.8]} tilt={p * 6} lean={p * 3} />
      </g>),
    };
  }
  // S5a: alguien preguntó
  if (t < B.s5b) {
    const l = lt(B.s5);
    return {
      cam: cam(1.04, 540, 1000),
      world: (<g><Disc /><Floor /><D x={520} pal={CLIENT_B} hair="spiky" expr="happy" hr={[40, -262]} holdR="phone" hl={[-40, -250]} look={[0, 0.6]} seed={3} />
        <Bubble x={560} y={560} text="¿Hay cupo hoy?" s={pop(l, 0.55)} rot={-3} tick /></g>),
    };
  }
  // S5b: espera... pero nadie respondió
  if (t < B.s5c) {
    const l = lt(B.s5b), sad = t >= T_PERO, p = clamp(l / 2.4);
    return {
      cam: cam(lerp(1.04, 1.3, eio(l / 2.7)), 540, 1020, sad ? Math.sin(l * 2) * 0.6 : 0),
      world: (<g><Disc /><Floor />
        <Hourglass x={220} y={1010} s={1.6 * pop(l, 0.05)} p={p} />
        <D x={600} pal={CLIENT_B} hair="spiky" expr={sad ? 'sad' : 'think'} hl={sad ? undefined : [-100, -262]} hr={sad ? undefined : [90, -300]} bendR={1} look={sad ? [0, 0.7] : [-0.6, 0.2]} bob={sad ? 0 : Math.abs(Math.sin(l * 8)) * -4} tilt={sad ? 6 : 0} seed={3} />
        {sad && <Bubble x={640} y={560} text="..." s={pop(t - T_PERO, 0.1)} rot={3} />}
      </g>),
    };
  }
  // S5c: se fue con la competencia
  if (t < B.s6) {
    const l = lt(B.s5c), w = eio(l / 1.6);
    return {
      cam: cam(1, 540, 960),
      world: (<g><Backdrop shelf counter /><D x={250} scale={1.25} expr="sad" lean={6} tilt={8} look={[0.7, 0.5]} />
        <D x={lerp(520, 1330, w)} pal={CLIENT_B} hair="spiky" expr="sad" walk={l * 10} look={[1, 0.3]} seed={3} />
      </g>),
    };
  }
  // S6: ¿cuánto vale una hora?
  if (t < B.s7) {
    const l = lt(B.s6), k = pop(l, 0.25, 0.5);
    return {
      cam: cam(lerp(1.2, 1.45, eio(l / 2.7)), 480, 1030),
      world: (<g><Disc cx={500} /><Floor /><D x={420} expr="think" hr={[24, -392]} hl={[-30, -240]} bendR={1} look={[0.8, -0.7]} tilt={-6} />
        <g transform={`translate(790 700) scale(${k})`}><circle cx={-110} cy={190} r={16} fill="#fff" stroke={INK} strokeWidth={6} /><circle cx={-60} cy={140} r={26} fill="#fff" stroke={INK} strokeWidth={6} />
          <ellipse cx={30} cy={20} rx={190} ry={150} fill="#fff" stroke={INK} strokeWidth={8} /><WallClock x={30} y={20} r={100} h={4 + l * 0.9} />
          <text x={170} y={-100} fontFamily="Anton" fontSize={90} fill={GREEN}>?</text></g>
      </g>),
    };
  }
  // S7: Iguana
  if (t < B.s8) {
    const l = lt(B.s7);
    const N = [['Iguana · Ana', '¿Te agendo hoy 4 pm?', 0.5], ['Cita agendada ✓', 'Ana · hoy 4 pm', 1.5], ['Iguana · Luis', 'Hasta las 8 pm', 2.4], ['Iguana · Sofi', 'Turno 5 pm separado', 3.3]] as const;
    return {
      cam: cam(1, 540, 960, 0),
      world: (<g><Backdrop disc={false} shelf={false} />
        <Disc cy={960} r={420} />
        <g><Shelf x={380} y={420} />
          <D x={250} y={1010} scale={0.8} expr="calm" hl={[150, -250]} holdL="bag" hr={[-10, -230]} look={[0.5, 0.1]} />
          <D x={830} y={1010} scale={0.8} flip pal={CLIENT_A} hair="curly" expr="happy" hr={[140, -250]} look={[-0.5, 0]} seed={2} />
          <rect x={-100} y={300} width={1300} height={1200} fill={PAPER} opacity={0.38} /></g>
        <rect x={-100} y={1290} width={1300} height={700} fill="#E9E6DA" /><path d="M -100 1290 H 1200" stroke={INK} strokeWidth={6} />
        <ellipse cx={540} cy={1560} rx={300} ry={22} fill="#000" opacity={0.1} />
        <PhoneBig x={540} y={1180 + Math.sin(l * 2.2) * 4} rot={-4} time="11:42">
          {N.map(([a, b, d], i) => { const shown = N.filter(([, , dd]) => dd <= l).length; const idx = N.slice(0, i + 1).filter(([, , dd]) => dd <= l).length; if (l < d) return null; const slot = shown - idx; const k = pop(l, d, 0.4); return <Notif key={i} x={20} y={250 + slot * 118 + (1 - k) * -60} title={a} body={b} k={k} />; })}
        </PhoneBig>
        <g transform={`translate(${860} ${1010 + Math.sin(l * 3) * 10}) rotate(${Math.sin(l * 2) * 6 - 6}) scale(${pop(l, 0.2, 0.5)})`}>
          <image href={staticFile('user_whatsapp.png')} x={-115} y={-116} width={230} height={232} />
        </g>
      </g>),
    };
  }
  // S8a: Dani tranquilo
  if (t < B.s8b) {
    const l = lt(B.s8);
    return {
      cam: cam(1, 540, 960, 0),
      world: (<g><Backdrop counter /><D x={380} expr="calm" hl={[-124, -240]} hr={[124, -240]} look={[0.3, 0]} bob={Math.sin(l * 2) * 2} /></g>),
    };
  }
  // S8b: reloj 6 pm -> familia
  if (t < T_LLEGA) {
    const l = lt(B.s8b);
    return {
      cam: cam(1 + l * 0.05, 540, 1000),
      world: (<g><Disc cy={1010} r={380} /><WallClock x={540} y={1010} r={250} h={lerp(5.6, 6.0, eio(l / 1.1))} /><Floor />
        <g transform={`translate(540 1380) scale(${pop(l, 0.5)})`}><rect x={-120} y={-46} width={240} height={92} rx={46} fill={LIME} stroke={INK} strokeWidth={7} /><text x={0} y={24} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={CHAR}>6:00 PM</text></g></g>),
    };
  }
  if (t < B.s9) {
    const l = lt(T_LLEGA), w = eo(l / 0.9);
    return {
      cam: cam(1, 540, 960),
      world: (<g><Disc cy={1060} r={400} /><Floor />
        <D x={lerp(-160, 300, w)} walk={l < 0.9 ? l * 9 : null} expr="grin" hl={l > 1 ? [-30, -300] : undefined} hr={l > 1 ? [140, -300] : undefined} look={[0.4, 0]} />
        <Table x={540} y={1340} />
        <D x={780} scale={1.4} pal={MOM} hair="bun" expr="calm" hl={[-130, -300]} hr={[100, -250]} look={[-0.4, 0]} seed={5} flip />
        <D x={540} scale={0.9} pal={KID} hair="quiff" expr="happy" hl={[-120, -520]} hr={[120, -520]} bob={Math.abs(Math.sin(l * 6)) * -10} seed={7} y={1330} />
        {[0, 1, 2].map((i) => { const d = 1.0 + i * 0.25; return l > d ? <Heart key={i} x={320 + i * 220} y={700 - eo((l - d) / 1) * 70} s={pop(l, d, 0.4) * 1.1} /> : null; })}
      </g>),
    };
  }
  // S9: end card
  const l = lt(B.s9);
  return {
    cam: cam(1, 540, 960),
    world: (<g><rect x={-100} y={-100} width={1300} height={2200} fill={PAPER} />
      <circle cx={540} cy={900} r={360 * eo(l / 0.7)} fill={DISC} />
      <g transform={`translate(540 760) scale(${pop(l, 0.05, 0.5)})`}><image href={staticFile('logo_green.png')} x={-320} y={-210} width={640} height={420} preserveAspectRatio="xMidYMid meet" /></g>
      <g transform={`translate(540 1010) scale(${pop(l, 0.45, 0.45)})`}><text x={0} y={0} textAnchor="middle" fontFamily="Anton" fontSize={104} fill={CHAR} letterSpacing={1}>RECUPERA TUS HORAS</text><rect x={-300} y={32} width={600} height={22} fill={LIME} rx={6} /></g>
      <g transform={`translate(540 1200) scale(${pop(l, 1.0, 0.45) * (1 + Math.sin(l * 6) * 0.015)})`}><rect x={-300} y={-52} width={600} height={104} rx={52} fill={CHAR} stroke={INK} strokeWidth={6} /><text x={0} y={20} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={44} fill="#fff">Agenda tu demo gratis</text></g>
    </g>),
  };
};

export const Motion2D: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const sc = scene(t);
  const c = sc.cam;
  const drift = [Math.sin(t * 1.3) * 3, Math.cos(t * 1.1) * 3];
  let wipeX = -2000, wipe = false;
  for (const b of BOUNDS) { const p = (t - (b - 0.2)) / 0.34; if (p >= 0 && p <= 1) { wipe = true; wipeX = -1500 + 3000 * eio(p); } }
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <Fonts />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <rect width={1080} height={1920} fill={PAPER} />
        <g transform={`translate(540 960) rotate(${c.rot}) scale(${c.s}) translate(${-c.cx + drift[0]} ${-c.cy + drift[1]})`}>{sc.world}</g>
        <Hud t={t} />
        {wipe && <path d={`M ${wipeX - 700} -50 H ${wipeX + 700} L ${wipeX + 560} 1970 H ${wipeX - 840} Z`} fill={LIME} />}
      </svg>
      {/* música original (sin voz): la voz la agrega el usuario después */}
      <Audio src={staticFile('music_bed.wav')} volume={1} />
      {(cuesData.cues as any[]).map((q, i) => {
        const from = Math.round(q.start * fps), len = Math.max(1, Math.ceil((q.dur + 0.05) * fps));
        return (<Sequence key={i} from={from} durationInFrames={len} layout="none"><Audio src={staticFile(q.file)} volume={(ff) => q.vol * interpolate(ff, [len - 4, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} /></Sequence>);
      })}
    </AbsoluteFill>
  );
};
