# BLOOD RUSH: Misja Krwiobieg

Dynamiczna gra edukacyjna w stylu „mikrogier” (seria bardzo krótkich zadań na czas) o **krwi, krwinkach, grupach krwi, sercu i układzie krwionośnym człowieka**. Przeznaczona do pracy na lekcji biologii – w szkole podstawowej (kl. 7–8), liceum i technikum.

Działa w przeglądarce, **bez logowania, bez serwera i bez internetu** (po zbudowaniu). Ustawienia, baza zadań, wyniki i odznaki zapisują się lokalnie na urządzeniu.

© 2026 CappySoft.pl

---

## Szybki start

**Chcesz tylko zagrać?** Otwórz plik `index.html` z folderu głównego (dwuklik). To kompletna gra w jednym pliku – działa offline, także z pendrive’a i na tablicy interaktywnej.

## Publikacja na GitHub Pages

Plik `index.html` w folderze głównym jest gotowy do publikacji – nie trzeba niczego budować.

1. Utwórz repozytorium na GitHubie i wgraj do niego **całą zawartość tego folderu** (tak, by `index.html` leżał w głównym katalogu repozytorium).
2. W repozytorium: **Settings → Pages → Build and deployment → Source: „Deploy from a branch”**, gałąź **`main`**, folder **`/ (root)`** → **Save**.
3. Po 1–2 minutach gra będzie dostępna pod adresem `https://<użytkownik>.github.io/<repozytorium>/`.

Plik `.nojekyll` wyłącza przetwarzanie Jekyll na GitHub Pages (strona jest serwowana dokładnie tak, jak jest). Gra działa także na każdym innym hostingu statycznym (Netlify, serwer szkoły) – wystarczy wgrać `index.html`.

## Praca nad kodem (dla deweloperów)

Wymagany Node.js 18+.

```bash
npm install
```

```bash
npm run dev
```

