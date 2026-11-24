import type { SessionSummary } from '../types';
import { load, save } from './storage';
import { tr } from '../i18n';

export interface Achievement { id: string; readonly name: string; readonly desc: string; icon: string }
const A = (id: string, icon: string, name: [string, string], desc: [string, string]): Achievement =>
  ({ id, icon, get name() { return tr(...name); }, get desc() { return tr(...desc); } });
export const ACHIEVEMENTS: Achievement[] = [
  A('rbc-master', '🔴', ['MISTRZ ERYTROCYTÓW', 'ERYTHROCYTE MASTER'], ['10 poprawnych zadań dotyczących erytrocytów (łącznie).', '10 correct erythrocyte tasks (in total).']),
  A('guardian', '🛡️', ['STRAŻNIK KRWIOBIEGU', 'GUARDIAN OF THE BLOODSTREAM'], ['20 minigier z rzędu bez błędu.', '20 mini-games in a row without a mistake.']),
  A('heart-expert', '❤️', ['EKSPERT SERCA', 'HEART EXPERT'], ['Perfekcyjnie wykonane zadania o budowie serca (min. 3 w jednej grze).', 'Perfect heart-structure tasks (at least 3 in one game).']),
  A('transfusion', '🩸', ['MISTRZ TRANSFUZJI', 'TRANSFUSION MASTER'], ['Wszystkie zadania o grupach krwi poprawnie (min. 2 w jednej grze).', 'All blood-group tasks correct (at least 2 in one game).']),
  A('lightning', '⚡', ['BŁYSKAWICA', 'LIGHTNING'], ['5 zadań z premią za szybkość w jednej grze.', '5 tasks with a speed bonus in one game.']),
  A('first-drop', '💧', ['PIERWSZA KROPLA', 'FIRST DROP'], ['Ukończ pierwszą rozgrywkę.', 'Finish your first game.']),
  A('marathon', '🏃', ['MARATOŃCZYK', 'MARATHON RUNNER'], ['Ukończ tryb Maraton.', 'Finish Marathon mode.']),
  A('boss', '👑', ['POGROMCA AWARII', 'FAILURE CRUSHER'], ['Pokonaj finał „Wielki Krwiobieg” w Boss Rush.', 'Beat the “Great Circulation” final in Boss Rush.']),
  A('scholar', '📚', ['PILNY LABORANT', 'DILIGENT TECHNICIAN'], ['Ukończ tryb Nauki ze skutecznością min. 80%.', 'Finish Learning mode with at least 80% accuracy.']),
  A('perfect', '✨', ['CZYSTA PRÓBKA', 'CLEAN SAMPLE'], ['Ukończ grę (min. 10 zadań) bez żadnego błędu.', 'Finish a game (at least 10 tasks) without a single mistake.']),
];

interface Progress { unlocked: Record<string, string>; rbcCorrect: number }
const KEY = 'achievements.v1';
export const loadProgress = (): Progress => load<Progress>(KEY, { unlocked: {}, rbcCorrect: 0 });
export const resetProgress = () => save(KEY, { unlocked: {}, rbcCorrect: 0 });

/** Aktualizuje postęp po zakończonej grze i zwraca nowo odblokowane osiągnięcia. */
export function evaluateSession(s: SessionSummary): Achievement[] {
  const p = loadProgress();
  const fresh: string[] = [];
  const unlock = (id: string) => { if (!p.unlocked[id]) { p.unlocked[id] = new Date().toISOString(); fresh.push(id); } };
  p.rbcCorrect += s.log.filter((r) => r.success && r.categories.includes('erytrocyty')).length;
  if (p.rbcCorrect >= 10) unlock('rbc-master');
  if (s.bestCombo >= 20) unlock('guardian');
  const heart = s.log.filter((r) => r.categories.includes('serce'));
  if (heart.length >= 3 && heart.every((r) => r.success && r.mistakes === 0)) unlock('heart-expert');
  const groups = s.log.filter((r) => r.categories.includes('grupy'));
  if (groups.length >= 2 && groups.every((r) => r.success)) unlock('transfusion');
  if (s.log.filter((r) => r.speedBonus).length >= 5) unlock('lightning');
  if (s.mode !== 'test') unlock('first-drop');
  if (s.mode === 'marathon') unlock('marathon');
  if (s.mode === 'boss' && s.bossCleared) unlock('boss');
  if (s.mode === 'learn' && s.accuracy >= 80 && s.rounds >= 5) unlock('scholar');
  if (s.rounds >= 10 && s.wrong === 0 && s.log.every((r) => r.mistakes === 0)) unlock('perfect');
  save(KEY, p);
  return ACHIEVEMENTS.filter((a) => fresh.includes(a.id));
}

/* ---------- Wyniki ---------- */
const RKEY = 'results.v1';
export type StoredResult = Omit<SessionSummary, 'log'>;
export const loadResults = () => load<StoredResult[]>(RKEY, []);
export function saveResult(s: SessionSummary) {
  const { log: _log, ...rest } = s;
  void _log;
  const all = [rest, ...loadResults()].slice(0, 300);
  save(RKEY, all);
}
export const clearResults = () => save(RKEY, []);
