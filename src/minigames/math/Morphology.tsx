import { useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { pick, sample } from '../../utils/random';
import { lv } from '../../utils/level';
import { Matcher } from '../common/Matcher';
import { MORPH, pairGroups } from '../common/bankHelpers';

/** Analiza morfologii: dopasuj skróty parametrów do ich znaczenia (bez diagnozowania). */
export default function Morphology(p: MiniGameProps) {
  const [pairs] = useState(() => {
    const [, items] = pick(p.rng, pairGroups(p.bank, p.level, p.categories, (g) => g === MORPH));
    return sample(p.rng, items, Math.min(items.length, lv(p.level, 3, 4, 5)));
  });
  return (
    <div className="mg">
      <p className="prompt">{tr('Wydruk z analizatora', 'Analyser printout')} <span className="tag">{tr('dane szkoleniowe – bez wartości i norm', 'training data – no values or reference ranges')}</span>. {tr('Połącz skrót parametru z jego znaczeniem.', 'Match each abbreviation to its meaning.')}</p>
      <Matcher p={p} variant="lab" pairs={pairs} allowed={1} successInfo={tr('Morfologia opisuje m.in. liczbę krwinek i ilość hemoglobiny. Wyniki interpretuje lekarz – nie diagnozujemy w grze.', 'A blood count describes, among other things, the number of blood cells and the amount of haemoglobin. Results are interpreted by a doctor – the game does not diagnose.')} />
    </div>
  );
}
