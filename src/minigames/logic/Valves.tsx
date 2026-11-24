import { useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { pick } from '../../utils/random';
import { HEART_VIEW } from '../../data/content';
import { DiagramBox, HeartSvg, pct } from '../common/Diagrams';
import { heartPart } from '../../data/content';

const VALVES = ['z3', 'z2', 'zpp', 'za'];
/** Pozycje przełączników (obok rysunku), połączone linią z zastawką. */
const TOGGLE_POS: Record<string, { x: number; y: number }> = { z3: { x: 64, y: 252 }, z2: { x: 352, y: 252 }, zpp: { x: 138, y: 96 }, za: { x: 352, y: 98 } };

/** Ustaw zastawki: które są otwarte w danej fazie pracy serca? */
export default function Valves(p: MiniGameProps) {
  const [phase] = useState(() => pick(p.rng, ['systole', 'diastole'] as const));
  const correct: Record<string, boolean> = phase === 'systole'
    ? { z3: false, z2: false, zpp: true, za: true }
    : { z3: true, z2: true, zpp: false, za: false };
  const [state, setState] = useState<Record<string, boolean>>(() => {
    const s: Record<string, boolean> = Object.fromEntries(VALVES.map((v) => [v, p.rng() < 0.5]));
    if (VALVES.every((v) => s[v] === correct[v])) s[pick(p.rng, VALVES)] = !s[VALVES[0]];
    if (VALVES.every((v) => s[v] === correct[v])) s.za = !s.za;
    return s;
  });
  const check = () => {
    const ok = VALVES.every((v) => state[v] === correct[v]);
    p.onDone({
      success: ok,
      info: phase === 'systole'
        ? tr('Skurcz komór: zastawki przedsionkowo-komorowe (trójdzielna, dwudzielna) zamknięte, półksiężycowate (pnia płucnego i aorty) otwarte – krew wypływa do tętnic.', 'Ventricular contraction: the atrioventricular valves (tricuspid, bicuspid) are closed, the semilunar valves (pulmonary and aortic) are open – blood flows into the arteries.')
        : tr('Rozkurcz komór: zastawki półksiężycowate zamknięte (krew nie cofa się z tętnic), przedsionkowo-komorowe otwarte – komory napełniają się.', 'Ventricular relaxation: the semilunar valves are closed (blood cannot flow back from the arteries), the atrioventricular valves are open – the ventricles fill.'),
    });
  };
  return (
    <div className="mg">
      <p className="prompt">{tr('Faza', 'Phase')}: <b>{phase === 'systole' ? tr('SKURCZ KOMÓR', 'VENTRICLES CONTRACT') : tr('ROZKURCZ KOMÓR (napełnianie)', 'VENTRICLES RELAX (filling)')}</b>. {tr('Kliknij zastawki, aby ustawić je jako otwarte/zamknięte, potem „Gotowe”.', 'Click the valves to set them open/closed, then “Done”.')}</p>
      <div className="valves-layout">
        <DiagramBox view={HEART_VIEW} svg={<HeartSvg valveState={state} leaders={VALVES.map((v) => ({ x1: TOGGLE_POS[v].x, y1: TOGGLE_POS[v].y, x2: heartPart(v).anchor.x, y2: heartPart(v).anchor.y }))} />}>
          {VALVES.map((v) => {
            const part = heartPart(v);
            return (
              <button key={v} className={`valve-toggle ${state[v] ? 'open' : 'closed'}`} style={{ left: pct(TOGGLE_POS[v].x, HEART_VIEW.w), top: pct(TOGGLE_POS[v].y, HEART_VIEW.h) }}
                onClick={() => setState((s) => ({ ...s, [v]: !s[v] }))} aria-label={`${part.name}: ${state[v] ? tr('otwarta', 'open') : tr('zamknięta', 'closed')}`}>
                {state[v] ? tr('OTWARTA', 'OPEN') : tr('ZAMKNIĘTA', 'CLOSED')}
                <small>{part.name.replace('Zastawka ', '').replace(/ valve$/, '')}</small>
              </button>
            );
          })}
        </DiagramBox>
      </div>
      <button className="btn big primary" onClick={check}>{tr('Gotowe', 'Done')} ✓</button>
    </div>
  );
}
