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

interface Viz { variant: VName; palette: string[]; background: Background; zoom: number; }

const DEFAULT_ZOOM = 3.2; // close-up por defecto en cards y heroes
const MAX_ZOOM = 6;
const DEFAULT_BACKGROUND: Background = { type: 'solid', color: '#f3ecf6' }; // claro por defecto

type Card =
  | { type: 'split'; label: string; title: string; desc: string; cta: string; viz: Viz }
  | { type: 'stacked'; label: string; title: string; desc: string; cta: string; viz: Viz }
  | { type: 'quote'; quote: string; author: string; viz: Viz }
  | { type: 'stats'; title: string; sub: string; stats: { n: string; l: string }[]; viz: Viz }
  | { type: 'cover'; label: string; title: string; cta: string; viz: Viz }
  | { type: 'coverMinimal'; title: string; viz: Viz }
  | { type: 'wide'; label: string; title: string; cta: string; viz: Viz };

const CARDS: Card[] = [
  { type: 'split', label: 'Article', title: 'Designing APIs That Developers Actually Love', desc: 'Real-world insights from data mesh implementations.', cta: 'Read More', viz: { variant: 'malla', palette: P.teal, background: DARK, zoom: 1.8 } },
  { type: 'quote', quote: 'Xebia didn’t sell us a deck. They delivered a governed platform in weeks.', author: 'CDO · European Bank', viz: { variant: 'entrelazado', palette: P.violet, background: BRAND, zoom: 1.6 } },
  { type: 'stats', title: 'Gemini Enterprise Challenge', sub: 'Prepared by Google Cloud for Xebia', stats: [{ n: '63', l: 'Participants' }, { n: '23', l: 'Skill Badges Earned' }, { n: '1', l: 'Global Challenge' }], viz: { variant: 'pliegues', palette: P.violet, background: BRAND, zoom: 1.5 } },
  { type: 'stacked', label: 'Article', title: 'Scaling Platforms Without Scaling Chaos', desc: 'Patterns for governed, self-service infrastructure at enterprise scale.', cta: 'Read More', viz: { variant: 'cubo', palette: P.cool, background: DARK, zoom: 1.5 } },
  { type: 'split', label: 'Insight', title: 'Linear Oscillations in Brand Systems', desc: 'How motion makes invisible systems visible.', cta: 'Read More', viz: { variant: 'oscilacion', palette: P.teal, background: DARK, zoom: 1.7 } },
  { type: 'stacked', label: 'Article', title: 'Flow, Interference & Emergent Structure', desc: 'Generative line fields as a visual language for data in motion.', cta: 'Read More', viz: { variant: 'flujo', palette: P.warm, background: DARK, zoom: 1.6 } },
  { type: 'cover', label: 'Report', title: 'The State of Platform Engineering', cta: 'Read More', viz: { variant: 'oscilacion', palette: P.teal, background: DARK, zoom: 2.4 } },
  { type: 'cover', label: 'Case study', title: 'Enterprise AI, in Motion', cta: 'Read More', viz: { variant: 'interferencia', palette: P.violet, background: BRAND, zoom: 2.4 } },
  { type: 'coverMinimal', title: 'Structure', viz: { variant: 'rejilla', palette: P.cool, background: DARK, zoom: 2.2 } },
  { type: 'coverMinimal', title: 'Symmetry', viz: { variant: 'espiral', palette: P.violet, background: BRAND, zoom: 2.0 } },
  { type: 'cover', label: 'Motion', title: 'Rolled & Gathered', cta: 'Read More', viz: { variant: 'tubo', palette: P.teal, background: DARK, zoom: 1.6 } },
  { type: 'coverMinimal', title: 'Cone', viz: { variant: 'cono', palette: P.violet, background: BRAND, zoom: 1.6 } },
  { type: 'split', label: 'Insight', title: 'Twisting Ribbons of Data', desc: 'A ruled surface that gathers and fuses as it turns.', cta: 'Read More', viz: { variant: 'cinta', palette: P.warm, background: DARK, zoom: 1.5 } },
  { type: 'stacked', label: 'Article', title: 'Helical Systems', desc: 'Coiled line fields with travelling pinches.', cta: 'Read More', viz: { variant: 'helice', palette: P.cool, background: DARK, zoom: 1.5 } },
  { type: 'cover', label: 'Case study', title: 'Into the Funnel', cta: 'Read More', viz: { variant: 'embudo', palette: P.violet, background: BRAND, zoom: 1.5 } },
  { type: 'coverMinimal', title: 'Dune', viz: { variant: 'duna', palette: P.teal, background: DARK, zoom: 1.5 } },
  { type: 'wide', label: 'Showreel', title: 'A generative line system for the Xebia brand', cta: 'Explore', viz: { variant: 'embudo', palette: P.violet, background: PURPLE, zoom: 1.4 } },
  { type: 'cover', label: 'Form', title: 'Quilla', cta: 'Read More', viz: { variant: 'quilla', palette: P.teal, background: PURPLE, zoom: 1.5 } },
  { type: 'coverMinimal', title: 'Helicoide', viz: { variant: 'helicoide', palette: P.violet, background: DARK, zoom: 1.6 } },
  { type: 'split', label: 'Insight', title: 'Scrolls & Volutes', desc: 'Curling line systems for motion design.', cta: 'Read More', viz: { variant: 'voluta', palette: P.warm, background: DARK, zoom: 1.5 } },
  { type: 'stacked', label: 'Article', title: 'Woven Lattices', desc: 'Shearing grids that recompose continuously.', cta: 'Read More', viz: { variant: 'celosia', palette: P.violet, background: BRAND, zoom: 1.4 } },
  { type: 'stats', title: 'By the numbers', sub: 'Generative system metrics', stats: [{ n: '20', l: 'Variants' }, { n: '∞', l: 'Combinations' }, { n: '60', l: 'FPS' }], viz: { variant: 'cono', palette: P.cool, background: DARK, zoom: 1.5 } },
  { type: 'wide', label: 'Lab', title: 'Twenty forms, infinite recompositions', cta: 'Explore', viz: { variant: 'helicoide', palette: P.teal, background: DARK, zoom: 1.5 } },
];

