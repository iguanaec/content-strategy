import React from 'react';
import {useCurrentFrame} from 'remotion';

export const OUT = '#1E1B1B';
export type Pal = {skin: string; skin2: string; shirt: string; shirt2: string; apron: string | null; pants: string; hair: string; hair2: string; shoe: string};
export const DANI: Pal = {skin: '#D99A6C', skin2: '#BE7E54', shirt: '#39713E', shirt2: '#2B5830', apron: '#A7FF6B', pants: '#383838', hair: '#2B2224', hair2: '#4C3C40', shoe: '#FFFFFF'};
export const CLIENT_A: Pal = {skin: '#E7B48A', skin2: '#CC9468', shirt: '#E9E4D8', shirt2: '#CFC8B8', apron: null, pants: '#4A5368', hair: '#6B3F22', hair2: '#8A5A38', shoe: '#FFFFFF'};
export const CLIENT_B: Pal = {skin: '#B97A52', skin2: '#9C623F', shirt: '#5B6470', shirt2: '#48505A', apron: null, pants: '#2F3A52', hair: '#2A1A14', hair2: '#4A3226', shoe: '#FFFFFF'};
export const MOM: Pal = {skin: '#C98F68', skin2: '#AE774F', shirt: '#A7FF6B', shirt2: '#86DB4C', apron: null, pants: '#383838', hair: '#2A1A14', hair2: '#4A3226', shoe: '#FFFFFF'};
export const KID: Pal = {skin: '#E2A878', skin2: '#C58C5E', shirt: '#39713E', shirt2: '#2B5830', apron: null, pants: '#383838', hair: '#2B2224', hair2: '#4C3C40', shoe: '#FFFFFF'};

export type Expr = 'neutral' | 'happy' | 'grin' | 'worry' | 'panic' | 'sad' | 'think' | 'surprise' | 'calm' | 'tired' | 'smirk';
type E = {brow: [number, number]; eye: 'round' | 'happy' | 'closed' | 'wide' | 'half'; mouth: string; sweat?: boolean; tear?: boolean; blush?: boolean; bags?: boolean};
// brow: [yOffset, angle(deg, + = inner end up)]
const EX: Record<Expr, E> = {
  neutral: {brow: [0, 0], eye: 'round', mouth: 'flat'},
  happy: {brow: [-4, 3], eye: 'round', mouth: 'smile', blush: true},
  grin: {brow: [-8, 6], eye: 'happy', mouth: 'grin', blush: true},
  worry: {brow: [-6, 16], eye: 'round', mouth: 'worry', sweat: true},
  panic: {brow: [-14, 18], eye: 'wide', mouth: 'scream', sweat: true},
  sad: {brow: [0, 18], eye: 'round', mouth: 'frown', tear: true},
  think: {brow: [-4, -10], eye: 'round', mouth: 'smirk'},
  surprise: {brow: [-16, 6], eye: 'wide', mouth: 'o'},
  calm: {brow: [-2, 2], eye: 'happy', mouth: 'smile', blush: true},
  tired: {brow: [2, 12], eye: 'half', mouth: 'flat', bags: true, sweat: true},
  smirk: {brow: [-6, -8], eye: 'round', mouth: 'smirk', blush: true},
};

function ik(sx: number, sy: number, tx: number, ty: number, a: number, b: number, side: number, sigma: number) {
  const dx = side * (tx - sx), dy = ty - sy;
  const d = Math.hypot(dx, dy), mx = a + b - 0.5, mn = Math.abs(a - b) + 0.5, cl = Math.min(mx, Math.max(mn, d));
  const th = Math.atan2(dy, dx);
  const al = Math.acos(Math.min(1, Math.max(-1, (a * a + cl * cl - b * b) / (2 * a * cl))));
  return {ex: sx + side * a * Math.cos(th + sigma * al), ey: sy + a * Math.sin(th + sigma * al), hx: sx + side * cl * Math.cos(th), hy: sy + cl * Math.sin(th)};
}
export type Hold = 'phone' | 'phoneOff' | 'bag' | 'mega' | 'book' | 'pencil' | 'plate' | null;
export type DaniProps = {
  x?: number; y?: number; scale?: number; flip?: boolean; pal?: Pal; hair?: 'quiff' | 'curly' | 'bun' | 'spiky' | 'none';
  expr?: Expr; look?: [number, number];
  hl?: [number, number]; hr?: [number, number]; bendL?: number; bendR?: number;
  holdL?: Hold; holdR?: Hold; holdRot?: [number, number]; screen?: React.ReactNode;
  lean?: number; tilt?: number; bob?: number; walk?: number | null; stance?: number; seed?: number; stubble?: boolean;
};
const REST_L: [number, number] = [-104, -146], REST_R: [number, number] = [104, -146];
const SH = 84, SY = -314;

