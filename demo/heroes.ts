import { LineField } from '../src/index';
import type { Background, LineFieldOptions } from '../src/index';

type VName = LineFieldOptions['variant'];

const DARK: Background = { type: 'gradient', from: '#06101a', to: '#0a1b2b' };
const BRAND: Background = { type: 'gradient', from: '#0b1f3a', to: '#3a1d5c' };
const PURPLE: Background = { type: 'gradient', from: '#160a2b', to: '#2a164d' };

const P = {
  teal: ['#3fd6a0', '#5ad1ff', '#9b8cff'],
  violet: ['#8be9ff', '#c9a0ff', '#ff9bd6'],
  warm: ['#ffd27a', '#ff8f6b', '#c96bff'],
  cool: ['#7be0c0', '#4aa3ff', '#0d2b4a'],
};

const wrap = document.getElementById('wrap')!;

function addZoom(node: HTMLElement, field: LineField, z0: number): void {
  let z = z0;
  const ctl = document.createElement('div');
  ctl.className = 'zoomctl';
  const minus = document.createElement('button'); minus.textContent = '−';
  const val = document.createElement('span');
  const plus = document.createElement('button'); plus.textContent = '+';
  const fmt = () => { val.textContent = `${z.toFixed(1)}×`; };
  minus.onclick = () => { z = Math.max(1, Math.round((z - 0.2) * 10) / 10); field.setOptions({ zoom: z }); fmt(); };
  plus.onclick = () => { z = Math.min(4, Math.round((z + 0.2) * 10) / 10); field.setOptions({ zoom: z }); fmt(); };
  fmt();
  ctl.append(minus, val, plus);
  node.appendChild(ctl);
}

function mount(viz: HTMLElement, variant: VName, palette: string[], background: Background, zoom: number) {
  const f = new LineField(viz, { variant, palette, background, zoom });
  addZoom(viz, f, zoom);
}

function section(label: string, html: string): HTMLElement {
  const sec = document.createElement('div');
  sec.innerHTML = `<div class="hlabel">${label}</div>${html}`;
  wrap.appendChild(sec);
  return sec;
}

// H1 · split + stats
let s = section('Hero 1 · split + stats', `
  <div class="h-split">
    <div class="viz" data-h="1"></div>
    <div class="panel">
      <div class="block purple"><div class="stat">900+</div><div class="sub">A structured view of where enterprise AI is heading</div></div>
      <div class="block light"><div class="stat">54</div><div class="sub">A structured view of where enterprise AI is heading</div></div>
    </div>
  </div>`);
mount(s.querySelector('[data-h="1"]')!, 'malla', P.violet, PURPLE, 1.6);

// H2 · banner full-width
s = section('Hero 2 · banner full-width', `
  <div class="h-banner">
    <div class="viz" data-h="2"></div>
    <div class="overlay"><h2>Systems in motion, made visible</h2><div class="sub">Generative line fields for enterprise storytelling</div></div>
  </div>`);
mount(s.querySelector('[data-h="2"]')!, 'flujo', P.teal, DARK, 1.8);

// H3 · centered
s = section('Hero 3 · centrado', `
  <div class="h-centered">
    <div class="viz" data-h="3"></div>
    <div class="overlay"><h2>Where enterprise AI is heading</h2><div class="sub">A structured, governed view — delivered in weeks, not quarters.</div></div>
  </div>`);
mount(s.querySelector('[data-h="3"]')!, 'oscilacion', P.teal, DARK, 1.5);

// H4 · texto izquierda / animación derecha
s = section('Hero 4 · texto + animación', `
  <div class="h-textleft">
    <div class="text"><span class="kicker">Platform</span><h2>Governed AI, delivered in weeks</h2><button class="pill" style="color:#160a1d;border-color:#0003;background:#0000;">Read More</button></div>
    <div class="viz" data-h="4"></div>
  </div>`);
mount(s.querySelector('[data-h="4"]')!, 'entrelazado', P.violet, BRAND, 1.6);

// H5 · stat cover
s = section('Hero 5 · stat cover', `
  <div class="h-statcover">
    <div class="viz" data-h="5"></div>
    <div class="overlay"><div class="stat">12k+</div><div class="sub">models in production across regulated industries</div></div>
  </div>`);
mount(s.querySelector('[data-h="5"]')!, 'cubo', P.cool, DARK, 1.6);

// H6 · duo (dos animaciones)
s = section('Hero 6 · duo', `
  <div class="h-duo">
    <div class="half"><div class="viz" data-h="6a"></div><div class="lab">Interference</div></div>
    <div class="half"><div class="viz" data-h="6b"></div><div class="lab">Folds</div></div>
  </div>`);
mount(s.querySelector('[data-h="6a"]')!, 'interferencia', P.violet, BRAND, 2.0);
mount(s.querySelector('[data-h="6b"]')!, 'pliegues', P.warm, DARK, 1.8);
