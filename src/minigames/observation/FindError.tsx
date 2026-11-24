import { useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { pick, randInt, sample } from '../../utils/random';
import { lv } from '../../utils/level';
import { cycleFor, cycleWindow } from '../../data/content';
import { useMistakes } from '../common/hooks';
import { sfx } from '../../engine/sound';

/** Znajdź błąd w schemacie przepływu krwi. */
export default function FindError(p: MiniGameProps) {
  const [task] = useState(() => {
    const cyc = cycleFor(p.level);
    const k = lv(p.level, 5, 6, 7);
    const start = randInt(p.rng, 0, cyc.length - 1);
    const correct = cycleWindow(cyc, start, k);
    const nErr = p.level === 'technical' ? 2 : 1;
    const outside = cyc.filter((c) => !correct.includes(c));
    const errIdx = sample(p.rng, correct.map((_, i) => i).slice(1), nErr);
    const shown = correct.slice();
    const used: string[] = [];
    for (const i of errIdx) {
      const pos = (start + i) % cyc.length;
      const dist = (o: string) => { const d = Math.abs(cyc.indexOf(o) - pos); return Math.min(d, cyc.length - d); };
      const options = outside.filter((o) => !used.includes(o) && dist(o) >= 3);
      const w = pick(p.rng, options.length ? options : ['Tchawica']);
      used.push(w);
      shown[i] = w;
    }
    return { correct, shown, errIdx };
  });
  const [found, setFound] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const mistake = useMistakes(p, lv(p.level, 1, 1, 1));
  const click = (i: number) => {
    if (found.includes(i)) return;
    if (task.errIdx.includes(i)) {
      sfx('pop');
      const next = [...found, i];
      setFound(next);
      if (next.length === task.errIdx.length) p.onDone({ success: true, info: `${tr('Poprawny przepływ', 'Correct flow')}: ${task.correct.join(' → ')}.` });
    } else {
      setWrong(i);
      setTimeout(() => setWrong(null), 400);
      mistake(`${tr('Poprawny przepływ', 'Correct flow')}: ${task.correct.join(' → ')}.`);
    }
  };
  return (
    <div className="mg">
      <p className="prompt">{tr(<>W schemacie przepływu krwi {task.errIdx.length > 1 ? <>są <b>2 błędy</b></> : <>jest <b>1 błąd</b></>}. Kliknij błędny element!</>, <>The blood flow diagram contains {task.errIdx.length > 1 ? <><b>2 mistakes</b></> : <><b>1 mistake</b></>}. Click the wrong item!</>)}</p>
      <div className="flow-chart">
        {task.shown.map((s, i) => (
          <div key={i} className="flow-node-wrap">
            {i > 0 && <span className="flow-arrow" aria-hidden>➜</span>}
            <button className={`flow-node ${found.includes(i) ? 'found' : ''} ${wrong === i ? 'shake bad-ring' : ''}`} onClick={() => click(i)}>
              {found.includes(i) ? <><s>{s}</s><br /><b>{task.correct[i]}</b></> : s}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
