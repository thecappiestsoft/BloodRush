import type { ReactNode } from 'react';
import { tr } from '../../i18n';
import { CIRC_VIEW, HEART_PARTS, HEART_VIEW, type DiagramPart } from '../../data/content';

const BLUE = '#4f7fe6';
const BLUE_D = '#1e3a8a';
const RED = '#d93a45';
const RED_D = '#6b0f19';
const BLOOD_B = '#a9c1f5';
const BLOOD_R = '#f4a3a8';
const MUSCLE = '#e07c7c';
const MUSCLE_D = '#7a1d24';
const HL = '#ffd23f';

/** Naczynie rysowane jako rurka z obrysem. */
function Tube({ d, color, dark, w, hl }: { d: string; color: string; dark: string; w: number; hl?: boolean }) {
  return (
    <g>
      <path d={d} fill="none" stroke={hl ? HL : dark} strokeWidth={w + (hl ? 10 : 6)} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth={Math.max(2, w / 5)} strokeLinecap="round" transform="translate(-3 -2)" />
    </g>
  );
}

/** Zastawka: dwa płatki – zamknięte stykają się, otwarte są rozchylone. */
function Valve({ p, open, hl }: { p: DiagramPart; open?: boolean; hl?: boolean }) {
  const { x, y, w, h } = p.rect;
  const cy = y + h / 2;
  const gap = open ? w * 0.18 : 0;
  const half = (w - gap) / 2;
  return (
    <g>
      {hl && <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx="6" fill="none" stroke={HL} strokeWidth="4" />}
      <path d={`M${x} ${cy - h / 2} Q${x + half / 2} ${cy + h * 0.9} ${x + half} ${cy + (open ? h * 0.9 : h * 0.15)} L${x + half} ${cy - h / 2}Z`} fill="#fff7d6" stroke="#8a6d00" strokeWidth="2" />
      <path d={`M${x + w} ${cy - h / 2} Q${x + w - half / 2} ${cy + h * 0.9} ${x + w - half} ${cy + (open ? h * 0.9 : h * 0.15)} L${x + w - half} ${cy - h / 2}Z`} fill="#fff7d6" stroke="#8a6d00" strokeWidth="2" />
    </g>
  );
}

