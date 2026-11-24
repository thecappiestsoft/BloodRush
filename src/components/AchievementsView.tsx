import { ArrowLeft } from 'lucide-react';
import { tr, locale } from '../i18n';
import { ACHIEVEMENTS, loadProgress, loadResults } from '../engine/achievements';
import { levelName } from '../data/catalog';

const MODE_NAMES: Record<string, [string, string]> = { quick: ['Szybka gra', 'Quick game'], marathon: ['Maraton', 'Marathon'], boss: ['Boss Rush', 'Boss Rush'], learn: ['Nauka', 'Learning'], class: ['Wyzwanie klasowe', 'Class challenge'], test: ['Test minigry', 'Mini-game test'] };
export const modeName = (m: string) => (MODE_NAMES[m] ? tr(...MODE_NAMES[m]) : m);

export function AchievementsView({ onBack }: { onBack: () => void }) {
  const p = loadProgress();
  const results = loadResults().filter((r) => r.mode !== 'test');
  const top = [...results].sort((a, b) => b.score - a.score).slice(0, 10);
  return (
    <div className="page">
      <button className="btn ghost" onClick={onBack}><ArrowLeft aria-hidden /> {tr('Wróć', 'Back')}</button>
      <h1>{tr('Odznaki', 'Badges')}</h1>
      <div className="badges">
        {ACHIEVEMENTS.map((a) => (
          <div key={a.id} className={`badge ${p.unlocked[a.id] ? 'on' : ''}`}>
            <span className="badge-icon" aria-hidden>{p.unlocked[a.id] ? a.icon : '🔒'}</span>
            <b>{a.name}</b>
            <small>{a.desc}</small>
            {a.id === 'rbc-master' && !p.unlocked[a.id] && <small className="progress">{tr('Postęp', 'Progress')}: {Math.min(10, p.rbcCorrect)}/10</small>}
            {p.unlocked[a.id] && <small className="progress">{tr('Zdobyto', 'Earned')}: {new Date(p.unlocked[a.id]).toLocaleDateString(locale())}</small>}
          </div>
        ))}
      </div>
      <h2>{tr('Najlepsze wyniki na tym urządzeniu', 'Best scores on this device')}</h2>
      {top.length === 0 ? <p className="muted">{tr('Brak wyników – zagraj pierwszą rozgrywkę!', 'No scores yet – play your first game!')}</p> : (
        <table className="table">
          <thead><tr><th>#</th><th>{tr('Gracz', 'Player')}</th><th>{tr('Wynik', 'Score')}</th><th>{tr('Skuteczność', 'Accuracy')}</th><th>{tr('Tryb', 'Mode')}</th><th>{tr('Poziom', 'Level')}</th><th>{tr('Data', 'Date')}</th></tr></thead>
          <tbody>{top.map((r, i) => (
            <tr key={i}><td>{i + 1}</td><td>{r.player ?? '—'}</td><td><b>{r.score}</b></td><td>{r.accuracy}%</td><td>{modeName(r.mode)}</td><td>{levelName(r.level)}</td><td>{new Date(r.date).toLocaleDateString(locale())}</td></tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}
