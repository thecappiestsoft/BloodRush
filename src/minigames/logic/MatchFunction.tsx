import { useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { pick, sample } from '../../utils/random';
import { lv } from '../../utils/level';
import { PAIR_GROUPS } from '../../data/questions';
import { Matcher } from '../common/Matcher';
import { MORPH, cats, pairGroups } from '../common/bankHelpers';

export default function MatchFunction(p: MiniGameProps) {
  const [task] = useState(() => {
    const groups = pairGroups(p.bank, p.level, cats(p), (g) => g !== MORPH);
    const [name, items] = pick(p.rng, groups);
    const n = Math.min(items.length, lv(p.level, 3, 4, 4) + (p.intensity === 2 ? 1 : 0));
    return { name, pairs: sample(p.rng, items, n) };
  });
  return (
    <div className="mg">
      <p className="prompt">{tr('Połącz w pary', 'Match the pairs')}: <b>{PAIR_GROUPS[task.name] ?? task.name}</b>. {tr('Kliknij element z lewej, potem jego funkcję.', 'Click an item on the left, then its function.')}</p>
      <Matcher p={p} pairs={task.pairs} allowed={1} successInfo={task.pairs[0].explanation} />
    </div>
  );
}
