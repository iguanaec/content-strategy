import React from 'react';
import {useCurrentFrame} from 'remotion';

export const OUT = '#1E1B1B';
const OW = 1.6; // half outline width (units; character is ~576 tall)
type Pt = [number, number];
export type Pal = {skin: string; skin2: string; lip: string; shirt: string; shirt2: string; apron: string | null; apron2: string; pants: string; hair: string; hair2: string; shoe: string; fem?: boolean; kid?: boolean};
export const DANI: Pal = {skin: '#CF9468', skin2: '#A86C46', lip: '#B2655B', shirt: '#39713E', shirt2: '#2B5830', apron: '#A7FF6B', apron2: '#86DB4C', pants: '#383838', hair: '#251D20', hair2: '#4A3A3E', shoe: '#FFFFFF'};
export const CLIENT_A: Pal = {skin: '#E4B08A', skin2: '#BE8A64', lip: '#C2766C', shirt: '#E9E4D8', shirt2: '#CFC8B8', apron: null, apron2: '', pants: '#4A5368', hair: '#6B3F22', hair2: '#8A5A38', shoe: '#FFFFFF', fem: true};
export const CLIENT_B: Pal = {skin: '#B97A52', skin2: '#946040', lip: '#9F5A4E', shirt: '#5B6470', shirt2: '#48505A', apron: null, apron2: '', pants: '#2F3A52', hair: '#2A1A14', hair2: '#4A3226', shoe: '#FFFFFF'};
export const MOM: Pal = {skin: '#C48A62', skin2: '#9E6A48', lip: '#B0605A', shirt: '#A7FF6B', shirt2: '#86DB4C', apron: null, apron2: '', pants: '#383838', hair: '#2A1A14', hair2: '#4A3226', shoe: '#FFFFFF', fem: true};
export const KID: Pal = {skin: '#DCA075', skin2: '#B87F58', lip: '#B86A60', shirt: '#39713E', shirt2: '#2B5830', apron: null, apron2: '', pants: '#383838', hair: '#251D20', hair2: '#4A3A3E', shoe: '#FFFFFF', kid: true};

export type Expr = 'neutral' | 'happy' | 'grin' | 'worry' | 'panic' | 'sad' | 'think' | 'surprise' | 'calm' | 'tired' | 'smirk';
type E = {brow: [number, number]; eye: 'open' | 'happy' | 'wide' | 'half'; mouth: string; sweat?: boolean; tear?: boolean; blush?: boolean; bags?: boolean; lines?: boolean};
const EX: Record<Expr, E> = {
  neutral: {brow: [0, 0], eye: 'open', mouth: 'flat'},
  happy: {brow: [-1, 3], eye: 'open', mouth: 'smile', blush: true, lines: true},
  grin: {brow: [-2, 5], eye: 'happy', mouth: 'grin', blush: true, lines: true},
  worry: {brow: [-1.5, 15], eye: 'open', mouth: 'worry', sweat: true},
  panic: {brow: [-4, 17], eye: 'wide', mouth: 'scream', sweat: true},
  sad: {brow: [0, 17], eye: 'half', mouth: 'frown', tear: true},
  think: {brow: [-1, -9], eye: 'open', mouth: 'smirk'},
  surprise: {brow: [-4.5, 6], eye: 'wide', mouth: 'o'},
  calm: {brow: [-0.5, 2], eye: 'happy', mouth: 'smile', blush: true, lines: true},
  tired: {brow: [0.5, 11], eye: 'half', mouth: 'flat', bags: true, sweat: true},
  smirk: {brow: [-1.5, -7], eye: 'open', mouth: 'smirk', blush: true, lines: true},
};

function ik(sx: number, sy: number, tx: number, ty: number, a: number, b: number, side: number, sigma: number) {
  const dx = side * (tx - sx), dy = ty - sy;
  const d = Math.hypot(dx, dy), mx = a + b - 0.5, mn = Math.abs(a - b) + 0.5, cl = Math.min(mx, Math.max(mn, d));
  const th = Math.atan2(dy, dx);
  const al = Math.acos(Math.min(1, Math.max(-1, (a * a + cl * cl - b * b) / (2 * a * cl))));
  return {ex: sx + side * a * Math.cos(th + sigma * al), ey: sy + a * Math.sin(th + sigma * al), hx: sx + side * cl * Math.cos(th), hy: sy + cl * Math.sin(th)};
}
const segPath = (a: Pt, b: Pt, wa: number, wb: number) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  return `M ${a[0] + (nx * wa) / 2} ${a[1] + (ny * wa) / 2} L ${b[0] + (nx * wb) / 2} ${b[1] + (ny * wb) / 2} L ${b[0] - (nx * wb) / 2} ${b[1] - (ny * wb) / 2} L ${a[0] - (nx * wa) / 2} ${a[1] - (ny * wa) / 2} Z`;
};
// tapered chain with joints, drawn with a unified outline
const Limb: React.FC<{pts: Pt[]; ws: number[]; fill: string}> = ({pts, ws, fill}) => {
  const shapes = (extra: number) => (
    <g>
      {pts.slice(1).map((p, i) => <path key={i} d={segPath(pts[i], p, ws[i] + extra, ws[i + 1] + extra)} />)}
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={(ws[i] + extra) / 2} />)}
    </g>
  );
  return (<g><g fill={OUT} stroke={OUT} strokeWidth={0}>{shapes(OW * 2)}</g><g fill={fill}>{shapes(0)}</g></g>);
};

