import { LineField, VARIANT_NAMES } from '../src/index';
import type { Background, LineFieldOptions } from '../src/index';
import { palabraLineas, paintBg, makeCol, BACKGROUNDS as PBGS } from './points';
import type { EstiloLineas } from './points';

// Mismo orden de paletas y fondos que en /puntos
const PALETTES = [
  ['#3fd6a0', '#5ad1ff', '#9b8cff'],
  ['#ff9bc4', '#b18cff', '#5ad1ff'],
  ['#ffd27a', '#ff8f6b', '#c96bff'],
  ['#7be0c0', '#4aa3ff', '#0d2b4a'],
  ['#a0f0c8', '#ffe08a', '#ff8f6b'],
  ['#8be9ff', '#c9a0ff', '#ff9bd6'],
  ['#ffffff', '#eaf1ff', '#ffffff'],
];
const UI_BACKGROUNDS: { name: string; bg: Background; css: string }[] = [
  { name: 'Oscuro', bg: { type: 'gradient', from: '#06101a', to: '#0a1b2b' }, css: 'linear-gradient(135deg,#06101a,#0a1b2b)' },
  { name: 'Marca', bg: { type: 'gradient', from: '#0b1f3a', to: '#3a1d5c' }, css: 'linear-gradient(135deg,#0b1f3a,#3a1d5c)' },
  { name: 'Negro', bg: { type: 'solid', color: '#000000' }, css: '#000000' },
  { name: 'Claro', bg: { type: 'solid', color: '#f3ecf6' }, css: '#f3ecf6' },
  { name: 'Lavanda', bg: { type: 'gradient', from: '#eef0ff', to: '#dfeaff' }, css: 'linear-gradient(135deg,#eef0ff,#dfeaff)' },
];
let PAL = PALETTES[1];
let BG = UI_BACKGROUNDS[1].bg;

// lazy-mount: solo anima lo visible (evita el límite de contextos WebGL)
interface Slot { el: HTMLElement; opts: LineFieldOptions; field: LineField | null; }
const slots: Slot[] = [];
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const s = slots.find((x) => x.el === e.target);
    if (!s) continue;
    if (e.isIntersecting && !s.field) {
      s.field = new LineField(s.el, s.opts);
    } else if (!e.isIntersecting && s.field) {
      s.field.destroy();
      s.field = null;
      s.el.querySelectorAll('canvas').forEach((c) => c.remove());
    }
  }
}, { rootMargin: '300px' });

const grid = document.getElementById('grid')!;

// Cards de palabras (primero): texto formado por líneas finas onduladas (Canvas 2D)
let bgIdx = 1;
const WORDS: [string, EstiloLineas][] = [['Xebia', 'horizontal'], ['People', 'vertical'], ['Human', 'concentrico'], ['Data & AI', 'diagonal']];
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
    paintBg(ctx, w, h, PBGS[bgIdx]);
    palabraLineas(ctx, w, h, t * 0.55, makeCol(PAL), word, estilo);
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

VARIANT_NAMES.forEach((name) => {
  const card = document.createElement('div');
  card.className = 'card';
  const stage = document.createElement('div');
  stage.className = 'stage';
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = name;
  card.append(stage, label);
  grid.appendChild(card);
  const slot: Slot = { el: stage, opts: { variant: name, palette: PAL, background: BG, thickness: 1.1 }, field: null };
  slots.push(slot);
  io.observe(stage);
});

function setPalette(p: string[]): void {
  PAL = p;
  slots.forEach((s) => { s.opts.palette = p; s.field?.setOptions({ palette: p }); });
}
function setBg(b: Background): void {
  BG = b;
  slots.forEach((s) => { s.opts.background = b; s.field?.setOptions({ background: b }); });
}

const palEl = document.getElementById('pal')!;
PALETTES.forEach((p, idx) => {
  const d = document.createElement('span');
  d.className = 'swat' + (idx === 1 ? ' active' : '');
  d.style.background = 'linear-gradient(135deg,' + p.join(',') + ')';
  d.onclick = () => { setPalette(p); [...palEl.children].forEach((c) => c.classList.remove('active')); d.classList.add('active'); };
  palEl.appendChild(d);
});
const bgEl = document.getElementById('backgrounds')!;
UI_BACKGROUNDS.forEach((b, idx) => {
  const d = document.createElement('span');
  d.className = 'swat sq' + (idx === 1 ? ' active' : '');
  d.title = b.name;
  d.style.background = b.css;
  d.onclick = () => { setBg(b.bg); bgIdx = idx; [...bgEl.children].forEach((c) => c.classList.remove('active')); d.classList.add('active'); };
  bgEl.appendChild(d);
});