const Prop: React.FC<{k: Hold; rot: number; screen?: React.ReactNode}> = ({k, rot, screen}) => {
  if (!k) return null;
  return (
    <g transform={`rotate(${rot})`} strokeLinejoin="round" strokeLinecap="round">
      {(k === 'phone' || k === 'phoneOff') && (<g transform="translate(0,-34)">
        <rect x={-24} y={-44} width={48} height={88} rx={10} fill="#262A2E" stroke={OUT} strokeWidth={6} />
        <rect x={-18} y={-37} width={36} height={74} rx={6} fill={k === 'phone' ? '#E9FFD9' : '#0f1311'} />
        {k === 'phone' && (screen ?? <g><rect x={-14} y={-28} width={28} height={9} rx={4} fill="#25D366" /><rect x={-14} y={-14} width={20} height={9} rx={4} fill="#fff" stroke="#cfd8cc" strokeWidth={1}/><rect x={-6} y={0} width={20} height={9} rx={4} fill="#A7FF6B" /></g>)}
      </g>)}
      {k === 'bag' && (<g transform="translate(0,20)"><path d="M -22 -58 Q -22 -88 0 -88 Q 22 -88 22 -58" fill="none" stroke={OUT} strokeWidth={6} /><rect x={-38} y={-60} width={76} height={86} rx={8} fill="#A7FF6B" stroke={OUT} strokeWidth={6} /><circle cx={0} cy={-18} r={15} fill="#fff" stroke={OUT} strokeWidth={4} /><text x={0} y={-11} fontFamily="Montserrat" fontWeight={900} fontSize={22} textAnchor="middle" fill="#383838">%</text></g>)}
      {k === 'mega' && (<g transform="translate(6,-24) rotate(-70)"><path d="M -14 -16 L 54 -44 L 54 44 L -14 16 Z" fill="#fff" stroke={OUT} strokeWidth={6} /><rect x={-30} y={-18} width={20} height={36} rx={6} fill="#39713E" stroke={OUT} strokeWidth={6} /><ellipse cx={54} cy={0} rx={10} ry={44} fill="#A7FF6B" stroke={OUT} strokeWidth={6} /></g>)}
      {k === 'book' && (<g transform="translate(0,-26)"><rect x={-34} y={-44} width={68} height={88} rx={6} fill="#fff" stroke={OUT} strokeWidth={6} /><rect x={-34} y={-44} width={12} height={88} rx={4} fill="#39713E" stroke={OUT} strokeWidth={5} /><path d="M -12 -22 H 24 M -12 -6 H 24 M -12 10 H 16" stroke="#8a8f87" strokeWidth={4} /></g>)}
      {k === 'pencil' && (<g transform="translate(0,-16) rotate(40)"><rect x={-5} y={-40} width={10} height={64} rx={3} fill="#FFD84A" stroke={OUT} strokeWidth={5} /><path d="M -5 24 L 0 38 L 5 24 Z" fill="#F2C9A0" stroke={OUT} strokeWidth={4} /></g>)}
      {k === 'plate' && (<g transform="translate(0,-10)"><ellipse cx={0} cy={0} rx={54} ry={14} fill="#fff" stroke={OUT} strokeWidth={6} /><ellipse cx={0} cy={-6} rx={36} ry={9} fill="#F5C26B" stroke={OUT} strokeWidth={4} /></g>)}
    </g>
  );
};

