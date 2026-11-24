/* Testy logiki gry: npm test */
import { scoreRound } from '../src/engine/scoring';
import { DEFAULT_SETTINGS } from '../src/engine/settings';
import { rbcCompatible, plasmaCompatible, ABO_ALL, type BloodType } from '../src/engine/bloodGroups';
import { buildRounds, eligibleGames } from '../src/engine/sequence';
import { DEFAULT_BANK } from '../src/data/questions';
import { MINIGAMES } from '../src/minigames/registry';
import { validateBank } from '../src/engine/bank';
import { DEFAULT_BANK_EN } from '../src/data/questions.en';
import { SORT_SETS } from '../src/data/questions';
import { setLang } from '../src/i18n';

let fails = 0;
const ok = (cond: boolean, msg: string) => { if (!cond) { fails++; console.log('✗', msg); } else console.log('✓', msg); };
const S = DEFAULT_SETTINGS;
const base = { timeout: false, elapsedMs: 6000, limitMs: 10000, mistakes: 0, streakBefore: 0, learn: false };

// punktacja
ok(scoreRound(S, { ...base, success: true }).total === 100, 'poprawne = 100 pkt');
ok(scoreRound(S, { ...base, success: true, elapsedMs: 3000 }).total === 125, 'szybko i bez błędu = +25');
ok(scoreRound(S, { ...base, success: true, elapsedMs: 3000, mistakes: 1 }).speed === 0, 'brak premii za szybkość przy pomyłce');
ok(scoreRound(S, { ...base, success: true, streakBefore: 2 }).combo === 50, 'COMBO ×3 = +50');
ok(scoreRound(S, { ...base, success: true, streakBefore: 4 }).combo === 100, 'COMBO ×5 = +100');
ok(scoreRound(S, { ...base, success: true, streakBefore: 9 }).combo === 250, 'COMBO ×10 = +250');
ok(scoreRound(S, { ...base, success: true, streakBefore: 5 }).combo === 0, 'COMBO ×6 = 0');
ok(scoreRound(S, { ...base, success: false, streakBefore: 7 }).streak === 0, 'błąd przerywa serię');
ok(scoreRound(S, { ...base, success: false, timeout: true }).total === 0, 'czas minął = 0 pkt');
ok(scoreRound({ ...S, comboEnabled: false }, { ...base, success: true, streakBefore: 2 }).combo === 0, 'COMBO można wyłączyć');
ok(scoreRound({ ...S, wrongPenalty: 30 }, { ...base, success: false }).total === -30, 'kara za błędne zadanie');
ok(scoreRound({ ...S, penaltiesEnabled: false, wrongPenalty: 30 }, { ...base, success: false, mistakes: 2 }).total === 0, 'kary można wyłączyć');

// zgodność KKCz (AB0 + Rh)
const T = (abo: BloodType['abo'], rh: BloodType['rh']): BloodType => ({ abo, rh });
ok(rbcCompatible(T('0', '−'), T('AB', '+')), 'KKCz 0− → AB+');
ok(!rbcCompatible(T('A', '+'), T('0', '+')), 'KKCz A+ ✗ 0+');
ok(!rbcCompatible(T('0', '+'), T('A', '−')), 'KKCz 0+ ✗ A− (Rh)');
ok(rbcCompatible(T('B', '−'), T('AB', '−')), 'KKCz B− → AB−');
ok(!rbcCompatible(T('AB', '+'), T('A', '+')), 'KKCz AB+ ✗ A+');
// osocze (AB0)
ok(plasmaCompatible('AB', '0') && plasmaCompatible('AB', 'A') && plasmaCompatible('AB', 'AB'), 'osocze AB → wszyscy');
ok(ABO_ALL.every((d) => plasmaCompatible(d, '0')), 'biorca 0 → każde osocze');
ok(!plasmaCompatible('0', 'A') && plasmaCompatible('A', 'A'), 'osocze 0 ✗ A');

