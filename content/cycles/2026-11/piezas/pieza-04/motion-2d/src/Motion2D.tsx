import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Dani, CLIENT_A, CLIENT_B, MOM, KID} from './char/Dani';
import {Fonts} from './Fonts';
import TL from './timeline.json';
import cuesData from '../public/cues.json';
import {DISC, Floor, Disc, Shelf, Counter, WallClock, Hourglass, Bubble, Notif, PhoneBig, Bag, Heart, Table, Speed, LIME, GREEN, CHAR, PAPER, INK, clamp, lerp, eo, eio, pop} from './world';

const C = (id: string) => (TL.clauses.find((c) => c.id === id) as any).start as number;
const at = (id: string, w: string) => { const c = TL.clauses.find((x) => x.id === id) as any; const k = c.text.toLowerCase().indexOf(w.toLowerCase()); return c.start + c.dur * (Math.max(k, 0) / c.text.length); };
const segStart = (s: string) => Math.min(...TL.clauses.filter((c) => c.seg === s).map((c) => c.start));
const B = {s2: segStart('s2'), s2b: C('s2b'), s3: segStart('s3'), s3b: C('s3b'), s3c: C('s3c'), s4: segStart('s4'), s4b: C('s4b'), s5: segStart('s5'), s5b: C('s5b'), s5c: C('s5c'), s6: segStart('s6'), s7: segStart('s7'), s8: segStart('s8'), s8b: C('s8b'), s9: segStart('s9')};
const T80 = at('s3c', 'ochenta'), T_PERO = at('s5b', 'pero'), T_LANZA = at('s2b', 'lanza'), T_LLEGA = at('s8b', 'llega');
const BOUNDS = [B.s2, B.s2b, B.s3, B.s3b, B.s3c, T80, B.s4, B.s4b, B.s5, B.s5b, B.s5c, B.s6, B.s7, B.s8, B.s8b, T_LLEGA, B.s9];
const FY = 1400, DS = 1.55; // línea de pies y escala del personaje (franja inferior 1440-1700 libre para subtítulos)

// puntos de mano (muñeca) en coordenadas locales del personaje; hombros en (±66,-452)
const P = {
  phoneR: [30, -372] as [number, number], typeL: [-26, -366] as [number, number], headL: [-38, -556] as [number, number], headR: [38, -556] as [number, number],
  hipL: [-62, -330] as [number, number], hipR: [62, -330] as [number, number], wave: [120, -566] as [number, number], reachR: [150, -392] as [number, number],
  chinR: [20, -508] as [number, number], armL: [-26, -388] as [number, number], crossL: [44, -352] as [number, number], crossR: [-44, -340] as [number, number],
};
type Cam = {s: number; cx: number; cy: number; rot: number};
const cam = (s = 1, cx = 540, cy = 960, rot = 0): Cam => ({s, cx, cy, rot});
const Backdrop: React.FC<{disc?: boolean; shelf?: boolean; counter?: boolean}> = ({disc = true, shelf = true, counter = false}) => (
  <g>{disc && <Disc cy={1000} r={380} />}{shelf && <Shelf x={60} y={760} />}<Floor />{counter && <Counter x={640} y={945} w={400} />}</g>
);
const D: React.FC<any> = (p) => <Dani x={540} y={FY} scale={DS} {...p} />;

