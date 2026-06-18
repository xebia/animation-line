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

interface Viz { variant: VName; palette: string[]; background: Background; }

type Card =
  | { type: 'split'; label: string; title: string; desc: string; cta: string; viz: Viz }
  | { type: 'stacked'; label: string; title: string; desc: string; cta: string; viz: Viz }
  | { type: 'quote'; quote: string; author: string; viz: Viz }
  | { type: 'stats'; title: string; sub: string; stats: { n: string; l: string }[]; viz: Viz };

const CARDS: Card[] = [
  {
    type: 'split', label: 'Article',
    title: 'Designing APIs That Developers Actually Love',
    desc: 'Real-world insights from data mesh implementations.',
    cta: 'Read More',
    viz: { variant: 'malla', palette: P.teal, background: DARK },
  },
  {
    type: 'quote',
    quote: 'Xebia didn’t sell us a deck. They delivered a governed platform in weeks.',
    author: 'CDO · European Bank',
    viz: { variant: 'entrelazado', palette: P.violet, background: BRAND },
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
    viz: { variant: 'pliegues', palette: P.violet, background: BRAND },
  },
  {
    type: 'stacked', label: 'Article',
    title: 'Scaling Platforms Without Scaling Chaos',
    desc: 'Patterns for governed, self-service infrastructure at enterprise scale.',
    cta: 'Read More',
    viz: { variant: 'cubo', palette: P.cool, background: DARK },
  },
  {
    type: 'split', label: 'Insight',
    title: 'Linear Oscillations in Brand Systems',
    desc: 'How motion makes invisible systems visible.',
    cta: 'Read More',
    viz: { variant: 'oscilacion', palette: P.teal, background: DARK },
  },
  {
    type: 'stacked', label: 'Article',
    title: 'Flow, Interference & Emergent Structure',
    desc: 'Generative line fields as a visual language for data in motion.',
    cta: 'Read More',
    viz: { variant: 'flujo', palette: P.warm, background: DARK },
  },
];

const root = document.getElementById('cards')!;

function logo(): string {
  return '<span class="brand"><b>X</b>ebia</span>';
}

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
          <div class="top">${logo()}</div>
          <h2>${card.quote}</h2>
          <div class="bottom"><p class="author">${card.author}</p></div>
        </div>
        <div class="accent"></div>
        <div class="viz"></div>
      </article>`;
  } else {
    const tiles = card.stats
      .map((s) => `<div class="tile"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>`)
      .join('');
    el.innerHTML = `
      <article class="xcard statscard">
        <div class="text">
          <div class="top"><span class="kicker">Case study</span>${logo()}</div>
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
  new LineField(viz, {
    variant: card.viz.variant,
    palette: card.viz.palette,
    background: card.viz.background,
  });
}
