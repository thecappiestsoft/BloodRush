import type { CellKind } from '../../types';
import { tr } from '../../i18n';

const PURPLE = '#6b3fa0';
const NUC = '#7d3fc8';

function Shape({ kind }: { kind: CellKind }) {
  switch (kind) {
    case 'rbc':
      return (
        <g>
          <circle r="40" fill="#e23b4a" stroke="#7a0b14" strokeWidth="4" />
          <circle r="19" fill="#f48a92" />
          <ellipse cx="-16" cy="-22" rx="11" ry="5" fill="#fff" opacity=".35" transform="rotate(-35 -16 -22)" />
        </g>
      );
    case 'neutrophil':
      return (
        <g>
          <circle r="42" fill="#efe4fb" stroke={PURPLE} strokeWidth="4" />
          {[[-26, 18], [24, 22], [-6, -28], [28, -16], [-30, -10], [6, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" fill="#c9b2e8" />)}
          <path d="M-20 -4 Q-10 -14 0 2 Q10 14 20 -2" stroke={NUC} strokeWidth="6" fill="none" />
          <circle cx="-20" cy="-4" r="11" fill={NUC} />
          <circle cx="0" cy="4" r="12" fill={NUC} />
          <circle cx="20" cy="-3" r="11" fill={NUC} />
        </g>
      );
    case 'lymphocyte':
      return (
        <g>
          <circle r="34" fill="#efe4fb" stroke={PURPLE} strokeWidth="4" />
          <circle cx="3" cy="2" r="26" fill="#5a2596" />
        </g>
      );
    case 'monocyte':
      return (
        <g>
          <circle r="46" fill="#efe4fb" stroke={PURPLE} strokeWidth="4" />
          <path d="M-26 -16 C-10 -32 28 -28 28 0 C28 26 -10 32 -26 16 C-14 8 -14 -8 -26 -16Z" fill={NUC} />
        </g>
      );
    case 'eosinophil':
      return (
        <g>
          <circle r="42" fill="#fde6d6" stroke={PURPLE} strokeWidth="4" />
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2;
            const r = 22 + (i % 3) * 6;
            return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r="4" fill="#f08a3c" />;
          })}
          <circle cx="-12" cy="0" r="13" fill={NUC} />
          <circle cx="13" cy="0" r="13" fill={NUC} />
        </g>
      );
    case 'platelet':
      return (
        <g transform="scale(1.6)">
          <path d="M-20 -6 C-18 -20 2 -22 12 -14 C24 -6 22 12 8 18 C-6 24 -24 12 -20 -6Z" fill="#f7c948" stroke="#a66f00" strokeWidth="3" />
          <circle cx="-4" cy="0" r="3" fill="#b36b00" />
          <circle cx="6" cy="6" r="2.5" fill="#b36b00" />
          <circle cx="4" cy="-8" r="2" fill="#b36b00" />
        </g>
      );
    case 'bacterium':
      return (
        <g transform="rotate(-20)">
          <path d="M34 0 q7 -9 14 0 t14 0" stroke="#1b5e20" strokeWidth="3" fill="none" />
          <path d="M-34 0 q-7 9 -14 0" stroke="#1b5e20" strokeWidth="3" fill="none" />
          <rect x="-34" y="-17" width="68" height="34" rx="17" fill="#4caf50" stroke="#1b5e20" strokeWidth="4" />
          <path d="M-14 -6 h28 M-10 6 h22" stroke="#1b5e20" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'neuron':
      return (
        <g stroke="#1d3557" strokeWidth="5" strokeLinecap="round">
          <path d="M0 0 L-36 -26 M0 0 L-40 8 M0 0 L-18 -40 M0 0 L22 -38 M0 0 L-24 36 M0 0 L44 40" fill="none" />
          <path d="M30 26 l8 -4 M36 32 l8 -2" fill="none" strokeWidth="3" />
          <circle r="15" fill="#8ecae6" />
        </g>
      );
    case 'clot':
      return (
        <g>
          <circle cx="-14" cy="-10" r="16" fill="#9b1c28" stroke="#4a0910" strokeWidth="3" />
          <circle cx="14" cy="-8" r="15" fill="#b3202f" stroke="#4a0910" strokeWidth="3" />
          <circle cx="-4" cy="14" r="17" fill="#8a1622" stroke="#4a0910" strokeWidth="3" />
          <circle cx="22" cy="14" r="11" fill="#f7c948" stroke="#a66f00" strokeWidth="3" />
          <path d="M-40 -30 L36 30 M-38 24 L34 -34 M-44 0 L44 4 M-10 -42 L6 42" stroke="#f1f1f1" strokeWidth="3" opacity=".9" />
        </g>
      );
    case 'o2':
      return (
        <g>
          <circle cx="-15" r="21" fill="#3fa9f5" stroke="#0b4f8a" strokeWidth="4" />
          <circle cx="15" r="21" fill="#3fa9f5" stroke="#0b4f8a" strokeWidth="4" />
          <text y="9" textAnchor="middle" fontSize="26" fontWeight="900" fill="#fff">O₂</text>
        </g>
      );
    case 'co2':
      return (
        <g>
          <circle cx="-26" r="15" fill="#c5ccd6" stroke="#4a5568" strokeWidth="3" />
          <circle cx="26" r="15" fill="#c5ccd6" stroke="#4a5568" strokeWidth="3" />
          <circle r="20" fill="#4a5568" stroke="#1f2937" strokeWidth="3" />
          <text y="8" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff">CO₂</text>
        </g>
      );
    case 'co':
      return (
        <g>
          <circle cx="-15" r="21" fill="#2d2d2d" stroke="#f5c400" strokeWidth="4" />
          <circle cx="15" r="21" fill="#2d2d2d" stroke="#f5c400" strokeWidth="4" />
          <text y="9" textAnchor="middle" fontSize="24" fontWeight="900" fill="#f5c400">CO</text>
        </g>
      );
  }
}

const NAMES_PL: Record<CellKind, string> = {
  rbc: 'erytrocyt', neutrophil: 'neutrofil', lymphocyte: 'limfocyt', monocyte: 'monocyt', eosinophil: 'eozynofil',
  platelet: 'trombocyt', bacterium: 'bakteria', neuron: 'neuron', clot: 'skrzep', o2: 'tlen (O₂)', co2: 'dwutlenek węgla (CO₂)', co: 'tlenek węgla (CO)',
};
const NAMES_EN: Record<CellKind, string> = {
  rbc: 'erythrocyte', neutrophil: 'neutrophil', lymphocyte: 'lymphocyte', monocyte: 'monocyte', eosinophil: 'eosinophil',
  platelet: 'thrombocyte', bacterium: 'bacterium', neuron: 'neuron', clot: 'clot', o2: 'oxygen (O₂)', co2: 'carbon dioxide (CO₂)', co: 'carbon monoxide (CO)',
};
/** Nazwy komórek w bieżącym języku. */
export const CELL_NAMES: Record<CellKind, string> = new Proxy(NAMES_PL, { get: (_, k: string) => tr(NAMES_PL, NAMES_EN)[k as CellKind] });
/** Względna wielkość rysunku (uproszczona, zachowuje kolejność rozmiarów). */
export const CELL_SCALE: Record<CellKind, number> = {
  rbc: 1, neutrophil: 1.25, lymphocyte: 0.95, monocyte: 1.45, eosinophil: 1.25, platelet: 0.5,
  bacterium: 0.85, neuron: 1.2, clot: 1.3, o2: 0.8, co2: 0.85, co: 0.8,
};

export function Cell({ kind, size = 64, label }: { kind: CellKind; size?: number; label?: string }) {
  return (
    <svg className="cell-svg" viewBox="-50 -50 100 100" width={size} height={size} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <Shape kind={kind} />
    </svg>
  );
}
