import { useEffect, useState } from 'react';
import { tr } from '../../i18n';
import type { CellKind, MiniGameProps } from '../../types';
import { pick, randInt } from '../../utils/random';
import { lv } from '../../utils/level';
import { Cell, CELL_NAMES } from '../common/Cell';

/** Co się zmieniło? Zapamiętaj preparat krwi – jedna komórka zostanie podmieniona. */
export default function SpotChange(p: MiniGameProps) {
  const [task] = useState(() => {
    const n = lv(p.level, 6, 9, 12);
    const pool: CellKind[] = lv(p.level, ['rbc', 'rbc', 'platelet', 'neutrophil'], ['rbc', 'rbc', 'platelet', 'neutrophil', 'lymphocyte', 'monocyte'], ['rbc', 'platelet', 'neutrophil', 'lymphocyte', 'monocyte', 'eosinophil']);
    const grid = Array.from({ length: n }, () => pick(p.rng, pool));
    const idx = randInt(p.rng, 0, n - 1);
    const replacement = pick(p.rng, pool.filter((k) => k !== grid[idx]));
    return { grid, idx, replacement, cols: lv(p.level, 3, 3, 4) };
  });
  const [phase, setPhase] = useState<'show' | 'blank' | 'find'>('show');
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => {
    if (p.paused || phase === 'find') return;
    const t = setTimeout(() => {
      if (phase === 'show') setPhase('blank');
      else { setPhase('find'); p.startTimer(); }
    }, phase === 'show' ? (p.learn ? 5000 : lv(p.level, 2600, 3000, 3400)) : 450);
    return () => clearTimeout(t);
  }, [phase, p.paused]); // eslint-disable-line react-hooks/exhaustive-deps
  const cells = phase === 'find' ? task.grid.map((k, i) => (i === task.idx ? task.replacement : k)) : task.grid;
  const click = (i: number) => {
    if (phase !== 'find' || picked !== null) return;
    setPicked(i);
    const info = `${tr('Zmiana', 'Change')}: ${CELL_NAMES[task.grid[task.idx]]} → ${CELL_NAMES[task.replacement]}.`;
    p.onDone({ success: i === task.idx, info });
  };
  return (
    <div className="mg center">
      <p className="prompt">{phase === 'find' ? tr(<>Która komórka się <b>zmieniła</b>?</>, <>Which cell has <b>changed</b>?</>) : tr(<><b>ZAPAMIĘTAJ</b> preparat!</>, <><b>REMEMBER</b> the slide!</>)}</p>
      <div className={`slide-grid ${phase === 'blank' ? 'blank' : ''}`} style={{ gridTemplateColumns: `repeat(${task.cols}, 1fr)` }}>
        {cells.map((k, i) => (
          <button key={i} className={`slide-cell ${picked === i ? (i === task.idx ? 'ok' : 'bad') : ''} ${picked !== null && i === task.idx ? 'reveal' : ''}`} onClick={() => click(i)} disabled={phase !== 'find'} aria-label={tr(`Pole ${i + 1}`, `Cell ${i + 1}`)}>
            {phase !== 'blank' && <Cell kind={k} size={52} />}
          </button>
        ))}
      </div>
    </div>
  );
}
