import { useState } from 'react';
import { tr } from '../../i18n';
import type { BankItem, Category, Level, MiniGameProps } from '../../types';
import { sample, shuffle } from '../../utils/random';
import { lv } from '../../utils/level';
import { bankFor } from '../../engine/bank';
import { SORT_SETS } from '../../data/questions';
import { Sorter } from '../common/Sorter';

/** Pozycje zestawu sortowania dla poziomu i kategorii; zestaw dostępny, gdy ≥4 pozycje i ≥2 kategorie. */
export function sortPool(bank: BankItem[], set: string, level: Level, cats: Category[]) {
  const items = bankFor(bank, 'sort', level, cats).filter((x) => x.set === set);
  const bins = [...new Set(items.map((x) => x.bin))];
  return { items, bins, ok: items.length >= 4 && bins.length >= 2 };
}

/** Wspólny komponent dla minigier sortujących z bazy zadań. */
export function makeBankSort(set: string, promptPl: string, promptEn: string, iconList: string[]) {
  return function BankSort(p: MiniGameProps) {
    const [task] = useState(() => {
      const { items, bins } = sortPool(p.bank, set, p.level, p.categories);
      const n = Math.min(items.length, lv(p.level, 4, 5, 6) + (p.intensity === 2 ? 1 : 0));
      // co najmniej jeden element z każdej kategorii, reszta losowo
      const first = bins.map((b) => sample(p.rng, items.filter((x) => x.bin === b), 1)[0]);
      const rest = sample(p.rng, items.filter((x) => !first.includes(x)), Math.max(0, n - first.length));
      const chosen = shuffle(p.rng, [...first, ...rest]);
      const order = SORT_SETS[set]?.bins ?? [];
      const usedBins = [...new Set(chosen.map((x) => x.bin))].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      return { chosen, bins: usedBins };
    });
    return (
      <div className="mg">
        <p className="prompt">{tr(promptPl, promptEn)}</p>
        <Sorter p={p} bins={task.bins} binIcons={Object.fromEntries((SORT_SETS[set]?.bins ?? []).map((b, i) => [b, iconList[i]]))} allowed={1}
          entries={task.chosen.map((x) => ({ id: x.id, label: x.item, bin: x.bin, explanation: x.explanation }))}
          successInfo={pickInfo(task.chosen.map((x) => x.explanation))} />
      </div>
    );
  };
}
const pickInfo = (arr: string[]) => arr.find((x) => x.includes('!') || x.length > 40) ?? arr[0];

export const SortBlood = makeBankSort('plasma', 'Posortuj składniki krwi: osocze czy elementy morfotyczne?', 'Sort the blood components: plasma or formed elements?', ['💧', '🔴']);
export const ArteryVein = makeBankSort('vessels', 'Tętnica, żyła czy naczynie włosowate? Posortuj opisy.', 'Artery, vein or capillary? Sort the descriptions.', ['⬆️', '⬇️', '🕸️']);
export const SortFunctions = makeBankSort('cellfunc', 'Przypisz cechy i funkcje do właściwych elementów krwi.', 'Match the features and functions to the right blood cells.', ['🔴', '🛡️', '🩹']);
