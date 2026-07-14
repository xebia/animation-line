import { LINE_NAMES } from '../src/index';
import { palabraLineas, paintBg, makeCol, BACKGROUNDS as PBGS } from './points';
import type { EstiloLineas } from './points';
import { mountVariantGrid } from './variant-grid';

const grid = document.getElementById('grid')!;

// Cards de palabras (primero): texto formado por líneas finas onduladas (Canvas 2D)
const WORDS: [string, EstiloLineas][] = [['Xebia', 'horizontal'], ['People', 'vertical'], ['Human', 'concentrico'], ['Data & AI', 'diagonal']];
let state: { palette: string[]; bgIndex: number };

function buildWordCard([word, estilo]: [string, EstiloLineas]): void {
  const card = document.createElement('div');
  card.className = 'card';
  const cv = document.createElement('canvas');
  cv.style.position = 'absolute'; cv.style.inset = '0'; cv.style.width = '100%'; cv.style.height = '100%';
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = word + ' · ' + estilo;
  card.append(cv, label);
  grid.appendChild(card);
  const ctx = cv.getContext('2d')!;
  const DPR = Math.min(devicePixelRatio || 1, 2);
  let w = 1, h = 1, running = false, raf = 0;
  const fit = (): void => {
    const r = cv.getBoundingClientRect(); w = r.width; h = r.height;
    cv.width = r.width * DPR; cv.height = r.height * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  const loop = (t: number): void => {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    paintBg(ctx, w, h, PBGS[state.bgIndex]);
    palabraLineas(ctx, w, h, t * 0.55, makeCol(state.palette), word, estilo);
  };
  const wio = new IntersectionObserver((es) => {
    for (const e of es) {
      if (e.isIntersecting && !running) { running = true; fit(); raf = requestAnimationFrame(loop); }
      else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    }
  }, { rootMargin: '300px' });
  wio.observe(cv);
  addEventListener('resize', () => { if (running) fit(); });
}

WORDS.forEach(buildWordCard);
state = mountVariantGrid(LINE_NAMES);