export type Hold = 'phone' | 'bag' | 'mega' | null;
export type Hand = 'relax' | 'open' | 'fist' | 'point';
export type DaniProps = {
  x?: number; y?: number; scale?: number; flip?: boolean; pal?: Pal; hair?: 'quiff' | 'curly' | 'bun' | 'spiky' | 'short' | 'none';
  expr?: Expr; look?: [number, number];
  hl?: [number, number]; hr?: [number, number]; bendL?: number; bendR?: number;
  holdL?: Hold; holdR?: Hold; holdRot?: [number, number]; handL?: Hand; handR?: Hand; typing?: number;
  lean?: number; tilt?: number; bob?: number; walk?: number | null; stance?: number; seed?: number; stubble?: boolean;
};
export const REST_L: [number, number] = [-70, -284], REST_R: [number, number] = [70, -284];
const SX = 66, SY = -452, UA = 96, FA = 80;

// ---------------- hands ----------------
const finger = (x0: number, y0: number, len: number, w: number, ang: number): {d: string; tip: Pt; base: Pt; w: number} => {
  const a = (ang * Math.PI) / 180, x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
  return {d: segPath([x0, y0], [x1, y1], w, w * 0.88), tip: [x1, y1], base: [x0, y0], w};
};
const HandShape: React.FC<{kind: Hand; pal: Pal; thumbSign: number; t?: number}> = ({kind, pal, thumbSign, t = 0}) => {
  const ts = thumbSign;
  const fs = kind === 'open' ? [[-9.5, 30, 8, -9], [-3, 34, 8.4, -2], [3.5, 31, 8, 5], [9.5, 25, 7, 13]]
    : kind === 'relax' ? [[-9.5, 22, 8, -4], [-3, 25, 8.4, 0], [3.5, 23, 8, 5], [9.5, 19, 7, 11]]
    : kind === 'point' ? [[-9.5, 31, 7.6, -3], [-3, 11, 8.4, 0], [3.5, 10, 8, 0], [9.5, 9, 7, 0]]
    : [[-9.5, 10, 8.4, 0], [-3, 11, 8.8, 0], [3.5, 10, 8.4, 0], [9.5, 9, 7.4, 0]];
  const F = fs.map(([y, l, w, a]) => finger(28, ts * y, l, w, a));
  const palm = `M 0 ${-11} Q 4 ${-13.5} 10 ${-14} L 28 ${-13} Q 33 ${-12} 33 ${-8} L 33 8 Q 33 12 28 13 L 10 14 Q 4 13.5 0 11 Z`;
  const thumbA = kind === 'open' ? 38 : kind === 'fist' ? 72 : kind === 'point' ? 64 : 24;
  const th = finger(10, -ts * 13, kind === 'fist' || kind === 'point' ? 19 : 23, 9.4, -ts * thumbA);
  const parts = (extra: number) => (
    <g>
      <path d={palm} transform="" />
      {F.map((f, i) => <g key={i}><path d={f.d} /><circle cx={f.tip[0]} cy={f.tip[1]} r={(f.w * 0.88 + extra) / 2} /></g>)}
      <path d={th.d} /><circle cx={th.tip[0]} cy={th.tip[1]} r={(th.w * 0.88 + extra) / 2} />
    </g>
  );
  const grow = (extra: number) => (<g strokeLinejoin="round" strokeLinecap="round">{parts(extra)}</g>);
  return (
    <g>
      <g fill={OUT} stroke={OUT} strokeWidth={OW * 2}>{grow(OW * 2)}</g>
      <g fill={pal.skin}>{grow(0)}</g>
      <g stroke={pal.skin2} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.9}>
        {F.slice(0, 3).map((f, i) => <path key={i} d={`M ${f.base[0] - 2} ${(f.base[1] + F[i + 1].base[1]) / 2} L ${Math.min(f.tip[0], F[i + 1].tip[0])} ${(f.tip[1] + F[i + 1].tip[1]) / 2}`} />)}
        {kind === 'fist' && F.map((f, i) => <path key={'k' + i} d={`M ${f.base[0] + 5} ${f.base[1] - 3} Q ${f.base[0] + 7} ${f.base[1]} ${f.base[0] + 5} ${f.base[1] + 3}`} />)}
      </g>
    </g>
  );
};
const HandAt: React.FC<{w: Pt; dir: number; side: number; kind: Hand; pal: Pal}> = ({w, dir, side, kind, pal}) => {
  const wy = -Math.sin(dir);
  const ts = wy * -side >= 0 ? 1 : -1;
  return (<g transform={`translate(${w[0]} ${w[1]}) rotate(${(dir * 180) / Math.PI})`}><HandShape kind={kind} pal={pal} thumbSign={ts} /></g>);
};
// prop held with fingertips visible (phone) or fist (bag, megaphone)
const Held: React.FC<{k: Hold; pal: Pal; rot: number; side: number; typing: number}> = ({k, pal, rot, side, typing}) => {
  if (!k) return null;
  const tip = (x: number, y: number, key: number) => (<g key={key}><rect x={x - 1} y={y - 3.4} width={9} height={6.8} rx={3.4} fill={OUT} /><rect x={x} y={y - 2.3} width={7} height={4.6} rx={2.3} fill={pal.skin} /></g>);
  return (
    <g transform={`scale(${side} 1) rotate(${rot})`}>
      {k === 'phone' && (<g>
        <g transform="translate(0 -12)">
          <rect x={-12.2} y={-26.2} width={24.4} height={52.4} rx={4.6} fill={OUT} /><rect x={-11} y={-25} width={22} height={50} rx={3.6} fill="#262A2E" />
          <rect x={-9.4} y={-23.4} width={18.8} height={46.8} rx={2.6} fill="#E9FFD9" />
          <rect x={-6.5} y={-19} width={13} height={4.6} rx={2.3} fill="#25D366" /><rect x={-7.5} y={-11} width={11} height={4.6} rx={2.3} fill="#fff" /><rect x={-3.5} y={-3} width={11} height={4.6} rx={2.3} fill="#A7FF6B" />
        </g>
        {[-6, 1, 8].map((y, i) => tip(8, y + 8, i))}
        <g transform={`translate(${-9 - typing * 2} ${14 - typing * 3}) rotate(${-24 + typing * 10})`}><rect x={-2} y={-4.8} width={19} height={9.6} rx={4.8} fill={OUT} /><rect x={-1} y={-3.6} width={16.5} height={7.2} rx={3.6} fill={pal.skin} /></g>
      </g>)}
      {k === 'bag' && (<g transform="translate(0 4)">
        <path d="M -12 2 Q -12 -22 0 -22 Q 12 -22 12 2" fill="none" stroke={OUT} strokeWidth={4.4} /><path d="M -12 2 Q -12 -22 0 -22 Q 12 -22 12 2" fill="none" stroke="#fff" strokeWidth={2} />
        <rect x={-26} y={4} width={52} height={62} rx={5} fill={OUT} /><rect x={-24.6} y={5.4} width={49.2} height={59.2} rx={4} fill="#A7FF6B" />
        <rect x={-24.6} y={5.4} width={49.2} height={11} rx={3} fill="#fff" /><circle cx={0} cy={36} r={11} fill="#fff" stroke={OUT} strokeWidth={1.6} />
        <text x={0} y={41} textAnchor="middle" fontFamily="Anton" fontSize={15} fill="#383838">%</text>
        <g transform="translate(0 -2)"><HandShape kind="fist" pal={pal} thumbSign={1} /></g>
      </g>)}
      {k === 'mega' && (<g transform="translate(4 -10) rotate(-78)">
        <path d="M -4 -7 L 30 -22 L 30 22 L -4 7 Z" fill="#fff" stroke={OUT} strokeWidth={2.6} strokeLinejoin="round" />
        <rect x={-16} y={-8} width={12} height={16} rx={3} fill="#39713E" stroke={OUT} strokeWidth={2.4} /><ellipse cx={30} cy={0} rx={5} ry={22} fill="#A7FF6B" stroke={OUT} strokeWidth={2.6} />
        <g transform="translate(-6 0) rotate(78)"><HandShape kind="fist" pal={pal} thumbSign={1} /></g>
      </g>)}
    </g>
  );
};

