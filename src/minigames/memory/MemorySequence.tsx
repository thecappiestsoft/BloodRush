import { useEffect, useState } from 'react';
import { tr } from '../../i18n';
import type { CellKind, MiniGameProps } from '../../types';
import { pick } from '../../utils/random';
import { lv } from '../../utils/level';
import { Cell, CELL_NAMES } from '../common/Cell';
import { useMistakes, useNumberKeys } from '../common/hooks';
import { sfx } from '../../engine/sound';

/** Zapamiętaj kolejność elementów krwi, a potem ją odtwórz. */
export default function MemorySequence(p: MiniGameProps) {
  const palette: CellKind[] = lv(p.level, ['rbc', 'platelet', 'neutrophil'], ['rbc', 'platelet', 'neutrophil', 'lymphocyte', 'monocyte'], ['rbc', 'platelet', 'neutrophil', 'lymphocyte', 'monocyte', 'eosinophil']);
  const [seq] = useState(() => {
    const k = lv(p.level, 3, 4, 5) + (p.intensity === 2 ? 1 : 0);
    const s: CellKind[] = [];
    while (s.length < k) { const c = pick(p.rng, palette); if (s[s.length - 1] !== c) s.push(c); }
    return s;
  });
  const [show, setShow] = useState(true);
  const [pos, setPos] = useState(0);
  const mistake = useMistakes(p, lv(p.level, 1, 0, 0));
  const nameOf = (k: CellKind) => (p.level === 'primary' && k === 'neutrophil' ? tr('leukocyt', 'leukocyte') : CELL_NAMES[k]);
  useEffect(() => {
    if (!show || p.paused) return;
    const t = setTimeout(() => { setShow(false); p.startTimer(); }, (p.learn ? 4500 : 1500) + seq.length * 450);
    return () => clearTimeout(t);
  }, [show, p.paused]); // eslint-disable-line react-hooks/exhaustive-deps
  const press = (k: CellKind) => {
    if (show) return;
    if (k === seq[pos]) {
      sfx('pop');
      if (pos + 1 === seq.length) p.onDone({ success: true, info: tr('Świetna pamięć! Pamiętaj: erytrocyty i płytki nie mają jądra, leukocyty – mają.', 'Great memory! Remember: erythrocytes and platelets have no nucleus; leukocytes do.') });
      setPos(pos + 1);
    } else {
      mistake(`${tr('Kolejność', 'Order')}: ${seq.map(nameOf).join(' → ')}.`);
    }
  };
  return (
    <div className="mg center">
      <p className="prompt">{show ? tr(<><b>ZAPAMIĘTAJ</b> kolejność!</>, <><b>REMEMBER</b> the order!</>) : tr(<>Odtwórz kolejność – klikaj komórki.</>, <>Repeat the order – click the cells.</>)}</p>
      <div className="seq-row">
        {seq.map((k, i) => (
          <div key={i} className={`seq-slot ${!show && i < pos ? 'ok' : ''}`}>
            {show || i < pos ? <Cell kind={k} size={58} /> : <span className="q">?</span>}
            {(show || i < pos) && <small>{nameOf(k)}</small>}
          </div>
        ))}
      </div>
      {!show && (
        <div className="palette">
          {palette.map((k, i) => (
            <button key={k} className="palette-btn" onClick={() => press(k)}>
              <Cell kind={k} size={52} />
              <small>{i + 1}. {nameOf(k)}</small>
            </button>
          ))}
          <Keys n={palette.length} on={(i) => press(palette[i])} />
        </div>
      )}
    </div>
  );
}
function Keys({ n, on }: { n: number; on: (i: number) => void }) { useNumberKeys(n, on); return null; }
