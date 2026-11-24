import { useMemo, useRef, useState } from 'react';
import { tr } from '../i18n';
import { Download, Upload, Plus, Pencil, Trash2, RotateCcw, Save, X } from 'lucide-react';
import type { BankItem, BankType, Category, Level } from '../types';
import { CATEGORIES, LEVELS, catName, lvShort } from '../data/catalog';
import { PAIR_GROUPS, SORT_SETS } from '../data/questions';
import { downloadFile } from '../engine/storage';
import { resetBank, validateBank } from '../engine/bank';

const TY = (id: BankType, name: [string, string], used: [string, string]) => ({ id, get name() { return tr(...name); }, get used() { return tr(...used); } });
const TYPES = [
  TY('tf', ['Prawda / fałsz', 'True / false'], ['Prawda czy fałsz?', 'True or false?']),
  TY('quiz', ['Szybki wybór', 'Quick choice'], ['Szybki wybór', 'Quick choice']),
  TY('odd', ['Kto nie pasuje', 'Odd one out'], ['Kto tu nie pasuje?', 'Odd one out']),
  TY('pair', ['Pary', 'Pairs'], ['Dopasuj element do funkcji / Analiza morfologii', 'Match part to function / Blood count analysis']),
  TY('sort', ['Sortowanie', 'Sorting'], ['Sortowanie krwi / Tętnica czy żyła? / Posortuj funkcje', 'Blood sorting / Artery or vein? / Sort the functions']),
];

function summary(b: BankItem) {
  switch (b.type) {
    case 'tf': return `${b.statement} → ${b.answer ? tr('PRAWDA', 'TRUE') : tr('FAŁSZ', 'FALSE')}`;
    case 'quiz': return `${b.question} → ${b.correct}`;
    case 'odd': return `${b.others.join(', ')} | ${tr('nie pasuje', 'odd one')}: ${b.odd}`;
    case 'pair': return `[${PAIR_GROUPS[b.group] ?? b.group}] ${b.left} ↔ ${b.right}`;
    case 'sort': return `[${SORT_SETS[b.set]?.name ?? b.set}] ${b.item} → ${b.bin}`;
  }
}
function blank(type: BankType): BankItem {
  const base = { id: `custom-${Date.now().toString(36)}`, levels: ['primary', 'highschool', 'technical'] as Level[], category: 'sklad' as Category, explanation: '' };
  switch (type) {
    case 'tf': return { ...base, type, statement: '', answer: true };
    case 'quiz': return { ...base, type, question: '', correct: '', wrong: ['', '', ''] };
    case 'odd': return { ...base, type, odd: '', others: ['', '', ''] };
    case 'pair': return { ...base, type, group: 'cells', left: '', right: '' };
    case 'sort': return { ...base, type, set: 'plasma', item: '', bin: SORT_SETS.plasma.bins[0] };
  }
}
function validate(b: BankItem): string | null {
  if (!b.levels.length) return tr('Wybierz co najmniej jeden poziom.', 'Choose at least one level.');
  const e = (s: string) => !s.trim();
  switch (b.type) {
    case 'tf': return e(b.statement) ? tr('Wpisz stwierdzenie.', 'Enter a statement.') : null;
    case 'quiz': return e(b.question) || e(b.correct) || b.wrong.filter((w) => w.trim()).length < 1 ? tr('Wpisz pytanie, poprawną i min. 1 błędną odpowiedź.', 'Enter a question, the correct answer and at least 1 wrong answer.') : null;
    case 'odd': return e(b.odd) || b.others.filter((w) => w.trim()).length < 3 ? tr('Podaj element niepasujący i 3 pasujące.', 'Enter the odd item and 3 matching items.') : null;
    case 'pair': return e(b.left) || e(b.right) || e(b.group) ? tr('Uzupełnij obie strony pary i grupę.', 'Fill in both sides of the pair and the group.') : null;
    case 'sort': return e(b.item) || e(b.bin) ? tr('Uzupełnij element i kategorię.', 'Fill in the item and the category.') : null;
  }
}