// rejestr i losowanie
const regular = MINIGAMES.filter((g) => !g.bossOnly);
ok(regular.length >= 30, `min. 30 minigier (jest ${regular.length})`);
ok(new Set(MINIGAMES.map((g) => g.id)).size === MINIGAMES.length, 'unikalne id minigier');
for (const l of ['primary', 'highschool', 'technical'] as const) {
  const el = eligibleGames(S, l, DEFAULT_BANK);
  ok(el.length >= 28, `${l}: ${el.length} dostępnych minigier`);
  const r = buildRounds(S, 'quick', l, 50, DEFAULT_BANK, 1234);
  let adj = 0;
  for (let i = 1; i < r.length; i++) if (r[i].gameId === r[i - 1].gameId) adj++;
  ok(adj === 0, `${l}: brak powtórzeń z rzędu w 50 rundach`);
  const counts: Record<string, number> = {};
  r.forEach((x) => (counts[x.gameId] = (counts[x.gameId] ?? 0) + 1));
  ok(Math.max(...Object.values(counts)) <= 2, `${l}: limit powtórzeń (maks. ${Math.max(...Object.values(counts))})`);
  const r10 = buildRounds(S, 'quick', l, 10, DEFAULT_BANK, 99);
  ok(new Set(r10.map((x) => x.gameId)).size === 10, `${l}: 10 różnych minigier w szybkiej grze`);
  const boss = buildRounds(S, 'boss', l, 8, DEFAULT_BANK, 5);
  ok(boss.length === 9 && boss[8].gameId === 'grand-circulation', `${l}: Boss Rush kończy się finałem`);
  ok(boss[0].intensity <= boss[7].intensity, `${l}: Boss Rush – rosnąca trudność`);
}
ok(buildRounds({ ...S, timeMode: 'fixed', fixedTime: 8 }, 'quick', 'primary', 5, DEFAULT_BANK).every((r) => r.time === 8 || r.gameId === 'grand-circulation'), 'stały czas zadań');
ok(buildRounds(S, 'learn', 'primary', 5, DEFAULT_BANK).every((r) => r.time === null), 'tryb nauki bez limitu');
ok(buildRounds({ ...S, timeLimitEnabled: false }, 'quick', 'primary', 5, DEFAULT_BANK).every((r) => r.time === null), 'limit czasu można wyłączyć');
const onlyHeart = eligibleGames({ ...S, categories: ['serce'] }, 'primary', DEFAULT_BANK);
ok(onlyHeart.every((g) => g.categories.includes('serce')), `filtr kategorii (serce: ${onlyHeart.length})`);
const noMemory = eligibleGames({ ...S, gameTypes: S.gameTypes.filter((t) => t !== 'memory') }, 'primary', DEFAULT_BANK);
ok(noMemory.every((g) => g.type !== 'memory'), 'wyłączenie typu minigier');
ok(eligibleGames({ ...S, disabledGames: ['catch-rbc'] }, 'primary', DEFAULT_BANK).every((g) => g.id !== 'catch-rbc'), 'wyłączenie pojedynczej minigry');

// baza zadań
const v = validateBank(JSON.parse(JSON.stringify({ items: DEFAULT_BANK })));
ok(v.items.length === DEFAULT_BANK.length && v.rejected === 0, `eksport/import bazy (${v.items.length} zadań)`);
ok(validateBank([{ id: 'x', type: 'tf', levels: ['primary'], category: 'sklad' }]).rejected === 1, 'odrzucenie niepoprawnego zadania');
ok(new Set(DEFAULT_BANK.map((b) => b.id)).size === DEFAULT_BANK.length, 'unikalne id zadań');

// wersja angielska
setLang('en');
ok(DEFAULT_BANK_EN.length === DEFAULT_BANK.length && DEFAULT_BANK_EN.every((b, i) => b.id === DEFAULT_BANK[i].id && b.type === DEFAULT_BANK[i].type), 'EN: baza zgodna z PL (id, typy)');
ok(DEFAULT_BANK_EN.filter((b) => b.type === 'sort').every((b) => b.type === 'sort' && SORT_SETS[b.set].bins.includes(b.bin)), 'EN: kategorie sortowania pasują do zestawów');
ok(validateBank(JSON.parse(JSON.stringify(DEFAULT_BANK_EN))).rejected === 0, 'EN: baza przechodzi walidację');
for (const l of ['primary', 'highschool', 'technical'] as const) {
  const pl = eligibleGames(S, l, DEFAULT_BANK).length;
  const en = eligibleGames(S, l, DEFAULT_BANK_EN).length;
  ok(pl === en, `EN: ${l} – tyle samo minigier co PL (${en})`);
}
ok(MINIGAMES.every((g) => typeof g.name === 'string' && !/[ąćęłńóśźż]/i.test(g.name)), 'EN: nazwy minigier po angielsku');
setLang('pl');
ok(MINIGAMES.find((g) => g.id === 'catch-rbc')!.name === 'Złap erytrocyty', 'PL: powrót do polskich nazw');

console.log(fails ? `\n${fails} BŁĘDÓW` : '\nWSZYSTKIE TESTY ZALICZONE');
process.exit(fails ? 1 : 0);
