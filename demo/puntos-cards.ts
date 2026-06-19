import { POINTS, makeCol, PALETTES, BACKGROUNDS, paintBg } from './points';
import type { PBg, Col } from './points';

const P = {
  teal: ['#3fd6a0', '#5ad1ff', '#9b8cff'],
  violet: ['#8be9ff', '#c9a0ff', '#ff9bd6'],
  warm: ['#ffd27a', '#ff8f6b', '#c96bff'],
  cool: ['#7be0c0', '#4aa3ff', '#0d2b4a'],
};

// Mapa: la variante de línea de cada card → animación de puntos equivalente
const L2P: Record<string, string> = {
  malla: 'pondas', entrelazado: 'olas', pliegues: 'montanas', cubo: 'pcubo', oscilacion: 'fusion',
  flujo: 'pondas', interferencia: 'premolino', rejilla: 'datos', espiral: 'ptoro', tubo: 'ptoro',
  cono: 'fusion', cinta: 'pcresta', helice: 'esfera', embudo: 'fusion', duna: 'montanas',
  quilla: 'pcresta', helicoide: 'neural', voluta: 'premolino', celosia: 'datos',
};
const KEY_ZOOM: Record<string, number> = { fusion: 1.6, esfera: 1.6, ptoro: 1.6, pcubo: 1.6 };

interface Viz { variant: string; palette: string[]; }
type Card =
  | { type: 'split'; label: string; title: string; desc: string; cta: string; viz: Viz }
  | { type: 'stacked'; label: string; title: string; desc: string; cta: string; viz: Viz }
  | { type: 'quote'; quote: string; author: string; viz: Viz }
  | { type: 'stats'; title: string; sub: string; stats: { n: string; l: string }[]; viz: Viz }
  | { type: 'cover'; label: string; title: string; cta: string; viz: Viz }
  | { type: 'coverMinimal'; title: string; viz: Viz }
  | { type: 'wide'; label: string; title: string; cta: string; viz: Viz };

const CARDS: Card[] = [
  { type: 'split', label: 'Article', title: 'Designing APIs That Developers Actually Love', desc: 'Real-world insights from data mesh implementations.', cta: 'Read More', viz: { variant: 'malla', palette: P.teal } },
  { type: 'quote', quote: 'Xebia didn’t sell us a deck. They delivered a governed platform in weeks.', author: 'CDO · European Bank', viz: { variant: 'entrelazado', palette: P.violet } },
  { type: 'stats', title: 'Gemini Enterprise Challenge', sub: 'Prepared by Google Cloud for Xebia', stats: [{ n: '63', l: 'Participants' }, { n: '23', l: 'Skill Badges Earned' }, { n: '1', l: 'Global Challenge' }], viz: { variant: 'pliegues', palette: P.violet } },
  { type: 'stacked', label: 'Article', title: 'Scaling Platforms Without Scaling Chaos', desc: 'Patterns for governed, self-service infrastructure at enterprise scale.', cta: 'Read More', viz: { variant: 'cubo', palette: P.cool } },
  { type: 'split', label: 'Insight', title: 'Linear Oscillations in Brand Systems', desc: 'How motion makes invisible systems visible.', cta: 'Read More', viz: { variant: 'oscilacion', palette: P.teal } },
  { type: 'stacked', label: 'Article', title: 'Flow, Interference & Emergent Structure', desc: 'Generative point fields as a visual language for data in motion.', cta: 'Read More', viz: { variant: 'flujo', palette: P.warm } },
  { type: 'cover', label: 'Report', title: 'The State of Platform Engineering', cta: 'Read More', viz: { variant: 'oscilacion', palette: P.teal } },
  { type: 'cover', label: 'Case study', title: 'Enterprise AI, in Motion', cta: 'Read More', viz: { variant: 'interferencia', palette: P.violet } },
  { type: 'coverMinimal', title: 'Structure', viz: { variant: 'rejilla', palette: P.cool } },
  { type: 'coverMinimal', title: 'Symmetry', viz: { variant: 'espiral', palette: P.violet } },
  { type: 'cover', label: 'Motion', title: 'Rolled & Gathered', cta: 'Read More', viz: { variant: 'tubo', palette: P.teal } },
  { type: 'coverMinimal', title: 'Cone', viz: { variant: 'cono', palette: P.violet } },
  { type: 'split', label: 'Insight', title: 'Twisting Ribbons of Data', desc: 'A field that gathers and fuses as it turns.', cta: 'Read More', viz: { variant: 'cinta', palette: P.warm } },
  { type: 'stacked', label: 'Article', title: 'Helical Systems', desc: 'Coiled point fields with travelling pinches.', cta: 'Read More', viz: { variant: 'helice', palette: P.cool } },
  { type: 'cover', label: 'Case study', title: 'Into the Funnel', cta: 'Read More', viz: { variant: 'embudo', palette: P.violet } },
  { type: 'coverMinimal', title: 'Dune', viz: { variant: 'duna', palette: P.teal } },
  { type: 'wide', label: 'Showreel', title: 'A generative point system for the Xebia brand', cta: 'Explore', viz: { variant: 'embudo', palette: P.violet } },
  { type: 'cover', label: 'Form', title: 'Fusion', cta: 'Read More', viz: { variant: 'quilla', palette: P.teal } },
  { type: 'coverMinimal', title: 'Neural', viz: { variant: 'helicoide', palette: P.violet } },
  { type: 'split', label: 'Insight', title: 'Scrolls & Volutes', desc: 'Curling point systems for motion design.', cta: 'Read More', viz: { variant: 'voluta', palette: P.warm } },
  { type: 'stacked', label: 'Article', title: 'Woven Lattices', desc: 'Shearing fields that recompose continuously.', cta: 'Read More', viz: { variant: 'celosia', palette: P.violet } },
  { type: 'stats', title: 'By the numbers', sub: 'Generative point-system metrics', stats: [{ n: '2.4M', l: 'Events / s' }, { n: '∞', l: 'Datapoints' }, { n: '60', l: 'FPS' }], viz: { variant: 'cono', palette: P.cool } },
  { type: 'wide', label: 'Lab', title: 'Data & AI, in motion', cta: 'Explore', viz: { variant: 'helicoide', palette: P.teal } },
];