const Hair: React.FC<{pal: Pal; style: string}> = ({pal, style}) => {
  if (style === 'none') return null;
  const base = <path d="M -108 -446 Q -118 -540 -52 -548 Q 0 -558 52 -548 Q 118 -540 108 -446 L 97 -466 Q 92 -502 72 -518 Q 30 -532 0 -524 Q -30 -532 -72 -518 Q -92 -502 -97 -466 Z" fill={pal.hair} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />;
  if (style === 'curly') return (<g>{base}{[[-84, -526, 34], [-46, -552, 38], [0, -562, 40], [46, -552, 38], [84, -526, 34], [-100, -490, 26], [100, -490, 26], [-22, -526, 30], [26, -528, 30]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={pal.hair} stroke={OUT} strokeWidth={6} />)}{[[-46, -562], [20, -572], [70, -540]].map(([x, y], i) => <path key={i} d={`M ${x - 12} ${y} q 10 -10 22 -2`} stroke={pal.hair2} strokeWidth={5} fill="none" strokeLinecap="round" />)}</g>);
  if (style === 'bun') return (<g><circle cx={0} cy={-584} r={34} fill={pal.hair} stroke={OUT} strokeWidth={7} />{base}<path d="M -40 -540 Q 0 -552 44 -538" stroke={pal.hair2} strokeWidth={6} fill="none" strokeLinecap="round" /></g>);
  if (style === 'spiky') return (<g>{base}{[-70, -35, 0, 35, 70].map((x, i) => <path key={i} d={`M ${x - 22} -540 L ${x + (i - 2) * 6} ${-596 - (i % 2) * 12} L ${x + 22} -540 Z`} fill={pal.hair} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />)}</g>);
  // quiff: fade sides + voluminous swept-up pompadour
  return (
    <g>
      {base}
      <path d="M -92 -524 C -112 -592 -34 -616 38 -602 C 100 -592 114 -546 102 -520 C 70 -550 20 -560 -30 -550 C -62 -544 -82 -536 -92 -524 Z" fill={pal.hair} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -66 -566 C -62 -596 -30 -608 8 -604" stroke={pal.hair2} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M 34 -600 C 64 -594 84 -576 90 -552" stroke={pal.hair2} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 22 -548 C 58 -540 78 -514 66 -486 C 60 -502 44 -512 24 -516 C 34 -526 32 -538 22 -548 Z" fill={pal.hair} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 38 -534 C 50 -528 58 -518 60 -504" stroke={pal.hair2} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M -40 -552 C -20 -560 4 -556 18 -548" stroke={OUT} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.4} />
      {[-1, 1].map((s) => <path key={s} d={`M ${s * 102} -470 L ${s * 106} -420 L ${s * 93} -424 Z`} fill={pal.hair} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />)}
    </g>
  );
};

