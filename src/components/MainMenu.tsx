import { Play, GraduationCap, Volume2, VolumeX, Award, Zap, Infinity as Inf, Skull, BookOpen, Users, Minus, Plus, Timer } from 'lucide-react';
import { tr } from '../i18n';
import type { Level, Mode } from '../types';
import type { Settings } from '../engine/settings';
import { LEVELS } from '../data/catalog';
import { Logo, LangSwitch, ThemeSwitch } from './Logo';

const M = (id: Mode, icon: typeof Zap, name: [string, string], desc: [string, string]) => ({ id, icon, get name() { return tr(...name); }, get desc() { return tr(...desc); } });
const MODES = [
  M('quick', Zap, ['Szybka gra', 'Quick game'], ['Seria losowych minigier na czas.', 'A series of random timed mini-games.']),
  M('marathon', Inf, ['Maraton', 'Marathon'], ['20, 30 lub 50 minigier – pobij rekord!', '20, 30 or 50 mini-games – beat your record!']),
  M('boss', Skull, ['Boss Rush', 'Boss Rush'], ['Coraz trudniej, a na końcu finał „Wielki Krwiobieg”.', 'Harder and harder, ending with “The Great Circulation” final.']),
  M('learn', BookOpen, ['Nauka', 'Learning'], ['Bez presji czasu, z wyjaśnieniami.', 'No time pressure, with explanations.']),
  M('class', Users, ['Wyzwanie klasowe', 'Class challenge'], ['Gracze kolejno przy jednym stanowisku – ranking.', 'Players take turns at one computer – leaderboard.']),
];