// ---- motor de puntos (Canvas) ----
let curBg: PBg = BACKGROUNDS[3]; // Claro por defecto
interface Slot { ctx: CanvasRenderingContext2D; cv: HTMLCanvasElement; fn: (c: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) => void; palette: string[]; zoom: number; w: number; h: number; vis: boolean; }
const slots: Slot[] = [];
const DPR = Math.min(devicePixelRatio || 1, 2);

function mount(viz: HTMLElement, variant: string, palette: string[]): void {
  const key = L2P[variant] ?? 'pondas';
  const cv = document.createElement('canvas');
  viz.appendChild(cv);
  const slot: Slot = { ctx: cv.getContext('2d')!, cv, fn: POINTS[key], palette, zoom: KEY_ZOOM[key] ?? 1, w: 1, h: 1, vis: true };
  slots.push(slot);
  // control de zoom
  let z = slot.zoom;
  const ctl = document.createElement('div'); ctl.className = 'zoomctl';
  const minus = document.createElement('button'); minus.textContent = '−';
  const val = document.createElement('span');
  const plus = document.createElement('button'); plus.textContent = '+';
  const fmt = () => { val.textContent = `${z.toFixed(1)}×`; };
  minus.onclick = () => { z = Math.max(1, Math.round((z - 0.2) * 10) / 10); slot.zoom = z; fmt(); };
  plus.onclick = () => { z = Math.min(6, Math.round((z + 0.2) * 10) / 10); slot.zoom = z; fmt(); };
  fmt(); ctl.append(minus, val, plus); viz.appendChild(ctl);
}

function render(card: Card): HTMLElement {
  const el = document.createElement('div');
  if (card.type === 'split') el.innerHTML = `<article class="xcard split"><div class="text"><div class="top"><span class="kicker">${card.label}</span></div><h2>${card.title}</h2><div class="bottom"><p class="desc">${card.desc}</p><button class="pill">${card.cta}</button></div></div><div class="accent"></div><div class="viz"></div></article>`;
  else if (card.type === 'stacked') el.innerHTML = `<article class="xcard stacked"><div class="text"><div class="top"><span class="kicker">${card.label}</span></div><h2>${card.title}</h2><p class="desc">${card.desc}</p></div><div class="viz"></div><button class="pill float">${card.cta}</button></article>`;
  else if (card.type === 'quote') el.innerHTML = `<article class="xcard quote"><div class="text"><h2>${card.quote}</h2><div class="bottom"><p class="author">${card.author}</p></div></div><div class="accent"></div><div class="viz"></div></article>`;
  else if (card.type === 'cover') el.innerHTML = `<article class="xcard cover"><div class="viz"></div><div class="overlay"><div class="top"><span class="kicker">${card.label}</span></div><div class="foot"><h2>${card.title}</h2><button class="pill light">${card.cta}</button></div></div></article>`;
  else if (card.type === 'coverMinimal') el.innerHTML = `<article class="xcard cover minimal"><div class="viz"></div><div class="overlay"><div class="top"></div><div class="foot"><h2>${card.title}</h2></div></div></article>`;
  else if (card.type === 'wide') el.innerHTML = `<article class="xcard cover wide"><div class="viz"></div><div class="overlay"><div class="top"><span class="kicker">${card.label}</span></div><div class="foot"><h2>${card.title}</h2><button class="pill light">${card.cta}</button></div></div></article>`;
  else { const tiles = card.stats.map((s) => `<div class="tile"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>`).join(''); el.innerHTML = `<article class="xcard statscard"><div class="text"><div class="top"><span class="kicker">Case study</span></div><h2>${card.title}</h2><p class="sub">${card.sub}</p></div><div class="viz statsviz"><div class="tiles">${tiles}</div></div></article>`; }
  return el.firstElementChild as HTMLElement;
}

