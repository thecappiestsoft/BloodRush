import type { Category, Difficulty, GameType, Level } from '../types';
import { tr } from '../i18n';

export const LEVELS: { id: Level; readonly name: string; readonly short: string; readonly desc: string }[] = [
  { id: 'primary', get name() { return tr('Szkoła podstawowa', 'Primary school'); }, get short() { return tr('Klasy 7–8', 'Ages 12–14'); }, get desc() { return tr('Skład krwi, krwinki, serce i podstawy krążenia.', 'Blood composition, blood cells, the heart and basic circulation.'); } },
  { id: 'highschool', get name() { return tr('Liceum', 'High school'); }, get short() { return tr('Zakres podst. i rozsz.', 'Standard & advanced'); }, get desc() { return tr('Grupy krwi, Rh, hemostaza, transport gazów, analiza.', 'Blood groups, Rh, haemostasis, gas transport, analysis.'); } },
  { id: 'technical', get name() { return tr('Technikum', 'Technical school'); }, get short() { return tr('Praktyka i dane', 'Practice & data'); }, get desc() { return tr('Obliczenia, parametry, symulacje i decyzje.', 'Calculations, parameters, simulations and decisions.'); } },
];
export const levelName = (l: Level) => LEVELS.find((x) => x.id === l)!.name;

const C = (id: Category, pl: string, en: string) => ({ id, get name() { return tr(pl, en); } });
export const CATEGORIES: { id: Category; readonly name: string }[] = [
  C('sklad', 'Skład krwi', 'Blood composition'),
  C('erytrocyty', 'Erytrocyty', 'Erythrocytes'),
  C('leukocyty', 'Leukocyty', 'Leukocytes'),
  C('trombocyty', 'Trombocyty', 'Thrombocytes'),
  C('osocze', 'Osocze', 'Plasma'),
  C('grupy', 'Grupy krwi (AB0)', 'Blood groups (ABO)'),
  C('rh', 'Czynnik Rh', 'Rh factor'),
  C('krzepniecie', 'Krzepnięcie krwi', 'Blood clotting'),
  C('serce', 'Budowa serca', 'Heart structure'),
  C('naczynia', 'Naczynia krwionośne', 'Blood vessels'),
  C('krazenie-male', 'Krążenie małe (płucne)', 'Pulmonary circulation'),
  C('krazenie-duze', 'Krążenie duże (ustrojowe)', 'Systemic circulation'),
  C('gazy', 'Transport gazów oddechowych', 'Respiratory gas transport'),
  C('cisnienie', 'Ciśnienie krwi i tętno', 'Blood pressure and pulse'),
];
export const catName = (c: Category) => CATEGORIES.find((x) => x.id === c)?.name ?? c;

const G = (id: GameType, pl: string, en: string) => ({ id, get name() { return tr(pl, en); } });
export const GAME_TYPES: { id: GameType; readonly name: string }[] = [
  G('reflex', 'Zręcznościowe', 'Reflex'),
  G('logic', 'Logiczne', 'Logic'),
  G('memory', 'Pamięciowe', 'Memory'),
  G('observation', 'Obserwacyjne', 'Observation'),
  G('classification', 'Klasyfikacyjne', 'Classification'),
  G('math', 'Matematyczno-analityczne', 'Maths & analysis'),
  G('spatial', 'Przestrzenne i manipulacyjne', 'Spatial & building'),
];

const D = (id: Difficulty, pl: string, en: string, time: number) => ({ id, time, get name() { return tr(pl, en); } });
export const DIFFICULTIES: { id: Difficulty; readonly name: string; time: number }[] = [
  D('veryEasy', 'Bardzo łatwe', 'Very easy', 5),
  D('easy', 'Łatwe', 'Easy', 7),
  D('medium', 'Średnie', 'Medium', 10),
  D('hard', 'Trudne', 'Hard', 12),
  D('veryHard', 'Bardzo trudne', 'Very hard', 15),
];
export const DIFF_ORDER: Difficulty[] = DIFFICULTIES.map((d) => d.id);
/** Krótki symbol poziomu: SP/LO/T lub PS/HS/TS. */
export const lvShort = (l: Level) => tr({ primary: 'SP', highschool: 'LO', technical: 'T' }, { primary: 'PS', highschool: 'HS', technical: 'TS' })[l];