const BACKGROUNDS: { name: string; bg: Background; css: string; light?: boolean }[] = [
  { name: 'Oscuro', bg: DARK, css: 'linear-gradient(135deg,#06101a,#0a1b2b)' },
  { name: 'Marca', bg: BRAND, css: 'linear-gradient(135deg,#0b1f3a,#3a1d5c)' },
  { name: 'Negro', bg: { type: 'solid', color: '#000000' }, css: '#000000' },
  { name: 'Claro', bg: { type: 'solid', color: '#f3ecf6' }, css: '#f3ecf6', light: true },
  { name: 'Lavanda', bg: { type: 'gradient', from: '#eef0ff', to: '#dfeaff' }, css: 'linear-gradient(135deg,#eef0ff,#dfeaff)', light: true },
];

// ---- Gestor: solo animar lo visible (evita el límite de contextos WebGL ~16) ----
interface Slot { el: HTMLElement; opts: Viz; field: LineField | null; }
const slots: Slot[] = [];
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const slot = slots.find((s) => s.el === e.target);
    if (!slot) continue;
    if (e.isIntersecting && !slot.field) {
      slot.field = new LineField(slot.el, slot.opts);
    } else if (!e.isIntersecting && slot.field) {
      slot.field.destroy();
      slot.field = null;
      slot.el.querySelectorAll('canvas').forEach((c) => c.remove());
    }
  }
}, { rootMargin: '300px' });

function register(el: HTMLElement, viz: Viz): Slot {
  const slot: Slot = { el, opts: { ...viz }, field: null };
  slots.push(slot);
  io.observe(el);
  return slot;
}

function addZoomControl(node: HTMLElement, slot: Slot): void {
  let z = slot.opts.zoom;
  const ctl = document.createElement('div');
  ctl.className = 'zoomctl';
  const minus = document.createElement('button'); minus.textContent = '−';
  const val = document.createElement('span');
  const plus = document.createElement('button'); plus.textContent = '+';
  const fmt = () => { val.textContent = `${z.toFixed(1)}×`; };
  minus.onclick = () => { z = Math.max(1, Math.round((z - 0.2) * 10) / 10); slot.opts.zoom = z; slot.field?.setOptions({ zoom: z }); fmt(); };
  plus.onclick = () => { z = Math.min(MAX_ZOOM, Math.round((z + 0.2) * 10) / 10); slot.opts.zoom = z; slot.field?.setOptions({ zoom: z }); fmt(); };
  fmt();
  ctl.append(minus, val, plus);
  node.appendChild(ctl);
}

function logo(): string { return ''; }

