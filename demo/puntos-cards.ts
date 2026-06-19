import { POINTS, makeCol, PALETTES, BACKGROUNDS, paintBg } from './points';
import type { PBg, Col } from './points';

let PAL = PALETTES[1];
let BG: PBg = BACKGROUNDS[1];
let col: Col = makeCol(PAL);

interface Viz { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; fn: (c: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) => void; w: number; h: number; vis: boolean; zoom: number; }
const vizzes: Viz[] = [];
const DPR = Math.min(devicePixelRatio || 1, 2);

function addViz(host: HTMLElement, key: string, zoom: number): Viz {
  const cv = document.createElement('canvas');
  host.appendChild(cv);
  const viz: Viz = { cv, ctx: cv.getContext('2d')!, fn: POINTS[key], w: 1, h: 1, vis: true, zoom };
  vizzes.push(viz);
  // control de zoom
  let z = zoom;
  const ctl = document.createElement('div'); ctl.className = 'zoomctl';
  const minus = document.createElement('button'); minus.textContent = '−';
  const val = document.createElement('span');
  const plus = document.createElement('button'); plus.textContent = '+';
  const fmt = () => { val.textContent = `${z.toFixed(1)}×`; };
  minus.onclick = () => { z = Math.max(1, Math.round((z - 0.2) * 10) / 10); viz.zoom = z; fmt(); };
  plus.onclick = () => { z = Math.min(6, Math.round((z + 0.2) * 10) / 10); viz.zoom = z; fmt(); };
  fmt(); ctl.append(minus, val, plus); host.appendChild(ctl);
  return viz;
}

const cardsRoot = document.getElementById('cards')!;
function card(html: string, key: string, zoom = 1): void {
  const wrap = document.createElement('div'); wrap.innerHTML = html;
  const el = wrap.firstElementChild as HTMLElement; cardsRoot.appendChild(el);
  addViz(el.querySelector<HTMLElement>('.viz')!, key, zoom);
}
card(`<article class="xcard cover"><div class="viz"></div><div class="overlay"><div class="top"><span class="kicker">Report</span></div><div class="foot"><h2>Live data, in motion</h2></div></div></article>`, 'datos', 1);
card(`<article class="xcard cover"><div class="viz"></div><div class="overlay"><div class="top"><span class="kicker">AI</span></div><div class="foot"><h2>Neural networks at work</h2></div></div></article>`, 'neural', 1);
card(`<article class="xcard split"><div class="text"><div class="top"><span class="kicker">Insight</span></div><h2>Particle fields of data</h2></div><div class="accent"></div><div class="viz"></div></article>`, 'pondas', 1);
card(`<article class="xcard cover"><div class="viz"></div><div class="overlay"><div class="top"><span class="kicker">Wave</span></div><div class="foot"><h2>Crest</h2></div></div></article>`, 'pcresta', 1);
card(`<article class="xcard cover minimal"><div class="viz"></div><div class="overlay"><div class="top"></div><div class="foot"><h2>Swirl</h2></div></div></article>`, 'premolino', 1);
card(`<article class="xcard statscard"><div class="text"><span class="kicker">By the numbers</span><h2>Data &amp; AI</h2><p class="sub">Generative point systems</p></div><div class="viz statsviz"><div class="tiles"><div class="tile"><div class="n">2.4M</div><div class="l">Events / s</div></div><div class="tile"><div class="n">∞</div><div class="l">Datapoints</div></div><div class="tile"><div class="n">60</div><div class="l">FPS</div></div></div></div></article>`, 'datos', 1);
card(`<article class="xcard cover"><div class="viz"></div><div class="overlay"><div class="top"><span class="kicker">Form</span></div><div class="foot"><h2>Fusion</h2></div></div></article>`, 'fusion', 1.6);
card(`<article class="xcard cover minimal"><div class="viz"></div><div class="overlay"><div class="top"></div><div class="foot"><h2>Sphere</h2></div></div></article>`, 'esfera', 1.6);
card(`<article class="xcard cover"><div class="viz"></div><div class="overlay"><div class="top"><span class="kicker">3D</span></div><div class="foot"><h2>Torus</h2></div></div></article>`, 'ptoro', 1.6);
card(`<article class="xcard cover minimal"><div class="viz"></div><div class="overlay"><div class="top"></div><div class="foot"><h2>Lattice</h2></div></div></article>`, 'pcubo', 1.6);
card(`<article class="xcard cover wide"><div class="viz"></div><div class="overlay"><div class="top"><span class="kicker">Showreel</span></div><div class="foot"><h2>A point system for data storytelling</h2></div></div></article>`, 'pondas', 1);