const root = document.getElementById('cards')!;
for (const card of CARDS) { const node = render(card); root.appendChild(node); mount(node.querySelector<HTMLElement>('.viz')!, card.viz.variant, card.viz.palette); }

// ===== Heroes (mismos layouts que cards de líneas) =====
const heroesRoot = document.getElementById('heroes')!;
function heroSection(label: string, html: string): HTMLElement { const sec = document.createElement('div'); sec.className = 'hero-sec'; sec.innerHTML = `<div class="hlabel">${label}</div>${html}`; heroesRoot.appendChild(sec); return sec; }

let hs = heroSection('Hero 1 · split + stats', `<div class="h-split"><div class="viz" data-h="1"></div><div class="panel"><div class="block purple"><div class="stat">900+</div><div class="sub">A structured view of where enterprise AI is heading</div></div><div class="block light"><div class="stat">54</div><div class="sub">A structured view of where enterprise AI is heading</div></div></div></div>`);
mount(hs.querySelector('[data-h="1"]')!, 'malla', P.violet);
hs = heroSection('Hero 2 · banner full-width', `<div class="h-banner"><div class="viz" data-h="2"></div><div class="overlay"><h2>Systems in motion, made visible</h2><div class="sub">Generative point fields for enterprise storytelling</div></div></div>`);
mount(hs.querySelector('[data-h="2"]')!, 'flujo', P.teal);
hs = heroSection('Hero 3 · centrado', `<div class="h-centered"><div class="viz" data-h="3"></div><div class="overlay"><h2>Where enterprise AI is heading</h2><div class="sub">A structured, governed view — delivered in weeks, not quarters.</div></div></div>`);
mount(hs.querySelector('[data-h="3"]')!, 'oscilacion', P.teal);
hs = heroSection('Hero 4 · texto + animación', `<div class="h-textleft"><div class="text"><span class="kicker">Platform</span><h2>Governed AI, delivered in weeks</h2></div><div class="viz" data-h="4"></div></div>`);
mount(hs.querySelector('[data-h="4"]')!, 'entrelazado', P.violet);
hs = heroSection('Hero 5 · stat cover', `<div class="h-statcover"><div class="viz" data-h="5"></div><div class="overlay"><div class="stat">12k+</div><div class="sub">models in production across regulated industries</div></div></div>`);
mount(hs.querySelector('[data-h="5"]')!, 'cubo', P.cool);
hs = heroSection('Hero 6 · duo', `<div class="h-duo"><div class="half"><div class="viz" data-h="6a"></div><div class="lab">Interference</div></div><div class="half"><div class="viz" data-h="6b"></div><div class="lab">Folds</div></div></div>`);
mount(hs.querySelector('[data-h="6a"]')!, 'interferencia', P.violet); mount(hs.querySelector('[data-h="6b"]')!, 'pliegues', P.warm);
hs = heroSection('Hero 7 · banner', `<div class="h-banner"><div class="viz" data-h="7"></div><div class="overlay"><h2>Data, gathered and fused</h2><div class="sub">Point fields that fold and fuse with themselves</div></div></div>`);
mount(hs.querySelector('[data-h="7"]')!, 'tubo', P.teal);
hs = heroSection('Hero 8 · centrado', `<div class="h-centered"><div class="viz" data-h="8"></div><div class="overlay"><h2>Everything flows to one point</h2><div class="sub">A vortex of governed, structured intelligence.</div></div></div>`);
mount(hs.querySelector('[data-h="8"]')!, 'embudo', P.violet);
hs = heroSection('Hero 9 · stat cover', `<div class="h-statcover"><div class="viz" data-h="9"></div><div class="overlay"><div class="stat">3.2×</div><div class="sub">faster delivery with composable platforms</div></div></div>`);
mount(hs.querySelector('[data-h="9"]')!, 'helice', P.cool);
hs = heroSection('Hero 10 · duo', `<div class="h-duo"><div class="half"><div class="viz" data-h="10a"></div><div class="lab">Ribbon</div></div><div class="half"><div class="viz" data-h="10b"></div><div class="lab">Dune</div></div></div>`);
mount(hs.querySelector('[data-h="10a"]')!, 'cinta', P.warm); mount(hs.querySelector('[data-h="10b"]')!, 'duna', P.teal);
hs = heroSection('Hero 11 · tríptico', `<div class="h-tript"><div class="col"><div class="viz" data-h="11a"></div></div><div class="col"><div class="viz" data-h="11b"></div></div><div class="col"><div class="viz" data-h="11c"></div></div><div class="titleband"><h2>A visual language for systems in motion</h2><div class="sub">Fusion · Neural · Swirl</div></div></div>`);
mount(hs.querySelector('[data-h="11a"]')!, 'quilla', P.teal); mount(hs.querySelector('[data-h="11b"]')!, 'helicoide', P.violet); mount(hs.querySelector('[data-h="11c"]')!, 'voluta', P.cool);
hs = heroSection('Hero 12 · banner (red neuronal)', `<div class="h-banner"><div class="viz" data-h="12"></div><div class="overlay"><h2>Intelligence, visualized</h2><div class="sub">Neural activation across the network</div></div></div>`);
mount(hs.querySelector('[data-h="12"]')!, 'helicoide', P.violet);
hs = heroSection('Hero 13 · split + stats', `<div class="h-split"><div class="viz" data-h="13"></div><div class="panel"><div class="block purple"><div class="stat">28+</div><div class="sub">enterprise platforms shipped this year</div></div><div class="block light"><div class="stat">9</div><div class="sub">countries, one governed architecture</div></div></div></div>`);
mount(hs.querySelector('[data-h="13"]')!, 'quilla', P.teal);
hs = heroSection('Hero 14 · stat cover', `<div class="h-statcover"><div class="viz" data-h="14"></div><div class="overlay"><div class="stat">∞</div><div class="sub">composable building blocks, endlessly recombined</div></div></div>`);
mount(hs.querySelector('[data-h="14"]')!, 'voluta', P.warm);
hs = heroSection('Hero 15 · banner', `<div class="h-banner"><div class="viz" data-h="15"></div><div class="overlay"><h2>Layered, woven, in motion</h2><div class="sub">Generative point systems for the Xebia brand</div></div></div>`);
mount(hs.querySelector('[data-h="15"]')!, 'celosia', P.violet);