/** Schemat serca w przekroju, widok od przodu (prawa strona serca po lewej stronie rysunku). */
export function HeartSvg({ highlight, valveState, leaders }: {
  highlight?: string | null;
  valveState?: Record<string, boolean>;
  /** linie odnośników (np. od przełącznika do zastawki) */
  leaders?: { x1: number; y1: number; x2: number; y2: number }[];
}) {
  const hl = (id: string) => highlight === id;
  const cham = (id: string) => ({ stroke: hl(id) ? HL : '#5b1a20', strokeWidth: hl(id) ? 6 : 2.5 });
  const valve = (id: string) => HEART_PARTS.find((x) => x.id === id)!;
  return (
    <svg viewBox={`0 0 ${HEART_VIEW.w} ${HEART_VIEW.h}`} className="diagram-svg" aria-hidden>
      {/* naczynia za sercem: aorta zstępująca, żyły płucne, żyły główne */}
      <Tube d="M318 52 C327 72 325 110 322 150" color={RED} dark={RED_D} w={26} />
      <Tube d="M338 150 L388 144" color={RED} dark={RED_D} w={15} hl={hl('zp')} />
      <Tube d="M340 182 L390 190" color={RED} dark={RED_D} w={15} hl={hl('zp')} />
      <Tube d="M97 10 V140" color={BLUE} dark={BLUE_D} w={32} hl={hl('zgg')} />
      <Tube d="M70 328 C70 280 78 238 102 196" color={BLUE} dark={BLUE_D} w={30} hl={hl('zgd')} />

      {/* sylwetka mięśnia sercowego (koniuszek w dół, ku lewej stronie ciała) */}
      <path d="M140 110 C85 104 50 150 57 207 C64 268 150 326 252 368 C320 330 354 264 347 205 C342 150 306 110 262 112 C240 100 166 100 140 110Z" fill={MUSCLE} stroke={MUSCLE_D} strokeWidth="4" />
      <path d="M150 300 C190 320 225 340 252 360" fill="none" stroke="#f5b0a8" strokeWidth="3" opacity=".7" />
      <path d="M205 120 C215 200 225 280 250 350" fill="none" stroke="#c9585e" strokeWidth="5" strokeLinecap="round" opacity=".6" />

      {/* jamy serca */}
      <ellipse cx="120" cy="164" rx="52" ry="42" fill={BLOOD_B} {...cham('pp')} />
      <path d="M92 222 C110 212 180 210 205 220 C212 262 220 300 226 328 C178 318 115 292 95 252Z" fill={BLOOD_B} {...cham('pk')} />
      <ellipse cx="296" cy="160" rx="45" ry="33" fill={BLOOD_R} {...cham('lp')} />
      <path d="M238 220 C256 211 310 210 320 224 C327 262 300 312 256 342 C248 306 242 262 238 220Z" fill={BLOOD_R} {...cham('lk')} />

      {/* aorta wstępująca i łuk z odgałęzieniami */}
      <Tube d="M251 44 V12" color={RED} dark={RED_D} w={9} />
      <Tube d="M274 37 V6" color={RED} dark={RED_D} w={9} />
      <Tube d="M297 42 V12" color={RED} dark={RED_D} w={9} />
      <Tube d="M236 214 C232 160 230 92 250 62 C266 38 300 30 318 52" color={RED} dark={RED_D} w={28} hl={hl('aorta')} />
      {/* pień płucny i tętnice płucne (przed aortą) */}
      <Tube d="M186 214 C184 170 184 130 194 98" color={BLUE} dark={BLUE_D} w={26} hl={hl('pien')} />
      <Tube d="M194 98 C186 80 160 74 132 80" color={BLUE} dark={BLUE_D} w={15} hl={hl('pien')} />
      <Tube d="M194 98 C214 84 250 90 292 96" color={BLUE} dark={BLUE_D} w={15} hl={hl('pien')} />

      {/* zastawki */}
      {['z3', 'z2', 'zpp', 'za'].map((id) => <Valve key={id} p={valve(id)} open={valveState?.[id]} hl={hl(id)} />)}

      {/* kierunek przepływu */}
      <g fill="#fff" stroke="#1e293b" strokeWidth="1.2">
        <path d="M91 22 l6 10 l6 -10Z" />
        <path d="M66 312 l4 -11 l6 9Z" />
        <path d="M183 112 l11 -12 l3 15Z" />
        <path d="M245 52 l9 -10 l2 13Z" />
        <path d="M376 140 l-11 5 l11 5Z" />
        <path d="M378 188 l-11 -2 l9 8Z" />
      </g>
      {leaders?.map((l, i) => <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#0f172a" strokeWidth="1.5" strokeDasharray="4 3" />)}
      <text x="110" y="375" textAnchor="middle" fontSize="13" fontWeight="700" fill="#64748b">{tr('strona PRAWA serca', 'RIGHT side of heart')}</text>
      <text x="300" y="375" textAnchor="middle" fontSize="13" fontWeight="700" fill="#64748b">{tr('strona LEWA serca', 'LEFT side of heart')}</text>
    </svg>
  );
}

/** Schemat krążenia małego i dużego: płuca, serce i narządy z siecią naczyń włosowatych. */
export function CircSvg({ highlight }: { highlight?: string | null }) {
  const hl = (id: string) => highlight === id;
  const heart = 'M200 178 C190 158 150 150 132 166 C112 184 115 222 140 246 C160 265 185 280 200 294 C215 280 240 265 260 246 C285 222 288 184 268 166 C250 150 210 158 200 178Z';
  const capillaries = (y0: number, x0: number, x1: number, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const y = y0 + i * 9;
      return `M${x0} ${y} q ${(x1 - x0) / 6} -6 ${(x1 - x0) / 3} 0 t ${(x1 - x0) / 3} 0 t ${(x1 - x0) / 3} 0`;
    }).join(' ');
  return (
    <svg viewBox={`0 0 ${CIRC_VIEW.w} ${CIRC_VIEW.h}`} className="diagram-svg" aria-hidden>
      <defs>
        <linearGradient id="capGrad" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#3b6fd8" /><stop offset="1" stopColor="#d93a45" /></linearGradient>
        <linearGradient id="bodyGrad" x1="0" x2="1"><stop offset="0" stopColor="#c9d7fb" /><stop offset="1" stopColor="#f9c4c7" /></linearGradient>
        <clipPath id="heartClip"><path d={heart} /></clipPath>
        <marker id="arB" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill={BLUE_D} /></marker>
        <marker id="arR" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill={RED_D} /></marker>
      </defs>
      {/* naczynia */}
      <Tube d="M135 210 H65 V55 H122" color={BLUE} dark={BLUE_D} w={13} hl={hl('tp')} />
      <path d="M110 210 H65 V55 H112" fill="none" stroke="#fff" strokeWidth="2" markerEnd="url(#arB)" strokeDasharray="9 9" />
      <Tube d="M278 55 H335 V210 H268" color={RED} dark={RED_D} w={13} hl={hl('zp')} />
      <path d="M288 55 H335 V210 H280" fill="none" stroke="#fff" strokeWidth="2" markerEnd="url(#arR)" strokeDasharray="9 9" />
      <Tube d="M245 260 V352" color={RED} dark={RED_D} w={13} hl={hl('ao')} />
      <path d="M245 290 V340" fill="none" stroke="#fff" strokeWidth="2" markerEnd="url(#arR)" strokeDasharray="9 9" />
      <Tube d="M155 352 V260" color={BLUE} dark={BLUE_D} w={13} hl={hl('zg')} />
      <path d="M155 345 V285" fill="none" stroke="#fff" strokeWidth="2" markerEnd="url(#arB)" strokeDasharray="9 9" />

      {/* płuca z tchawicą i oskrzelami */}
      <g stroke={hl('pluca') ? HL : '#a8324a'} strokeWidth={hl('pluca') ? 6 : 3}>
        <path d="M190 24 C168 16 134 26 121 52 C110 76 120 96 152 96 C178 96 192 82 193 62Z" fill="#f7b9c4" />
        <path d="M210 24 C232 16 266 26 279 52 C290 76 280 96 248 96 C228 96 214 88 210 70Z" fill="#f7b9c4" />
      </g>
      <path d={capillaries(46, 128, 190, 5)} fill="none" stroke="url(#capGrad)" strokeWidth="2" opacity=".8" />
      <path d={capillaries(46, 212, 274, 5)} fill="none" stroke="url(#capGrad)" strokeWidth="2" opacity=".8" />
      <path d="M200 0 V30 M200 30 L180 46 M200 30 L220 46 M180 46 L170 60 M180 46 L186 66 M220 46 L230 60 M220 46 L214 66" fill="none" stroke="#e8d3c4" strokeWidth="6" strokeLinecap="round" />
      <path d="M200 0 V30" fill="none" stroke="#b9a090" strokeWidth="6" strokeDasharray="2 4" />

      {/* serce: prawa połowa (krew odtlenowana) i lewa (utlenowana) */}
      <g clipPath="url(#heartClip)">
        <rect x="100" y="140" width="100" height="160" fill="#9db8f7" />
        <rect x="200" y="140" width="100" height="160" fill="#f6a2a5" />
        <path d="M200 175 V300" stroke={MUSCLE_D} strokeWidth="6" />
      </g>
      <path d={heart} fill="none" stroke={MUSCLE_D} strokeWidth="4" />
      {hl('ps') && <path d={heart} fill="none" stroke={HL} strokeWidth="7" clipPath="url(#heartClip)" transform="translate(0 0)" />}
      {(hl('ps') || hl('ls')) && <circle cx={hl('ps') ? 159 : 241} cy="215" r="10" fill={HL} />}
      <text x="200" y="146" textAnchor="middle" fontSize="13" fontWeight="800" fill="#475569">{tr('SERCE', 'HEART')}</text>

      {/* narządy ciała z siecią naczyń włosowatych */}
      <path d="M126 352 Q200 338 274 352 Q292 380 274 404 Q200 420 126 404 Q108 380 126 352Z" fill="url(#bodyGrad)" stroke={hl('cialo') ? HL : '#8a5a00'} strokeWidth={hl('cialo') ? 6 : 3} />
      <path d={capillaries(360, 140, 262, 5)} fill="none" stroke="url(#capGrad)" strokeWidth="2" opacity=".85" />
      {[[150, 368], [178, 386], [212, 366], [236, 390], [258, 372]].map(([x, y], i) => (
        <g key={i}><rect x={x - 8} y={y - 7} width="16" height="14" rx="4" fill="#f6d6a8" stroke="#a66f00" strokeWidth="1.5" /><circle cx={x} cy={y} r="2.5" fill="#a66f00" /></g>
      ))}
      <text x="40" y="300" fontSize="12" fill="#64748b" transform="rotate(-90 40 300)">{tr('krążenie duże', 'systemic circuit')}</text>
      <text x="22" y="140" fontSize="12" fill="#64748b" transform="rotate(-90 22 140)">{tr('krążenie małe', 'pulmonary circuit')}</text>
    </svg>
  );
}

/** Kontener z rysunkiem i nakładkami pozycjonowanymi w procentach. */
export function DiagramBox({ view, svg, children, className }: { view: { w: number; h: number }; svg: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={`diagram-box ${className ?? ''}`} style={{ aspectRatio: `${view.w} / ${view.h}` }}>
      {svg}
      {children}
    </div>
  );
}
export const pct = (v: number, total: number) => `${(v / total) * 100}%`;