function render(card: Card): HTMLElement {
  const el = document.createElement('div');
  if (card.type === 'split') {
    el.innerHTML = `
      <article class="xcard split">
        <div class="text">
          <div class="top"><span class="kicker">${card.label}</span>${logo()}</div>
          <h2>${card.title}</h2>
          <div class="bottom"><p class="desc">${card.desc}</p><button class="pill">${card.cta}</button></div>
        </div>
        <div class="accent"></div>
        <div class="viz"></div>
      </article>`;
  } else if (card.type === 'stacked') {
    el.innerHTML = `
      <article class="xcard stacked">
        <div class="text">
          <div class="top"><span class="kicker">${card.label}</span>${logo()}</div>
          <h2>${card.title}</h2>
          <p class="desc">${card.desc}</p>
        </div>
        <div class="viz"></div>
        <button class="pill float">${card.cta}</button>
      </article>`;
  } else if (card.type === 'quote') {
    el.innerHTML = `
      <article class="xcard quote">
        <div class="text">
          <h2>${card.quote}</h2>
          <div class="bottom"><p class="author">${card.author}</p></div>
        </div>
        <div class="accent"></div>
        <div class="viz"></div>
      </article>`;
  } else if (card.type === 'cover') {
    el.innerHTML = `
      <article class="xcard cover">
        <div class="viz"></div>
        <div class="overlay">
          <div class="top"><span class="kicker">${card.label}</span></div>
          <div class="foot"><h2>${card.title}</h2><button class="pill light">${card.cta}</button></div>
        </div>
      </article>`;
  } else if (card.type === 'coverMinimal') {
    el.innerHTML = `
      <article class="xcard cover minimal">
        <div class="viz"></div>
        <div class="overlay"><div class="top"></div><div class="foot"><h2>${card.title}</h2></div></div>
      </article>`;
  } else if (card.type === 'wide') {
    el.innerHTML = `
      <article class="xcard cover wide">
        <div class="viz"></div>
        <div class="overlay">
          <div class="top"><span class="kicker">${card.label}</span></div>
          <div class="foot"><h2>${card.title}</h2><button class="pill light">${card.cta}</button></div>
        </div>
      </article>`;
  } else {
    const tiles = card.stats.map((s) => `<div class="tile"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>`).join('');
    el.innerHTML = `
      <article class="xcard statscard">
        <div class="text">
          <div class="top"><span class="kicker">Case study</span></div>
          <h2>${card.title}</h2>
          <p class="sub">${card.sub}</p>
        </div>
        <div class="viz statsviz"><div class="tiles">${tiles}</div></div>
      </article>`;
  }
  return el.firstElementChild as HTMLElement;
}

const root = document.getElementById('cards')!;
for (const card of CARDS) {
  const node = render(card);
  root.appendChild(node);
  const viz = node.querySelector<HTMLElement>('.viz')!;
  const slot = register(viz, { ...card.viz, zoom: DEFAULT_ZOOM, background: DEFAULT_BACKGROUND });
  addZoomControl(node, slot);
}

// ===== Heroes (debajo de las cards) =====
const heroesRoot = document.getElementById('heroes')!;
function heroSection(label: string, html: string): HTMLElement {
  const sec = document.createElement('div');
  sec.className = 'hero-sec';
  sec.innerHTML = `<div class="hlabel">${label}</div>${html}`;
  heroesRoot.appendChild(sec);
  return sec;
}
function mountHero(viz: HTMLElement, v: Viz): void {
  const slot = register(viz, { ...v, zoom: DEFAULT_ZOOM, background: DEFAULT_BACKGROUND });
  addZoomControl(viz, slot);
}

let hs = heroSection('Hero 1 · split + stats', `
  <div class="h-split">
    <div class="viz" data-h="1"></div>
    <div class="panel">
      <div class="block purple"><div class="stat">900+</div><div class="sub">A structured view of where enterprise AI is heading</div></div>
      <div class="block light"><div class="stat">54</div><div class="sub">A structured view of where enterprise AI is heading</div></div>
    </div>
  </div>`);
mountHero(hs.querySelector('[data-h="1"]')!, { variant: 'malla', palette: P.violet, background: PURPLE, zoom: 1.6 });

hs = heroSection('Hero 2 · banner full-width', `
  <div class="h-banner">
    <div class="viz" data-h="2"></div>
    <div class="overlay"><h2>Systems in motion, made visible</h2><div class="sub">Generative line fields for enterprise storytelling</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="2"]')!, { variant: 'flujo', palette: P.teal, background: DARK, zoom: 1.8 });

hs = heroSection('Hero 3 · centrado', `
  <div class="h-centered">
    <div class="viz" data-h="3"></div>
    <div class="overlay"><h2>Where enterprise AI is heading</h2><div class="sub">A structured, governed view — delivered in weeks, not quarters.</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="3"]')!, { variant: 'oscilacion', palette: P.teal, background: DARK, zoom: 1.5 });