// ---- loop + selectores ----
function fit(): void { for (const s of slots) { const r = s.cv.getBoundingClientRect(); s.w = r.width; s.h = r.height; s.cv.width = r.width * DPR; s.cv.height = r.height * DPR; s.ctx.setTransform(DPR, 0, 0, DPR, 0, 0); } }
addEventListener('resize', fit);
const vio = new IntersectionObserver((es) => es.forEach((e) => { const s = slots.find((x) => x.cv === e.target); if (s) s.vis = e.isIntersecting; }), { rootMargin: '300px' });
slots.forEach((s) => vio.observe(s.cv));
function frame(t: number): void {
  const ts = t * 0.55;
  for (const s of slots) {
    if (!s.vis) continue;
    const ctx = s.ctx;
    paintBg(ctx, s.w, s.h, curBg);
    const col = makeCol(s.palette);
    if (s.zoom !== 1) { ctx.save(); ctx.translate(s.w / 2, s.h / 2); ctx.scale(s.zoom, s.zoom); ctx.translate(-s.w / 2, -s.h / 2); }
    s.fn(ctx, s.w, s.h, ts, col);
    if (s.zoom !== 1) ctx.restore();
  }
  requestAnimationFrame(frame);
}

const palbar = document.getElementById('cardpal')!;
PALETTES.forEach((p) => { const d = document.createElement('span'); d.className = 'pdot'; d.style.background = 'linear-gradient(135deg,' + p.join(',') + ')'; d.onclick = () => { slots.forEach((s) => { s.palette = p; }); [...palbar.children].forEach((c) => c.classList.remove('active')); d.classList.add('active'); }; palbar.appendChild(d); });
const bgbar = document.getElementById('cardbg')!;
BACKGROUNDS.forEach((b) => { const d = document.createElement('span'); d.className = 'bgdot' + (b.name === 'Claro' ? ' active' : ''); d.title = b.name; d.style.background = b.css; d.onclick = () => { curBg = b; document.body.classList.toggle('cards-light', !!b.light); [...bgbar.querySelectorAll('.bgdot')].forEach((c) => c.classList.remove('active')); d.classList.add('active'); }; bgbar.appendChild(d); });

document.body.classList.add('cards-light');
fit(); requestAnimationFrame(frame);
