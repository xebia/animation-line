import { LineField, VARIANT_NAMES } from '../src/index';
import type { Background } from '../src/index';

// Paletas seleccionables por card.
const PALETTES = [
  ['#3fd6a0', '#5ad1ff', '#9b8cff'], // teal → azul → violeta
  ['#ff9bc4', '#b18cff', '#5ad1ff'], // rosa → violeta → azul
  ['#ffd27a', '#ff8f6b', '#c96bff'], // cálido
  ['#7be0c0', '#4aa3ff', '#0d2b4a'], // verde agua → azul profundo
  ['#a0f0c8', '#ffe08a', '#ff8f6b'], // verde → ámbar
  ['#8be9ff', '#c9a0ff', '#ff9bd6'], // pastel frío
];

// Fondos seleccionables (globales, aplican a todas las cards).
const BACKGROUNDS: { name: string; bg: Background; css: string }[] = [
  { name: 'Oscuro', bg: { type: 'gradient', from: '#06101a', to: '#0a1b2b' }, css: 'linear-gradient(135deg,#06101a,#0a1b2b)' },
  { name: 'Negro', bg: { type: 'solid', color: '#000000' }, css: '#000000' },
  { name: 'Marca', bg: { type: 'gradient', from: '#0b1f3a', to: '#3a1d5c' }, css: 'linear-gradient(135deg,#0b1f3a,#3a1d5c)' },
  { name: 'Claro', bg: { type: 'solid', color: '#eef2f7' }, css: '#eef2f7' },
];

const grid = document.getElementById('grid')!;
const fields: LineField[] = [];

VARIANT_NAMES.forEach((name, i) => {
  const card = document.createElement('div');
  card.className = 'card';

  const stage = document.createElement('div');
  stage.className = 'stage';

  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = name;

  const swatches = document.createElement('div');
  swatches.className = 'swatches';

  card.append(stage, label, swatches);
  grid.appendChild(card);

  const startIdx = i % PALETTES.length;
  const field = new LineField(stage, {
    variant: name,
    palette: PALETTES[startIdx],
    background: BACKGROUNDS[0].bg,
  });
  fields.push(field);

  // Swatches por card → cambia el color de esa animación.
  PALETTES.forEach((p, idx) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (idx === startIdx ? ' active' : '');
    dot.style.background = `linear-gradient(135deg, ${p.join(', ')})`;
    dot.onclick = () => {
      field.setOptions({ palette: p });
      [...swatches.children].forEach((c) => c.classList.remove('active'));
      dot.classList.add('active');
    };
    swatches.appendChild(dot);
  });
});

// Selector de fondo global.
const bgbar = document.getElementById('backgrounds')!;
const blabel = document.createElement('span');
blabel.className = 'blabel';
blabel.textContent = 'Fondo';
bgbar.appendChild(blabel);
BACKGROUNDS.forEach((b, idx) => {
  const dot = document.createElement('span');
  dot.className = 'bgdot' + (idx === 0 ? ' active' : '');
  dot.title = b.name;
  dot.style.background = b.css;
  dot.onclick = () => {
    fields.forEach((f) => f.setOptions({ background: b.bg }));
    [...bgbar.querySelectorAll('.bgdot')].forEach((c) => c.classList.remove('active'));
    dot.classList.add('active');
  };
  bgbar.appendChild(dot);
});