hs = heroSection('Hero 4 · texto + animación', `
  <div class="h-textleft">
    <div class="text"><span class="kicker">Platform</span><h2>Governed AI, delivered in weeks</h2><button class="pill" style="color:#160a1d;border-color:#0003;background:transparent;">Read More</button></div>
    <div class="viz" data-h="4"></div>
  </div>`);
mountHero(hs.querySelector('[data-h="4"]')!, { variant: 'entrelazado', palette: P.violet, background: BRAND, zoom: 1.6 });

hs = heroSection('Hero 5 · stat cover', `
  <div class="h-statcover">
    <div class="viz" data-h="5"></div>
    <div class="overlay"><div class="stat">12k+</div><div class="sub">models in production across regulated industries</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="5"]')!, { variant: 'cubo', palette: P.cool, background: DARK, zoom: 1.6 });

hs = heroSection('Hero 6 · duo', `
  <div class="h-duo">
    <div class="half"><div class="viz" data-h="6a"></div><div class="lab">Interference</div></div>
    <div class="half"><div class="viz" data-h="6b"></div><div class="lab">Folds</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="6a"]')!, { variant: 'interferencia', palette: P.violet, background: BRAND, zoom: 2.0 });
mountHero(hs.querySelector('[data-h="6b"]')!, { variant: 'pliegues', palette: P.warm, background: DARK, zoom: 1.8 });

hs = heroSection('Hero 7 · banner (tubo)', `
  <div class="h-banner">
    <div class="viz" data-h="7"></div>
    <div class="overlay"><h2>Rolled, gathered, in motion</h2><div class="sub">Line fields that fold and fuse with themselves</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="7"]')!, { variant: 'tubo', palette: P.teal, background: PURPLE, zoom: 1.6 });

hs = heroSection('Hero 8 · centrado (embudo)', `
  <div class="h-centered">
    <div class="viz" data-h="8"></div>
    <div class="overlay"><h2>Everything flows to one point</h2><div class="sub">A vortex of governed, structured intelligence.</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="8"]')!, { variant: 'embudo', palette: P.violet, background: PURPLE, zoom: 1.5 });

hs = heroSection('Hero 9 · stat cover (hélice)', `
  <div class="h-statcover">
    <div class="viz" data-h="9"></div>
    <div class="overlay"><div class="stat">3.2×</div><div class="sub">faster delivery with coiled, composable platforms</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="9"]')!, { variant: 'helice', palette: P.cool, background: DARK, zoom: 1.5 });

hs = heroSection('Hero 10 · duo (cinta · duna)', `
  <div class="h-duo">
    <div class="half"><div class="viz" data-h="10a"></div><div class="lab">Ribbon</div></div>
    <div class="half"><div class="viz" data-h="10b"></div><div class="lab">Dune</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="10a"]')!, { variant: 'cinta', palette: P.warm, background: DARK, zoom: 1.6 });
mountHero(hs.querySelector('[data-h="10b"]')!, { variant: 'duna', palette: P.teal, background: BRAND, zoom: 1.5 });

hs = heroSection('Hero 11 · tríptico', `
  <div class="h-tript">
    <div class="col"><div class="viz" data-h="11a"></div></div>
    <div class="col"><div class="viz" data-h="11b"></div></div>
    <div class="col"><div class="viz" data-h="11c"></div></div>
    <div class="titleband"><h2>A visual language for systems in motion</h2><div class="sub">Quilla · Helicoide · Voluta</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="11a"]')!, { variant: 'quilla', palette: P.teal, background: PURPLE, zoom: 1.4 });
mountHero(hs.querySelector('[data-h="11b"]')!, { variant: 'helicoide', palette: P.violet, background: PURPLE, zoom: 1.4 });
mountHero(hs.querySelector('[data-h="11c"]')!, { variant: 'voluta', palette: P.cool, background: PURPLE, zoom: 1.4 });

hs = heroSection('Hero 12 · centrado (helicoide)', `
  <div class="h-centered">
    <div class="viz" data-h="12"></div>
    <div class="overlay"><h2>Where structure meets intelligence</h2><div class="sub">Crossing fields of governed data, in constant recomposition.</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="12"]')!, { variant: 'helicoide', palette: P.violet, background: DARK, zoom: 1.5 });

hs = heroSection('Hero 13 · split + stats (quilla)', `
  <div class="h-split">
    <div class="viz" data-h="13"></div>
    <div class="panel">
      <div class="block purple"><div class="stat">28+</div><div class="sub">enterprise platforms shipped this year</div></div>
      <div class="block light"><div class="stat">9</div><div class="sub">countries, one governed architecture</div></div>
    </div>
  </div>`);
