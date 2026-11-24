import { useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { randInt, scatter } from '../../utils/random';
import { lv } from '../../utils/level';
import { cycleFor, cycleWindow } from '../../data/content';
import { useMistakes } from '../common/hooks';
import { sfx } from '../../engine/sound';

/** Uporządkuj drogę krwi: klikaj „bąbelki” w kolejności przepływu. */
export default function BloodPath(p: MiniGameProps) {
  const [task] = useState(() => {
    const cyc = cycleFor(p.level);
    const k = lv(p.level, 4, 5, 6) + (p.intensity === 2 ? 1 : 0);
    const seq = cycleWindow(cyc, randInt(p.rng, 0, cyc.length - 1), k);
    const pos = scatter(p.rng, k, 24, { x0: 14, x1: 86, y0: 16, y1: 84 });
    return { seq, pos };
  });
  const [done, setDone] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const mistake = useMistakes(p, 1);
  const click = (i: number) => {
    if (i < done) return;
    if (i === done) {
      sfx('pop');
      if (done + 1 === task.seq.length) p.onDone({ success: true, info: `${task.seq.join(' → ')}.` });
      setDone(done + 1);
    } else {
      setShake(i);
      setTimeout(() => setShake(null), 400);
      mistake(tr(`Prawidłowo: ${task.seq.join(' → ')}.`, `Correct order: ${task.seq.join(' → ')}.`));
    }
  };
  return (
    <div className="mg">
      <p className="prompt">{tr(<>Klikaj etapy w kolejności, w jakiej <b>płynie krew</b>.</>, <>Click the stages in the order in which <b>blood flows</b>.</>)}</p>
      <div className="path-track" aria-live="polite">
        {task.seq.slice(0, done).map((s, i) => <span key={i} className="path-step">{i > 0 && <span className="arrow">→</span>}{s}</span>)}
        {done === 0 && <span className="muted">{tr('Zacznij od pierwszego etapu…', 'Start with the first stage…')}</span>}
      </div>
      <div className="field bubbles">
        {task.seq.map((s, i) => (
          <button key={s} className={`bubble ${i < done ? 'used' : ''} ${shake === i ? 'shake' : ''}`} style={{ left: `${task.pos[i].x}%`, top: `${task.pos[i].y}%` }} onClick={() => click(i)} disabled={i < done}>
            {i < done && <b>{i + 1}.</b>} {s}
          </button>
        ))}
      </div>
    </div>
  );
}