const Pill: React.FC<{x: number; label: string; value: string; good: boolean; k: number}> = ({x, label, value, good, k}) => (
  <g transform={`translate(${x} 262)`}>
    <rect x={0} y={0} width={300} height={112} rx={24} fill={good ? LIME : '#2B2B2B'} stroke={INK} strokeWidth={4} />
    <text x={150} y={34} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={21} fill={good ? CHAR : '#C9D1C5'}>{label}</text>
    <text x={150} y={94} textAnchor="middle" fontFamily="Anton" fontSize={62} fill={good ? CHAR : LIME} transform={`translate(150 80) scale(${k}) translate(-150 -80)`}>{value}</text>
  </g>
);
const Hud: React.FC<{t: number}> = ({t}) => {
  if (t < B.s2 || t > B.s9) return null;
  const inS7 = t >= B.s7;
  const msgs = t < B.s3 ? 0 : t < B.s3b ? 1 : t < B.s3c ? 10 : t < T80 ? Math.round(lerp(10, 47, clamp((t - B.s3c) / (T80 - B.s3c)))) : 80;
  const hrs = t < B.s4b ? 0 : Math.min(4, Math.floor(((t - B.s4b) / (B.s5 - B.s4b)) * 4.99));
  const lost = t < B.s5c ? 0 : 1;
  const left = inS7 ? Math.round(lerp(80, 0, eio(clamp((t - (B.s7 + 0.7)) / 2.2)))) : msgs;
  const booked = Math.round(lerp(0, 6, eio(clamp((t - (B.s7 + 1.2)) / 2.4))));
  const gain = t < B.s8 ? 0 : Math.min(4, Math.floor(((t - B.s8) / 2.0) * 4.99));
  const bump = (t0: number) => { const d = t - t0; return d >= 0 && d < 0.4 ? 1 + 0.25 * Math.sin((d / 0.4) * Math.PI) : 1; };
  const f = clamp((t - B.s2) / 0.4);
  return (
    <g transform={`translate(0 ${(1 - eo(f)) * -160})`}>
      <Pill x={60} label={inS7 ? 'SIN RESPONDER' : 'MENSAJES'} value={String(left)} good={inS7 && left < 20} k={inS7 ? 1 : Math.max(bump(B.s3), bump(B.s3b), bump(T80))} />
      <Pill x={390} label={t >= B.s8 ? 'HORAS GANADAS' : 'HORAS PERDIDAS'} value={t >= B.s8 ? `+${gain}` : `${hrs}h`} good={t >= B.s8} k={inS7 ? bump(B.s8) : bump(B.s4b + 0.8)} />
      <Pill x={720} label={inS7 ? 'CITAS AGENDADAS' : 'CLIENTES PERDIDOS'} value={inS7 ? String(booked) : String(lost)} good={inS7} k={inS7 ? 1 : bump(B.s5c)} />
    </g>
  );
};