export function QuestionBankEditor({ bank, setBank }: { bank: BankItem[]; setBank: (b: BankItem[]) => void }) {
  const [type, setType] = useState<BankType | 'all'>('all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<BankItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const list = useMemo(() => bank.filter((b) =>
    (type === 'all' || b.type === type) && (level === 'all' || b.levels.includes(level)) && (cat === 'all' || b.category === cat) &&
    (!q || summary(b).toLowerCase().includes(q.toLowerCase()))), [bank, type, level, cat, q]);

  const saveEdit = () => {
    if (!edit) return;
    const clean: BankItem = edit.type === 'quiz' ? { ...edit, wrong: edit.wrong.filter((w) => w.trim()) } : edit.type === 'odd' ? { ...edit, others: edit.others.filter((w) => w.trim()) } : edit;
    const err = validate(clean);
    if (err) { setMsg(err); return; }
    setBank(isNew ? [clean, ...bank] : bank.map((b) => (b.id === clean.id ? clean : b)));
    setMsg(isNew ? tr('Dodano zadanie.', 'Task added.') : tr('Zapisano zmiany.', 'Changes saved.'));
    setEdit(null);
  };
  const del = (b: BankItem) => {
    if (confirm(`${tr('Usunąć zadanie?', 'Delete this task?')}\n\n${summary(b)}`)) { setBank(bank.filter((x) => x.id !== b.id)); setMsg(tr('Usunięto zadanie.', 'Task deleted.')); }
  };
  const doImport = async (f: File) => {
    try {
      const { items, rejected } = validateBank(JSON.parse(await f.text()));
      if (!items.length) throw new Error(tr('Brak poprawnych zadań w pliku.', 'No valid tasks in the file.'));
      const replace = confirm(tr(`Znaleziono ${items.length} poprawnych zadań${rejected ? ` (odrzucono ${rejected})` : ''}.\n\nOK – ZASTĄP całą bazę\nAnuluj – DOŁĄCZ do obecnej bazy`, `Found ${items.length} valid tasks${rejected ? ` (${rejected} rejected)` : ''}.\n\nOK – REPLACE the whole bank\nCancel – ADD to the current bank`));
      if (replace) setBank(items);
      else { const ids = new Set(bank.map((b) => b.id)); setBank([...bank, ...items.map((it) => (ids.has(it.id) ? { ...it, id: `${it.id}-imp${Date.now().toString(36)}` } : it))]); }
      setMsg(tr(`Zaimportowano ${items.length} zadań.`, `Imported ${items.length} tasks.`));
    } catch (e) {
      setMsg(`${tr('Błąd importu', 'Import error')}: ${(e as Error).message}`);
    }
  };

  return (
    <div className="bank-editor">
      <p className="muted">{tr('Baza zawiera', 'The bank contains')} <b>{bank.length}</b> {tr('zadań', 'tasks')} ({tr('wersja polska', 'English version')}). {tr('Zadania z bazy zasilają minigry', 'Bank tasks feed these mini-games')}: {TYPES.map((t) => <span key={t.id}><b>{t.name}</b> → {t.used}; </span>)}</p>
      <div className="row wrap">
        <button className="btn primary" onClick={() => { setEdit(blank(type === 'all' ? 'tf' : type)); setIsNew(true); setMsg(''); }}><Plus aria-hidden /> {tr('Dodaj zadanie', 'Add task')}</button>
        <button className="btn" onClick={() => downloadFile(`${tr('blood-rush-baza-zadan', 'blood-rush-task-bank-en')}-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ app: 'blood-rush', version: 1, items: bank }, null, 2))}><Download aria-hidden /> {tr('Eksport JSON', 'Export JSON')}</button>
        <button className="btn" onClick={() => fileRef.current?.click()}><Upload aria-hidden /> {tr('Import JSON', 'Import JSON')}</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = ''; }} />
        <button className="btn ghost" onClick={() => { if (confirm(tr('Przywrócić domyślną bazę zadań? Własne zmiany zostaną utracone.', 'Restore the default task bank? Your own changes will be lost.'))) { setBank(resetBank()); setMsg(tr('Przywrócono bazę domyślną.', 'Default bank restored.')); } }}><RotateCcw aria-hidden /> {tr('Przywróć domyślne', 'Restore defaults')}</button>
      </div>
      {msg && <p className="notice" role="status">{msg}</p>}

      {edit && (
        <div className="edit-card" role="dialog" aria-label={tr('Edycja zadania', 'Edit task')}>
          <div className="row between"><h3>{isNew ? tr('Nowe zadanie', 'New task') : tr('Edycja zadania', 'Edit task')}</h3><button className="icon-btn" onClick={() => setEdit(null)} aria-label={tr('Zamknij', 'Close')}><X /></button></div>
          {isNew && (
            <label className="field-row">{tr('Typ zadania', 'Task type')}
              <select className="input" value={edit.type} onChange={(e) => setEdit({ ...blank(e.target.value as BankType), id: edit.id })}>
                {TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
          )}
          <EditFields b={edit} set={setEdit} />
          <fieldset className="field-row">
            <legend>{tr('Poziomy', 'Levels')}</legend>
            {LEVELS.map((l) => (
              <label key={l.id} className="check"><input type="checkbox" checked={edit.levels.includes(l.id)} onChange={(e) => setEdit({ ...edit, levels: e.target.checked ? [...edit.levels, l.id] : edit.levels.filter((x) => x !== l.id) })} /> {l.name}</label>
            ))}
          </fieldset>
          <label className="field-row">{tr('Kategoria', 'Topic')}
            <select className="input" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value as Category })}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="field-col">{tr('Wyjaśnienie biologiczne (informacja zwrotna)', 'Biology explanation (feedback)')}
            <textarea className="input" rows={2} value={edit.explanation} onChange={(e) => setEdit({ ...edit, explanation: e.target.value })} />
          </label>
          <div className="row"><button className="btn primary" onClick={saveEdit}><Save aria-hidden /> {tr('Zapisz', 'Save')}</button><button className="btn ghost" onClick={() => setEdit(null)}>{tr('Anuluj', 'Cancel')}</button></div>
        </div>
      )}

      <div className="row wrap filters">
        <select className="input" value={type} onChange={(e) => setType(e.target.value as BankType | 'all')} aria-label={tr('Filtr typu', 'Type filter')}><option value="all">{tr('Wszystkie typy', 'All types')}</option>{TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <select className="input" value={level} onChange={(e) => setLevel(e.target.value as Level | 'all')} aria-label={tr('Filtr poziomu', 'Level filter')}><option value="all">{tr('Wszystkie poziomy', 'All levels')}</option>{LEVELS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
        <select className="input" value={cat} onChange={(e) => setCat(e.target.value as Category | 'all')} aria-label={tr('Filtr kategorii', 'Topic filter')}><option value="all">{tr('Wszystkie kategorie', 'All topics')}</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input className="input" placeholder={tr('Szukaj…', 'Search…')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={tr('Szukaj w bazie', 'Search the bank')} />
      </div>
      <p className="muted">{tr('Wyświetlono', 'Shown')}: {list.length}</p>
      <ul className="bank-list">
        {list.map((b) => (
          <li key={b.id}>
            <span className="type-pill">{TYPES.find((t) => t.id === b.type)?.name}</span>
            <span className="bank-text">{summary(b)}</span>
            <span className="bank-meta">{b.levels.map(lvShort).join(' ')} · {catName(b.category)}</span>
            <button className="icon-btn" onClick={() => { setEdit(structuredClone(b)); setIsNew(false); setMsg(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label={tr('Edytuj', 'Edit')}><Pencil size={18} /></button>
            <button className="icon-btn danger" onClick={() => del(b)} aria-label={tr('Usuń', 'Delete')}><Trash2 size={18} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditFields({ b, set }: { b: BankItem; set: (b: BankItem) => void }) {
  switch (b.type) {
    case 'tf':
      return (<>
        <label className="field-col">{tr('Stwierdzenie', 'Statement')}<textarea className="input" rows={2} value={b.statement} onChange={(e) => set({ ...b, statement: e.target.value })} /></label>
        <div className="field-row">{tr('Poprawna odpowiedź:', 'Correct answer:')}
          <label className="check"><input type="radio" checked={b.answer} onChange={() => set({ ...b, answer: true })} /> {tr('PRAWDA', 'TRUE')}</label>
          <label className="check"><input type="radio" checked={!b.answer} onChange={() => set({ ...b, answer: false })} /> {tr('FAŁSZ', 'FALSE')}</label>
        </div>
      </>);
    case 'quiz':
      return (<>
        <label className="field-col">{tr('Pytanie', 'Question')}<input className="input" value={b.question} onChange={(e) => set({ ...b, question: e.target.value })} /></label>
        <label className="field-col">{tr('Poprawna odpowiedź', 'Correct answer')}<input className="input" value={b.correct} onChange={(e) => set({ ...b, correct: e.target.value })} /></label>
        {[0, 1, 2].map((i) => <label key={i} className="field-col">{tr('Błędna odpowiedź', 'Wrong answer')} {i + 1}<input className="input" value={b.wrong[i] ?? ''} onChange={(e) => { const w = [...b.wrong]; w[i] = e.target.value; set({ ...b, wrong: w }); }} /></label>)}
      </>);
    case 'odd':
      return (<>
        <label className="field-col">{tr('Element, który NIE pasuje', 'The item that does NOT belong')}<input className="input" value={b.odd} onChange={(e) => set({ ...b, odd: e.target.value })} /></label>
        {[0, 1, 2].map((i) => <label key={i} className="field-col">{tr('Pasujący element', 'Matching item')} {i + 1}<input className="input" value={b.others[i] ?? ''} onChange={(e) => { const w = [...b.others]; w[i] = e.target.value; set({ ...b, others: w }); }} /></label>)}
      </>);
    case 'pair':
      return (<>
        <label className="field-row">{tr('Grupa par', 'Pair group')}
          <select className="input" value={b.group} onChange={(e) => set({ ...b, group: e.target.value })}>
            {Object.entries(PAIR_GROUPS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="field-col">{tr('Lewa strona (element)', 'Left side (item)')}<input className="input" value={b.left} onChange={(e) => set({ ...b, left: e.target.value })} /></label>
        <label className="field-col">{tr('Prawa strona (funkcja / znaczenie)', 'Right side (function / meaning)')}<input className="input" value={b.right} onChange={(e) => set({ ...b, right: e.target.value })} /></label>
      </>);
    case 'sort':
      return (<>
        <label className="field-row">{tr('Zestaw (minigra)', 'Set (mini-game)')}
          <select className="input" value={b.set} onChange={(e) => set({ ...b, set: e.target.value, bin: SORT_SETS[e.target.value].bins[0] })}>
            {Object.entries(SORT_SETS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </label>
        <label className="field-col">{tr('Element do posortowania', 'Item to sort')}<input className="input" value={b.item} onChange={(e) => set({ ...b, item: e.target.value })} /></label>
        <label className="field-row">{tr('Właściwa kategoria', 'Correct category')}
          <select className="input" value={b.bin} onChange={(e) => set({ ...b, bin: e.target.value })}>
            {(SORT_SETS[b.set]?.bins ?? [b.bin]).map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
      </>);
  }
}
