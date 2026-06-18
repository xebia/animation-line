import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Static build of the demo (grid + cards) for GitHub Pages.
export default defineConfig({
  root: 'demo',
  base: './', // relativa: funciona en cualquier ruta de Pages
  build: {
    outDir: '../site',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'demo/index.html'),    // grid
        cards: resolve(__dirname, 'demo/cards.html'),     // cards con animación
        heroes: resolve(__dirname, 'demo/heroes.html'),   // diseños de hero
      },
    },
  },
});