const Face: React.FC<{e: E; look: [number, number]; pal: Pal; blink: boolean; f: number; stubble: boolean}> = ({e, look, pal, blink, f, stubble}) => {
  const lx = look[0] * 9, ly = look[1] * 7;
  const eyeStyle = blink && (e.eye === 'round' || e.eye === 'wide') ? 'closed' : e.eye;
  const eye = (s: number) => {
    const cx = s * 40 + look[0] * 5;
    const cy = -440 + look[1] * 3;
    if (eyeStyle === 'happy') return <path key={s} d={`M ${cx - 20} ${cy + 6} Q ${cx} ${cy - 22} ${cx + 20} ${cy + 6}`} stroke={OUT} strokeWidth={8} fill="none" strokeLinecap="round" />;
    if (eyeStyle === 'closed') return <path key={s} d={`M ${cx - 20} ${cy} Q ${cx} ${cy + 12} ${cx + 20} ${cy}`} stroke={OUT} strokeWidth={8} fill="none" strokeLinecap="round" />;
    const ry = eyeStyle === 'wide' ? 34 : 29, rx = eyeStyle === 'wide' ? 27 : 25, pr = eyeStyle === 'wide' ? 9 : 12.5;
    const id = `ec${s}${eyeStyle}`;
    return (
      <g key={s}>
        <clipPath id={id}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" stroke={OUT} strokeWidth={6} />
        <g clipPath={`url(#${id})`}>
          <circle cx={cx + lx} cy={cy + ly} r={pr} fill="#2a1a14" /><circle cx={cx + lx} cy={cy + ly} r={pr * 0.55} fill="#0b0707" />
          <circle cx={cx + lx - 4} cy={cy + ly - 5} r={4} fill="#fff" />
          {eyeStyle === 'half' && <rect x={cx - rx - 2} y={cy - ry - 2} width={rx * 2 + 4} height={ry + 10} fill={pal.skin} />}
        </g>
        {eyeStyle === 'half' && <path d={`M ${cx - rx} ${cy + 8} H ${cx + rx}`} stroke={OUT} strokeWidth={6} strokeLinecap="round" />}
      </g>
    );
  };
  const m = e.mouth;
  const dark = '#6D2323';
  return (
    <g>
      {stubble && <g opacity={0.22} fill="#3a2418">{Array.from({length: 26}).map((_, i) => <circle key={i} cx={-58 + (i * 37) % 116} cy={-378 + ((i * 53) % 30)} r={2.2} />)}</g>}
      {e.blush && <g fill="#F0806F" opacity={0.55}><ellipse cx={-72} cy={-402} rx={18} ry={11} /><ellipse cx={72} cy={-402} rx={18} ry={11} /></g>}
      {[-1, 1].map(eye)}
      {e.bags && <g stroke={pal.skin2} strokeWidth={5} fill="none" strokeLinecap="round"><path d="M -60 -408 Q -40 -398 -20 -408" /><path d="M 20 -408 Q 40 -398 60 -408" /></g>}
      {[-1, 1].map((s) => {
        const [yo, ang] = e.brow;
        return <path key={s} d={`M ${-26} 0 Q 0 -8 26 0`} transform={`translate(${s * 42} ${-486 + yo + look[1] * 2}) rotate(${s * ang})`} stroke={pal.hair} strokeWidth={13} fill="none" strokeLinecap="round" />;
      })}
      <path d="M 3 -432 Q 17 -410 1 -406" stroke={pal.skin2} strokeWidth={6} fill="none" strokeLinecap="round" transform={`translate(${look[0] * 6} ${look[1] * 2})`} />
      <g transform={`translate(${look[0] * 5} ${look[1] * 2})`}>
        {m === 'flat' && <path d="M -20 -382 H 20" stroke={OUT} strokeWidth={7} strokeLinecap="round" />}
        {m === 'smile' && <path d="M -28 -392 Q 0 -362 28 -392" stroke={OUT} strokeWidth={7} fill="none" strokeLinecap="round" />}
        {m === 'smirk' && <path d="M -22 -382 Q 8 -372 30 -396" stroke={OUT} strokeWidth={7} fill="none" strokeLinecap="round" />}
        {m === 'frown' && <path d="M -26 -372 Q 0 -396 26 -372" stroke={OUT} strokeWidth={7} fill="none" strokeLinecap="round" />}
        {m === 'worry' && <path d="M -28 -376 Q -14 -388 0 -376 Q 14 -364 28 -376" stroke={OUT} strokeWidth={7} fill="none" strokeLinecap="round" />}
        {m === 'o' && <ellipse cx={0} cy={-378} rx={15} ry={20} fill={dark} stroke={OUT} strokeWidth={6} />}
        {m === 'grin' && (<g><clipPath id="gr"><path d="M -38 -396 Q 0 -388 38 -396 Q 34 -354 0 -352 Q -34 -354 -38 -396 Z" /></clipPath><path d="M -38 -396 Q 0 -388 38 -396 Q 34 -354 0 -352 Q -34 -354 -38 -396 Z" fill={dark} /><g clipPath="url(#gr)"><rect x={-40} y={-398} width={80} height={14} fill="#fff" /><ellipse cx={0} cy={-352} rx={20} ry={14} fill="#F0808A" /></g><path d="M -38 -396 Q 0 -388 38 -396 Q 34 -354 0 -352 Q -34 -354 -38 -396 Z" fill="none" stroke={OUT} strokeWidth={6} strokeLinejoin="round" /></g>)}
        {m === 'scream' && (<g><clipPath id="sc"><ellipse cx={0} cy={-370} rx={32} ry={40} /></clipPath><ellipse cx={0} cy={-370} rx={32} ry={40} fill={dark} /><g clipPath="url(#sc)"><rect x={-34} y={-412} width={68} height={14} fill="#fff" /><ellipse cx={0} cy={-338} rx={22} ry={16} fill="#F0808A" /></g><ellipse cx={0} cy={-370} rx={32} ry={40} fill="none" stroke={OUT} strokeWidth={6} /></g>)}
      </g>
      {e.sweat && [0, 1].map((i) => {const k = ((f * 0.04 + i * 0.5) % 1); return <path key={i} d="M 0 -18 Q 12 2 0 10 Q -12 2 0 -18 Z" fill="#9FD8FF" stroke={OUT} strokeWidth={4} transform={`translate(${i ? -104 : 100} ${-500 + k * 56}) scale(${0.9 - i * 0.2})`} opacity={1 - k * 0.7} />;})}
      {e.tear && <path d="M 0 -18 Q 12 2 0 10 Q -12 2 0 -18 Z" fill="#9FD8FF" stroke={OUT} strokeWidth={4} transform={`translate(${-52} ${-408 + ((f * 0.05) % 1) * 40})`} />}
    </g>
  );
};

