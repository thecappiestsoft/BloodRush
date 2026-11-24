import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Struktura projektu:
 *   src/              – kod źródłowy (tu edytujesz), wejście: src/index.html
 *   index.html        – GOTOWA GRA w jednym pliku, tworzona przez `npm run build`
 *                       (gotowa do GitHub Pages i do otwarcia dwuklikiem z dysku)
 *
 * Ścieżki `root` i `outDir` są liczone względem folderu projektu (tam uruchamiasz npm).
 */

/** Dopisuje do zbudowanego index.html ostrzeżenie, że plik jest generowany. */
function generatedBanner(): Plugin {
  return {
    name: 'generated-banner',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler: (html) =>
        html.replace(
          /<!doctype html>/i,
          '<!doctype html>\n<!-- PLIK WYGENEROWANY poleceniem "npm run build" z src/index.html i kodu w src/. Nie edytuj go ręcznie – zmiany wprowadzaj w src/, a potem zbuduj ponownie. -->',
        ),
    },
  };
}

export default defineConfig({
  root: 'src',
  base: './',
  publicDir: false,
  plugins: [react(), viteSingleFile(), generatedBanner()],
  build: {
    outDir: '..', // = folder główny projektu
    emptyOutDir: false, // NIE czyść folderu głównego – zapisz tylko index.html
  },
});
