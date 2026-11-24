import { useEffect, useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { randInt, shuffle } from '../../utils/random';
import { lv } from '../../utils/level';
import { ChoiceGrid } from '../common/ChoiceGrid';
import { sfx } from '../../engine/sound';

/** Policz uderzenia serca w pokazanym przedziale czasu. */
export default function CountBeats(p: MiniGameProps) {
  const [task] = useState(() => {
    const beats = randInt(p.rng, lv(p.level, 4, 5, 5), lv(p.level, 7, 9, 8));
    const windowS = p.level === 'technical' ? 5 : Math.max(4, Math.round(beats * 0.75));
    const perMin = p.level === 'technical';
    const ans = perMin ? beats * 12 : beats;
    const step = perMin ? 12 : 1;
    const raw = [ans - step, ans + step, ans + 2 * step, ans - 2 * step, ans + 3 * step].filter((x) => x > 0);
    const opts = shuffle(p.rng, [ans, ...shuffle(p.rng, raw).slice(0, 3)]);
    return { beats, windowS, perMin, ans, opts };
  });
  const [n, setN] = useState(0);
  const [beat, setBeat] = useState(false);
  const watching = n < task.beats;
  useEffect(() => {
    if (!watching) { p.startTimer(); return; }
    if (p.paused) return;
    const interval = (task.windowS * 1000) / task.beats;
    const t = setTimeout(() => {
      sfx('beat');
      setBeat(true);
      setTimeout(() => setBeat(false), 220);
      setN((x) => x + 1);
    }, n === 0 ? 500 : interval);
    return () => clearTimeout(t);
  }, [n, p.paused]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="mg center">
      <p className="prompt">
        {watching ? tr(<><b>LICZ</b> uderzenia serca{task.perMin ? <> w ciągu <b>{task.windowS} s</b></> : ''}!</>, <><b>COUNT</b> the heartbeats{task.perMin ? <> in <b>{task.windowS} s</b></> : ''}!</>) : task.perMin ? tr(<>Ile to uderzeń <b>na minutę</b>?</>, <>How many beats is that <b>per minute</b>?</>) : tr(<>Ile było uderzeń?</>, <>How many beats were there?</>)}
      </p>
      <div className={`beating-heart ${beat ? 'beat' : ''} ${p.reduceMotion ? 'calm' : ''}`} aria-hidden>
        <svg viewBox="0 0 100 90" width="160"><path d="M50 86 C10 58 0 40 0 24 A24 24 0 0 1 50 12 A24 24 0 0 1 100 24 C100 40 90 58 50 86Z" fill="#e23b4a" stroke="#7a0b14" strokeWidth="5" /></svg>
        <svg className="ecg" viewBox="0 0 200 40" width="220"><path d={beat ? 'M0 20 H80 L90 4 L100 36 L110 20 H200' : 'M0 20 H200'} stroke="#22c55e" strokeWidth="3" fill="none" /></svg>
      </div>
      {!watching && (
        <ChoiceGrid columns={4} options={task.opts.map((o) => (task.perMin ? `${o}/min` : `${o}`))} correct={task.opts.indexOf(task.ans)}
          onAnswer={(i) => p.onDone({ success: task.opts[i] === task.ans, info: task.perMin ? tr(`${task.beats} uderzeń w 5 s → ${task.beats} × 12 = ${task.ans}/min. Tak liczy się tętno z krótszego pomiaru.`, `${task.beats} beats in 5 s → ${task.beats} × 12 = ${task.ans}/min. This is how pulse is worked out from a shorter count.`) : tr(`Uderzeń było ${task.beats}. Każde uderzenie to skurcz komór wypychający krew do tętnic – to wyczuwamy jako tętno.`, `There were ${task.beats} beats. Each beat is a contraction of the ventricles pushing blood into the arteries – that is what we feel as the pulse.`) })} />
      )}
    </div>
  );
}