export const Dani: React.FC<DaniProps> = ({
  x = 0, y = 0, scale = 1, flip = false, pal = DANI, hair = 'quiff', expr = 'neutral', look = [0, 0], hl, hr, bendL, bendR, holdL = null, holdR = null, holdRot = [0, 0], screen,
  lean = 0, tilt = 0, bob = 0, walk = null, stance = 0, seed = 0, stubble = true,
}) => {
  const f = useCurrentFrame();
  const e = EX[expr];
  const breathe = Math.sin((f + seed * 17) * 0.11);
  const blink = ((f + seed * 29 + 40) % 96) < 4;
  const hLp = hl ?? REST_L, hRp = hr ?? REST_R;
  const aL = ik(-SH, SY, hLp[0], hLp[1], 92, 88, -1, bendL ?? (hLp[1] > SY + 40 ? -1 : 1));
  const aR = ik(SH, SY, hRp[0], hRp[1], 92, 88, 1, bendR ?? (hRp[1] > SY + 40 ? -1 : 1));
  const ph = walk ?? 0;
  const lift = (s: number) => (walk === null ? 0 : Math.max(0, Math.sin(ph * 2 + (s > 0 ? Math.PI : 0))) * 34);
  const legs = [-1, 1].map((s) => {
    const fx = s * (40 + stance) + (walk === null ? 0 : Math.sin(ph * 2 + (s > 0 ? Math.PI : 0)) * 14), fy = -lift(s) - 6;
    return {s, ...ik(s * 36, -196, fx, fy, 96, 96, s, -1)};
  });
  const walkBob = walk === null ? 0 : -Math.abs(Math.sin(ph * 2)) * 10;
  const handR = (hh: {hx: number; hy: number}, rot: number, h: Hold) => (<g transform={`translate(${hh.hx} ${hh.hy})`}><Prop k={h} rot={rot} screen={screen} /></g>);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <ellipse cx={0} cy={4} rx={120} ry={16} fill="#000" opacity={0.1} />
      <g transform={`translate(0 ${bob + walkBob})`}>
        {/* legs */}
        {legs.map((l) => (
          <g key={l.s} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <polyline points={`${l.s * 36},-196 ${l.ex},${l.ey} ${l.hx},${l.hy}`} stroke={OUT} strokeWidth={58} />
            <polyline points={`${l.s * 36},-196 ${l.ex},${l.ey} ${l.hx},${l.hy}`} stroke={pal.pants} strokeWidth={44} />
            <rect x={l.hx - 44 + l.s * 4} y={l.hy - 10} width={88} height={40} rx={18} fill={pal.shoe} stroke={OUT} strokeWidth={6} />
            <path d={`M ${l.hx - 40 + l.s * 4} ${l.hy + 18} H ${l.hx + 40 + l.s * 4}`} stroke="#A7FF6B" strokeWidth={6} />
          </g>
        ))}
        <g transform={`rotate(${lean} 0 -190) translate(0 ${breathe * 1.2})`}>
          {/* torso */}
          <rect x={-78} y={-232} width={156} height={56} rx={20} fill={pal.pants} stroke={OUT} strokeWidth={7} />
          <path d="M -90 -330 Q -96 -348 -72 -348 L 72 -348 Q 96 -348 90 -330 L 76 -200 Q 74 -188 62 -188 L -62 -188 Q -74 -188 -76 -200 Z" fill={pal.shirt} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
          <path d="M 52 -340 L 74 -206 L 62 -190 L 40 -190 Z" fill={pal.shirt2} opacity={0.6} />
          {pal.apron && (<g strokeLinejoin="round">
            <path d="M -52 -334 L 52 -334 L 72 -196 Q 0 -184 -72 -196 Z" fill={pal.apron} stroke={OUT} strokeWidth={7} />
            <path d="M -52 -334 L -80 -346 M 52 -334 L 80 -346" stroke={OUT} strokeWidth={7} strokeLinecap="round" />
            <path d="M -52 -334 L -80 -346 M 52 -334 L 80 -346" stroke={pal.apron} strokeWidth={3} strokeLinecap="round" />
            <rect x={-40} y={-262} width={80} height={52} rx={10} fill="#86DB4C" stroke={OUT} strokeWidth={6} />
            <rect x={-20} y={-284} width={26} height={40} rx={6} fill="#262A2E" stroke={OUT} strokeWidth={5} /><rect x={-15} y={-278} width={16} height={26} rx={3} fill="#25D366" />
            <rect x={14} y={-292} width={9} height={44} rx={3} fill="#FFD84A" stroke={OUT} strokeWidth={4} transform="rotate(12 18 -270)" />
          </g>)}
          {/* neck */}
          <rect x={-30} y={-362} width={60} height={30} rx={14} fill={pal.skin2} stroke={OUT} strokeWidth={6} />
          {/* arms */}
          {[{a: aL, s: -1}, {a: aR, s: 1}].map(({a, s}) => (
            <g key={s} strokeLinecap="round" strokeLinejoin="round" fill="none">
              <polyline points={`${s * SH},${SY} ${a.ex},${a.ey} ${a.hx},${a.hy}`} stroke={OUT} strokeWidth={50} />
              <polyline points={`${s * SH},${SY} ${a.ex},${a.ey}`} stroke={pal.shirt} strokeWidth={38} />
              <polyline points={`${a.ex},${a.ey} ${a.hx},${a.hy}`} stroke={pal.skin} strokeWidth={30} />
              <circle cx={s * SH} cy={SY} r={19} fill={pal.shirt} />
            </g>
          ))}
          {handR(aL, holdRot[0], holdL)}
          {handR(aR, holdRot[1], holdR)}
          {[aL, aR].map((a, i) => <circle key={i} cx={a.hx} cy={a.hy} r={22} fill={pal.skin} stroke={OUT} strokeWidth={6} />)}
          {/* head */}
          <g transform={`translate(0 ${-340 + breathe * 1.6}) rotate(${tilt}) translate(0 340)`}>
            {[-1, 1].map((s) => <g key={s}><circle cx={s * 106} cy={-432} r={22} fill={pal.skin} stroke={OUT} strokeWidth={6} /><circle cx={s * 106} cy={-432} r={9} fill={pal.skin2} /></g>)}
            <path d="M -106 -450 Q -112 -352 0 -340 Q 112 -352 106 -450 Q 100 -546 0 -548 Q -100 -546 -106 -450 Z" fill={pal.skin} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
            <path d="M 70 -400 Q 96 -450 90 -490 Q 112 -440 100 -396 Q 86 -350 40 -348 Q 70 -362 70 -400 Z" fill={pal.skin2} opacity={0.5} />
            <Face e={e} look={look} pal={pal} blink={blink} f={f} stubble={stubble && !!pal.apron} />
            <Hair pal={pal} style={hair} />
          </g>
        </g>
      </g>
    </g>
  );
};
