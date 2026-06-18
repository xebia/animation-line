import { defineConfig } from 'vite';

// Static build of the demo gallery for GitHub Pages.
// base must match the repo name for project Pages (https://<user>.github.io/<repo>/).
export default defineConfig({
  root: 'demo',
  base: '/xebia-animation-line/',
  build: {
    outDir: '../site',
    emptyOutDir: true,
  },
});
