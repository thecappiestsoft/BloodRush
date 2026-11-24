import { useCallback, useEffect, useMemo, useState } from 'react';
import { tr, setLang } from './i18n';
import type { BankItem, Level, Mode, Round, SessionSummary } from './types';
import { loadSettings, saveSettings, type Settings } from './engine/settings';
import { loadBank, saveBank } from './engine/bank';
import { configureSound } from './engine/sound';
import { buildRounds, eligibleGames } from './engine/sequence';
import { evaluateSession, saveResult, type Achievement } from './engine/achievements';
import { GameRunner } from './engine/GameRunner';
import { MainMenu } from './components/MainMenu';
import { Summary } from './components/Summary';
import { AchievementsView } from './components/AchievementsView';
import { ClassChallenge } from './components/ClassChallenge';
import { Footer, Logo } from './components/Logo';
import { TeacherPanel } from './teacher/TeacherPanel';

type Screen = 'menu' | 'game' | 'summary' | 'teacher' | 'achievements' | 'class';

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => {
    const s = loadSettings();
    setLang(s.lang); // język musi być ustawiony przed wczytaniem bazy zadań
    document.documentElement.setAttribute('data-app-theme', s.theme); // motyw przed pierwszym rysowaniem
    return s;
  });
  const [bank, setBankState] = useState<BankItem[]>(loadBank);
  const [screen, setScreen] = useState<Screen>('menu');
  const [mode, setMode] = useState<Mode>('quick');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [runKey, setRunKey] = useState(0);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [fresh, setFresh] = useState<Achievement[]>([]);
  const [test, setTest] = useState<{ level: Level } | null>(null);
  const [sysReduce, setSysReduce] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const h = () => setSysReduce(mq.matches);
    mq.addEventListener?.('change', h);
    return () => mq.removeEventListener?.('change', h);
  }, []);
  const reduceMotion = !settings.animations || sysReduce;

  const update = useCallback((p: Partial<Settings>) => {
    if (p.lang) {
      setLang(p.lang);
      setBankState(loadBank()); // każdy język ma własną bazę zadań
    }
    setSettings((s) => {
      const n = { ...s, ...p };
      saveSettings(n);
      return n;
    });
  }, []);
  const setBank = useCallback((b: BankItem[]) => {
    setBankState(b);
    saveBank(b);
  }, []);

  useEffect(() => configureSound(settings.sound, settings.volume), [settings.sound, settings.volume]);
  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * settings.uiScale}px`;
    document.documentElement.setAttribute('data-app-theme', settings.theme);
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [settings.uiScale, reduceMotion, settings.theme]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  const roundCount = (m: Mode) => (m === 'marathon' ? settings.marathonRounds : m === 'boss' ? settings.bossRounds : settings.quickRounds);
  const start = useCallback((m: Mode = mode) => {
    if (m === 'class') { setScreen('class'); return; }
    setTest(null);
    setRounds(buildRounds(settings, m, settings.level, roundCount(m), bank));
    setRunKey((k) => k + 1);
    setScreen('game');
  }, [mode, settings, bank]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTest = (gameId: string, level: Level) => {
    setTest({ level });
    setMode('test');
    setRounds(buildRounds(settings, 'test', level, 1, bank, undefined, gameId));
    setRunKey((k) => k + 1);
    setScreen('game');
  };

  const finish = (s: SessionSummary) => {
    if (test) { setTest(null); setMode('quick'); setScreen('teacher'); return; }
    saveResult(s);
    setFresh(evaluateSession(s));
    setSummary(s);
    setScreen('summary');
  };

  const eligibleCount = useMemo(() => (l: Level) => eligibleGames(settings, l, bank).length, [settings, bank]);

  return (
    <div className={`app screen-${screen}`}>
      <div className="app-body" key={settings.lang}>
        {screen === 'menu' && (
          <MainMenu settings={settings} update={update} mode={mode === 'test' ? 'quick' : mode} setMode={setMode} onStart={() => start()}
            onTeacher={() => setScreen('teacher')} onAchievements={() => setScreen('achievements')} eligibleCount={eligibleCount} />
        )}
        {screen === 'game' && rounds.length > 0 && (
          <GameRunner key={runKey} settings={settings} bank={bank} mode={mode} level={test?.level ?? settings.level} rounds={rounds} reduceMotion={reduceMotion}
            skipIntro={!!test || mode === 'learn'}
            onFinish={finish} onQuit={() => setScreen(test ? 'teacher' : 'menu')} onRestart={() => (test ? setRunKey((k) => k + 1) : start(mode))} />
        )}
        {screen === 'game' && rounds.length === 0 && (
          <div className="page center"><Logo small /><p className="warn">{tr('Brak minigier spełniających ustawienia. Zmień kategorie lub typy w panelu nauczyciela.', 'No mini-games match these settings. Change the topics or types in the teacher panel.')}</p><button className="btn" onClick={() => setScreen('menu')}>{tr('Menu główne', 'Main menu')}</button></div>
        )}
        {screen === 'summary' && summary && (
          <Summary s={summary} fresh={fresh} onAgain={() => start(summary.mode)} onLevel={() => setScreen('menu')} onMenu={() => setScreen('menu')} />
        )}
        {screen === 'teacher' && <TeacherPanel settings={settings} update={update} bank={bank} setBank={setBank} onBack={() => setScreen('menu')} onTest={startTest} />}
        {screen === 'achievements' && <AchievementsView onBack={() => setScreen('menu')} />}
        {screen === 'class' && <ClassChallenge settings={settings} bank={bank} level={settings.level} reduceMotion={reduceMotion} onExit={() => setScreen('menu')} />}
      </div>
      <Footer />
    </div>
  );
}
