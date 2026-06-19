// Animaciones de puntos (Canvas 2D) reutilizables en grid y en cards/heroes.
export type Col = (s: number) => string;
export interface PointVariant { name: string; fn: (ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) => void; }

export const PALETTES = [
  ['#3fd6a0', '#5ad1ff', '#9b8cff'],
  ['#ff9bc4', '#b18cff', '#5ad1ff'],
  ['#ffd27a', '#ff8f6b', '#c96bff'],
  ['#7be0c0', '#4aa3ff', '#0d2b4a'],
  ['#a0f0c8', '#ffe08a', '#ff8f6b'],
  ['#8be9ff', '#c9a0ff', '#ff9bd6'],
];
export interface PBg { name: string; from?: string; to?: string; solid?: string; css: string; light?: boolean; }
export const BACKGROUNDS: PBg[] = [
  { name: 'Oscuro', from: '#06101a', to: '#0a1b2b', css: 'linear-gradient(135deg,#06101a,#0a1b2b)' },
  { name: 'Marca', from: '#0b1f3a', to: '#3a1d5c', css: 'linear-gradient(135deg,#0b1f3a,#3a1d5c)' },
  { name: 'Negro', solid: '#000000', css: '#000000' },
  { name: 'Claro', solid: '#f3ecf6', css: '#f3ecf6', light: true },
  { name: 'Lavanda', from: '#eef0ff', to: '#dfeaff', css: 'linear-gradient(135deg,#eef0ff,#dfeaff)', light: true },
];

function mix(c1: string, c2: string, t: number): string {
  const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
  const r = (s: number) => Math.round(((a >> s) & 255) + ((((b >> s) & 255) - ((a >> s) & 255)) * t));
  return `rgb(${r(16)},${r(8)},${r(0)})`;
}
export function makeCol(pal: string[]): Col {
  return (t: number) => { t = Math.max(0, Math.min(1, t)); const s = t * (pal.length - 1), i = Math.min(Math.floor(s), pal.length - 2); return mix(pal[i], pal[i + 1], s - i); };
}
export function paintBg(ctx: CanvasRenderingContext2D, W: number, H: number, bg: PBg): void {
  if (bg.solid) { ctx.fillStyle = bg.solid; } else { const g = ctx.createLinearGradient(0, H, W, 0); g.addColorStop(0, bg.from!); g.addColorStop(1, bg.to!); ctx.fillStyle = g; }
  ctx.fillRect(0, 0, W, H);
}
function P3(x: number, y: number, z: number, ry: number, rx: number, S: number, W: number, H: number) {
  const x1 = x * Math.cos(ry) - z * Math.sin(ry), z1 = x * Math.sin(ry) + z * Math.cos(ry);
  const y1 = y * Math.cos(rx) - z1 * Math.sin(rx), z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
  const sc = 4.2 / (4.2 + z2);
  return { X: W / 2 + x1 * S * sc, Y: H / 2 + y1 * S * sc, sc };
}
const SPH: { x: number; y: number; z: number }[] = (() => { const n = 420, a: { x: number; y: number; z: number }[] = []; for (let i = 0; i < n; i++) { const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963; a.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r }); } return a; })();