Otwórz adres podany w terminalu (domyślnie http://localhost:5173) – zmiany w `src/` widać od razu.

Po zakończeniu zmian zbuduj nową wersję gry:

```bash
npm run build
```

Polecenie sprawdza typy (TypeScript) i **nadpisuje `index.html` w folderze głównym** nową, kompletną wersją gry (cały kod, style i grafiki w jednym pliku). Ten plik commitujesz razem ze zmianami w `src/` – GitHub Pages od razu pokaże nową wersję.

> Nie edytuj ręcznie `index.html` z folderu głównego – jest generowany. Szablon strony to `src/index.html`.

Podgląd zbudowanej wersji: `npm run preview`.

### Testy logiki

```bash
npm test
```

Sprawdza m.in. punktację i COMBO, zasady zgodności grup krwi, losowanie bez powtórzeń z rzędu, limity powtórzeń, filtry kategorii/typów, tryb Boss Rush i import/eksport bazy zadań.

---

## Język: PL / EN

Gra ma pełną wersję **polską i angielską**. Przełącznik **PL | EN** jest w prawym górnym rogu menu głównego oraz w nagłówku panelu nauczyciela. Przetłumaczone są: interfejs, wszystkie minigry (polecenia, informacje zwrotne, wyjaśnienia w trybie Nauki), schematy, odznaki i rangi oraz domyślna baza zadań (151 zadań, te same identyfikatory w obu językach).

- Wybór języka jest zapamiętywany. Przy pierwszym uruchomieniu gra wybiera język przeglądarki (polski → PL, każdy inny → EN).
- **Każdy język ma własną bazę zadań** – zmiany nauczyciela w bazie polskiej nie wpływają na angielską i odwrotnie. Eksport/import JSON dotyczy bazy w aktualnie wybranym języku.
- Ustawienia gry (czas, punktacja, kategorie) i wyniki są wspólne dla obu języków.
- W wersji angielskiej grupa krwi „0” jest wyświetlana jako „O”.

Teksty polskie i angielskie są w kodzie obok siebie (`tr('tekst PL', 'text EN')` z `src/i18n.ts`); angielska baza zadań – `src/data/questions.en.ts`, angielskie opisy minigier – `src/minigames/registry.en.ts`.

## Motyw: jasny / ciemny

Przełącznik z dwiema ikonami (☀ słońce – jasny, ☾ księżyc – ciemny) jest w prawym górnym rogu menu głównego, obok przełącznika języka, oraz w nagłówku panelu nauczyciela. Wybór jest zapamiętywany; przy pierwszym uruchomieniu gra przyjmuje ustawienie systemu. Motyw zmienia interfejs (menu, pasek gry, podsumowanie, odznaki, panel nauczyciela). Plansza „laboratorium”, na której toczą się minigry, jest jasna w obu motywach – rysunki komórek i schematy są projektowane na jasne tło. Kolory są zdefiniowane jako zmienne CSS w `src/styles/base.css` (blok `:root` – ciemny, `:root[data-app-theme='light']` – jasny).

## Czas na zadanie

W menu głównym (krok 3) gracz lub nauczyciel ustawia czas przyciskami **− / +** albo z listy: **Auto** (według trudności: 5/7/10/12/15 s), **10, 20, 30, 40, 50, 60 s** lub **Bez limitu**. Wybór jest zapamiętywany i obowiązuje we wszystkich trybach z wyjątkiem Nauki, w której nie ma limitu czasu. Te same ustawienia są też w panelu nauczyciela (zakładka Rozgrywka), gdzie można wpisać dowolną wartość.

## Tryby gry

| Tryb | Opis |
|---|---|
| **Szybka gra** | 10 losowych minigier (liczba konfigurowalna). |
| **Maraton** | 20, 30 lub 50 minigier – walka o rekord. |
| **Boss Rush** | Coraz trudniejsze zadania, na końcu finał **„Wielki Krwiobieg”** (4 etapy łączące różne mechaniki). |
| **Nauka** | Bez limitu czasu; po każdym zadaniu dłuższe wyjaśnienie i przycisk „Dalej”. |
| **Wyzwanie klasowe** | Gracze kolejno przy jednym stanowisku, **te same zadania dla wszystkich**, ranking na końcu. |

## Minigry (33 + finał)

| Typ | Minigry |
|---|---|
| Zręcznościowe | Złap erytrocyty · Uciekające bakterie · Zatkaj ranę · Nie pozwól na zator · Transport tlenu · Załaduj hemoglobinę · Ciśnieniomierz · Wystukaj tętno |
| Logiczne | Uporządkuj drogę krwi · Dopasuj element do funkcji · Kto tu nie pasuje? · Uzupełnij schemat serca · Prawda czy fałsz? · Ustaw zastawki · Szybki wybór |
| Pamięciowe | Zapamiętaj skład krwi · Zapamiętaj grupy krwi · Znikające podpisy |
| Obserwacyjne | Znajdź błąd · Znajdź właściwą krwinkę · Co się zmieniło? |
| Klasyfikacyjne | Sortowanie krwi · Tętnica czy żyła? · Posortuj funkcje · Wymiana gazowa |
| Matematyczno-analityczne | Oblicz skład krwi · Analiza morfologii · Policz uderzenia serca · Dopasuj grupę krwi |
| Przestrzenne | Zbuduj układ krwionośny · Połącz naczynia · Napraw serce · Ułóż elementy krwi |
| Finał Boss Rush | Wielki Krwiobieg |

Poziomy różnią się nie tylko liczbą elementów, ale też **mechaniką i zakresem wiedzy**, np.:

- *Zatkaj ranę*: SP – czop płytkowy; LO – czop + włóknik; T – pełna sekwencja hemostazy (skurcz naczynia → czop → włóknik).
- *Dopasuj grupę krwi*: SP – rozpoznanie grupy po antygenach na erytrocycie; LO – dobór dawcy koncentratu krwinek czerwonych (AB0 + Rh); T – dodatkowo dobór **wszystkich** zgodnych dawców osocza.
- *Ciśnieniomierz*: SP – strefa ciśnienia skurczowego; LO – odczyt skurczowego/rozkurczowego z zapisu; T – obliczenie średniego ciśnienia tętniczego (MAP).
- *Wystukaj tętno*: SP – z demonstracją rytmu; T – najpierw oblicz tętno z pomiaru 15-sekundowego.
- *Transport tlenu*: SP – dostarcz O₂; LO/T – dodatkowo zabierz CO₂ z tkanek do płuc.

Każda runda losuje minigrę (unikając powtórzeń), treść, kolejność odpowiedzi, położenie elementów i wariant trudności.

## Punktacja

- poprawne wykonanie: **100 pkt**
- bez błędu w pierwszej połowie czasu: **+25 pkt**
- COMBO: 3 z rzędu **+50**, 5 z rzędu **+100**, 10 (i każde kolejne 10) **+250**
- pomyłka w trakcie zadania (np. złe kliknięcie): **−10 pkt** (konfigurowalne)
- błędne zadanie: 0 pkt (lub kara z ustawień), czas minął: 0 pkt

Podsumowanie pokazuje wynik, skuteczność, liczbę poprawnych zadań i błędów, najlepsze COMBO, średni czas, rangę (1–5 gwiazdek) oraz minigry do powtórki.

## Panel nauczyciela

Bez zmian w kodzie nauczyciel może:

- ustawić poziom, liczbę minigier w każdym trybie, limit powtórzeń tej samej minigry,
- włączyć/wyłączyć limit czasu, wybrać **jeden czas dla wszystkich** albo **czas zależny od trudności** (domyślnie 5/7/10/12/15 s),
- ustawić punkty, COMBO, kary,
- wybrać **kategorie tematyczne** (14) i **typy minigier**, wyłączyć pojedyncze minigry, **wypróbować dowolną minigrę** na wybranym poziomie,
- ustawić dźwięk, głośność, animacje, pauzę, rozmiar interfejsu,
- **edytować bazę zadań**: dodawać, zmieniać, usuwać zadania (prawda/fałsz, szybki wybór, kto nie pasuje, pary, sortowanie), przypisywać je do kategorii i poziomów, **eksportować i importować JSON**,
- przeglądać wyniki i eksportować je do CSV.

## Dostępność

- każde przeciąganie ma alternatywę: **kliknij element, potem cel** (działa też z klawiatury: Enter/Spacja),
- klawisze 1–4 w pytaniach wyboru, strzałki w „Prawda czy fałsz?” i „Wymiana gazowa”, strzałki/WSAD w „Transporcie tlenu”, spacja w „Ciśnieniomierzu”, Esc – pauza,
- informacja nigdy nie jest przekazywana wyłącznie kolorem (kształty jąder komórek, symbole antygenów ▲ A / ■ B / ● D, podpisy),
- możliwość wyłączenia animacji (respektowane jest też systemowe „ogranicz ruch”), brak migających elementów,
- powiększanie interfejsu (85–160%), duże przyciski, wysoki kontrast.

## Poprawność merytoryczna – założenia

- Tętnice/żyły definiowane kierunkiem przepływu (pień płucny – tętnica z krwią odtlenowaną; żyły płucne – żyły z krwią utlenowaną).
- Zgodność transfuzji zawsze odniesiona do **konkretnego składnika** (koncentrat krwinek czerwonych vs osocze); gra nie uczy uproszczonej zasady „uniwersalnego dawcy/biorcy” i przypomina o badaniach zgodności.
- Krzepnięcie przedstawione jako część hemostazy.
- Wartości liczbowe (hematokryt, ciśnienie, tętno) są **przykładowe/szkoleniowe** i nie są prezentowane jako normy diagnostyczne; minigra „Analiza morfologii” dotyczy wyłącznie znaczenia parametrów, bez wartości i bez diagnozowania.
- Schemat serca w widoku od przodu (prawa strona serca po lewej stronie rysunku – zaznaczone podpisem).

## Struktura projektu

```
index.html              GOTOWA GRA (generowana przez `npm run build`) – publikowana na GitHub Pages
.nojekyll               wyłącza Jekyll na GitHub Pages
package.json            zależności i polecenia (dev, build, preview, test)
vite.config.ts          konfiguracja budowania (źródła w src/, wynik → index.html)
tests/logic.test.ts     testy logiki (npm test)
src/
  index.html            szablon strony (punkt wejścia Vite)
  main.tsx              start aplikacji
  App.tsx               nawigacja między ekranami, język, motyw
  types.ts              typy wspólne (minigra, baza zadań, runda, podsumowanie)
  i18n.ts               dwujęzyczność: tr('tekst PL', 'text EN')
  engine/               silnik gry
    GameRunner.tsx        przebieg rundy: zapowiedź, licznik czasu, pauza, informacja zwrotna
    sequence.ts           losowanie minigier i czasów
    scoring.ts            punktacja, COMBO, rangi
    settings.ts           ustawienia (zapisywane lokalnie)
    bank.ts               baza zadań nauczyciela (wczytywanie, zapis, import/eksport)
    achievements.ts       odznaki i wyniki
    bloodGroups.ts        zasady zgodności grup krwi
    sound.ts, storage.ts  dźwięki (Web Audio) i zapis w przeglądarce
  minigames/            minigry – każda to osobny komponent
    registry.ts           LISTA minigier: kategorie, poziomy, trudność, polecenia, wyjaśnienia (PL)
    registry.en.ts        to samo po angielsku
    reflex/               zręcznościowe (np. Złap erytrocyty, Zatkaj ranę, Ciśnieniomierz)
    logic/                logiczne (np. Droga krwi, Prawda czy fałsz, Zastawki)
    memory/               pamięciowe
    observation/          obserwacyjne
    classification/       klasyfikacyjne (sortowanie, wymiana gazowa)
    math/                 matematyczno-analityczne (obliczenia, morfologia, dawca krwi)
    spatial/              przestrzenne (schematy, połącz naczynia, napraw serce)
    boss/                 finał Boss Rush „Wielki Krwiobieg”
    common/               wspólne klocki: grafiki komórek i schematy (SVG), przeciąganie,
                          sortownik, łączenie par, plansza ruchu, pomocnicze funkcje bazy zadań
  data/                 treści
    questions.ts          domyślna baza zadań (PL) + zestawy sortowania i grupy par
    questions.en.ts       domyślna baza zadań (EN)
    content.ts            schematy serca i krążenia, droga krwi, opisy krwinek, kryteria
    catalog.ts            poziomy, kategorie, typy minigier, trudności
  components/           ekrany: menu, podsumowanie, odznaki, wyzwanie klasowe, logo i przełączniki
  teacher/              panel nauczyciela i edytor bazy zadań
  styles/               wygląd (app.css importuje pozostałe pliki w ustalonej kolejności)
    base.css              kolory obu motywów (zmienne CSS), czcionki, podstawy
    controls.css          przyciski, pola, logo
    menu.css              menu główne
    game.css              pasek gry, scena, informacja zwrotna, pauza
    minigames.css         wygląd minigier
    pages.css             podsumowanie, odznaki, rankingi
    teacher.css           panel nauczyciela
    responsive.css        telefony/tablety, ograniczenie ruchu
    header-controls.css   wybór czasu, przełączniki motywu i języka
  utils/                losowanie z ziarnem, pomocnik poziomów
```

### Gdzie co zmienić

| Chcę zmienić… | Plik |
|---|---|
| treść pytań i zadań (domyślnych) | `src/data/questions.ts` (PL), `src/data/questions.en.ts` (EN) – nauczyciel może też edytować bazę w panelu, bez kodu |
| nazwę, polecenie lub wyjaśnienie minigry | `src/minigames/registry.ts` (PL), `src/minigames/registry.en.ts` (EN) |
| trudność / czas minigry | pole `difficulty` w `src/minigames/registry.ts`; czasy poziomów trudności – `src/engine/settings.ts` |
| prędkość lub liczbę elementów w minigrze | plik minigry w `src/minigames/<typ>/` (wartości `lv(poziom, SP, LO, T)`) |
| rysunek serca lub schemat krążenia | `src/minigames/common/Diagrams.tsx` + współrzędne pól w `src/data/content.ts` |
| wygląd krwinek | `src/minigames/common/Cell.tsx` |
| kolory motywów | `src/styles/base.css` |
| punktację domyślną | `src/engine/settings.ts` |
| teksty interfejsu | w miejscu użycia: `tr('tekst PL', 'text EN')` |

### Jak dodać nową minigrę

1. Utwórz komponent w odpowiednim folderze typu, np. `src/minigames/reflex/MojaGra.tsx`, przyjmujący `MiniGameProps`. Po zakończeniu wywołaj `p.onDone({ success, info })`, przy pomyłce `p.onMistake()`. Losuj treść przez `p.rng` i zapisz ją raz w `useState(() => …)` (wtedy wyzwanie klasowe da wszystkim te same zadania, a elementy nie przetasują się przy odświeżeniu ekranu).
2. Dopisz wpis do tablicy `MINIGAMES` w `src/minigames/registry.ts` (kategorie, poziomy, trudność, polecenie, informacja edukacyjna) oraz tłumaczenie w `src/minigames/registry.en.ts`.
3. Uruchom `npm test` i `npm run build`.

Silnik sam zajmie się czasem, punktacją, losowaniem i panelem nauczyciela.

### Format bazy zadań (JSON)

```json
{
  "app": "blood-rush",
  "version": 1,
  "items": [
    { "id": "moje-1", "type": "tf", "levels": ["primary"], "category": "erytrocyty",
      "statement": "Erytrocyty transportują tlen.", "answer": true,
      "explanation": "Tlen wiąże hemoglobina." },
    { "id": "moje-2", "type": "quiz", "levels": ["highschool"], "category": "grupy",
      "question": "Jakie przeciwciała ma grupa B?", "correct": "Anty-A",
      "wrong": ["Anty-B", "Brak"], "explanation": "Grupa B ma antygen B i przeciwciała anty-A." }
  ]
}
```

Typy: `tf`, `quiz`, `odd` (`odd`, `others[]`), `pair` (`group`, `left`, `right`), `sort` (`set`: `plasma` | `vessels` | `cellfunc`, `item`, `bin`).
Poziomy: `primary`, `highschool`, `technical`. Kategorie: `sklad`, `erytrocyty`, `leukocyty`, `trombocyty`, `osocze`, `grupy`, `rh`, `krzepniecie`, `serce`, `naczynia`, `krazenie-male`, `krazenie-duze`, `gazy`, `cisnienie`.

## Technologie

React 19, TypeScript, Vite, czyste CSS (animacje CSS), ikony Lucide. Grafiki komórek i schematy – własne SVG. Dźwięki syntezowane w przeglądarce (Web Audio API) – brak plików zewnętrznych.
