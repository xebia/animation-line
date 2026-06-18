import { LineField } from '../src/index';
import type { Background, LineFieldOptions } from '../src/index';

type VName = LineFieldOptions['variant'];

const DARK: Background = { type: 'gradient', from: '#06101a', to: '#0a1b2b' };
const BRAND: Background = { type: 'gradient', from: '#0b1f3a', to: '#3a1d5c' };

const P = {
  teal: ['#3fd6a0', '#5ad1ff', '#9b8cff'],
  violet: ['#8be9ff', '#c9a0ff', '#ff9bd6'],
  warm: ['#ffd27a', '#ff8f6b', '#c96bff'],
  cool: ['#7be0c0', '#4aa3ff', '#0d2b4a'],
};

interface Viz { variant: VName; palette: string[]; background: Background; zoom: number; }

type Card =
  | { type: 'split'; label: string; title: string; desc: string; cta: string; viz: Viz }
  | { type: 'stacked'; label: string; title: string; desc: string; cta: string; viz: Viz }
  | { type: 'quote'; quote: string; author: string; viz: Viz }
  | { type: 'stats'; title: string; sub: string; stats: { n: string; l: string }[]; viz: Viz }
  | { type: 'cover'; label: string; title: string; cta: string; viz: Viz };

const CARDS: Card[] = [
  {
    type: 'split', label: 'Article',
    title: 'Designing APIs That Developers Actually Love',
    desc: 'Real-world insights from data mesh implementations.',
    cta: 'Read More',
    viz: { variant: 'malla', palette: P.teal, background: DARK, zoom: 1.8 },
  },
  {
    type: 'quote',
    quote: 'Xebia didn’t sell us a deck. They delivered a governed platform in weeks.',
    author: 'CDO · European Bank',
    viz: { variant: 'entrelazado', palette: P.violet, background: BRAND, zoom: 1.6 },
  },
  {
    type: 'stats',
    title: 'Gemini Enterprise Challenge',
    sub: 'Prepared by Google Cloud for Xebia',
    stats: [
      { n: '63', l: 'Participants' },
      { n: '23', l: 'Skill Badges Earned' },
      { n: '1', l: 'Global Challenge' },
    ],
    viz: { variant: 'pliegues', palette: P.violet, background: BRAND, zoom: 1.5 },
  },
  {
    type: 'stacked', label: 'Article',
    title: 'Scaling Platforms Without Scaling Chaos',
    desc: 'Patterns for governed, self-service infrastructure at enterprise scale.',
    cta: 'Read More',
    viz: { variant: 'cubo', palette: P.cool, background: DARK, zoom: 1.5 },
  },
  {
    type: 'split', label: 'Insight',
    title: 'Linear Oscillations in Brand Systems',
    desc: 'How motion makes invisible systems visible.',
    cta: 'Read More',
    viz: { variant: 'oscilacion', palette: P.teal, background: DARK, zoom: 1.7 },
  },
  {
    type: 'stacked', label: 'Article',
    title: 'Flow, Interference & Emergent Structure',
    desc: 'Generative line fields as a visual language for data in motion.',
    cta: 'Read More',
    viz: { variant: 'flujo', palette: P.warm, background: DARK, zoom: 1.6 },
  },
  {
    type: 'cover', label: 'Report',
    title: 'The State of Platform Engineering',
    cta: 'Read More',
    viz: { variant: 'oscilacion', palette: P.teal, background: DARK, zoom: 2.4 },
  },
  {
    type: 'cover', label: 'Case study',
    title: 'Enterprise AI, in Motion',
    cta: 'Read More',
    viz: { variant: 'interferencia', palette: P.violet, background: BRAND, zoom: 2.4 },
  },
];

// Fondos seleccionables (override global de la animación de todas las cards).
const BACKGROUNDS: { name: string; bg: Background; css: string }[] = [
  { name: 'Oscuro', bg: DARK, css: 'linear-gradient(135deg,#06101a,#0a1b2b)' },
  { name: 'Marca', bg: BRAND, css: 'linear-gradient(135deg,#0b1f3a,#3a1d5c)' },
  { name: 'Negro', bg: { type: 'solid', color: '#000000' }, css: '#000000' },
  { name: 'Claro', bg: { type: 'solid', color: '#eef2f7' }, css: '#eef2f7' },
];

const root = document.getElementById('cards')!;
const fields: LineField[] = [];

function render(card: Card): HTMLElement {
  const el = document.createElement('div');
  if (card.type === 'split') {
    el.innerHTML = `
      <article class="xcard split">
        <div class="text">
          <div class="top"><span class="kicker">${card.label}</span></div>
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
          <div class="top"><span class="kicker">${card.label}</span></div>
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
  } else {
    const tiles = card.stats
      .map((s) => `<div class="tile"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>`)
      .join('');
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

for (const card of CARDS) {
  const node = render(card);
  root.appendChild(node);
  const viz = node.querySelector<HTMLElement>('.viz')!;
  fields.push(new LineField(viz, {
    variant: card.viz.variant,
    palette: card.viz.palette,
    background: card.viz.background,
    zoom: card.viz.zoom,
  }));
}

// Hero al final (animación close-up en la zona de imagen).
const heroViz = document.getElementById('heroviz');
if (heroViz) {
  fields.push(new LineField(heroViz, {
    variant: 'malla',
    palette: ['#5ad1ff', '#9b8cff', '#e05bd0'],
    background: { type: 'gradient', from: '#160a2b', to: '#2a164d' },
    zoom: 1.6,
  }));
}

// Selector de fondo global para las animaciones de las cards.
const bgbar = document.getElementById('cardbg')!;
const blabel = document.createElement('span');
blabel.className = 'blabel';
blabel.textContent = 'Fondo de las animaciones';
bgbar.appendChild(blabel);
BACKGROUNDS.forEach((b) => {
  const dot = document.createElement('span');
  dot.className = 'bgdot';
  dot.title = b.name;
  dot.style.background = b.css;
  dot.onclick = () => {
    fields.forEach((f) => f.setOptions({ background: b.bg }));
    [...bgbar.querySelectorAll('.bgdot')].forEach((c) => c.classList.remove('active'));
    dot.classList.add('active');
  };
  bgbar.appendChild(dot);
});
