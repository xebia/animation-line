import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: '.',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'XebiaAnimationLine',
      formats: ['es'],
      fileName: 'xebia-animation-line',
    },
    rollupOptions: { external: ['ogl', 'react', 'react-dom'] },
  },
});