// ---------------- hair ----------------
const Hair: React.FC<{pal: Pal; style: string}> = ({pal, style}) => {
  if (style === 'none') return null;
  const st = {stroke: OUT, strokeWidth: OW * 2, strokeLinejoin: 'round' as const};
  const cap = (<path d="M -31 -546 C -33 -572 -19 -583 0 -583 C 19 -583 33 -572 31 -546 C 30 -538 29 -532 28 -526 L 27 -546 C 22 -555 10 -559 0 -557 C -10 -559 -22 -555 -27 -546 L -28 -526 C -29 -532 -30 -538 -31 -546 Z" fill={pal.hair} {...st} />);
  if (style === 'curly') return (<g>{cap}{[[-24, -574, 8], [-12, -584, 9], [2, -588, 9], [16, -584, 9], [27, -572, 8], [-31, -560, 6], [31, -560, 6], [-4, -574, 8], [10, -574, 8]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={pal.hair} {...st} />)}</g>);
  if (style === 'bun') return (<g><circle cx={0} cy={-596} r={11} fill={pal.hair} {...st} />{cap}<path d="M -20 -566 Q 0 -574 22 -564" stroke={pal.hair2} strokeWidth={2} fill="none" strokeLinecap="round" />{[-1, 1].map((s) => <path key={s} d={`M ${s * 31} -548 Q ${s * 35} -520 ${s * 30} -500`} fill="none" stroke={OUT} strokeWidth={OW * 2 + 6} strokeLinecap="round" opacity={0} />)}</g>);
  if (style === 'spiky') return (<g>{cap}{[-22, -11, 0, 11, 22].map((x, i) => <path key={i} d={`M ${x - 8} -574 L ${x + (i - 2) * 2} ${-596 - (i % 2) * 6} L ${x + 8} -574 Z`} fill={pal.hair} {...st} />)}</g>);
  if (style === 'short') return (<g>{cap}<path d="M -22 -566 Q 0 -578 24 -566" stroke={pal.hair2} strokeWidth={2} fill="none" strokeLinecap="round" /></g>);
  return (
    <g>
      {cap}
      <path d="M -27 -557 C -33 -577 -12 -590 10 -586 C 30 -582 36 -567 31 -552 C 24 -562 10 -565 -2 -562 C -12 -560 -20 -558 -27 -557 Z" fill={pal.hair} {...st} />
      <path d="M -20 -572 C -18 -582 -8 -587 3 -586" stroke={pal.hair2} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d="M 12 -585 C 24 -583 30 -576 31 -566" stroke={pal.hair2} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M -2 -574 C 6 -572 14 -567 17 -560" stroke={OUT} strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.5} />
    </g>
  );
};

