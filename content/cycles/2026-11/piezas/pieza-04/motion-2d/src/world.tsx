import React from 'react';
import {OUT} from './char/Dani';
export const LIME = '#A7FF6B', GREEN = '#39713E', CHAR = '#383838', PAPER = '#F8F8F6', DISC = '#E9FFD9', INK = OUT;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const back = (x: number) => { x = clamp(x); const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const pop = (lt: number, d: number, dur = 0.38) => back((lt - d) / dur);
const S = {stroke: INK, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

export const Floor: React.FC = () => (<g><rect x={-100} y={1440} width={1300} height={520} fill="#ECEDE6" /><path d="M -100 1440 H 1200" stroke="#D9DBD2" strokeWidth={4} /></g>);
export const Disc: React.FC<{cx?: number; cy?: number; r?: number}> = ({cx = 540, cy = 1120, r = 340}) => <circle cx={cx} cy={cy} r={r} fill={DISC} />;

export const Shelf: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 1].map((row) => (
      <g key={row} transform={`translate(0 ${row * 170})`}>
        {[[10, 70, 56, '#C9E8B0'], [80, 52, 74, GREEN], [150, 78, 48, '#F1ECDD'], [236, 56, 66, LIME], [300, 50, 80, '#C9E8B0']].map(([bx, bw, bh, c], i) => <rect key={i} x={bx as number} y={118 - (bh as number)} width={bw as number} height={bh as number} rx={10} fill={c as string} {...S} />)}
        <rect x={0} y={118} width={360} height={22} rx={8} fill="#fff" {...S} />
      </g>
    ))}
  </g>
);
export const Counter: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 430}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={30} width={w} height={240} rx={14} fill="#fff" {...S} />
    <rect x={0} y={150} width={w} height={34} fill={LIME} {...S} />
    <rect x={-16} y={0} width={w + 32} height={40} rx={14} fill="#fff" {...S} />
    <g transform="translate(40 -52)"><rect x={0} y={0} width={150} height={56} rx={12} fill={GREEN} {...S} /><text x={75} y={40} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill="#fff">ABIERTO</text></g>
  </g>
);
export const WallClock: React.FC<{x: number; y: number; r: number; h: number; alarm?: boolean}> = ({x, y, r, h, alarm}) => {
  const ha = ((h % 12) / 12) * 360, ma = (h % 1) * 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      {alarm && [-1, 1].map((s) => <circle key={s} cx={s * r * 0.7} cy={-r * 0.8} r={r * 0.28} fill={LIME} {...S} />)}
      <circle r={r} fill="#fff" {...S} strokeWidth={r * 0.07} />
      {Array.from({length: 12}).map((_, i) => <line key={i} x1={0} y1={-r * 0.8} x2={0} y2={-r * (i % 3 === 0 ? 0.62 : 0.7)} stroke={CHAR} strokeWidth={r * 0.04} strokeLinecap="round" transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={0} x2={0} y2={-r * 0.46} stroke={INK} strokeWidth={r * 0.075} strokeLinecap="round" transform={`rotate(${ha})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.7} stroke={GREEN} strokeWidth={r * 0.05} strokeLinecap="round" transform={`rotate(${ma})`} />
      <circle r={r * 0.07} fill={INK} />
    </g>
  );
};
export const Hourglass: React.FC<{x: number; y: number; s: number; p: number}> = ({x, y, s, p}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -34 -60 H 34 Q 34 -10 0 0 Q 34 10 34 60 H -34 Q -34 10 0 0 Q -34 -10 -34 -60 Z" fill="#fff" {...S} />
    <clipPath id="hgc"><path d="M -34 -60 H 34 Q 34 -10 0 0 Q 34 10 34 60 H -34 Q -34 10 0 0 Q -34 -10 -34 -60 Z" /></clipPath>
    <g clipPath="url(#hgc)"><rect x={-34} y={-60 + 58 * p} width={68} height={58 * (1 - p)} fill="#F2C45A" /><rect x={-34} y={60 - 58 * p} width={68} height={58 * p} fill="#F2C45A" />{p < 1 && <rect x={-2} y={0} width={4} height={60} fill="#F2C45A" />}</g>
    <path d="M -34 -60 H 34 Q 34 -10 0 0 Q 34 10 34 60 H -34 Q -34 10 0 0 Q -34 -10 -34 -60 Z" fill="none" {...S} />
    <rect x={-42} y={-72} width={84} height={14} rx={6} fill={GREEN} {...S} /><rect x={-42} y={58} width={84} height={14} rx={6} fill={GREEN} {...S} />
  </g>
);
export const Bubble: React.FC<{x: number; y: number; text: string; s?: number; rot?: number; side?: 'l' | 'r'; me?: boolean; tick?: boolean}> = ({x, y, text, s = 1, rot = 0, side = 'l', me, tick}) => {
  const w = text.length * 21 + 70, h = 84;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={`M ${side === 'l' ? -w / 2 + 30 : w / 2 - 30} ${h / 2 - 4} l ${side === 'l' ? -14 : 14} 26 l ${side === 'l' ? 38 : -38} -26 Z`} fill={me ? LIME : '#fff'} {...S} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill={me ? LIME : '#fff'} {...S} />
      <text x={tick ? -14 : 0} y={11} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={34} fill={CHAR}>{text}</text>
      {tick && <text x={w / 2 - 38} y={30} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={22} fill="#34A0F0">✓✓</text>}
    </g>
  );
};
export const Notif: React.FC<{x?: number; y: number; title: string; body: string; k?: number; wa?: boolean}> = ({x = 0, y, title, body, k = 1, wa}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp(k * 1.6)}>
    <rect x={0} y={0} width={300} height={104} rx={26} fill="#fff" stroke={INK} strokeWidth={5} />
    <rect x={16} y={20} width={64} height={64} rx={16} fill={wa ? '#25D366' : LIME} stroke={INK} strokeWidth={4} />
    <text x={48} y={66} textAnchor="middle" fontFamily="Anton" fontSize={44} fill={wa ? '#fff' : GREEN}>{wa ? '✆' : 'i'}</text>
    <text x={96} y={44} fontFamily="Montserrat" fontWeight={800} fontSize={22} fill={CHAR}>{title}</text>
    <text x={96} y={78} fontFamily="Montserrat" fontWeight={500} fontSize={20} fill="#555">{body}</text>
  </g>
);
export const PhoneBig: React.FC<{x: number; y: number; s?: number; rot?: number; time?: string; children?: React.ReactNode}> = ({x, y, s = 1, rot = 0, time = '11:00', children}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-190} y={-380} width={380} height={760} rx={52} fill="#262A2E" {...S} strokeWidth={8} />
    <rect x={-168} y={-358} width={336} height={716} rx={36} fill="#151a17" />
    <rect x={-40} y={-346} width={80} height={22} rx={11} fill="#000" />
    <g transform="translate(-150 -330)">
      <text x={150} y={150} textAnchor="middle" fontFamily="Anton" fontSize={120} fill="#fff">{time}</text>
      <text x={150} y={196} textAnchor="middle" fontFamily="Montserrat" fontWeight={500} fontSize={24} fill="#cfd6cb">viernes 27 de noviembre</text>
      {children}
    </g>
  </g>
);
export const Bag: React.FC<{x: number; y: number; s?: number; rot?: number; c?: string; pct?: boolean}> = ({x, y, s = 1, rot = 0, c = LIME, pct}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -34 -104 Q -34 -150 0 -150 Q 34 -150 34 -104" fill="none" {...S} strokeWidth={8} />
    <rect x={-70} y={-110} width={140} height={150} rx={14} fill={c} {...S} />
    <rect x={-70} y={-110} width={140} height={26} rx={10} fill="#fff" {...S} />
    {pct && <g><circle cx={0} cy={-30} r={30} fill="#fff" {...S} strokeWidth={5} /><text x={0} y={-18} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={CHAR}>%</text></g>}
  </g>
);
export const Heart: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (<path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 28 C -60 -14 -40 -58 0 -30 C 40 -58 60 -14 0 28 Z" fill="#FF6B7A" {...S} />);
export const Table: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-380} y={0} width={760} height={40} rx={16} fill="#fff" {...S} />
    <rect x={-330} y={40} width={34} height={160} fill={GREEN} {...S} /><rect x={296} y={40} width={34} height={160} fill={GREEN} {...S} />
    {[-220, 0, 220].map((px, i) => <g key={i}><ellipse cx={px} cy={-4} rx={72} ry={14} fill="#fff" {...S} /><ellipse cx={px} cy={-10} rx={46} ry={8} fill={i === 1 ? LIME : '#F5C26B'} stroke={INK} strokeWidth={4} /></g>)}
  </g>
);
export const Speed: React.FC<{cx: number; cy: number; t: number; c?: string}> = ({cx, cy, t, c = '#E4F7D2'}) => (
  <g transform={`translate(${cx} ${cy})`}>{Array.from({length: 22}).map((_, i) => <path key={i} d="M 260 -10 L 1500 -46 L 1500 46 L 260 10 Z" fill={c} transform={`rotate(${(i / 22) * 360 + t * 12})`} opacity={0.9} />)}</g>
);
