// Grid de la página Puntos: todas las variantes del módulo compartido,
// con etiquetas conceptuales de tecnología/datos (Data & AI).
import { POINTS, makeCol, PALETTES, BACKGROUNDS, paintBg } from './points';
import type { PBg } from './points';
import { pointsToSvg } from './svg-points';
import { downloadText, svgButton } from './download';

const LABELS: Record<string, string> = {
  pondas: 'Flujo de datos', pcresta: 'Pico de carga', premolino: 'Turbulencia',
  montanas: 'Series temporales', olas: 'Streaming', datos: 'Métricas vivas',
  adn: 'ADN del dato',
  fusion: 'Integración', pcubo: 'Cubo de datos',
  enjambre: 'Enjambre de agentes', bandada: 'Inteligencia colectiva',
  cardumen: 'Flujo orquestado',
  ripples: 'Propagación', corrientes: 'Corrientes de datos', lluvia: 'Lluvia digital',
  vortices: 'Campos de fuerza', supernova: 'Explosión de datos',
  girasol: 'Crecimiento orgánico', cometas: 'Señales entrantes',
  orbital: 'Átomo de datos', panal: 'Celdas de datos',
  circuito: 'Circuito', espectro: 'Espectro de señal',
  clustering: 'Clustering',
  marea: 'Marea de datos', escaneo: 'Escaneo', warp: 'Hipervelocidad',
  ecos: 'Ecos', ascenso: 'Ascenso',
  textoXebia: 'Xebia · texto en puntos', textoPeople: 'People · texto en puntos',
  textoHuman: 'Human · texto en puntos', textoDataAI: 'Data & AI · texto en puntos',
  textoDataScan: 'Data · escáner', textoGenAI: 'GenAI · descifrado',
};

let PAL = PALETTES[1];
let BG: PBg = BACKGROUNDS[1];
const MOBILE = matchMedia('(max-width: 760px)').matches;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, MOBILE ? 1.5 : 2);

interface Slot { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; fn: typeof POINTS[string]; w: number; h: number; running: boolean; raf: number }
const slots: Slot[] = [];

function fit(s: Slot): void {
  const r = s.cv.getBoundingClientRect(); s.w = r.width; s.h = r.height;
  s.cv.width = r.width * DPR; s.cv.height = r.height * DPR; s.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
function start(s: Slot): void {
  s.running = true; fit(s);
  let last = -999;
  const loop = (t: number) => {
    if (!s.running) return;
    if (!REDUCED) s.raf = requestAnimationFrame(loop); // reduced-motion → un fotograma
    if (MOBILE && !REDUCED && t - last < 33) return;   // móvil → ~30fps
    last = t;
    paintBg(s.ctx, s.w, s.h, BG);
    s.fn(s.ctx, s.w, s.h, t * 0.55, makeCol(PAL));
  };
  s.raf = requestAnimationFrame(loop);
}
function stop(s: Slot): void { s.running = false; if (s.raf) cancelAnimationFrame(s.raf); }

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    const s = slots.find((x) => x.cv === e.target);
    if (!s) continue;
    if (e.isIntersecting && !s.running) start(s);
    else if (!e.isIntersecting && s.running) stop(s);
  }
}, { rootMargin: '250px' });

const grid = document.getElementById('grid')!;
Object.keys(POINTS).forEach((name) => {
  const card = document.createElement('div'); card.className = 'card';
  const cv = document.createElement('canvas');
  const lb = document.createElement('span'); lb.className = 'label'; lb.textContent = LABELS[name] ?? name;
  // SVG: se vuelve a ejecutar la animación sobre un contexto que anota lo que dibuja,
  // en el mismo instante que se está viendo, y se vuelca a vectores.
  const dl = svgButton(() => {
    const r = cv.getBoundingClientRect();
    const W = Math.round(r.width), H = Math.round(r.height);
    const svg = pointsToSvg(POINTS[name], W, H, performance.now() * 0.55, makeCol(PAL), BG);
    downloadText(`${name}.svg`, svg);
  });
  card.append(cv, lb, dl); grid.appendChild(card);
  const slot: Slot = { cv, ctx: cv.getContext('2d')!, fn: POINTS[name], w: 1, h: 1, running: false, raf: 0 };
  slots.push(slot);
  io.observe(cv);
});

const palEl = document.getElementById('pal')!;
PALETTES.forEach((p, idx) => {
  const d = document.createElement('span'); d.className = 'swat' + (idx === 1 ? ' active' : '');
  d.style.background = 'linear-gradient(135deg,' + p.join(',') + ')';
  d.onclick = () => { PAL = p; [...palEl.children].forEach((c) => c.classList.remove('active')); d.classList.add('active'); };
  palEl.appendChild(d);
});
const bgEl = document.getElementById('backgrounds')!;
BACKGROUNDS.forEach((b, idx) => {
  const d = document.createElement('span'); d.className = 'swat sq' + (idx === 1 ? ' active' : '');
  d.title = b.name; d.style.background = b.css;
  d.onclick = () => { BG = b; [...bgEl.children].forEach((c) => c.classList.remove('active')); d.classList.add('active'); };
  bgEl.appendChild(d);
});

addEventListener('resize', () => { slots.forEach((s) => { if (s.running) fit(s); }); });