// ---------------- face ----------------
const HEAD = 'M 0 -578 C 19 -578 31 -563 31 -541 C 31 -527 28 -516 23 -508 C 18 -500 10 -494 0 -494 C -10 -494 -18 -500 -23 -508 C -28 -516 -31 -527 -31 -541 C -31 -563 -19 -578 0 -578 Z';
const Face: React.FC<{e: E; look: [number, number]; pal: Pal; blink: boolean; f: number; stubble: boolean}> = ({e, look, pal, blink, f, stubble}) => {
  const state = blink && (e.eye === 'open' || e.eye === 'wide') ? 'closed' : e.eye;
  const ox = look[0] * 1.6, oy = look[1] * 0.9;
  const eye = (s: number) => {
    const cx = s * 14 + ox, cy = -536 + oy;
    const wide = state === 'wide';
    const W = wide ? 8.4 : 7.6, up = wide ? 7.6 : 5.6, dn = wide ? 6 : 4.6;
    const sc = `M ${-W} 0 Q 0 ${-up * 1.7} ${W} 0 Q 0 ${dn * 1.7} ${-W} 0 Z`;
    return (
      <g key={s} transform={`translate(${cx} ${cy})`}>
        {state === 'happy' && <path d={`M ${-W} 1.5 Q 0 ${-7.5} ${W} 1.5`} stroke={OUT} strokeWidth={2.2} fill="none" strokeLinecap="round" />}
        {state === 'closed' && <path d={`M ${-W} 0 Q 0 3.6 ${W} 0`} stroke={OUT} strokeWidth={2} fill="none" strokeLinecap="round" />}
        {(state === 'open' || state === 'wide' || state === 'half') && (<g>
          <clipPath id={`ec${state}`}><path d={sc} /></clipPath>
          <path d={sc} fill="#F6F2EC" />
          <g clipPath={`url(#ec${state})`}>
            <circle cx={look[0] * 2.4} cy={look[1] * 1.5} r={wide ? 3.5 : 4.1} fill="#4A2D1D" /><circle cx={look[0] * 2.4} cy={look[1] * 1.5} r={wide ? 1.7 : 2} fill="#0B0707" />
            <circle cx={look[0] * 2.4 - 1.3} cy={look[1] * 1.5 - 1.4} r={1} fill="#fff" />
            {state === 'half' && <rect x={-W - 1} y={-up * 1.7 - 1} width={W * 2 + 2} height={up * 1.7 * 0.95 + 1} fill={pal.skin} />}
          </g>
          <path d={sc} fill="none" stroke={OUT} strokeWidth={1.1} />
          <path d={state === 'half' ? `M ${-W - 0.6} 0.3 Q 0 -2 ${W + 0.6} 0.3` : `M ${-W - 0.6} 0.4 Q 0 ${-up * 1.7 - 1.2} ${W + 0.6} 0.2`} stroke={OUT} strokeWidth={pal.fem ? 2.3 : 1.9} fill="none" strokeLinecap="round" />
          <path d={`M ${-W + 0.4} ${-up * 1.7 - 2.6} Q 0 ${-up * 1.7 - 5.4} ${W + 0.8} ${-up * 1.7 - 2.4}`} stroke={pal.skin2} strokeWidth={0.9} fill="none" opacity={0.75} />
          <path d={`M ${-W + 1.5} ${dn * 1.7 + 1} Q 0 ${dn * 1.7 + 3} ${W - 1.5} ${dn * 1.7 + 1}`} stroke={pal.skin2} strokeWidth={0.8} fill="none" opacity={0.5} />
        </g>)}
      </g>
    );
  };
  const m = e.mouth, y0 = -505, dark = '#4E1B1B';
  const lipUp = pal.lip, lipLo = pal.lip;
  return (
    <g>
      <path d={HEAD.replace('M 0 -578', 'M 0 -578')} fill="none" />
      <path d="M 16 -576 C 30 -571 31 -550 31 -540 C 31 -524 27 -512 20 -503 C 14 -497 8 -495 3 -494 C 14 -508 22 -526 20 -548 C 19 -560 17 -568 16 -576 Z" fill={pal.skin2} opacity={0.32} />
      {stubble && <path d="M -27 -520 Q -26 -506 -15 -498 Q 0 -491 15 -498 Q 26 -506 27 -520 Q 16 -511 0 -512 Q -16 -511 -27 -520 Z" fill="#2E1D14" opacity={0.13} />}
      {e.blush && <g fill="#E3806F" opacity={0.26}><ellipse cx={-20} cy={-519} rx={6.5} ry={3.6} /><ellipse cx={20} cy={-519} rx={6.5} ry={3.6} /></g>}
      {[-1, 1].map(eye)}
      {e.bags && <g stroke={pal.skin2} strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.8}><path d="M -21 -528 Q -14 -524 -7 -528" /><path d="M 7 -528 Q 14 -524 21 -528" /></g>}
      {[-1, 1].map((s) => {
        const [yo, ang] = e.brow;
        return <path key={s} d={pal.fem ? 'M -9 1 Q 0 -2.6 9 -0.6' : 'M -9.5 1.2 Q 0 -2.8 9.5 -1'} transform={`translate(${s * 15 + look[0] * 1} ${-547 + yo + look[1] * 0.6}) rotate(${s * ang}) scale(${-s} 1)`} stroke={pal.hair} strokeWidth={pal.fem ? 2.5 : 3.6} fill="none" strokeLinecap="round" />;
      })}
      {/* nose */}
      <g transform={`translate(${look[0] * 1.2} ${look[1] * 0.5})`}>
        <path d="M 1.5 -537 Q 4 -526 5.8 -519.5 Q 3 -516 0 -516 Z" fill={pal.skin2} opacity={0.28} />
        <path d="M -2.2 -538 Q -4.4 -527 -5.4 -519.5" stroke={pal.skin2} strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.8} />
        <path d="M -6.6 -518 Q -3.6 -512.5 0 -513.4 Q 3.6 -512.5 6.6 -518" stroke={pal.skin2} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <ellipse cx={-3.3} cy={-515.3} rx={1.3} ry={0.8} fill="#4a2a1e" opacity={0.5} /><ellipse cx={3.3} cy={-515.3} rx={1.3} ry={0.8} fill="#4a2a1e" opacity={0.5} />
      </g>
      {e.lines && <g stroke={pal.skin2} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.7}><path d="M -9.5 -519 Q -13.5 -512 -12 -505" /><path d="M 9.5 -519 Q 13.5 -512 12 -505" /></g>}
      {/* mouth */}
      <g transform={`translate(${look[0] * 1.2} ${look[1] * 0.5})`}>
        {m === 'flat' && <g><path d={`M -10 ${y0} Q -5 ${y0 - 2} 0 ${y0 - 1.2} Q 5 ${y0 - 2} 10 ${y0} Q 5 ${y0 + 0.6} 0 ${y0 + 0.4} Q -5 ${y0 + 0.6} -10 ${y0} Z`} fill={lipUp} stroke={OUT} strokeWidth={0.9} /><path d={`M -8 ${y0 + 0.4} Q 0 ${y0 + 5.4} 8 ${y0 + 0.4} Q 0 ${y0 + 1.6} -8 ${y0 + 0.4} Z`} fill={lipLo} opacity={0.9} /></g>}
        {m === 'smile' && <g><path d={`M -12 ${y0 - 3} Q -5 ${y0 - 0.4} 0 ${y0 - 0.2} Q 5 ${y0 - 0.4} 12 ${y0 - 3} Q 6 ${y0 + 4.4} 0 ${y0 + 4.4} Q -6 ${y0 + 4.4} -12 ${y0 - 3} Z`} fill={lipUp} stroke={OUT} strokeWidth={0.9} strokeLinejoin="round" /><path d={`M -9 ${y0 - 1.6} Q 0 ${y0 + 1.6} 9 ${y0 - 1.6} Q 0 ${y0 - 0.6} -9 ${y0 - 1.6} Z`} fill="#fff" opacity={0.95} /></g>}
        {m === 'smirk' && <g><path d={`M -9 ${y0 + 0.6} Q 0 ${y0 + 0.6} 8 ${y0 - 1.4} Q 11 ${y0 - 2.4} 12 ${y0 - 4} Q 9 ${y0 + 3.6} 0 ${y0 + 3.2} Q -6 ${y0 + 3} -9 ${y0 + 0.6} Z`} fill={lipUp} stroke={OUT} strokeWidth={0.9} strokeLinejoin="round" /></g>}
        {m === 'frown' && <g><path d={`M -10 ${y0 + 2.4} Q -5 ${y0 - 2.6} 0 ${y0 - 2.6} Q 5 ${y0 - 2.6} 10 ${y0 + 2.4} Q 5 ${y0 - 0.8} 0 ${y0 - 0.8} Q -5 ${y0 - 0.8} -10 ${y0 + 2.4} Z`} fill={lipUp} stroke={OUT} strokeWidth={0.9} strokeLinejoin="round" /><path d={`M -4 ${y0 + 5} Q 0 ${y0 + 3.4} 4 ${y0 + 5}`} stroke={pal.skin2} strokeWidth={1} fill="none" opacity={0.7} /></g>}
        {m === 'worry' && <g><path d={`M -10 ${y0 + 1.4} Q -5 ${y0 - 2.2} 0 ${y0 - 0.6} Q 5 ${y0 - 2.2} 10 ${y0 + 1.4} Q 5 ${y0 + 0.6} 0 ${y0 + 1} Q -5 ${y0 + 0.6} -10 ${y0 + 1.4} Z`} fill={lipUp} stroke={OUT} strokeWidth={0.9} strokeLinejoin="round" /><path d={`M -6 ${y0 + 3.6} Q 0 ${y0 + 6} 6 ${y0 + 3.6}`} stroke={pal.skin2} strokeWidth={1.1} fill="none" opacity={0.7} /></g>}
        {m === 'grin' && <g><clipPath id="mg"><path d={`M -13 ${y0 - 3.5} Q 0 ${y0 - 0.4} 13 ${y0 - 3.5} Q 11 ${y0 + 9} 0 ${y0 + 10} Q -11 ${y0 + 9} -13 ${y0 - 3.5} Z`} /></clipPath><path d={`M -13 ${y0 - 3.5} Q 0 ${y0 - 0.4} 13 ${y0 - 3.5} Q 11 ${y0 + 9} 0 ${y0 + 10} Q -11 ${y0 + 9} -13 ${y0 - 3.5} Z`} fill={dark} /><g clipPath="url(#mg)"><rect x={-14} y={y0 - 4} width={28} height={5.6} fill="#fff" /><ellipse cx={0} cy={y0 + 9.5} rx={7} ry={4.4} fill="#D4707A" /></g><path d={`M -13 ${y0 - 3.5} Q 0 ${y0 - 0.4} 13 ${y0 - 3.5} Q 11 ${y0 + 9} 0 ${y0 + 10} Q -11 ${y0 + 9} -13 ${y0 - 3.5} Z`} fill="none" stroke={OUT} strokeWidth={1} strokeLinejoin="round" /></g>}
        {m === 'o' && <g><ellipse cx={0} cy={y0 + 1.6} rx={4.8} ry={6.4} fill={dark} stroke={OUT} strokeWidth={1} /><ellipse cx={0} cy={y0 + 1.6} rx={6.4} ry={7.8} fill="none" stroke={lipUp} strokeWidth={2} opacity={0.9} /></g>}
        {m === 'scream' && <g><clipPath id="ms"><path d={`M -11 ${y0 - 3.5} Q 0 ${y0 - 6} 11 ${y0 - 3.5} Q 12 ${y0 + 11} 0 ${y0 + 13} Q -12 ${y0 + 11} -11 ${y0 - 3.5} Z`} /></clipPath><path d={`M -11 ${y0 - 3.5} Q 0 ${y0 - 6} 11 ${y0 - 3.5} Q 12 ${y0 + 11} 0 ${y0 + 13} Q -12 ${y0 + 11} -11 ${y0 - 3.5} Z`} fill={dark} /><g clipPath="url(#ms)"><rect x={-12} y={y0 - 5} width={24} height={5.6} fill="#fff" /><ellipse cx={0} cy={y0 + 12} rx={8} ry={5.4} fill="#D4707A" /></g><path d={`M -11 ${y0 - 3.5} Q 0 ${y0 - 6} 11 ${y0 - 3.5} Q 12 ${y0 + 11} 0 ${y0 + 13} Q -12 ${y0 + 11} -11 ${y0 - 3.5} Z`} fill="none" stroke={OUT} strokeWidth={1.1} strokeLinejoin="round" /></g>}
      </g>
      {e.sweat && [0, 1].map((i) => {const k = (f * 0.035 + i * 0.5) % 1; return <path key={i} d="M 0 -5 Q 3.4 0 0 3.4 Q -3.4 0 0 -5 Z" fill="#9FD8FF" stroke={OUT} strokeWidth={0.8} transform={`translate(${i ? -34 : 33} ${-556 + k * 22}) scale(${1.4 - i * 0.3})`} opacity={1 - k * 0.7} />;})}
      {e.tear && <path d="M 0 -5 Q 3.4 0 0 3.4 Q -3.4 0 0 -5 Z" fill="#9FD8FF" stroke={OUT} strokeWidth={0.8} transform={`translate(-17 ${-526 + ((f * 0.04) % 1) * 14}) scale(1.1)`} />}
    </g>
  );
};

