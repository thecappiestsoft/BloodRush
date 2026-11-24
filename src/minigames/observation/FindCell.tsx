import { useState } from 'react';
import { tr } from '../../i18n';
import type { CellKind, MiniGameProps } from '../../types';
import { pick, sample, shuffle } from '../../utils/random';
import { CELL_DESCRIPTIONS } from '../../data/content';
import { lv } from '../../utils/level';
import { Cell, CELL_NAMES, CELL_SCALE } from '../common/Cell';
import { ChoiceGrid } from '../common/ChoiceGrid';

/** Znajdź właściwą krwinkę na podstawie opisu budowy. */
export default function FindCell(p: MiniGameProps) {
  const [task] = useState(() => {
    const d = pick(p.rng, CELL_DESCRIPTIONS.filter((x) => x.levels.includes(p.level)));
    const pool: CellKind[] = lv(p.level, ['rbc', 'platelet', 'neutrophil', 'bacterium', 'neuron'], ['rbc', 'platelet', 'neutrophil', 'lymphocyte', 'monocyte'], ['rbc', 'platelet', 'neutrophil', 'lymphocyte', 'monocyte', 'eosinophil']);
    const others = sample(p.rng, pool.filter((k) => k !== d.kind && !(p.level === 'primary' && d.kind === 'neutrophil' && ['lymphocyte', 'monocyte'].includes(k))), 3);
    const opts = shuffle(p.rng, [d.kind, ...others]);
    return { d, opts };
  });
  return (
    <div className="mg">
      <p className="prompt">{tr('Wskaż', 'Find')}: <b>{task.d.text}</b></p>
      <ChoiceGrid columns={4} options={task.opts.map((k) => (
        <span className="cell-choice" key={k}><Cell kind={k} size={Math.round(80 * CELL_SCALE[k])} label={tr('komórka', 'cell')} /></span>
      ))} correct={task.opts.indexOf(task.d.kind)}
        onAnswer={(i) => p.onDone({ success: task.opts[i] === task.d.kind, info: task.opts[i] === task.d.kind ? task.d.fact : tr(`To był ${CELL_NAMES[task.opts[i]]}. ${task.d.fact}`, `That was a ${CELL_NAMES[task.opts[i]]}. ${task.d.fact}`) })} />
    </div>
  );
}
