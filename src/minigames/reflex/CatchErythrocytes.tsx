import { useState } from 'react';
import { tr } from '../../i18n';
import type { CellKind, MiniGameProps } from '../../types';
import { pick } from '../../utils/random';
import { lv } from '../../utils/level';
import { CatchField } from '../common/CatchField';
import { CELL_NAMES } from '../common/Cell';

export default function CatchErythrocytes(p: MiniGameProps) {
  const [cfg] = useState(() => {
    const L = p.level;
    const nT = lv(L, 4, 5, 6) + (p.intensity === 2 ? 1 : 0);
    const pool: CellKind[] = lv(L, ['platelet', 'neutrophil', 'bacterium'], ['platelet', 'neutrophil', 'lymphocyte', 'monocyte'], ['platelet', 'lymphocyte', 'neutrophil', 'eosinophil', 'monocyte', 'bacterium']);
    const nD = lv(L, 4, 6, 8) + p.intensity;
    return {
      targets: Array<CellKind>(nT).fill('rbc'),
      distractors: Array.from({ length: nD }, () => pick(p.rng, pool)),
      speed: lv(L, 3.5, 5, 6.5) * (1 + p.intensity * 0.15),
    };
  });
  return (
    <div className="mg">
      <p className="prompt">{tr(<>Klikaj tylko <b>erytrocyty</b> – czerwone krążki <b>bez jądra</b> z jaśniejszym środkiem.</>, <>Click only the <b>erythrocytes</b> – red discs with <b>no nucleus</b> and a paler centre.</>)}</p>
      <CatchField p={p} targets={cfg.targets} distractors={cfg.distractors} speed={cfg.speed} allowed={lv(p.level, 2, 1, 1)}
        successInfo={tr('Erytrocyty nie mają jądra i są wypełnione hemoglobiną, która transportuje tlen.', 'Erythrocytes have no nucleus and are filled with haemoglobin, which carries oxygen.')}
        wrongInfo={(k) => tr(`To był ${CELL_NAMES[k]}. Erytrocyt nie ma jądra i ma kształt dwuwklęsłego krążka.`, `That was a ${CELL_NAMES[k]}. An erythrocyte has no nucleus and is shaped like a biconcave disc.`)} />
    </div>
  );
}