export const Dani: React.FC<DaniProps> = ({
  x = 0, y = 0, scale = 1, flip = false, pal = DANI, hair = 'quiff', expr = 'neutral', look = [0, 0], hl, hr, bendL, bendR, holdL = null, holdR = null, holdRot = [0, 0], handL, handR, typing = 0,
  lean = 0, tilt = 0, bob = 0, walk = null, stance = 0, seed = 0, stubble = true,
}) => {
  const f = useCurrentFrame();
  const e = EX[expr];
  const breathe = Math.sin((f + seed * 17) * 0.11);
  const blink = ((f + seed * 29 + 40) % 96) < 4;
  const hLp = hl ?? REST_L, hRp = hr ?? REST_R;
  const aL = ik(-SX, SY, hLp[0], hLp[1], UA, FA, -1, bendL ?? (hLp[1] < SY - 30 ? 1 : -1));
  const aR = ik(SX, SY, hRp[0], hRp[1], UA, FA, 1, bendR ?? (hRp[1] < SY - 30 ? 1 : -1));
  const ph = walk ?? 0;
  const lift = (s: number) => (walk === null ? 0 : Math.max(0, Math.sin(ph * 2 + (s > 0 ? Math.PI : 0))) * 40);
  const legs = [-1, 1].map((s) => {
    const fx = s * (26 + stance) + (walk === null ? 0 : Math.sin(ph * 2 + (s > 0 ? Math.PI : 0)) * 14), fy = -20 - lift(s);
    return {s, ...ik(s * 26, -280, fx, fy, 132, 132, s, -1)};
  });
  const walkBob = walk === null ? 0 : -Math.abs(Math.sin(ph * 2)) * 6;
  const dirA = (a: {ex: number; ey: number; hx: number; hy: number}) => Math.atan2(a.hy - a.ey, a.hx - a.ex);
  const hk = (h: Hold, d: Hand | undefined, def: Hand): Hand => (h === 'bag' || h === 'mega' ? 'fist' : d ?? def);
  const arm = (a: ReturnType<typeof ik>, s: number, hold: Hold, hd: Hand | undefined, hrot: number) => {
    const dir = dirA(a), tip: Pt = [a.hx, a.hy];
    const sl = 0.64;
    const sleeveEnd: Pt = [SX * s + (a.ex - SX * s) * sl, SY + (a.ey - SY) * sl];
    return (
      <g key={s}>
        <Limb pts={[[SX * s, SY], [a.ex, a.ey], tip]} ws={[28, 24, 16]} fill={pal.skin} />
        <Limb pts={[[SX * s, SY], sleeveEnd]} ws={[34, 31]} fill={pal.shirt} />
        <path d={segPath([SX * s + (a.ex - SX * s) * (sl - 0.07), SY + (a.ey - SY) * (sl - 0.07)], sleeveEnd, 31.5, 31.5)} fill={pal.shirt2} opacity={0.9} />
        <g transform={`translate(${tip[0]} ${tip[1]})`}>
          {!hold && <g transform={`rotate(${(dir * 180) / Math.PI}) translate(-4 0) rotate(${-(dir * 180) / Math.PI})`}><g /></g>}
        </g>
        {hold ? (<g transform={`translate(${tip[0]} ${tip[1]})`}><g transform={`translate(${Math.cos(dir) * 16} ${Math.sin(dir) * 16})`}><Held k={hold} pal={pal} rot={hrot} side={s} typing={typing} /></g></g>)
          : <HandAt w={tip} dir={dir} side={s} kind={hk(hold, hd, 'relax')} pal={pal} />}
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <ellipse cx={0} cy={3} rx={92} ry={11} fill="#000" opacity={0.1} />
      <g transform={`translate(0 ${bob + walkBob})`}>
        {legs.map((l) => (
          <g key={l.s}>
            <Limb pts={[[l.s * 26, -280], [l.ex, l.ey], [l.hx, l.hy]]} ws={[50, 38, 27]} fill={pal.pants} />
            <path d={`M ${l.ex} ${l.ey - 26} L ${l.ex + l.s * 1} ${l.ey + 30}`} stroke="#000" strokeWidth={1.2} opacity={0.18} />
            <g transform={`translate(${l.hx} ${l.hy + 12}) scale(${l.s} 1)`}>
              <path d="M -15 -24 L -15 0 Q -15 6 -9 6 L 24 6 Q 31 6 31 0 Q 31 -6 22 -9 L 8 -14 Q 3 -16 3 -24 Z" fill={OUT} stroke={OUT} strokeWidth={OW * 2} strokeLinejoin="round" />
              <path d="M -15 -24 L -15 0 Q -15 6 -9 6 L 24 6 Q 31 6 31 0 Q 31 -6 22 -9 L 8 -14 Q 3 -16 3 -24 Z" fill={pal.shoe} />
              <path d="M -15 0 H 31 V 5 Q 31 6 24 6 L -9 6 Q -15 6 -15 0 Z" fill="#A7FF6B" /><path d="M 4 -12 L 14 -9 M 3 -17 L 11 -13" stroke="#B8BCB4" strokeWidth={1.4} />
            </g>
          </g>
        ))}
        <g transform={`rotate(${lean} 0 -290) translate(0 ${breathe * 0.9})`}>
          <path d="M -50 -304 L 50 -304 L 53 -262 Q 0 -250 -53 -262 Z" fill={pal.pants} stroke={OUT} strokeWidth={OW * 2} strokeLinejoin="round" />
          {/* shirt */}
          <path d="M -64 -456 C -66 -470 -50 -475 -24 -477 L 24 -477 C 50 -475 66 -470 64 -456 L 57 -302 C 57 -293 51 -288 42 -288 L -42 -288 C -51 -288 -57 -293 -57 -302 Z" fill={pal.shirt} stroke={OUT} strokeWidth={OW * 2} strokeLinejoin="round" />
          <path d="M 36 -472 C 54 -468 66 -464 64 -456 L 57 -302 C 57 -293 51 -288 42 -288 L 30 -288 C 44 -340 44 -420 36 -472 Z" fill={pal.shirt2} opacity={0.55} />
          {pal.apron && (<g>
            <path d="M -26 -470 L 26 -470 C 30 -444 42 -408 48 -340 L 52 -198 Q 0 -188 -52 -198 L -48 -340 C -42 -408 -30 -444 -26 -470 Z" fill={pal.apron} stroke={OUT} strokeWidth={OW * 2} strokeLinejoin="round" />
            <path d="M 26 -470 C 30 -444 42 -408 48 -340 L 52 -198 Q 36 -194 22 -192 C 28 -262 30 -380 22 -468 Z" fill={pal.apron2} opacity={0.6} />
            <path d="M -26 -470 L -38 -479 M 26 -470 L 38 -479" stroke={OUT} strokeWidth={5.4} strokeLinecap="round" /><path d="M -26 -470 L -38 -479 M 26 -470 L 38 -479" stroke={pal.apron} strokeWidth={2.6} strokeLinecap="round" />
            <path d="M -48 -338 Q 0 -331 48 -338" stroke={pal.apron2} strokeWidth={3} fill="none" />
            <rect x={-23} y={-322} width={46} height={42} rx={5} fill={pal.apron2} stroke={OUT} strokeWidth={OW * 2} />
            <g transform="rotate(-6 -6 -326)"><rect x={-14} y={-342} width={14} height={24} rx={2.6} fill="#262A2E" stroke={OUT} strokeWidth={1.4} /><rect x={-12} y={-340} width={10} height={14} rx={1.6} fill="#25D366" /></g>
            <rect x={8} y={-350} width={5} height={30} rx={1.6} fill="#FFD84A" stroke={OUT} strokeWidth={1.2} transform="rotate(10 10 -335)" />
          </g>)}
          {/* neck + collar */}
          <path d="M -12 -498 L 12 -498 L 15 -472 L -15 -472 Z" fill={pal.skin} stroke={OUT} strokeWidth={OW * 2} strokeLinejoin="round" />
          <path d="M -12 -498 Q 0 -488 12 -498 L 13 -488 Q 0 -478 -13 -488 Z" fill={pal.skin2} opacity={0.5} />
          <path d="M -20 -477 L -6 -470 L -26 -463 Z M 20 -477 L 6 -470 L 26 -463 Z" fill={pal.shirt} stroke={OUT} strokeWidth={1.6} strokeLinejoin="round" />
          {arm(aL, -1, holdL, handL, holdRot[0])}
          {arm(aR, 1, holdR, handR, holdRot[1])}
          {/* head */}
          <g transform={`translate(0 ${breathe * 0.8}) rotate(${tilt} 0 -476) ${pal.kid ? 'translate(0 -476) scale(1.22) translate(0 476)' : ''}`}>
            {[-1, 1].map((s) => <g key={s}><ellipse cx={s * 31.5} cy={-531} rx={4.8} ry={9.4} fill={pal.skin} stroke={OUT} strokeWidth={OW * 2} /><ellipse cx={s * 31.5} cy={-531} rx={2} ry={5} fill={pal.skin2} opacity={0.7} /></g>)}
            <path d={HEAD} fill={pal.skin} stroke={OUT} strokeWidth={OW * 2} strokeLinejoin="round" />
            <Face e={e} look={look} pal={pal} blink={blink} f={f} stubble={stubble && !!pal.apron} />
            <Hair pal={pal} style={hair} />
          </g>
        </g>
      </g>
    </g>
  );
};
