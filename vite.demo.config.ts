import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Static build of the demo gallery for GitHub Pages.
// base must match the repo name for project Pages (https://<user>.github.io/<repo>/).
export default defineConfig({
  root: 'demo',
  base: '/xebia-animation-line/',
  build: {
    outDir: '../site',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'demo/index.html'),   // grid (portada)
        single: resolve(__dirname, 'demo/single.html'), // vista individual
      },
    },
  },
});
