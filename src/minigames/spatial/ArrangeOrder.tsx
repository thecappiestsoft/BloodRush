import { useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { pick, shuffle } from '../../utils/random';
import { ORDER_CRITERIA } from '../../data/content';
import { Cell } from '../common/Cell';
import { useMistakes } from '../common/hooks';
import { sfx } from '../../engine/sound';

/** Ułóż elementy według kryterium: wypełnij półkę, potem sprawdź. */
export default function ArrangeOrder(p: MiniGameProps) {
  const [task] = useState(() => {
    const c = pick(p.rng, ORDER_CRITERIA.filter((x) => x.levels.includes(p.level)));
    let order = shuffle(p.rng, c.items.map((_, i) => i));
    if (order.every((v, i) => v === i)) order = order.reverse();
    return { c, order };
  });
  const [placed, setPlaced] = useState<number[]>([]);
  const [bad, setBad] = useState<number[]>([]);
  const mistake = useMistakes(p, 1);
  const n = task.c.items.length;
  const put = (i: number) => {
    if (placed.includes(i)) return;
    sfx('click');
    setBad([]);
    const next = [...placed, i];
    setPlaced(next);
    if (next.length === n) {
      if (next.every((v, k) => v === k)) {
        p.onDone({ success: true, info: task.c.fact });
      } else {
        const wrong = next.map((v, k) => (v === k ? -1 : k)).filter((k) => k >= 0);
        setBad(wrong);
        setTimeout(() => setPlaced(next.filter((v, k) => v === k && k < wrong[0])), 500);
        mistake(`${task.c.items.join(' → ')}. ${task.c.fact}`);
      }
    }
  };
  const unplace = (k: number) => setPlaced(placed.slice(0, k));
  return (
    <div className="mg">
      <p className="prompt">{tr('Ułóż', 'Arrange')}: <b>{task.c.prompt}</b></p>
      <div className="shelf" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
        {Array.from({ length: n }, (_, k) => (
          <button key={k} className={`shelf-slot ${placed[k] !== undefined ? 'filled' : ''} ${bad.includes(k) ? 'shake bad-ring' : ''}`} onClick={() => unplace(k)} disabled={placed[k] === undefined} aria-label={placed[k] !== undefined ? tr(`${k + 1}: ${task.c.items[placed[k]]} – kliknij, aby cofnąć`, `${k + 1}: ${task.c.items[placed[k]]} – click to undo`) : tr(`Miejsce ${k + 1}`, `Slot ${k + 1}`)}>
            <span className="shelf-no">{k + 1}</span>
            {placed[k] !== undefined && <>{task.c.cells && <Cell kind={task.c.cells[placed[k]]} size={40} />}<span>{task.c.items[placed[k]]}</span></>}
          </button>
        ))}
      </div>
      <div className="tray">
        {task.order.filter((i) => !placed.includes(i)).map((i) => (
          <button key={i} className="chip" onClick={() => put(i)}>
            {task.c.cells && <Cell kind={task.c.cells[i]} size={34} />} {task.c.items[i]}
          </button>
        ))}
      </div>
    </div>
  );
}
