import { useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { randInt, sample, shuffle } from '../../utils/random';
import { lv } from '../../utils/level';
import { cycleFor, cycleWindow } from '../../data/content';
import { useDragTap } from '../common/useDragTap';
import { useMistakes } from '../common/hooks';
import { sfx } from '../../engine/sound';

/** Połącz naczynia: wstaw brakujące odcinki „rurociągu”, aby krew popłynęła. */
export default function ConnectVessels(p: MiniGameProps) {
  const [task] = useState(() => {
    const cyc = cycleFor(p.level);
    const gaps = lv(p.level, 2, 3, 4);
    const chain = cycleWindow(cyc, randInt(p.rng, 0, cyc.length - 1), gaps + 2);
    const middle = chain.slice(1, -1);
    const distract = sample(p.rng, cyc.filter((c) => !chain.includes(c)), lv(p.level, 1, 2, 2));
    return { start: chain[0], end: chain[chain.length - 1], middle, pieces: shuffle(p.rng, [...middle, ...distract]) };
  });
  const [filled, setFilled] = useState<(string | null)[]>(() => task.middle.map(() => null));
  const [shake, setShake] = useState<number | null>(null);
  const mistake = useMistakes(p, 1);
  const { itemProps, targetProps, selected, ghost } = useDragTap((piece, slot) => {
    const i = Number(slot);
    if (filled[i]) return;
    if (task.middle[i] === piece) {
      sfx('pop');
      const next = filled.slice();
      next[i] = piece;
      setFilled(next);
      if (next.every(Boolean)) p.onDone({ success: true, info: `${tr('Przepływ przywrócony', 'Flow restored')}: ${[task.start, ...task.middle, task.end].join(' → ')}.` });
    } else {
      setShake(i);
      setTimeout(() => setShake(null), 400);
      mistake(tr(`W tym miejscu: ${task.middle[i]}.`, `This section is: ${task.middle[i]}.`));
    }
  });
  const flowing = filled.every(Boolean);
  return (
    <div className="mg">
      <p className="prompt">{tr(<>Awaria rurociągu! Wstaw brakujące odcinki tak, by krew płynęła od <b>{task.start}</b> do <b>{task.end}</b>.</>, <>Pipeline failure! Insert the missing sections so blood flows from <b>{task.start}</b> to <b>{task.end}</b>.</>)}</p>
      <div className={`pipeline ${flowing ? 'flowing' : ''}`}>
        <div className="pipe-node fixed">{task.start}</div>
        {task.middle.map((_, i) => (
          <div key={i} className="pipe-seg">
            <span className="pipe" aria-hidden />
            <button className={`pipe-node slot ${filled[i] ? 'filled' : ''} ${shake === i ? 'shake' : ''} ${selected ? 'armed' : ''}`} disabled={!!filled[i]} {...targetProps(String(i))} aria-label={filled[i] ?? tr(`Brakujący odcinek ${i + 1}`, `Missing section ${i + 1}`)}>
              {filled[i] ?? '?'}
            </button>
          </div>
        ))}
        <div className="pipe-seg"><span className="pipe" aria-hidden /><div className="pipe-node fixed">{task.end}</div></div>
      </div>
      <div className="tray">
        {task.pieces.filter((x) => !filled.includes(x)).map((x) => (
          <button key={x} className={`chip pipe-chip ${selected === x ? 'selected' : ''}`} {...itemProps(x)}>{x}</button>
        ))}
      </div>
      {ghost((id) => <span className="chip pipe-chip">{id}</span>)}
    </div>
  );
}
