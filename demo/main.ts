import { LineField, VARIANT_NAMES } from '../src/index';
import type { LineFieldOptions, Background } from '../src/index';

const PALETTES = [
  ['#3fd6a0', '#5ad1ff', '#9b8cff'],
  ['#7be0c0', '#4aa3ff', '#0d2b4a'],
  ['#ff9bc4', '#b18cff', '#5ad1ff'],
  ['#ffd27a', '#ff8f6b', '#c96bff'],
];
const BACKGROUNDS: Background[] = [
  { type: 'gradient', from: '#06101a', to: '#0a1b2b' },
  { type: 'solid', color: '#000000' },
  { type: 'gradient', from: '#0b1f3a', to: '#3a1d5c' },
  { type: 'solid', color: '#eef2f7' },
];

const opts: LineFieldOptions = {
  variant: 'oscilacion', palette: PALETTES[0], background: BACKGROUNDS[0],
};
const stage = document.getElementById('stage')!;
let field = new LineField(stage, opts);

function rebuild() { field.destroy(); stage.innerHTML = ''; field = new LineField(stage, opts); }

const vEl = document.getElementById('variants')!;
VARIANT_NAMES.forEach((name) => {
  const b = document.createElement('button');
  b.textContent = name; if (name === opts.variant) b.classList.add('active');
  b.onclick = () => { opts.variant = name; [...vEl.children].forEach((c) => c.classList.remove('active')); b.classList.add('active'); field.setOptions({ variant: name }); };
  vEl.appendChild(b);
});
const pEl = document.getElementById('palettes')!;
PALETTES.forEach((p, i) => {
  const d = document.createElement('div'); d.className = 'dot';
  d.style.background = `linear-gradient(135deg, ${p.join(',')})`;
  d.onclick = () => { opts.palette = p; field.setOptions({ palette: p }); };
  pEl.appendChild(d);
});
const bEl = document.getElementById('backgrounds')!;
BACKGROUNDS.forEach((bg, i) => {
  const d = document.createElement('div'); d.className = 'dot';
  d.style.background = bg.type === 'gradient' ? `linear-gradient(135deg, ${bg.from}, ${bg.to})` : bg.type === 'solid' ? bg.color : '#fff';
  d.onclick = () => { opts.background = bg; rebuild(); };
  bEl.appendChild(d);
});

addEventListener('resize', () => field.setOptions({}));
