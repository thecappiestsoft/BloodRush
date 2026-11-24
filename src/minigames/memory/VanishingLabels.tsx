import { useEffect, useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { sample } from '../../utils/random';
import { lv } from '../../utils/level';
import { HEART_PARTS, HEART_VIEW, heartPartsFor } from '../../data/content';
import { DiagramBox, HeartSvg, pct } from '../common/Diagrams';
import { useMistakes } from '../common/hooks';
import { sfx } from '../../engine/sound';

/** Znikające podpisy: zapamiętaj schemat serca, potem wskaż wskazane części. */
export default function VanishingLabels(p: MiniGameProps) {
  const [task] = useState(() => {
    const ids = heartPartsFor(p.level).filter((id) => p.level === 'technical' || !id.startsWith('z') || id === 'zgg' || id === 'zgd' || id === 'zp');
    const parts = HEART_PARTS.filter((x) => ids.includes(x.id));
    const asks = sample(p.rng, parts, lv(p.level, 2, 3, 3) + (p.intensity === 2 ? 1 : 0));
    return { parts, asks };
  });
  const [show, setShow] = useState(true);
  const [q, setQ] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const mistake = useMistakes(p, lv(p.level, 1, 0, 0));
  useEffect(() => {
    if (!show || p.paused) return;
    const t = setTimeout(() => { setShow(false); p.startTimer(); }, p.learn ? 6000 : lv(p.level, 3000, 3200, 3400));
    return () => clearTimeout(t);
  }, [show, p.paused]); // eslint-disable-line react-hooks/exhaustive-deps
  const click = (id: string) => {
    if (show) return;
    const target = task.asks[q];
    if (id === target.id) {
      sfx('pop');
      setFound([...found, id]);
      if (q + 1 >= task.asks.length) p.onDone({ success: true, info: tr('Przedsionki przyjmują krew z żył, komory tłoczą ją do tętnic (aorty i pnia płucnego).', 'The atria receive blood from veins; the ventricles pump it into arteries (the aorta and pulmonary trunk).') });
      else setQ(q + 1);
    } else {
      setWrong(id);
      setTimeout(() => setWrong(null), 400);
      mistake(tr(`${target.name} – to inne miejsce na schemacie.`, `${target.name} is somewhere else on the diagram.`));
    }
  };
  return (
    <div className="mg">
      <p className="prompt">{show ? tr(<><b>ZAPAMIĘTAJ</b> podpisy – zaraz znikną!</>, <><b>REMEMBER</b> the labels – they are about to vanish!</>) : <>{tr('Wskaż', 'Point to')}: <b className="ask">{task.asks[q].name}</b></>}</p>
      <div className="narrow">
        <DiagramBox view={HEART_VIEW} svg={<HeartSvg />}>
          {task.parts.map((x) => (
            <button key={x.id} className={`hit hit-${x.kind} ${found.includes(x.id) ? 'found' : ''} ${wrong === x.id ? 'shake bad-ring' : ''}`}
              style={hitStyle(x.rect)}
              onClick={() => click(x.id)} aria-label={show || found.includes(x.id) ? x.name : tr('Część serca', 'Part of the heart')}>
              {(show || found.includes(x.id)) && <span className="hit-label">{x.name}</span>}
            </button>
          ))}
        </DiagramBox>
      </div>
    </div>
  );
}

export function hitStyle(r: { x: number; y: number; w: number; h: number }) {
  const w = Math.max(r.w, 34);
  const h = Math.max(r.h, 24);
  return { left: pct(r.x + (r.w - w) / 2, HEART_VIEW.w), top: pct(r.y + (r.h - h) / 2, HEART_VIEW.h), width: pct(w, HEART_VIEW.w), height: pct(h, HEART_VIEW.h) };
}
