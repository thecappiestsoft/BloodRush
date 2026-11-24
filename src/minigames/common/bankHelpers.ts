import type { BankItem, Category, Level, MiniGameProps, PairItem } from '../../types';
import { bankFor } from '../../engine/bank';

/** Grupa par z danymi do minigry „Analiza morfologii”. */
export const MORPH = 'morphology';

/** Kategorie tematyczne wybrane przez nauczyciela dla bieżącej rozgrywki. */
export const cats = (p: MiniGameProps) => p.categories;

/** Grupy par z co najmniej `min` unikalnymi pozycjami (dla minigier łączenia w pary). */
export function pairGroups(bank: BankItem[], level: Level, categories: Category[], filter: (g: string) => boolean, min = 3) {
  const items = bankFor(bank, 'pair', level, categories).filter((x) => filter(x.group));
  const groups: Record<string, PairItem[]> = {};
  for (const it of items) {
    const g = (groups[it.group] ??= []);
    if (!g.some((x) => x.left === it.left || x.right === it.right)) g.push(it);
  }
  return Object.entries(groups).filter(([, v]) => v.length >= min);
}
