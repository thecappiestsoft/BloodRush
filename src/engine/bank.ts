import type { BankItem, BankType, Category, Level } from '../types';
import { DEFAULT_BANK } from '../data/questions';
import { DEFAULT_BANK_EN } from '../data/questions.en';
import { getLang, tr } from '../i18n';
import { load, remove, save } from './storage';

/** Każdy język ma własną bazę zadań (nauczyciel może edytować obie niezależnie). */
const key = () => (getLang() === 'en' ? 'bank.en.v1' : 'bank.v1');
const defaults = () => (getLang() === 'en' ? DEFAULT_BANK_EN : DEFAULT_BANK);
export function loadBank(): BankItem[] {
  return load<BankItem[] | null>(key(), null) ?? defaults();
}
export function saveBank(bank: BankItem[]) {
  save(key(), bank);
}
export function resetBank() {
  remove(key());
  return defaults();
}

/** Pozycje bazy danego typu pasujące do poziomu i wybranych kategorii. */
export function bankFor<T extends BankType>(bank: BankItem[], type: T, level: Level, cats: Category[]) {
  return bank.filter((b) => b.type === type && b.levels.includes(level) && cats.includes(b.category)) as Extract<BankItem, { type: T }>[];
}

/** Walidacja importowanego pliku JSON. Zwraca poprawne pozycje i liczbę odrzuconych. */
export function validateBank(data: unknown): { items: BankItem[]; rejected: number } {
  const arr = Array.isArray(data) ? data : (data as { items?: unknown })?.items;
  if (!Array.isArray(arr)) throw new Error(tr('Plik nie zawiera listy zadań.', 'The file does not contain a list of tasks.'));
  const levels = ['primary', 'highschool', 'technical'];
  const items: BankItem[] = [];
  let rejected = 0;
  const str = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
  for (const raw of arr) {
    const r = raw as Record<string, unknown>;
    const okBase = str(r.id) && str(r.category) && Array.isArray(r.levels) && (r.levels as unknown[]).every((l) => levels.includes(l as string));
    let ok = false;
    switch (r.type) {
      case 'tf': ok = str(r.statement) && typeof r.answer === 'boolean'; break;
      case 'odd': ok = str(r.odd) && Array.isArray(r.others) && (r.others as unknown[]).length >= 2; break;
      case 'pair': ok = str(r.group) && str(r.left) && str(r.right); break;
      case 'sort': ok = str(r.set) && str(r.item) && str(r.bin); break;
      case 'quiz': ok = str(r.question) && str(r.correct) && Array.isArray(r.wrong) && (r.wrong as unknown[]).length >= 1; break;
    }
    if (okBase && ok) items.push({ explanation: '', ...(r as object) } as BankItem);
    else rejected++;
  }
  return { items, rejected };
}