mountHero(hs.querySelector('[data-h="13"]')!, { variant: 'quilla', palette: P.teal, background: PURPLE, zoom: 1.5 });

hs = heroSection('Hero 14 · stat cover (voluta)', `
  <div class="h-statcover">
    <div class="viz" data-h="14"></div>
    <div class="overlay"><div class="stat">∞</div><div class="sub">composable building blocks, endlessly recombined</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="14"]')!, { variant: 'voluta', palette: P.warm, background: DARK, zoom: 1.5 });

hs = heroSection('Hero 15 · banner (celosía)', `
  <div class="h-banner">
    <div class="viz" data-h="15"></div>
    <div class="overlay"><h2>Layered, woven, in motion</h2><div class="sub">Generative line systems for the Xebia brand</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="15"]')!, { variant: 'celosia', palette: P.violet, background: BRAND, zoom: 1.4 });

hs = heroSection('Hero 16 · banner (quilla)', `
  <div class="h-banner">
    <div class="viz" data-h="16"></div>
    <div class="overlay"><h2>Engineered, not decorated</h2><div class="sub">Ruled surfaces that twist and fuse</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="16"]')!, { variant: 'quilla', palette: P.teal, background: PURPLE, zoom: 1.5 });

hs = heroSection('Hero 17 · centrado (celosía)', `
  <div class="h-centered">
    <div class="viz" data-h="17"></div>
    <div class="overlay"><h2>Layers that recompose</h2><div class="sub">Shearing lattices for adaptive systems.</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="17"]')!, { variant: 'celosia', palette: P.violet, background: DARK, zoom: 1.4 });

hs = heroSection('Hero 18 · stat cover (tubo)', `
  <div class="h-statcover">
    <div class="viz" data-h="18"></div>
    <div class="overlay"><div class="stat">100%</div><div class="sub">generated in the browser — no assets, no video</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="18"]')!, { variant: 'tubo', palette: P.cool, background: DARK, zoom: 1.5 });

hs = heroSection('Hero 19 · duo (cono · embudo)', `
  <div class="h-duo">
    <div class="half"><div class="viz" data-h="19a"></div><div class="lab">Cone</div></div>
    <div class="half"><div class="viz" data-h="19b"></div><div class="lab">Funnel</div></div>
  </div>`);
mountHero(hs.querySelector('[data-h="19a"]')!, { variant: 'cono', palette: P.warm, background: BRAND, zoom: 1.5 });
mountHero(hs.querySelector('[data-h="19b"]')!, { variant: 'embudo', palette: P.violet, background: PURPLE, zoom: 1.5 });

// Selector de paleta global (gradiente de las líneas).
const PALETTES = [
  ['#3fd6a0', '#5ad1ff', '#9b8cff'], ['#ff9bc4', '#b18cff', '#5ad1ff'], ['#ffd27a', '#ff8f6b', '#c96bff'],
  ['#7be0c0', '#4aa3ff', '#0d2b4a'], ['#a0f0c8', '#ffe08a', '#ff8f6b'], ['#8be9ff', '#c9a0ff', '#ff9bd6'],
];
const palbar = document.getElementById('cardpal')!;
PALETTES.forEach((p) => {
  const d = document.createElement('span');
  d.className = 'pdot';
  d.style.background = 'linear-gradient(135deg,' + p.join(',') + ')';
  d.onclick = () => {
    slots.forEach((s) => { s.opts.palette = p; s.field?.setOptions({ palette: p }); });
    [...palbar.children].forEach((c) => c.classList.remove('active'));
    d.classList.add('active');
  };
  palbar.appendChild(d);
});

// Selector de fondo global (aplica a todas las animaciones, vivas o futuras).
const bgbar = document.getElementById('cardbg')!;
BACKGROUNDS.forEach((b) => {
  const dot = document.createElement('span');
  dot.className = 'bgdot' + (b.name === 'Claro' ? ' active' : '');
  dot.title = b.name;
  dot.style.background = b.css;
  dot.onclick = () => {
    slots.forEach((s) => { s.opts.background = b.bg; s.field?.setOptions({ background: b.bg }); });
    document.body.classList.toggle('cards-light', !!b.light);
    [...bgbar.querySelectorAll('.bgdot')].forEach((c) => c.classList.remove('active'));
    dot.classList.add('active');
  };
  bgbar.appendChild(dot);
});

// Arranca en modo claro (fondo por defecto = Claro).
document.body.classList.add('cards-light');
