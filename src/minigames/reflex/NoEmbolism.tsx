import { useRef, useState } from 'react';
import { tr } from '../../i18n';
import type { CellKind, MiniGameProps } from '../../types';
import { pick, shuffle } from '../../utils/random';
import { lv } from '../../utils/level';
import { Cell, CELL_NAMES, CELL_SCALE } from '../common/Cell';
import { useLoop, useMistakes } from '../common/hooks';
import { sfx } from '../../engine/sound';

interface Flow { id: number; kind: CellKind; spawn: number; y: number; state: 'alive' | 'gone' | 'wrong' }

/** Edukacyjna abstrakcja: usuwaj skrzepy z naczynia, zanim dotrą do zwężenia. */
export default function NoEmbolism(p: MiniGameProps) {
  const [cfg] = useState(() => {
    const limit = p.timeLimit ?? 10;
    const travel = Math.min(lv(p.level, 8, 7, 6) / (1 + p.intensity * 0.1), Math.max(2.5, (limit - 1.5) * 0.65));
    const window = Math.max(1, Math.min(6, limit - travel - 1.2));
    const nClots = lv(p.level, 3, 4, 5);
    const normals: CellKind[] = lv(p.level, ['rbc', 'rbc', 'platelet', 'neutrophil'], ['rbc', 'rbc', 'platelet', 'neutrophil', 'lymphocyte'], ['rbc', 'rbc', 'platelet', 'neutrophil', 'lymphocyte', 'monocyte']);
    const kinds: CellKind[] = shuffle(p.rng, [...Array<CellKind>(nClots).fill('clot'), ...Array.from({ length: lv(p.level, 6, 8, 10) }, () => pick(p.rng, normals))]);
    const flows: Flow[] = kinds.map((k, i) => ({ id: i, kind: k, spawn: (i / kinds.length) * window + p.rng() * 0.3, y: 18 + p.rng() * 64, state: 'alive' }));
    return { travel, flows };
  });
  const t = useRef(0);
  const [, force] = useState(0);
  const ended = useRef(false);
  const mistake = useMistakes(p, 1);

  useLoop((dt) => {
    if (ended.current) return;
    t.current += dt;
    for (const f of cfg.flows) {
      if (f.kind === 'clot' && f.state === 'alive' && xOf(f) >= 92) {
        ended.current = true;
        sfx('fail');
        p.onDone({ success: false, info: tr('Skrzep dotarł do zwężenia i zablokował przepływ (zator). Uszkodzone naczynie i skrzepy mogą utrudnić krążenie.', 'A clot reached the narrowing and blocked the flow (embolism). Damaged vessels and clots can hinder circulation.') });
      }
    }
    force((n) => (n + 1) % 1e6);
  }, p.paused);

  const xOf = (f: Flow) => ((t.current - f.spawn) / cfg.travel) * 100;
  const hit = (f: Flow) => {
    if (ended.current || f.state !== 'alive') return;
    if (f.kind === 'clot') {
      f.state = 'gone';
      sfx('pop');
      if (cfg.flows.every((x) => x.kind !== 'clot' || x.state === 'gone')) {
        ended.current = true;
        p.onDone({ success: true, info: tr('Przepływ utrzymany! Prawidłowa krew to zawiesina krwinek w osoczu – skrzep w świetle naczynia może prowadzić do zatoru.', 'Flow maintained! Healthy blood is a suspension of cells in plasma – a clot inside a vessel can cause a blockage.') });
      }
    } else {
      f.state = 'wrong';
      setTimeout(() => { if (f.state === 'wrong') f.state = 'alive'; }, 400);
      mistake(tr(`To ${CELL_NAMES[f.kind]} – prawidłowy element krwi. Usuwaj tylko skrzepy!`, `That is a ${CELL_NAMES[f.kind]} – a normal part of blood. Remove only the clots!`));
    }
  };
  const clotsLeft = cfg.flows.filter((f) => f.kind === 'clot' && f.state !== 'gone').length;
  return (
    <div className="mg">
      <p className="prompt">{tr(<>Klikaj <b>skrzepy</b> (zlepione krwinki z nićmi włóknika), zanim dotrą do zwężenia! Nie ruszaj zdrowych krwinek.</>, <>Click the <b>clots</b> (clumped cells with fibrin threads) before they reach the narrowing! Leave healthy cells alone.</>)}</p>
      <div className="lane">
        <div className="lane-stripes" aria-hidden />
        <div className="lane-narrow" aria-hidden><span>{tr('ZWĘŻENIE', 'NARROWING')}</span></div>
        <div className="field-counter">{tr('Skrzepy', 'Clots')}: <b>{clotsLeft}</b></div>
        {cfg.flows.map((f) => {
          const x = xOf(f);
          if (f.state === 'gone' || x < -8 || x > 104) return null;
          return (
            <button key={f.id} className={`field-item ${f.state === 'wrong' ? 'shake bad-ring' : ''}`} style={{ left: `${x}%`, top: `${f.y}%` }}
              onPointerDown={(e) => { e.preventDefault(); hit(f); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') hit(f); }}
              aria-label={CELL_NAMES[f.kind]}>
              <Cell kind={f.kind} size={Math.round(54 * CELL_SCALE[f.kind])} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
