import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Static build of the demo (líneas + puntos) for GitHub Pages.
export default defineConfig({
  root: 'demo',
  base: './', // relativa: funciona en cualquier ruta de Pages
  build: {
    outDir: '../site',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'demo/index.html'),    // hub
        lineas: resolve(__dirname, 'demo/lineas.html'),   // grid de líneas
        puntos: resolve(__dirname, 'demo/puntos.html'),   // grid de puntos
      },
    },
  },
});