const scene = (t: number): {cam: Cam; world: React.ReactNode} => {
  const lt = (a: number) => t - a;
  // S1: NOV + DIC -> 22 %
  if (t < B.s2) {
    const l = t, donut = clamp((l - 2.7) / 1.2), calOut = eio(clamp((l - 2.4) / 0.5));
    const cal = (x: number, m: string, d: number) => {
      const k = pop(l, d, 0.45);
      return (
        <g transform={`translate(${x} 900) scale(${k * (1 - calOut * 0.45)}) translate(0 ${calOut * -200})`}>
          <rect x={-150} y={-160} width={300} height={320} rx={26} fill="#fff" stroke={INK} strokeWidth={6} />
          <path d="M -150 -134 a 26 26 0 0 1 26 -26 H 124 a 26 26 0 0 1 26 26 V -70 H -150 Z" fill={LIME} stroke={INK} strokeWidth={6} />
          <text x={0} y={-90} textAnchor="middle" fontFamily="Anton" fontSize={58} fill={CHAR}>{m}</text>
          {Array.from({length: 20}).map((_, i) => <circle key={i} cx={-100 + (i % 5) * 50} cy={-30 + Math.floor(i / 5) * 46} r={12} fill={i === 12 ? GREEN : '#E4E7DE'} />)}
        </g>
      );
    };
    const circ = 2 * Math.PI * 150, k22 = pop(l, 3.7, 0.5);
    return {
      cam: cam(1 + clamp(l / 5.4) * 0.05),
      world: (
        <g><Disc cy={900} r={420} />{cal(340, 'NOV', 0.25)}{cal(740, 'DIC', 0.75)}
          {l > 2.5 && (
            <g transform={`translate(540 900) scale(${eo(clamp((l - 2.5) / 0.5))})`}>
              <circle r={190} fill="#fff" stroke={INK} strokeWidth={6} /><circle r={150} fill="none" stroke="#E4E7DE" strokeWidth={70} />
              <circle r={150} fill="none" stroke={LIME} strokeWidth={70} strokeDasharray={`${circ * 0.22 * donut} ${circ}`} transform="rotate(-90)" />
              <circle r={186} fill="none" stroke={INK} strokeWidth={4} /><circle r={114} fill="none" stroke={INK} strokeWidth={4} />
              <text x={0} y={28} textAnchor="middle" fontFamily="Anton" fontSize={96} fill={CHAR} transform={`scale(${k22})`}>22%</text>
            </g>
          )}
          {l > 3.8 && <Bag x={230} y={1280} s={0.85 * pop(l, 3.9)} rot={-8} pct />}
          {l > 4.0 && <Bag x={850} y={1270} s={0.85 * pop(l, 4.1)} rot={9} c={GREEN} />}
          <Floor /></g>
      ),
    };
  }
  // S2a: llega y saluda
  if (t < B.s2b) {
    const l = lt(B.s2), w = eo(l / 1.0), moving = l < 1.0;
    return {cam: cam(1, 540, 960), world: (<g><Backdrop counter />
      <D x={lerp(-170, 380, w)} walk={moving ? l * 9 : null} expr={moving ? 'happy' : 'grin'} hr={!moving ? [P.wave[0] + Math.sin(l * 14) * 12, P.wave[1] + Math.sin(l * 14) * 14] : undefined} handR={!moving ? 'open' : undefined} look={[0.4, 0]} />
    </g>)};
  }
  // S2b: Black Friday
  if (t < B.s3) {
    const l = lt(B.s2b), meg = t >= T_LANZA, ml = t - T_LANZA, drop = pop(l, 0.3, 0.5);
    return {
      cam: cam(1, 540, 960, meg ? Math.sin(ml * 9) * 0.6 : 0),
      world: (<g><Backdrop counter />
        <g transform={`translate(540 ${lerp(300, 440, drop)}) rotate(${(1 - drop) * -6})`}>
          <path d="M -400 -58 H 400 L 372 0 L 400 58 H -400 L -372 0 Z" fill={LIME} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <text x={0} y={30} textAnchor="middle" fontFamily="Anton" fontSize={90} fill={CHAR} letterSpacing={4}>BLACK FRIDAY</text>
        </g>
        <D x={400} expr={meg ? 'grin' : l < 0.7 ? 'surprise' : 'happy'} hr={meg ? [62, -514] : undefined} holdR={meg ? 'mega' : null} holdRot={[0, 0]} hl={meg ? P.hipL : undefined} look={[0.3, 0]} />
        {meg && [0, 1, 2].map((i) => { const k = (ml * 1.6 + i / 3) % 1; return <path key={i} d="M 0 -46 Q 36 0 0 46" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`translate(${640 + k * 150} 640) scale(${0.6 + k * 1.2})`} opacity={1 - k} />; })}
      </g>),
    };
  }
  // S3a: mensaje (primer plano del celular) -> mirada
  if (t < B.s3b) {
    const l = lt(B.s3), dur = B.s3b - B.s3 - 0.3;
    if (l < dur) {
      const sh = Math.sin(l * 95) * 7 * Math.exp(-Math.max(0, l - 0.5) * 2.4);
      return {cam: cam(1.05, 540, 940, -2 + l * 0.8), world: (<g><rect x={-100} y={1180} width={1300} height={800} fill="#E9E6DA" /><path d="M -100 1180 H 1200" stroke={INK} strokeWidth={4} />
        <ellipse cx={540} cy={1260} rx={300} ry={24} fill="#000" opacity={0.1} />
        {[-1, 1].map((s) => [0, 1].map((i) => <path key={`${s}${i}`} d={`M ${s * (250 + i * 50)} -70 Q ${s * (290 + i * 50)} 0 ${s * (250 + i * 50)} 70`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" transform="translate(540 880)" opacity={l < 1.2 ? 1 : 0} />))}
        <PhoneBig x={540 + sh} y={870} rot={-4 + sh * 0.3} time="10:52"><Notif x={20} y={260 + (1 - pop(l, 0.3, 0.4)) * -80} title="Cliente nuevo" body="¿Hay cupo hoy?" k={pop(l, 0.3, 0.4)} wa /></PhoneBig></g>)};
    }
    return {cam: cam(1.3, 480, 800), world: (<g><Backdrop counter /><D x={420} expr="surprise" look={[-0.2, 0.7]} hr={P.phoneR} holdR="phone" hl={P.hipL} /></g>)};
  }
  // S3b: luego, diez
  if (t < B.s3c) {
    const l = lt(B.s3b);
    return {cam: cam(1.25, 540, 800, Math.sin(l * 6) * 1.2), world: (<g><Backdrop counter /><D x={430} expr={l < 0.4 ? 'surprise' : 'worry'} hr={P.phoneR} holdR="phone" hl={P.hipL} look={[0.2, 0.6]} />
      <Bubble x={800} y={770} text="¿Precio?" s={pop(l, 0.05)} rot={4} />
      <Bubble x={730} y={580} text="¿Hay cupo hoy?" s={pop(l, 0.22)} rot={-4} />
      <Bubble x={330} y={650} text="¿Hasta qué hora?" s={pop(l, 0.38)} rot={-3} side="r" /></g>)};
  }
  // S3c: las once (reloj) / ochenta (cara)
  if (t < T80) {
    const l = lt(B.s3c), bs = ['¿Precio?', '¿Hay cupo?', '¿Dónde están?', '¿Abren hoy?', '¿Me separan?', '¿Qué horario?'];
    return {cam: cam(1 + l * 0.07, 540, 940), world: (<g><Disc cy={900} r={380} /><WallClock x={540} y={900} r={250} h={11 + l * 0.02} alarm /><Floor />
      {bs.map((b, i) => <Bubble key={i} x={[190, 880, 250, 860, 200, 850][i]} y={[620, 640, 1170, 1150, 880, 880][i]} text={b} s={0.78 * pop(l, 0.12 + i * 0.12)} rot={[-6, 6, 5, -5, -4, 5][i]} side={i % 2 ? 'r' : 'l'} />)}</g>)};
  }
  if (t < B.s4) {
    const l = lt(T80);
    return {cam: cam(3.0 + l * 0.1, 540, 590, Math.sin(l * 40) * 1.0), world: (<g><rect x={-1400} y={-1400} width={4000} height={5000} fill="#FFE9E4" /><Speed cx={540} cy={590} t={l} c="#FFD3CB" /><D x={540} expr="panic" look={[0, 0]} hl={P.headL} hr={P.headR} handL="open" handR="open" bendL={1} bendR={1} bob={Math.sin(l * 50) * 2} /></g>)};
  }
  // S4a: atiende con una mano, contesta con la otra
  if (t < B.s4b) {
    const l = lt(B.s4), type = Math.sin(l * 36);
    return {cam: cam(1.12, 540, 880, -2.5), world: (<g><Backdrop disc shelf />
      <D x={330} expr="worry" hr={[P.reachR[0] + Math.sin(l * 5) * 5, P.reachR[1]]} holdR="bag" hl={P.typeL} holdL="phone" typing={type} look={[0.5, 0.4]} />
      <D x={790} flip pal={CLIENT_A} hair="curly" expr="happy" hr={[122, -330]} handR="open" look={[-0.5, 0]} seed={2} />
      <Bubble x={560} y={600} text="¿Precio?" s={0.8 * pop(l, 0.5)} rot={-6} side="r" /></g>)};
  }
  // S4b: cuatro horas así
  if (t < B.s5) {
    const l = lt(B.s4b), p = clamp(l / (B.s5 - B.s4b)), type = Math.sin(l * 40);
    return {cam: cam(lerp(1.15, 1.45, eio(p)), 540, lerp(860, 760, p), Math.sin(l * 1.5) * 0.8), world: (<g><Backdrop disc shelf />
      <WallClock x={880} y={560} r={105} h={11 + p * 4} alarm />
      <D x={470} expr={p < 0.5 ? 'worry' : 'tired'} hr={P.phoneR} holdR="phone" typing={type} hl={P.typeL} handL="point" look={[0, 0.9]} tilt={p * 5} lean={p * 2} /></g>)};
  }
  // S5a: alguien preguntó
  if (t < B.s5b) {
    const l = lt(B.s5);
    return {cam: cam(1.18, 540, 840), world: (<g><Disc cy={1000} r={380} /><Floor /><D x={520} pal={CLIENT_B} hair="spiky" expr="happy" hr={P.phoneR} holdR="phone" hl={P.typeL} handL="point" typing={Math.sin(l * 30)} look={[0, 0.7]} seed={3} />
      <Bubble x={560} y={520} text="¿Hay cupo hoy?" s={pop(l, 0.5)} rot={-3} tick /></g>)};
  }
  // S5b: esperó, pero nadie respondió
  if (t < B.s5c) {
    const l = lt(B.s5b), sad = t >= T_PERO, p = clamp(l / 1.8);
    return {cam: cam(lerp(1.1, 1.4, eio(l / 1.9)), 540, 880, sad ? Math.sin(l * 2) * 0.6 : 0), world: (<g><Disc cy={1000} r={380} /><Floor />
      <Hourglass x={210} y={1000} s={1.7 * pop(l, 0.05)} p={p} />
      <D x={600} pal={CLIENT_B} hair="spiky" expr={sad ? 'sad' : 'think'} hl={sad ? undefined : P.crossL} hr={sad ? undefined : P.crossR} bendL={-1} bendR={-1} look={sad ? [0, 0.8] : [-0.6, 0.2]} bob={sad ? 0 : Math.abs(Math.sin(l * 8)) * -3} tilt={sad ? 5 : 0} seed={3} />
      {sad && <Bubble x={620} y={520} text="..." s={pop(t - T_PERO, 0.1)} rot={3} />}</g>)};
  }
  // S5c: y se fue
  if (t < B.s6) {
    const l = lt(B.s5c), w = eio(l / 0.8);
    return {cam: cam(1, 540, 960), world: (<g><Backdrop shelf counter />
      <D x={250} scale={1.4} expr="sad" lean={5} tilt={7} look={[0.7, 0.5]} />
      <D x={lerp(520, 1330, w)} pal={CLIENT_B} hair="spiky" expr="sad" walk={l * 10} look={[1, 0.3]} seed={3} /></g>)};
  }
  // S6: ¿cuánto vale una hora?
  if (t < B.s7) {
    const l = lt(B.s6), k = pop(l, 0.2, 0.5);
    return {cam: cam(lerp(1.3, 1.55, eio(l / 2.0)), 470, 790), world: (<g><Disc cx={500} cy={1000} r={380} /><Floor />
      <D x={400} expr="think" hr={P.chinR} bendR={-1} hl={[-20, -396]} bendL={-1} look={[0.8, -0.6]} tilt={-5} />
      <g transform={`translate(780 560) scale(${k})`}><circle cx={-120} cy={170} r={14} fill="#fff" stroke={INK} strokeWidth={5} /><circle cx={-70} cy={125} r={24} fill="#fff" stroke={INK} strokeWidth={5} />
        <ellipse cx={30} cy={10} rx={190} ry={150} fill="#fff" stroke={INK} strokeWidth={6} /><WallClock x={30} y={10} r={100} h={4 + l * 0.9} /><text x={170} y={-100} fontFamily="Anton" fontSize={90} fill={GREEN}>?</text></g></g>)};
  }
  // S7: Iguana (celular en primer plano, Dani al fondo atendiendo tranquilo)
  if (t < B.s8) {
    const l = lt(B.s7);
    const N = [['Iguana · Ana', '¿Te agendo hoy 4 pm?', 0.4], ['Cita agendada ✓', 'Ana · hoy 4 pm', 1.3], ['Iguana · Luis', 'Hasta las 8 pm', 2.1], ['Iguana · Sofi', 'Turno 5 pm separado', 2.9]] as const;
    return {cam: cam(1, 540, 960), world: (<g><Disc cy={900} r={420} /><Floor />
      <g><Shelf x={380} y={420} />
        <D x={250} y={1010} scale={0.85} expr="calm" hr={P.reachR} holdR="bag" hl={P.hipL} look={[0.5, 0.1]} />
        <D x={830} y={1010} scale={0.85} flip pal={CLIENT_A} hair="curly" expr="happy" hr={[P.reachR[0] + 6, P.reachR[1] + 8]} handR="open" look={[-0.5, 0]} seed={2} />
        <rect x={-100} y={300} width={1300} height={1100} fill={PAPER} opacity={0.34} /></g>
      <ellipse cx={540} cy={1400} rx={290} ry={20} fill="#000" opacity={0.1} />
      <PhoneBig x={540} y={1010 + Math.sin(l * 2.2) * 4} rot={-4} time="11:42">
        {N.map(([a, b, d], i) => { if (l < d) return null; const shown = N.filter(([, , dd]) => dd <= l).length; const idx = N.slice(0, i + 1).filter(([, , dd]) => dd <= l).length; const k = pop(l, d, 0.4); return <Notif key={i} x={20} y={250 + (shown - idx) * 118 + (1 - k) * -60} title={a} body={b} k={k} />; })}
      </PhoneBig>
      <g transform={`translate(${880} ${940 + Math.sin(l * 3) * 10}) rotate(${Math.sin(l * 2) * 6 - 6}) scale(${pop(l, 0.2, 0.5)})`}><image href={staticFile('user_whatsapp.png')} x={-105} y={-106} width={210} height={212} /></g></g>)};
  }
  // S8a: Dani tranquilo
  if (t < B.s8b) {
    const l = lt(B.s8);
    return {cam: cam(1, 540, 960), world: (<g><Backdrop counter /><D x={380} expr="calm" hl={P.hipL} hr={P.hipR} bendL={-1} bendR={-1} look={[0.3, 0]} bob={Math.sin(l * 2) * 1.5} /></g>)};
  }
  // S8b: reloj 6 pm -> familia
  if (t < T_LLEGA) {
    const l = lt(B.s8b);
    return {cam: cam(1 + l * 0.05, 540, 960), world: (<g><Disc cy={900} r={380} /><WallClock x={540} y={900} r={250} h={lerp(5.6, 6.0, eio(l / 1.0))} /><Floor />
      <g transform={`translate(540 1250) scale(${pop(l, 0.4)})`}><rect x={-120} y={-46} width={240} height={92} rx={46} fill={LIME} stroke={INK} strokeWidth={5} /><text x={0} y={24} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={CHAR}>6:00 PM</text></g></g>)};
  }
  if (t < B.s9) {
    const l = lt(T_LLEGA), w = eo(l / 0.8);
    return {cam: cam(1, 540, 960), world: (<g><Disc cy={960} r={400} /><Floor />
      <D x={lerp(-170, 290, w)} walk={l < 0.8 ? l * 9 : null} expr="grin" hl={l > 0.9 ? P.armL : undefined} hr={l > 0.9 ? [90, -388] : undefined} look={[0.4, 0]} />
      <D x={800} scale={1.5} pal={MOM} hair="bun" expr="calm" hl={[-92, -388]} hr={P.hipR} bendR={-1} look={[-0.4, 0]} seed={5} flip />
      <D x={545} y={1400} scale={0.95} pal={KID} hair="short" expr="happy" hl={P.headL} hr={P.headR} bendL={1} bendR={1} handL="open" handR="open" bob={Math.abs(Math.sin(l * 6)) * -10} seed={7} />
      <Table x={540} y={1030} legH={335} />
      {[0, 1, 2].map((i) => { const d = 0.9 + i * 0.25; return l > d ? <Heart key={i} x={320 + i * 220} y={620 - eo((l - d) / 1) * 60} s={pop(l, d, 0.4) * 1.1} /> : null; })}</g>)};
  }
  // S9: cierre
  const l = lt(B.s9);
  return {cam: cam(1, 540, 960), world: (<g><rect x={-100} y={-100} width={1300} height={2200} fill={PAPER} />
    <circle cx={540} cy={860} r={360 * eo(l / 0.7)} fill={DISC} />
    <g transform={`translate(540 720) scale(${pop(l, 0.05, 0.5)})`}><image href={staticFile('logo_green.png')} x={-320} y={-210} width={640} height={420} preserveAspectRatio="xMidYMid meet" /></g>
    <g transform={`translate(540 970) scale(${pop(l, 0.4, 0.45)})`}><text x={0} y={0} textAnchor="middle" fontFamily="Anton" fontSize={104} fill={CHAR} letterSpacing={1}>RECUPERA TUS HORAS</text><rect x={-300} y={32} width={600} height={22} fill={LIME} rx={6} /></g>
    <g transform={`translate(540 1150) scale(${pop(l, 0.9, 0.45) * (1 + Math.sin(l * 6) * 0.015)})`}><rect x={-300} y={-52} width={600} height={104} rx={52} fill={CHAR} stroke={INK} strokeWidth={4} /><text x={0} y={20} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={44} fill="#fff">Agenda tu demo gratis</text></g></g>)};
};

export const Motion2D: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const sc = scene(t), c = sc.cam;
  const drift = [Math.sin(t * 1.3) * 3, Math.cos(t * 1.1) * 3];
  let wipeX = -2000, wipe = false;
  for (const b of BOUNDS) { const p = (t - (b - 0.2)) / 0.34; if (p >= 0 && p <= 1) { wipe = true; wipeX = -1500 + 3000 * eio(p); } }
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <Fonts />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <defs><linearGradient id="sub" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAPER} stopOpacity={0} /><stop offset="1" stopColor={PAPER} stopOpacity={0.92} /></linearGradient></defs>
        <rect width={1080} height={1920} fill={PAPER} />
        <g transform={`translate(540 960) rotate(${c.rot}) scale(${c.s}) translate(${-c.cx + drift[0]} ${-c.cy + drift[1]})`}>{sc.world}</g>
        {/* zona reservada a subtítulos: y 1470-1660, el contenido se desvanece hacia el fondo */}
        {t < B.s9 - 0.05 && <g><rect x={0} y={1400} width={1080} height={120} fill="url(#sub)" /><rect x={0} y={1520} width={1080} height={400} fill={PAPER} opacity={0.92} /></g>}
        <Hud t={t} />
        {wipe && <path d={`M ${wipeX - 700} -50 H ${wipeX + 700} L ${wipeX + 560} 1970 H ${wipeX - 840} Z`} fill={LIME} />}
      </svg>
      <Audio src={staticFile('music_bed.wav')} volume={1} />
      {(cuesData.cues as any[]).map((q, i) => {
        const from = Math.round(q.start * fps), len = Math.max(1, Math.ceil((q.dur + 0.05) * fps));
        return (<Sequence key={i} from={from} durationInFrames={len} layout="none"><Audio src={staticFile(q.file)} volume={(ff) => q.vol * interpolate(ff, [len - 4, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} /></Sequence>);
      })}
    </AbsoluteFill>
  );
};
