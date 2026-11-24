import { useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { sample } from '../../utils/random';
import { lv } from '../../utils/level';
import { HEART_PARTS, HEART_VIEW, heartPartsFor } from '../../data/content';
import { SlotDiagram } from '../common/SlotDiagram';
import { HeartSvg } from '../common/Diagrams';

/** Uzupełnij schemat serca: podpisy do pustych pól. */
export default function HeartLabels(p: MiniGameProps) {
  const [parts] = useState(() => {
    const ids = heartPartsFor(p.level);
    const chambers = ['pp', 'pk', 'lp', 'lk'];
    const n = lv(p.level, 4, 5, 6) + (p.intensity === 2 ? 1 : 0);
    const chosen = p.level === 'primary' ? [...chambers, ...sample(p.rng, ids.filter((i) => !chambers.includes(i)), n - 4)] : sample(p.rng, ids, n);
    return HEART_PARTS.filter((x) => chosen.includes(x.id));
  });
  return (
    <div className="mg">
      <p className="prompt">{tr(<>Przeciągnij podpisy na <b>puste pola</b> schematu serca (lub kliknij podpis, potem pole).</>, <>Drag the labels onto the <b>empty boxes</b> of the heart diagram (or click a label, then a box).</>)}</p>
      <SlotDiagram p={p} parts={parts} view={HEART_VIEW} svg={<HeartSvg />} allowed={1}
        successInfo={tr('Schemat w widoku od przodu: prawa strona serca jest po lewej stronie rysunku. Serce ma 2 przedsionki i 2 komory.', 'Front view: the right side of the heart is on the left of the picture. The heart has 2 atria and 2 ventricles.')} />
    </div>
  );
}
