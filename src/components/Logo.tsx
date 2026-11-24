import { Moon, Sun } from 'lucide-react';
import { tr } from '../i18n';
export function Logo({ small }: { small?: boolean }) {
  return (
    <div className={`logo ${small ? 'small' : ''}`} aria-label={tr('Blood Rush: Misja Krwiobieg', 'Blood Rush: Mission Bloodstream')}>
      <svg viewBox="0 0 100 120" className="logo-drop" aria-hidden>
        <path d="M50 4 C50 4 12 52 12 76 a38 38 0 0 0 76 0 C88 52 50 4 50 4Z" fill="#e23b4a" stroke="#fff" strokeWidth="5" />
        <path d="M26 78 h12 l6 -14 l8 26 l6 -12 h16" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <div className="logo-title">BLOOD <span>RUSH</span></div>
        {!small && <div className="logo-sub">{tr('MISJA KRWIOBIEG', 'MISSION BLOODSTREAM')}</div>}
      </div>
    </div>
  );
}
export function Footer() {
  return <footer className="footer">© 2026 CappySoft.pl</footer>;
}

/** Przełącznik języka PL | EN. */
export function LangSwitch({ lang, onChange }: { lang: 'pl' | 'en'; onChange: (l: 'pl' | 'en') => void }) {
  return (
    <div className="lang-switch" role="radiogroup" aria-label="Język / Language">
      {(['pl', 'en'] as const).map((l) => (
        <button key={l} role="radio" aria-checked={lang === l} className={lang === l ? 'active' : ''} onClick={() => onChange(l)}
          lang={l} title={l === 'pl' ? 'Polski' : 'English'}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Przełącznik motywu: jasny | ciemny (dwie ikony). */
export function ThemeSwitch({ theme, onChange }: { theme: 'light' | 'dark'; onChange: (t: 'light' | 'dark') => void }) {
  const opts = [
    { id: 'light' as const, Icon: Sun, label: tr('Jasny motyw', 'Light theme') },
    { id: 'dark' as const, Icon: Moon, label: tr('Ciemny motyw', 'Dark theme') },
  ];
  return (
    <div className="theme-switch" role="radiogroup" aria-label={tr('Motyw', 'Theme')}>
      {opts.map(({ id, Icon, label }) => (
        <button key={id} role="radio" aria-checked={theme === id} className={theme === id ? 'active' : ''} onClick={() => onChange(id)} title={label} aria-label={label}>
          <Icon size={20} aria-hidden />
        </button>
      ))}
    </div>
  );
}
