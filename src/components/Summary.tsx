import { RotateCcw, Layers, Home, Star } from 'lucide-react';
import { tr } from '../i18n';
import type { SessionSummary } from '../types';
import type { Achievement } from '../engine/achievements';
import { rankFor } from '../engine/scoring';
import { levelName } from '../data/catalog';
import { gameById } from '../minigames/registry';

export function Summary({ s, fresh, onAgain, onLevel, onMenu }: { s: SessionSummary; fresh: Achievement[]; onAgain: () => void; onLevel: () => void; onMenu: () => void }) {
  const rank = rankFor(s.accuracy);
  const weak = [...new Set(s.log.filter((r) => !r.success).map((r) => gameById(r.gameId).name))].slice(0, 4);
  return (
    <div className="summary">
      <h1>{s.mode === 'boss' ? (s.bossCleared ? tr('AWARIA OPANOWANA!', 'FAILURE CONTAINED!') : tr('KONIEC BOSS RUSH', 'BOSS RUSH OVER')) : tr('MISJA ZAKOŃCZONA!', 'MISSION COMPLETE!')}</h1>
      <p className="muted">{levelName(s.level)}{s.player ? ` · ${s.player}` : ''}</p>
      <div className="big-score" aria-label={tr(`Wynik: ${s.score} punktów`, `Score: ${s.score} points`)}>{s.score}<small>{tr('pkt', 'pts')}</small></div>
      <div className="stars" aria-label={tr(`Ocena: ${rank.stars} na 5 gwiazdek`, `Rating: ${rank.stars} out of 5 stars`)}>
        {Array.from({ length: 5 }, (_, i) => <Star key={i} className={i < rank.stars ? 'on' : ''} fill={i < rank.stars ? 'currentColor' : 'none'} aria-hidden />)}
      </div>
      <p className="rank">{rank.title}</p>
      <div className="stat-grid">
        <div><b>{s.accuracy}%</b><span>{tr('skuteczność', 'accuracy')}</span></div>
        <div><b>{s.correct}</b><span>{tr('poprawne', 'correct')}</span></div>
        <div><b>{s.wrong}</b><span>{tr('błędy', 'mistakes')}</span></div>
        <div><b>{s.rounds}</b><span>{tr('zadania', 'tasks')}</span></div>
        <div><b>×{s.bestCombo}</b><span>{tr('najlepsze COMBO', 'best COMBO')}</span></div>
        <div><b>{s.avgTime.toFixed(1)} s</b><span>{tr('średni czas', 'average time')}</span></div>
      </div>
      {fresh.length > 0 && (
        <div className="new-badges">
          <h2>{tr('Nowe odznaki!', 'New badges!')}</h2>
          {fresh.map((a) => <div key={a.id} className="badge on"><span className="badge-icon" aria-hidden>{a.icon}</span><b>{a.name}</b><small>{a.desc}</small></div>)}
        </div>
      )}
      {weak.length > 0 && <p className="muted">{tr('Do powtórki', 'To review')}: {weak.join(', ')}.</p>}
      <div className="summary-actions">
        <button className="btn primary big" onClick={onAgain}><RotateCcw aria-hidden /> {tr('ZAGRAJ PONOWNIE', 'PLAY AGAIN')}</button>
        <button className="btn big" onClick={onLevel}><Layers aria-hidden /> {tr('ZMIEŃ POZIOM', 'CHANGE LEVEL')}</button>
        <button className="btn ghost big" onClick={onMenu}><Home aria-hidden /> {tr('MENU GŁÓWNE', 'MAIN MENU')}</button>
      </div>
    </div>
  );
}
