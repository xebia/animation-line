// Grid de variantes con selector de paleta y de fondo, compartido por /lineas y /tramas.
import { LineField, VARIANTS, polylinesToSvg } from '../src/index';
import type { Background, LineFieldOptions, VariantName } from '../src/index';
import { downloadText, svgButton } from './download';

// Mismo orden de paletas y fondos que en /puntos
export const PALETTES = [
  ['#3fd6a0', '#5ad1ff', '#9b8cff'],
  ['#ff9bc4', '#b18cff', '#5ad1ff'],
  ['#ffd27a', '#ff8f6b', '#c96bff'],
  ['#7be0c0', '#4aa3ff', '#0d2b4a'],
  ['#a0f0c8', '#ffe08a', '#ff8f6b'],
  ['#8be9ff', '#c9a0ff', '#ff9bd6'],
  ['#ffffff', '#eaf1ff', '#ffffff'],
];
export const UI_BACKGROUNDS: { name: string; bg: Background; css: string }[] = [
  { name: 'Oscuro', bg: { type: 'gradient', from: '#06101a', to: '#0a1b2b' }, css: 'linear-gradient(135deg,#06101a,#0a1b2b)' },
  { name: 'Marca', bg: { type: 'gradient', from: '#0b1f3a', to: '#3a1d5c' }, css: 'linear-gradient(135deg,#0b1f3a,#3a1d5c)' },
  { name: 'Negro', bg: { type: 'solid', color: '#000000' }, css: '#000000' },
  { name: 'Claro', bg: { type: 'solid', color: '#f3ecf6' }, css: '#f3ecf6' },
  { name: 'Lavanda', bg: { type: 'gradient', from: '#eef0ff', to: '#dfeaff' }, css: 'linear-gradient(135deg,#eef0ff,#dfeaff)' },
];

const START = 1;     // paleta y fondo iniciales
const SPEED = 0.35;  // el mismo speed por defecto que usa LineField, para que el SVG cuadre

interface Slot { el: HTMLElement; opts: LineFieldOptions; field: LineField | null; }

export interface VariantGrid {
  palette: string[];
  bgIndex: number;
  /** Se avisa cuando el usuario cambia paleta o fondo, para lo que no sea un LineField
   *  (p. ej. las cards de palabras en Canvas 2D). */
  onChange(cb: () => void): void;
}

/** Monta una card por variante en #grid y cablea los selectores de paleta y fondo.
 *  Lazy-mount: solo anima lo visible, para no agotar los contextos WebGL. */
export function mountVariantGrid(
  names: readonly VariantName[], opts: { thickness?: number } = {},
): VariantGrid {
  const slots: Slot[] = [];
  const listeners: Array<() => void> = [];
  const state = {
    palette: PALETTES[START],
    bgIndex: START,
    onChange(cb: () => void) { listeners.push(cb); },
  };

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
  names.forEach((name) => {
    const card = document.createElement('div');
    card.className = 'card';
    const stage = document.createElement('div');
    stage.className = 'stage';
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = name;

    // SVG: se congela el fotograma actual regenerando la geometría de la variante en ese t,
    // con la misma paleta y fondo que la card. Sale vectorial y sin animación.
    const dl = svgButton(() => {
      const r = stage.getBoundingClientRect();
      const W = Math.round(r.width), H = Math.round(r.height);
      const t = performance.now() * SPEED;
      const svg = polylinesToSvg(VARIANTS[name].generate({ t, W, H }), {
        W, H,
        palette: state.palette,
        background: UI_BACKGROUNDS[state.bgIndex].bg,
        thickness: opts.thickness ?? 1.1,
      });
      downloadText(`${name}.svg`, svg);
    });

    card.append(stage, label, dl);
    grid.appendChild(card);
    const slot: Slot = {
      el: stage,
      opts: {
        variant: name,
        palette: state.palette,
        background: UI_BACKGROUNDS[state.bgIndex].bg,
        thickness: opts.thickness ?? 1.1,
      },
      field: null,
    };
    slots.push(slot);
    io.observe(stage);
  });

  const palEl = document.getElementById('pal')!;
  PALETTES.forEach((p, idx) => {
    const d = document.createElement('span');
    d.className = 'swat' + (idx === START ? ' active' : '');
    d.style.background = 'linear-gradient(135deg,' + p.join(',') + ')';
    d.onclick = () => {
      state.palette = p;
      slots.forEach((s) => { s.opts.palette = p; s.field?.setOptions({ palette: p }); });
      [...palEl.children].forEach((c) => c.classList.remove('active'));
      d.classList.add('active');
      listeners.forEach((cb) => cb());
    };
    palEl.appendChild(d);
  });

  const bgEl = document.getElementById('backgrounds')!;
  UI_BACKGROUNDS.forEach((b, idx) => {
    const d = document.createElement('span');
    d.className = 'swat sq' + (idx === START ? ' active' : '');
    d.title = b.name;
    d.style.background = b.css;
    d.onclick = () => {
      state.bgIndex = idx;
      slots.forEach((s) => { s.opts.background = b.bg; s.field?.setOptions({ background: b.bg }); });
      [...bgEl.children].forEach((c) => c.classList.remove('active'));
      d.classList.add('active');
      listeners.forEach((cb) => cb());
    };
    bgEl.appendChild(d);
  });

  return state;
}