const heroesRoot = document.getElementById('heroes')!;
function hero(label: string, html: string, vs: { sel: string; key: string; zoom: number }[]): void {
  const sec = document.createElement('div'); sec.innerHTML = `<div class="hlabel">${label}</div>${html}`;
  heroesRoot.appendChild(sec);
  vs.forEach((v) => addViz(sec.querySelector<HTMLElement>(v.sel)!, v.key, v.zoom));
}
hero('Hero · banner (red neuronal)', `<div class="h-banner"><div class="viz" data-h="1"></div><div class="overlay"><h2>Intelligence, visualized</h2><div class="sub">Neural activation across the network</div></div></div>`, [{ sel: '[data-h="1"]', key: 'neural', zoom: 1 }]);
hero('Hero · split + stats (datos)', `<div class="h-split"><div class="viz" data-h="2"></div><div class="panel"><div class="block purple"><div class="stat">2.4M</div><div class="sub">events processed per second</div></div><div class="block light"><div class="stat">99.9%</div><div class="sub">uptime across regions</div></div></div></div>`, [{ sel: '[data-h="2"]', key: 'datos', zoom: 1 }]);
hero('Hero · banner (onda partículas)', `<div class="h-banner"><div class="viz" data-h="3"></div><div class="overlay"><h2>Systems in motion</h2><div class="sub">Particle fields for data storytelling</div></div></div>`, [{ sel: '[data-h="3"]', key: 'pondas', zoom: 1 }]);
hero('Hero · duo (fusión · esfera)', `<div class="h-duo"><div class="half"><div class="viz" data-h="4a"></div><div class="lab">Fusion</div></div><div class="half"><div class="viz" data-h="4b"></div><div class="lab">Sphere</div></div></div>`, [{ sel: '[data-h="4a"]', key: 'fusion', zoom: 1.6 }, { sel: '[data-h="4b"]', key: 'esfera', zoom: 1.6 }]);
hero('Hero · duo (toro · cubo)', `<div class="h-duo"><div class="half"><div class="viz" data-h="5a"></div><div class="lab">Torus</div></div><div class="half"><div class="viz" data-h="5b"></div><div class="lab">Lattice</div></div></div>`, [{ sel: '[data-h="5a"]', key: 'ptoro', zoom: 1.6 }, { sel: '[data-h="5b"]', key: 'pcubo', zoom: 1.6 }]);

function fit(): void { for (const v of vizzes) { const r = v.cv.getBoundingClientRect(); v.w = r.width; v.h = r.height; v.cv.width = r.width * DPR; v.cv.height = r.height * DPR; v.ctx.setTransform(DPR, 0, 0, DPR, 0, 0); } }
addEventListener('resize', fit);
const vio = new IntersectionObserver((es) => es.forEach((e) => { const v = vizzes.find((x) => x.cv === e.target); if (v) v.vis = e.isIntersecting; }), { rootMargin: '300px' });
vizzes.forEach((v) => vio.observe(v.cv));
function frame(t: number): void {
  const ts = t * 0.55;
  for (const v of vizzes) {
    if (!v.vis) continue;
    const ctx = v.ctx;
    paintBg(ctx, v.w, v.h, BG);
    if (v.zoom !== 1) { ctx.save(); ctx.translate(v.w / 2, v.h / 2); ctx.scale(v.zoom, v.zoom); ctx.translate(-v.w / 2, -v.h / 2); }
    v.fn(ctx, v.w, v.h, ts, col);
    if (v.zoom !== 1) ctx.restore();
  }
  requestAnimationFrame(frame);
}

function applyLight(): void { document.body.classList.toggle('cards-light', !!BG.light); }
const palEl = document.getElementById('pal')!;
PALETTES.forEach((p, idx) => { const d = document.createElement('span'); d.className = 'swat' + (idx === 1 ? ' active' : ''); d.style.background = 'linear-gradient(135deg,' + p.join(',') + ')'; d.onclick = () => { PAL = p; col = makeCol(p); [...palEl.children].forEach((c) => c.classList.remove('active')); d.classList.add('active'); }; palEl.appendChild(d); });
const bgsEl = document.getElementById('bgs')!;
BACKGROUNDS.forEach((b, idx) => { const d = document.createElement('span'); d.className = 'swat sq' + (idx === 1 ? ' active' : ''); d.title = b.name; d.style.background = b.css; d.onclick = () => { BG = b; applyLight(); [...bgsEl.children].forEach((c) => c.classList.remove('active')); d.classList.add('active'); }; bgsEl.appendChild(d); });

fit(); applyLight(); requestAnimationFrame(frame);