function pondas(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.82, rx = 0.7, gx = 124, gz = 60; for (let j = gz - 1; j >= 0; j--) { const z = (j / (gz - 1) - 0.5) * 3.6; for (let i = 0; i < gx; i++) { const un = i / (gx - 1), gx2 = un + 0.07 * Math.sin(un * 18 - t * 0.0009), x = (gx2 - 0.5) * 4.4; const y = 0.5 * Math.sin(x * 1.3 + z * 1.1 - t * 0.0009) + 0.25 * Math.sin(x * 2.6 - t * 0.0005) + 0.15 * Math.sin(z * 2 + t * 0.0006); const p = P3(x, y, z, 0, rx, S, W, H); ctx.fillStyle = col(un); ctx.globalAlpha = 0.2 + 0.65 * p.sc; ctx.beginPath(); ctx.arc(p.X, p.Y, 0.9 * p.sc + 0.4, 0, 6.283); ctx.fill(); } } ctx.globalAlpha = 1; }
function montanas(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.82, rx = 0.6, gx = 120, gz = 52; for (let j = gz - 1; j >= 0; j--) { const z = (j / (gz - 1) - 0.5) * 3.6; for (let i = 0; i < gx; i++) { const un = i / (gx - 1), x = (un - 0.5) * 4.4; const ridge = Math.abs(Math.sin(x * 1 + 0.4 * Math.sin(z * 0.8))); const y = 0.7 * ridge - 0.15 + 0.18 * Math.sin(x * 0.5 + z * 0.7 - t * 0.0006); const p = P3(x, y, z, 0, rx, S, W, H); ctx.fillStyle = col(un); ctx.globalAlpha = 0.2 + 0.65 * p.sc; ctx.beginPath(); ctx.arc(p.X, p.Y, 0.9 * p.sc + 0.4, 0, 6.283); ctx.fill(); } } ctx.globalAlpha = 1; }
function olas(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.8, rx = 0.58, gx = 120, gz = 54; for (let j = gz - 1; j >= 0; j--) { const z = (j / (gz - 1) - 0.5) * 3.6; for (let i = 0; i < gx; i++) { const un = i / (gx - 1), x = (un - 0.5) * 4.4; const y = 0.3 * Math.sin(x * 1.3 - t * 0.0009) + 0.22 * Math.sin(z * 1.5 - t * 0.0007) + 0.13 * Math.sin((x + z) * 2 - t * 0.0005); const p = P3(x, y, z, 0, rx, S, W, H); ctx.fillStyle = col(un); ctx.globalAlpha = 0.2 + 0.65 * p.sc; ctx.beginPath(); ctx.arc(p.X, p.Y, 0.9 * p.sc + 0.4, 0, 6.283); ctx.fill(); } } ctx.globalAlpha = 1; }
function datos(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const gx = 46, gy = 30; for (let i = 0; i < gx; i++) for (let j = 0; j < gy; j++) { const x = (i + 0.5) / gx * W, y = (j + 0.5) / gy * H; let v = 0.5 + 0.5 * Math.sin(i * 0.55 - t * 0.0012) * Math.cos(j * 0.7 + t * 0.0009); v = Math.pow(Math.max(0, v), 2); ctx.fillStyle = col(v); ctx.globalAlpha = 0.3 + 0.6 * v; ctx.beginPath(); ctx.arc(x, y, 1 + v * 5.5, 0, 6.283); ctx.fill(); } ctx.globalAlpha = 1; }
function neural(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const layers = [5, 8, 8, 5, 3], pad = 0.12;
  const cols: { x: number; y: number; act: number }[][] = [];
  layers.forEach((cnt, l) => { const x = W * (pad + (1 - 2 * pad) * l / (layers.length - 1)); const arr: { x: number; y: number; act: number }[] = []; for (let n = 0; n < cnt; n++) { const y = H * 0.5 + (n - (cnt - 1) / 2) * Math.min(H * 0.13, H * 0.8 / cnt); arr.push({ x, y, act: 0.4 + 0.6 * Math.abs(Math.sin(t * 0.0016 + l * 0.7 + n * 1.1)) }); } cols.push(arr); });
  for (let l = 0; l < cols.length - 1; l++) for (const a of cols[l]) for (const b of cols[l + 1]) { const lit = (a.act + b.act) / 2; ctx.strokeStyle = col(0.35 + 0.4 * lit); ctx.globalAlpha = 0.05 + 0.18 * lit; ctx.lineWidth = 0.5 + lit; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  ctx.globalAlpha = 1;
  for (let l = 0; l < cols.length - 1; l++) { const A = cols[l], B = cols[l + 1]; for (let k = 0; k < A.length * 2; k++) { const a = A[k % A.length], b = B[(k * 3) % B.length], tp = (t * 0.0007 + k * 0.13 + l * 0.25) % 1; ctx.fillStyle = col(0.7); ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * tp, a.y + (b.y - a.y) * tp, 1.6, 0, 6.283); ctx.fill(); } }
  ctx.globalAlpha = 1;
  for (const arr of cols) for (const nd of arr) { ctx.fillStyle = col(nd.act); ctx.globalAlpha = 0.5 + 0.5 * nd.act; ctx.beginPath(); ctx.arc(nd.x, nd.y, 3 + nd.act * 5, 0, 6.283); ctx.fill(); if (nd.act > 0.85) { ctx.strokeStyle = col(0.8); ctx.globalAlpha = 0.5; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(nd.x, nd.y, 3 + nd.act * 5 + 4, 0, 6.283); ctx.stroke(); } } ctx.globalAlpha = 1;
}
function fusion(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.32, ry = t * 0.0003, rx = 0.5, sep = Math.sin(t * 0.0005) * 0.75; [-1, 1].forEach((side, ci) => { SPH.forEach((p) => { const pr = P3(p.x * 0.72 + side * sep, p.y * 0.72, p.z * 0.72, ry, rx, S, W, H); ctx.fillStyle = col(ci ? (p.y + 1) / 2 : 1 - (p.y + 1) / 2); ctx.globalAlpha = 0.25 + 0.6 * pr.sc; ctx.beginPath(); ctx.arc(pr.X, pr.Y, 1.2 * pr.sc + 0.5, 0, 6.283); ctx.fill(); }); }); ctx.globalAlpha = 1; }
function esfera(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.36, ry = t * 0.00025, rx = 0.5; SPH.forEach((p) => { const rr = 0.85 + 0.15 * Math.sin(p.y * 5 - t * 0.0012); const pr = P3(p.x * rr, p.y * rr, p.z * rr, ry, rx, S, W, H); ctx.fillStyle = col((p.y + 1) / 2); ctx.globalAlpha = 0.35 + 0.55 * pr.sc; ctx.beginPath(); ctx.arc(pr.X, pr.Y, 1.3 * pr.sc + 0.5, 0, 6.283); ctx.fill(); }); ctx.globalAlpha = 1; }

