import { useEffect, useState } from 'react';
import { tr } from '../../i18n';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import type { MiniGameProps } from '../../types';
import { pick } from '../../utils/random';
import { lv } from '../../utils/level';
import { Cell } from '../common/Cell';
import { useMistakes } from '../common/hooks';
import { sfx } from '../../engine/sound';

type Place = 'lungs' | 'tissue';
type Gas = 'o2' | 'co2';

/** Wymiana gazowa: w którą stronę dyfunduje cząsteczka – do krwi czy z krwi? */
export default function GasExchange(p: MiniGameProps) {
  const [items] = useState(() => {
    const n = lv(p.level, 3, 4, 5) + (p.intensity === 2 ? 1 : 0);
    const fixed: Place = pick(p.rng, ['lungs', 'tissue'] as Place[]);
    return Array.from({ length: n }, () => ({ gas: pick(p.rng, ['o2', 'co2'] as Gas[]), place: p.level === 'technical' ? pick(p.rng, ['lungs', 'tissue'] as Place[]) : fixed }));
  });
  const [i, setI] = useState(0);
  const mistake = useMistakes(p, lv(p.level, 1, 0, 0));
  const correctDir = (g: Gas, pl: Place) => ((g === 'o2') === (pl === 'lungs') ? 'in' : 'out');
  const answer = (dir: 'in' | 'out') => {
    const it = items[i];
    if (!it) return;
    if (dir === correctDir(it.gas, it.place)) {
      sfx('pop');
      if (i + 1 >= items.length) p.onDone({ success: true, info: tr('W płucach O₂ przechodzi do krwi, a CO₂ z krwi do pęcherzyków. W tkankach – odwrotnie. Gazy dyfundują zgodnie z różnicą stężeń (ciśnień parcjalnych).', 'In the lungs O₂ moves into the blood and CO₂ from the blood into the alveoli. In the tissues it is the other way round. Gases diffuse down their concentration (partial pressure) gradient.') });
      setI(i + 1);
    } else {
      mistake(tr(`${it.place === 'lungs' ? 'W płucach' : 'W tkankach'} ${it.gas === 'o2' ? 'O₂' : 'CO₂'} przechodzi ${correctDir(it.gas, it.place) === 'in' ? 'DO krwi' : 'Z krwi'}.`, `${it.place === 'lungs' ? 'In the lungs' : 'In the tissues'} ${it.gas === 'o2' ? 'O₂' : 'CO₂'} moves ${correctDir(it.gas, it.place) === 'in' ? 'INTO the blood' : 'OUT OF the blood'}.`));
    }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') answer('in'); if (e.key === 'ArrowRight') answer('out'); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  const it = items[Math.min(i, items.length - 1)];
  return (
    <div className="mg center">
      <p className="prompt">{tr('Miejsce', 'Location')}: <b>{it.place === 'lungs' ? tr('NACZYNIA WŁOSOWATE PŁUC 🫁', 'LUNG CAPILLARIES 🫁') : tr('NACZYNIA WŁOSOWATE TKANEK 💪', 'TISSUE CAPILLARIES 💪')}</b>. {tr('W którą stronę przejdzie cząsteczka?', 'Which way will the molecule move?')}</p>
      <div className={`exchange ${it.place}`}>
        <div className="ex-side">{it.place === 'lungs' ? tr('pęcherzyk płucny', 'alveolus') : tr('komórki tkanki', 'tissue cells')}</div>
        <div className="ex-mol" key={i}><Cell kind={it.gas} size={84} label={it.gas === 'o2' ? tr('tlen', 'oxygen') : tr('dwutlenek węgla', 'carbon dioxide')} /></div>
        <div className="ex-side blood">{tr('krew', 'blood')}</div>
      </div>
      <div className="tf-buttons">
        <button className="btn big" onClick={() => answer('in')}><ArrowDownToLine aria-hidden /> {tr('DO KRWI', 'INTO BLOOD')} <small>←</small></button>
        <button className="btn big" onClick={() => answer('out')}><ArrowUpFromLine aria-hidden /> {tr('Z KRWI', 'OUT OF BLOOD')} <small>→</small></button>
      </div>
      <div className="tap-dots">{items.map((_, k) => <span key={k} className={k < i ? 'on' : ''} />)}</div>
    </div>
  );
}
