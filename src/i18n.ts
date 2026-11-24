/**
 * Prosty mechanizm dwujęzyczności (PL / EN).
 * Aktualny język jest trzymany w module; po zmianie aplikacja przerysowuje całe drzewo,
 * więc tr() i gettery w danych zawsze zwracają tekst w bieżącym języku.
 */
export type Lang = 'pl' | 'en';
let current: Lang = 'pl';

export function setLang(l: Lang) {
  current = l;
  if (typeof document !== 'undefined') document.documentElement.lang = l;
}
export const getLang = () => current;
/** Wybiera wariant dla bieżącego języka (działa dla tekstu i JSX). */
export function tr<T>(pl: T, en: T): T {
  return current === 'en' ? en : pl;
}
export const locale = () => (current === 'en' ? 'en-GB' : 'pl-PL');
/** Grupa 0 po polsku, O po angielsku. */
export const groupName = (g: string) => (current === 'en' && g === '0' ? 'O' : g);
