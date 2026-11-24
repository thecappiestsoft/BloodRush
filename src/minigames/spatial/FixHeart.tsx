import { useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { sample, shuffle } from '../../utils/random';
import { lv } from '../../utils/level';
import { HEART_PARTS, HEART_VIEW, heartPartsFor } from '../../data/content';
import { DiagramBox, HeartSvg, pct } from '../common/Diagrams';
import { sfx } from '../../engine/sound';

/** Napraw serce: podpisy są pomieszane – zamieniaj je miejscami, aż wszystko będzie poprawne. */
export default function FixHeart(p: MiniGameProps) {
  const [task] = useState(() => {
    const pool = heartPartsFor(p.level).filter((id) => p.level === 'technical' || !['z3', 'z2', 'zpp', 'za'].includes(id));
    const n = lv(p.level, 4, 5, 6);
    const ids = p.level === 'primary' ? ['pp', 'pk', 'lp', 'lk'] : sample(p.rng, pool, n);
    const parts = HEART_PARTS.filter((x) => ids.includes(x.id));
    // derangement – żaden podpis nie zostaje na swoim miejscu na start, przynajmniej 2 zamiany
    let labels = shuffle(p.rng, parts.map((x) => x.id));
    for (let k = 0; k < 50 && labels.some((l, i) => l === parts[i].id); k++) labels = shuffle(p.rng, labels);
    return { parts, labels };
  });
  const [labels, setLabels] = useState(task.labels);
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const click = (i: number) => {
    if (done) return;
    if (sel === null) { setSel(i); return; }
    if (sel === i) { setSel(null); return; }
    const next = labels.slice();
    [next[sel], next[i]] = [next[i], next[sel]];
    setLabels(next);
    setSel(null);
    sfx('click');
    if (next.every((l, k) => l === task.parts[k].id)) {
      setDone(true);
      p.onDone({ success: true, info: tr('Serce naprawione! Na schemacie od przodu prawa połowa serca leży po lewej stronie rysunku.', 'Heart fixed! In a front-view diagram the right side of the heart is on the left of the picture.') });
    }
  };
  const name = (id: string) => HEART_PARTS.find((x) => x.id === id)!.name;
  return (
    <div className="mg">
      <p className="prompt">{tr(<>Podpisy są <b>pomieszane</b>! Kliknij dwa podpisy, aby zamienić je miejscami. Popraw wszystkie.</>, <>The labels are <b>mixed up</b>! Click two labels to swap them. Fix them all.</>)}</p>
      <div className="narrow">
        <DiagramBox view={HEART_VIEW} svg={<HeartSvg />}>
          {task.parts.map((x, i) => (
            <button key={x.id} className={`slot swap ${sel === i ? 'selected' : ''} ${labels[i] === x.id ? 'correct-place' : ''}`}
              style={{ left: pct(x.anchor.x, HEART_VIEW.w), top: pct(x.anchor.y, HEART_VIEW.h) }} onClick={() => click(i)}>
              {name(labels[i])}
            </button>
          ))}
        </DiagramBox>
      </div>
    </div>
  );
}