function pcresta(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.82, rx = 0.7, gx = 124, gz = 60, xc = Math.sin(t * 0.0004) * 1.4; for (let j = gz - 1; j >= 0; j--) { const z = (j / (gz - 1) - 0.5) * 3.6; for (let i = 0; i < gx; i++) { const un = i / (gx - 1), x = (un - 0.5) * 4.4; const y = 0.95 * Math.exp(-Math.pow(x - xc, 2) * 1.5) + 0.16 * Math.sin(z * 3 - t * 0.001) + 0.1 * Math.sin(x * 4 - t * 0.0006); const p = P3(x, y, z, 0, rx, S, W, H); ctx.fillStyle = col(un); ctx.globalAlpha = 0.2 + 0.65 * p.sc; ctx.beginPath(); ctx.arc(p.X, p.Y, 0.9 * p.sc + 0.4, 0, 6.283); ctx.fill(); } } ctx.globalAlpha = 1; }
function premolino(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.8, rx = 0.65, gx = 112, gz = 60, cxw = Math.sin(t * 0.0003) * 1.0, czw = Math.cos(t * 0.00025) * 0.9; for (let j = gz - 1; j >= 0; j--) { const z = (j / (gz - 1) - 0.5) * 3.6; for (let i = 0; i < gx; i++) { const un = i / (gx - 1), x = (un - 0.5) * 4.4; const dx = x - cxw, dz = z - czw, d = Math.hypot(dx, dz), ang = Math.atan2(dz, dx) + (1.4 / (d + 0.4)) * Math.sin(t * 0.0006); const y = 0.4 * Math.sin(d * 3 - t * 0.001) + 0.2; const p = P3(cxw + Math.cos(ang) * d, y, czw + Math.sin(ang) * d, 0, rx, S, W, H); ctx.fillStyle = col(un); ctx.globalAlpha = 0.2 + 0.65 * p.sc; ctx.beginPath(); ctx.arc(p.X, p.Y, 0.9 * p.sc + 0.4, 0, 6.283); ctx.fill(); } } ctx.globalAlpha = 1; }
function ptoro(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.34, ry = t * 0.0004, rx = 0.6 + 0.1 * Math.sin(t * 0.0003), R = 0.6, r = 0.28, nu = 46, nv = 18; for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const u = i / nu * 6.283, v = j / nv * 6.283; const r2 = r * (0.5 + 0.5 * Math.abs(Math.sin(u * 3 - t * 0.001))); const x = (R + r2 * Math.cos(v)) * Math.cos(u), y = r2 * Math.sin(v), z = (R + r2 * Math.cos(v)) * Math.sin(u); const p = P3(x, y, z, ry, rx, S, W, H); ctx.fillStyle = col((Math.cos(u) + 1) / 2); ctx.globalAlpha = 0.22 + 0.6 * p.sc; ctx.beginPath(); ctx.arc(p.X, p.Y, 1.1 * p.sc + 0.4, 0, 6.283); ctx.fill(); } ctx.globalAlpha = 1; }
function pcubo(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.3, ry = t * 0.0004, rx = 0.5 + 0.2 * Math.sin(t * 0.0003), n = 8, g = (a: number) => -1 + 2 * a / (n - 1), breathe = 1 + 0.16 * Math.sin(t * 0.0009), shear = 0.32 * Math.sin(t * 0.0006); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) { const p = P3(g(i) * breathe, g(j) * breathe + shear * g(k), g(k) * breathe, ry, rx, S, W, H); ctx.fillStyle = col((g(j) + 1) / 2); ctx.globalAlpha = 0.18 + 0.6 * p.sc; ctx.beginPath(); ctx.arc(p.X, p.Y, 1.1 * p.sc + 0.4, 0, 6.283); ctx.fill(); } ctx.globalAlpha = 1; }

export const POINTS: Record<string, PointVariant['fn']> = { pondas, pcresta, premolino, montanas, olas, datos, neural, fusion, ptoro, pcubo, esfera };
