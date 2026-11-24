import { useState } from 'react';
import { tr, locale } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { pick, shuffle } from '../../utils/random';
import { ChoiceGrid } from '../common/ChoiceGrid';

const fmt = (v: number) => `${Math.round(v).toLocaleString(locale())} ml`;
const dec = (s: string) => tr(s, s.replace(',', '.'));

/** Oblicz skład krwi na uproszczonych danych. */
export default function CalcComposition(p: MiniGameProps) {
  const [task] = useState(() => {
    let q: string, ans: number, wrong: number[], info: string;
    if (p.level === 'primary') {
      const v = pick(p.rng, [1000, 2000, 4000, 5000]);
      const askPlasma = p.rng() < 0.5;
      ans = v * (askPlasma ? 0.55 : 0.45);
      q = tr(`Przyjmij: osocze to 55%, a elementy morfotyczne 45% objętości krwi. Ile ${askPlasma ? 'osocza' : 'elementów morfotycznych'} jest w ${fmt(v)} krwi?`, `Assume plasma is 55% and formed elements 45% of blood volume. How much ${askPlasma ? 'plasma' : 'formed elements'} is in ${fmt(v)} of blood?`);
      wrong = [v * (askPlasma ? 0.45 : 0.55), v * 0.1, v * 0.9];
      info = `${fmt(v)} × ${dec(askPlasma ? '0,55' : '0,45')} = ${fmt(ans)}.`;
    } else if (p.level === 'highschool' || p.rng() < 0.35) {
      const v = pick(p.rng, [500, 1000, 2000]);
      const hct = pick(p.rng, [40, 42, 44, 45, 46]);
      ans = (v * (100 - hct)) / 100;
      q = tr(`Próbka (dane szkoleniowe): ${fmt(v)} krwi, hematokryt ${hct}%. Ile ml osocza zawiera próbka? (Pomiń objętość leukocytów i płytek.)`, `Sample (training data): ${fmt(v)} of blood, haematocrit ${hct}%. How many ml of plasma does it contain? (Ignore the volume of leukocytes and platelets.)`);
      wrong = [(v * hct) / 100, v - hct * 10, (v * (100 - hct)) / 1000 * 100 + 50];
      info = `${tr('Osocze', 'Plasma')} ≈ ${fmt(v)} × (100% − ${hct}%) = ${fmt(ans)}.`;
    } else {
      const v = pick(p.rng, [1000, 2000]);
      const hct = pick(p.rng, [40, 45]);
      const water = 0.9;
      ans = v * (1 - hct / 100) * water;
      q = tr(`Próbka: ${fmt(v)} krwi, hematokryt ${hct}%. Woda stanowi ok. 90% osocza. Ile ml wody jest w osoczu tej próbki?`, `Sample: ${fmt(v)} of blood, haematocrit ${hct}%. Water is about 90% of plasma. How many ml of water are in this sample’s plasma?`);
      wrong = [v * (1 - hct / 100), v * water, v * (hct / 100) * water];
      info = `${fmt(v)} × ${dec((1 - hct / 100).toFixed(2).replace('.', ','))} × ${dec('0,9')} = ${fmt(ans)}.`;
    }
    const uniq = [...new Set(wrong.map((w) => Math.round(w)).filter((w) => w !== Math.round(ans) && w > 0))].slice(0, 3);
    while (uniq.length < 3) uniq.push(Math.round(ans * (1 + 0.2 * (uniq.length + 1))));
    const opts = shuffle(p.rng, [Math.round(ans), ...uniq]);
    return { q, opts, correct: opts.indexOf(Math.round(ans)), info };
  });
  return (
    <div className="mg">
      <div className="calc-card"><span className="calc-ico" aria-hidden>🧪</span><p>{task.q}</p></div>
      <ChoiceGrid options={task.opts.map(fmt)} correct={task.correct} onAnswer={(i) => p.onDone({ success: i === task.correct, info: task.info })} />
    </div>
  );
}