export function MainMenu({ settings, update, mode, setMode, onStart, onTeacher, onAchievements, eligibleCount }: {
  settings: Settings;
  update: (p: Partial<Settings>) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  onStart: () => void;
  onTeacher: () => void;
  onAchievements: () => void;
  eligibleCount: (l: Level) => number;
}) {
  const count = eligibleCount(settings.level);
  return (
    <div className="menu">
      <div className="menu-top">
        <div className="top-controls">
          <ThemeSwitch theme={settings.theme} onChange={(theme) => update({ theme })} />
          <LangSwitch lang={settings.lang} onChange={(lang) => update({ lang })} />
        </div>
        <Logo />
        <p className="tagline">{tr(<>Laboratorium Krwi zgłasza <b>awarię systemu krwionośnego</b>. Tylko Ty możesz ją naprawić!</>, <>The Blood Lab reports a <b>circulatory system failure</b>. Only you can fix it!</>)}</p>
      </div>

      <section className="menu-section" aria-labelledby="lvl-h">
        <h2 id="lvl-h">1. {tr('Poziom edukacyjny', 'School level')}</h2>
        <div className="level-cards" role="radiogroup">
          {LEVELS.map((l, i) => (
            <button key={l.id} role="radio" aria-checked={settings.level === l.id} className={`level-card ${settings.level === l.id ? 'active' : ''}`} onClick={() => update({ level: l.id as Level })}>
              <span className="level-icon" aria-hidden>{['🧪', '🔬', '⚙️'][i]}</span>
              <b>{l.name}</b>
              <small>{l.short}</small>
              <span className="level-desc">{l.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="menu-section" aria-labelledby="mode-h">
        <h2 id="mode-h">2. {tr('Tryb gry', 'Game mode')}</h2>
        <div className="mode-cards" role="radiogroup">
          {MODES.map((m) => (
            <button key={m.id} role="radio" aria-checked={mode === m.id} className={`mode-card ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
              <m.icon aria-hidden />
              <b>{m.name}</b>
              <small>{m.desc}</small>
            </button>
          ))}
        </div>
        {mode === 'marathon' && (
          <div className="seg" role="radiogroup" aria-label={tr('Długość maratonu', 'Marathon length')}>
            {[20, 30, 50].map((n) => (
              <button key={n} role="radio" aria-checked={settings.marathonRounds === n} className={settings.marathonRounds === n ? 'active' : ''} onClick={() => update({ marathonRounds: n })}>{n} {tr('minigier', 'mini-games')}</button>
            ))}
          </div>
        )}
      </section>

      <section className="menu-section" aria-labelledby="time-h">
        <h2 id="time-h">3. {tr('Czas na zadanie', 'Time per task')}</h2>
        {mode === 'learn' ? (
          <p className="muted">{tr('W trybie Nauki zadania nie mają limitu czasu.', 'In Learning mode tasks have no time limit.')}</p>
        ) : (
          <TimePicker settings={settings} update={update} />
        )}
      </section>

      <button className="btn start-btn" onClick={onStart} disabled={count === 0}>
        <Play aria-hidden /> START
      </button>
      {count === 0 ? (
        <p className="warn">{tr('Brak minigier dla wybranych ustawień – sprawdź kategorie i typy w panelu nauczyciela.', 'No mini-games match these settings – check the topics and types in the teacher panel.')}</p>
      ) : (
        <p className="muted center-text">{tr('Dostępnych minigier na tym poziomie', 'Mini-games available at this level')}: <b>{count}</b></p>
      )}

      <div className="menu-bottom">
        <button className="btn ghost" onClick={onTeacher}><GraduationCap aria-hidden /> {tr('Panel nauczyciela', 'Teacher panel')}</button>
        <button className="btn ghost" onClick={onAchievements}><Award aria-hidden /> {tr('Odznaki i wyniki', 'Badges & scores')}</button>
        <div className="sound-ctrl">
          <button className="icon-btn" onClick={() => update({ sound: !settings.sound })} aria-label={settings.sound ? tr('Wyłącz dźwięk', 'Mute sound') : tr('Włącz dźwięk', 'Turn sound on')} aria-pressed={settings.sound}>
            {settings.sound ? <Volume2 /> : <VolumeX />}
          </button>
          <input type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={(e) => update({ volume: Number(e.target.value), sound: true })} aria-label={tr('Głośność', 'Volume')} />
        </div>
        <div className="scale-ctrl" aria-label={tr('Rozmiar interfejsu', 'Interface size')}>
          <button className="icon-btn" onClick={() => update({ uiScale: Math.max(0.85, +(settings.uiScale - 0.15).toFixed(2)) })} aria-label={tr('Zmniejsz interfejs', 'Smaller interface')}><Minus /></button>
          <span>A</span>
          <button className="icon-btn" onClick={() => update({ uiScale: Math.min(1.6, +(settings.uiScale + 0.15).toFixed(2)) })} aria-label={tr('Powiększ interfejs', 'Larger interface')}><Plus /></button>
        </div>
      </div>
    </div>
  );
}

/* Wybór czasu: Auto (wg trudności) → 10 … 60 s → Bez limitu */
type TimeOpt = 'auto' | number | 'off';
const TIME_STEPS: TimeOpt[] = ['auto', 10, 20, 30, 40, 50, 60, 'off'];

function currentTime(s: Settings): TimeOpt {
  if (!s.timeLimitEnabled) return 'off';
  return s.timeMode === 'byDifficulty' ? 'auto' : s.fixedTime;
}
function applyTime(v: TimeOpt): Partial<Settings> {
  if (v === 'off') return { timeLimitEnabled: false };
  if (v === 'auto') return { timeLimitEnabled: true, timeMode: 'byDifficulty' };
  return { timeLimitEnabled: true, timeMode: 'fixed', fixedTime: v };
}
function timeLabel(v: TimeOpt) {
  return v === 'auto' ? 'Auto' : v === 'off' ? tr('Bez limitu', 'No limit') : `${v} s`;
}

function TimePicker({ settings, update }: { settings: Settings; update: (p: Partial<Settings>) => void }) {
  const cur = currentTime(settings);
  // czas spoza skali (np. 8 s ustawione w panelu) – „+” idzie do najbliższego wyższego kroku, „−” do niższego
  const onGrid = TIME_STEPS.includes(cur);
  let idx = typeof cur === 'number' ? TIME_STEPS.findIndex((x) => typeof x === 'number' && x >= cur) : TIME_STEPS.indexOf(cur);
  if (idx < 0) idx = TIME_STEPS.length - 1;
  const step = (dir: -1 | 1) => {
    const next = onGrid ? idx + dir : dir === 1 ? idx : idx - 1;
    update(applyTime(TIME_STEPS[Math.max(0, Math.min(TIME_STEPS.length - 1, next))]));
  };
  const desc = cur === 'auto'
    ? tr(`Czas zależny od trudności zadania: ${settings.diffTimes.veryEasy}–${settings.diffTimes.veryHard} s.`, `Time depends on task difficulty: ${settings.diffTimes.veryEasy}–${settings.diffTimes.veryHard} s.`)
    : cur === 'off' ? tr('Zadania trwają do skutku – bez odliczania i premii za szybkość liczonej od limitu.', 'Tasks last until finished – no countdown and no limit-based speed bonus.')
    : tr(`Każde zadanie: ${cur} sekund.`, `Each task: ${cur} seconds.`);
  return (
    <div className="time-picker">
      <div className="time-stepper" role="group" aria-label={tr('Czas na zadanie', 'Time per task')}>
        <button className="icon-btn big" onClick={() => step(-1)} disabled={cur === TIME_STEPS[0]} aria-label={tr('Mniej czasu', 'Less time')}><Minus /></button>
        <output className="time-value" aria-live="polite"><Timer aria-hidden /> {timeLabel(cur)}</output>
        <button className="icon-btn big" onClick={() => step(1)} disabled={cur === 'off'} aria-label={tr('Więcej czasu', 'More time')}><Plus /></button>
      </div>
      <label className="time-select">
        <span className="muted">{tr('lub wybierz z listy:', 'or pick from the list:')}</span>
        <select className="input" value={String(cur)} onChange={(e) => {
          const v = e.target.value;
          update(applyTime(v === 'auto' || v === 'off' ? v : Number(v)));
        }}>
          {typeof cur === 'number' && !TIME_STEPS.includes(cur) && <option value={cur}>{cur} s ({tr('z panelu nauczyciela', 'from teacher panel')})</option>}
          {TIME_STEPS.map((t) => <option key={String(t)} value={String(t)}>{t === 'auto' ? tr('Auto – według trudności', 'Auto – by difficulty') : timeLabel(t)}</option>)}
        </select>
      </label>
      <p className="muted time-desc">{desc}</p>
    </div>
  );
}
