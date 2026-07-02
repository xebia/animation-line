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
  ['#ffffff', '#eaf1ff', '#ffffff'],
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
  ctx.globalCompositeOperation = 'source-over';
  if (bg.solid) { ctx.fillStyle = bg.solid; } else { const g = ctx.createLinearGradient(0, H, W, 0); g.addColorStop(0, bg.from!); g.addColorStop(1, bg.to!); ctx.fillStyle = g; }
  ctx.fillRect(0, 0, W, H);
  // En fondos oscuros los puntos se suman (glow aditivo); en claros lavaría los colores.
  if (!bg.light) ctx.globalCompositeOperation = 'lighter';
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
function pcubo(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.3, ry = t * 0.0004, rx = 0.5 + 0.2 * Math.sin(t * 0.0003), n = 8, g = (a: number) => -1 + 2 * a / (n - 1), breathe = 1 + 0.18 * Math.sin(t * 0.0009), tw = 1.3 * Math.sin(t * 0.0005); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) { const x = g(i) * breathe, y = g(j) * breathe, z = g(k) * breathe, ang = y * tw, xr = x * Math.cos(ang) - z * Math.sin(ang), zr = x * Math.sin(ang) + z * Math.cos(ang); const p = P3(xr, y, zr, ry, rx, S, W, H); ctx.fillStyle = col((g(j) + 1) / 2); ctx.globalAlpha = 0.18 + 0.6 * p.sc; ctx.beginPath(); ctx.arc(p.X, p.Y, 1.1 * p.sc + 0.4, 0, 6.283); ctx.fill(); } ctx.globalAlpha = 1; }

// Doble hélice 3D que gira y respira (estilo data/ADN)
function helice(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const S = Math.min(W, H) * 0.42, ry = t * 0.0004, rx = 0.5, N = 150, spin = t * 0.0007;
  for (let i = N - 1; i >= 0; i--) {
    const f = i / (N - 1), yy = (f - 0.5) * 2.4, rad = 0.72 + 0.13 * Math.sin(f * 6 + t * 0.0009);
    [0, Math.PI].forEach((off, ci) => {
      const ph = f * 6.283 * 2.3 + off + spin, x = Math.cos(ph) * rad, z = Math.sin(ph) * rad;
      const p = P3(x, yy, z, ry, rx, S, W, H);
      ctx.fillStyle = col(ci ? f : 1 - f); ctx.globalAlpha = 0.25 + 0.6 * p.sc;
      ctx.beginPath(); ctx.arc(p.X, p.Y, 1.3 * p.sc + 0.4, 0, 6.283); ctx.fill();
    });
    if (i % 9 === 0) { // travesaños ocasionales entre las dos hebras
      const ph = f * 6.283 * 2.3 + spin;
      for (let k = 0; k <= 6; k++) { const tt = k / 6, ang = ph + Math.PI * tt, x = Math.cos(ang) * rad, z = Math.sin(ang) * rad; const p = P3(x, yy, z, ry, rx, S, W, H); ctx.fillStyle = col(0.5); ctx.globalAlpha = 0.12 + 0.4 * p.sc; ctx.beginPath(); ctx.arc(p.X, p.Y, 0.8 * p.sc + 0.3, 0, 6.283); ctx.fill(); }
    }
  }
  ctx.globalAlpha = 1;
}

// Icosaedro (12 vértices, 30 aristas) — base geométrica
const ICO = (() => {
  const p = (1 + Math.sqrt(5)) / 2, s = 1 / Math.sqrt(1 + p * p);
  const verts = [[0, 1, p], [0, 1, -p], [0, -1, p], [0, -1, -p], [1, p, 0], [1, -p, 0], [-1, p, 0], [-1, -p, 0], [p, 0, 1], [p, 0, -1], [-p, 0, 1], [-p, 0, -1]].map((a) => [a[0] * s, a[1] * s, a[2] * s]);
  const edges: [number, number][] = [];
  for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) { const dx = verts[i][0] - verts[j][0], dy = verts[i][1] - verts[j][1], dz = verts[i][2] - verts[j][2]; if (Math.abs(dx * dx + dy * dy + dz * dz - 4 * s * s) < 0.05) edges.push([i, j]); }
  return { verts, edges };
})();
// Icosaedro de puntos que rota y respira (forma geométrica)
function poliedro(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const S = Math.min(W, H) * 0.42, ry = t * 0.0004, rx = 0.45 + 0.15 * Math.sin(t * 0.0003), breathe = 1 + 0.06 * Math.sin(t * 0.0011);
  ICO.edges.forEach((e) => {
    const a = ICO.verts[e[0]], b = ICO.verts[e[1]], N = 11;
    for (let k = 0; k <= N; k++) { const f = k / N, x = (a[0] + (b[0] - a[0]) * f) * breathe, y = (a[1] + (b[1] - a[1]) * f) * breathe, z = (a[2] + (b[2] - a[2]) * f) * breathe; const pr = P3(x, y, z, ry, rx, S, W, H); ctx.fillStyle = col((y + 1) / 2); ctx.globalAlpha = 0.22 + 0.55 * pr.sc; ctx.beginPath(); ctx.arc(pr.X, pr.Y, 1 * pr.sc + 0.35, 0, 6.283); ctx.fill(); }
  });
  ICO.verts.forEach((a) => { const pr = P3(a[0] * breathe, a[1] * breathe, a[2] * breathe, ry, rx, S, W, H); ctx.fillStyle = col((a[1] + 1) / 2); ctx.globalAlpha = 0.4 + 0.6 * pr.sc; ctx.beginPath(); ctx.arc(pr.X, pr.Y, 2.2 * pr.sc + 0.6, 0, 6.283); ctx.fill(); });
  ctx.globalAlpha = 1;
}

// Galaxia espiral con rotación diferencial: el núcleo gira más rápido que los brazos
function galaxia(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const S = Math.min(W, H) * 0.5, rx = 0.95, ry = t * 0.00008, N = 680, arms = 3;
  for (let i = 0; i < N; i++) {
    const u = i / N, rad = 0.1 + 0.88 * Math.sqrt(u), arm = i % arms;
    // dispersión determinista alrededor del brazo, más ancha hacia fuera
    const scatter = 0.22 * rad * Math.sin(i * 12.9898) * Math.sin(i * 4.1414);
    const ang = (arm / arms) * 6.283 + rad * 3.6 + t * 0.0011 / (0.3 + rad) + scatter;
    const y = 0.05 * (1 - rad) * Math.sin(i * 7.7);
    const p = P3(rad * Math.cos(ang), y, rad * Math.sin(ang), ry, rx, S, W, H);
    ctx.fillStyle = col(1 - rad); ctx.globalAlpha = 0.2 + 0.65 * p.sc * (1 - 0.4 * rad);
    ctx.beginPath(); ctx.arc(p.X, p.Y, (0.7 + 1.4 * (1 - rad)) * p.sc + 0.3, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
// Enjambre: bandada de puntos que fluye en corrientes onduladas (flow field determinista)
function enjambre(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const N = 460;
  for (let k = 0; k < N; k++) {
    const f = k / N;
    const ph = k * 2.399963; // phase determinista por punto
    const speed = 0.04 + 0.05 * (0.5 + 0.5 * Math.sin(ph * 3.1));
    const span = W * 1.2;
    const x = ((f * span + t * speed) % span + span) % span - W * 0.1;
    // corriente compartida (todos siguen la misma ola) + carril propio → efecto bandada
    const lane = Math.sin(ph * 1.7) * 0.5;
    const y = H * (0.5
      + 0.22 * Math.sin(x * 0.005 + t * 0.00045)
      + 0.09 * Math.sin(x * 0.012 - t * 0.0008 + lane)
      + 0.16 * lane * (0.6 + 0.4 * Math.sin(x * 0.003 + t * 0.0003 + ph)));
    const tw = 0.6 + 0.4 * Math.sin(t * 0.002 + ph * 7); // parpadeo suave
    ctx.fillStyle = col(f); ctx.globalAlpha = (0.25 + 0.55 * tw);
    ctx.beginPath(); ctx.arc(x, y, 0.8 + 1.3 * tw, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
// Atractor de Lorenz: trayectoria caótica rotando, con un cometa que la recorre
const LORENZ: { x: number; y: number; z: number }[] = (() => {
  const pts: { x: number; y: number; z: number }[] = [];
  let x = 0.1, y = 0, z = 0;
  const dt = 0.007, sig = 10, rho = 28, beta = 8 / 3;
  for (let i = 0; i < 2400; i++) {
    const dx = sig * (y - x), dy = x * (rho - z) - y, dz = x * y - beta * z;
    x += dx * dt; y += dy * dt; z += dz * dt;
    if (i > 300) pts.push({ x: x / 24, y: (z - 25) / 24, z: y / 24 }); // normalizado, sin el transitorio
  }
  return pts;
})();
function atractor(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const S = Math.min(W, H) * 0.42, ry = t * 0.0003, rx = 0.35 + 0.12 * Math.sin(t * 0.0002);
  const M = LORENZ.length, head = (t * 0.35) % M;
  for (let i = 0; i < M; i += 2) {
    const p = LORENZ[i];
    const pr = P3(p.x, p.y, p.z, ry, rx, S, W, H);
    // el cometa: los puntos recién recorridos brillan y se van apagando
    let trail = (head - i + M) % M; trail = Math.max(0, 1 - trail / 260);
    ctx.fillStyle = col(0.25 + 0.5 * (p.y + 1) / 2 + 0.25 * trail);
    ctx.globalAlpha = (0.14 + 0.4 * pr.sc) + 0.5 * trail;
    ctx.beginPath(); ctx.arc(pr.X, pr.Y, (0.8 + 1.8 * trail) * pr.sc + 0.3, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ——— Campos que llenan todo el cuadro (sin figura central) ———

// Interferencia: ondas circulares de 2 focos que se cruzan por todo el lienzo
function ripples(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const gx = 64, gy = 42;
  const s1x = W * (0.3 + 0.18 * Math.sin(t * 0.0003)), s1y = H * (0.35 + 0.2 * Math.cos(t * 0.00025));
  const s2x = W * (0.7 + 0.16 * Math.sin(t * 0.00022 + 2)), s2y = H * (0.65 + 0.18 * Math.cos(t * 0.00028 + 1));
  const k = 0.045;
  for (let i = 0; i < gx; i++) for (let j = 0; j < gy; j++) {
    const x = (i + 0.5) / gx * W, y = (j + 0.5) / gy * H;
    const d1 = Math.hypot(x - s1x, y - s1y), d2 = Math.hypot(x - s2x, y - s2y);
    const v = (Math.sin(d1 * k - t * 0.002) + Math.sin(d2 * k - t * 0.0016)) * 0.25 + 0.5;
    const v2 = v * v;
    ctx.fillStyle = col(v); ctx.globalAlpha = 0.15 + 0.65 * v2;
    ctx.beginPath(); ctx.arc(x, y, 0.6 + 2.6 * v2, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
// Corrientes: ríos horizontales de puntos que recorren todo el alto del cuadro
function corrientes(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const rows = 30, per = 46;
  for (let r = 0; r < rows; r++) {
    const v = (r + 0.5) / rows, yBase = v * H;
    const speed = 0.03 + 0.05 * (0.5 + 0.5 * Math.sin(r * 1.7)); // cada río a su ritmo
    const dir = r % 2 === 0 ? 1 : -1;                            // alternando sentido
    for (let i = 0; i < per; i++) {
      const f = (i / per + dir * t * speed * 0.001) % 1;
      const x = ((f + 1) % 1) * W;
      const y = yBase + H * 0.028 * Math.sin(x * 0.012 + r * 2.1 + t * 0.0006)
        + H * 0.012 * Math.sin(x * 0.03 - t * 0.0009 + r);
      const tw = 0.5 + 0.5 * Math.sin(x * 0.02 + r * 3 + t * 0.001); // grosor pulsante
      ctx.fillStyle = col(v); ctx.globalAlpha = 0.2 + 0.6 * tw;
      ctx.beginPath(); ctx.arc(x, y, 0.7 + 1.9 * tw, 0, 6.283); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
// Lluvia digital: estelas verticales cayendo a distintas velocidades, con cabeza brillante
function lluvia(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const cols = 44, trail = 10, gap = H * 0.024;
  for (let c = 0; c < cols; c++) {
    const u = (c + 0.5) / cols, x0 = u * W;
    const sp = 0.08 + 0.14 * (0.5 + 0.5 * Math.sin(c * 7.13)); // velocidad por columna
    const off = Math.sin(c * 3.7) * 0.5;
    // dos estelas por columna, cada una = cabeza + cola pegada detrás
    for (const seg of [0, 0.5]) {
      const fh = ((t * sp * 0.001 + off + seg) % 1 + 1) % 1;
      const yh = fh * (H + trail * gap) - trail * gap * 0.5;
      for (let k = 0; k < trail; k++) {
        const y = yh - k * gap;
        if (y < -gap || y > H + gap) continue;
        const x = x0 + 3 * Math.sin(y * 0.015 + c);
        const fade = 1 - k / trail;                              // la cola se apaga
        const head = k === 0 ? 1 : 0;
        ctx.fillStyle = col(0.2 + 0.55 * u + 0.25 * head);
        ctx.globalAlpha = 0.08 + 0.5 * fade * fade + 0.35 * head;
        ctx.beginPath(); ctx.arc(x, y, 0.8 + 1.1 * fade + 0.8 * head, 0, 6.283); ctx.fill();
      }
    }
  }
  ctx.globalAlpha = 1;
}
// Vórtices: malla de puntos arrastrada por tres remolinos que deambulan por el cuadro
function vortices(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const gx = 56, gy = 38, R = Math.min(W, H);
  const vs = [0, 1, 2].map((n) => ({
    x: W * (0.5 + 0.34 * Math.sin(t * 0.00022 + n * 2.1)),
    y: H * (0.5 + 0.34 * Math.cos(t * 0.00019 + n * 2.6)),
    s: (n % 2 === 0 ? 1 : -1) * (0.5 + 0.2 * Math.sin(t * 0.0003 + n)),
  }));
  for (let i = 0; i < gx; i++) for (let j = 0; j < gy; j++) {
    let x = (i + 0.5) / gx * W, y = (j + 0.5) / gy * H, swirl = 0;
    for (const v of vs) {
      const dx = x - v.x, dy = y - v.y, d = Math.hypot(dx, dy) + 1;
      const ang = (v.s * R * 55) / (d * d + R * 14); // giro fuerte cerca, suave lejos
      const ca = Math.cos(ang), sa = Math.sin(ang);
      x = v.x + dx * ca - dy * sa; y = v.y + dx * sa + dy * ca;
      swirl += Math.abs(ang);
    }
    const e = Math.min(1, swirl * 2.2);
    // color: gradiente espacial + empuje del remolino (no monocromo)
    ctx.fillStyle = col(0.15 + 0.55 * ((i / gx + j / gy) / 2) + 0.3 * e);
    ctx.globalAlpha = 0.16 + 0.6 * e;
    ctx.beginPath(); ctx.arc(x, y, 0.8 + 1.6 * e, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Supernova: dos cohortes de partículas que explotan desde el núcleo y se disipan en bucle
function supernova(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const S = Math.min(W, H) * 0.5, ry = t * 0.0002, rx = 0.4;
  for (const cohort of [0, 0.5]) {
    const ph = ((t * 0.00035 + cohort) % 1 + 1) % 1;
    const r0 = 0.06 + 1.1 * (1 - Math.pow(1 - ph, 2.2)); // arranque explosivo, frenada suave
    const fade = Math.pow(1 - ph, 1.4);
    SPH.forEach((p, i) => {
      const spread = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(i * 12.9898)); // cada partícula llega a su radio
      const rr = r0 * spread;
      const pr = P3(p.x * rr, p.y * rr, p.z * rr, ry, rx, S, W, H);
      ctx.fillStyle = col(0.15 + 0.7 * ph + 0.15 * (p.y + 1) / 2);
      ctx.globalAlpha = (0.15 + 0.6 * pr.sc) * fade;
      ctx.beginPath(); ctx.arc(pr.X, pr.Y, (0.8 + 1.6 * (1 - ph)) * pr.sc + 0.3, 0, 6.283); ctx.fill();
    });
    // núcleo incandescente al nacer
    if (ph < 0.2) {
      const core = 1 - ph / 0.2;
      ctx.fillStyle = col(0.9); ctx.globalAlpha = 0.5 * core;
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 4 + 22 * core, 0, 6.283); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
// Tornado: columna de puntos girando, estrecha abajo y abierta arriba, que se mece
function tornado(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const S = Math.min(W, H) * 0.52, N = 640, f = 4.2;
  for (let i = 0; i < N; i++) {
    const u = i / N, y = 1.05 - u * 2.1; // arriba → abajo
    const hh = (1.05 - y) / 2.1;         // 0 arriba → 1 abajo
    const rad = 0.16 + 0.62 * Math.pow(1 - hh, 1.7);           // embudo
    const sway = 0.22 * Math.sin(hh * 2.4 + t * 0.0007);        // la columna se mece
    const ang = i * 2.399963 + t * 0.0016 * (0.7 + hh * 1.1);   // abajo gira más rápido
    const jag = 1 + 0.16 * Math.sin(i * 7.7 + t * 0.001);
    const x = sway + rad * jag * Math.cos(ang), z = rad * jag * Math.sin(ang);
    const sc = f / (f + z * 2);
    const X = W / 2 + x * S * sc, Y = H / 2 + y * S * 0.92 * sc;
    ctx.fillStyle = col(1 - hh);
    ctx.globalAlpha = 0.18 + 0.55 * sc * (0.5 + 0.5 * Math.sin(i * 3.1 + t * 0.002));
    ctx.beginPath(); ctx.arc(X, Y, 0.9 + 1.1 * (1 - hh), 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
// Girasol: espiral filotáctica (ángulo áureo) que respira, con ondas de tamaño radiando
function girasol(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const N = 720, R = Math.min(W, H) * 0.46;
  for (let k = 0; k < N; k++) {
    const u = k / N;
    const rr = R * Math.sqrt(u) * (1 + 0.05 * Math.sin(t * 0.0008 - u * 9));
    const ang = k * 2.399963 + t * 0.00025 + u * 0.9 * Math.sin(t * 0.0003); // giro con torsión
    const x = W / 2 + rr * Math.cos(ang), y = H / 2 + rr * Math.sin(ang);
    const wave = 0.5 + 0.5 * Math.sin(u * 14 - t * 0.0016); // ondas que viajan hacia fuera
    ctx.fillStyle = col(0.15 + 0.7 * u + 0.15 * wave);
    ctx.globalAlpha = 0.2 + 0.6 * wave;
    ctx.beginPath(); ctx.arc(x, y, 0.7 + 2.1 * wave * (0.4 + 0.6 * u), 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
// Cometas: lluvia de meteoros en diagonal con estelas que se apagan
function cometas(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const M = 22, trail = 14, dx = 0.82, dy = 0.57; // dirección ~35°
  for (let m = 0; m < M; m++) {
    const sp = 0.1 + 0.16 * (0.5 + 0.5 * Math.sin(m * 5.9)); // velocidad propia
    const off = ((m * 0.47 + Math.sin(m * 12.3) * 0.3) % 1 + 1) % 1;
    const ph = ((t * sp * 0.001 + off) % 1.25 + 1.25) % 1.25;
    const x0 = (Math.sin(m * 3.7) * 0.5 + 0.5) * W * 1.1 - W * 0.35 + ph * W * 1.1 * dx;
    const y0 = -H * 0.15 + ph * H * 1.25 * dy;
    const size = 0.8 + 1.6 * (0.5 + 0.5 * Math.sin(m * 8.1));
    for (let k = 0; k < trail; k++) {
      const fade = 1 - k / trail;
      const x = x0 - k * 7 * dx, y = y0 - k * 7 * dy;
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
      ctx.fillStyle = col(0.2 + 0.6 * (m / M) + 0.2 * (k === 0 ? 1 : 0));
      ctx.globalAlpha = (0.08 + 0.55 * fade * fade) + (k === 0 ? 0.3 : 0);
      ctx.beginPath(); ctx.arc(x, y, size * (0.4 + 0.6 * fade) + (k === 0 ? 0.8 : 0), 0, 6.283); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
// ADN: doble hélice de puntos (data strands) con peldaños, girando
function adn(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const S = Math.min(W, H) * 0.4, ry = t * 0.0004, rx = 0.5 + 0.15 * Math.sin(t * 0.0003), N = 120, turns = 3, len = 1.9, r = 0.4;
  const node = (strand: number, u: number) => { const x = -len / 2 + u * len, th = u * turns * 6.283 + t * 0.0006 + strand * Math.PI; return { x, y: r * Math.cos(th), z: r * Math.sin(th) }; };
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    if (i % 5 === 0) { const a = node(0, u), b = node(1, u), pa = P3(a.x, a.y, a.z, ry, rx, S, W, H), pb = P3(b.x, b.y, b.z, ry, rx, S, W, H); ctx.strokeStyle = col(0.5); ctx.globalAlpha = 0.22; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pa.X, pa.Y); ctx.lineTo(pb.X, pb.Y); ctx.stroke(); }
    for (const strand of [0, 1]) { const p = node(strand, u), pr = P3(p.x, p.y, p.z, ry, rx, S, W, H); ctx.fillStyle = col(strand ? 0.2 : 0.85); ctx.globalAlpha = 0.3 + 0.6 * pr.sc; ctx.beginPath(); ctx.arc(pr.X, pr.Y, 1.4 * pr.sc + 0.5, 0, 6.283); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}
// Túnel: anillos de puntos que fluyen hacia la cámara y te envuelven
function tunel(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const S = Math.min(W, H) * 0.5, rings = 44, per = 46, r = 0.78;
  for (let j = 0; j < rings; j++) {
    let zc = (j / rings) * 4 - (t * 0.0006) % 4; zc = ((zc % 4) + 4) % 4 - 2;
    const wob = 0.16 * Math.sin(zc * 2 + t * 0.0008);
    for (let i = 0; i < per; i++) { const a = i / per * 6.283, rr = r + wob, pr = P3(rr * Math.cos(a), rr * Math.sin(a), zc, 0, 0.18, S, W, H); if (pr.sc <= 0) continue; ctx.fillStyle = col(a / 6.283); ctx.globalAlpha = Math.max(0, 0.12 + 0.72 * pr.sc); ctx.beginPath(); ctx.arc(pr.X, pr.Y, 1.1 * pr.sc + 0.3, 0, 6.283); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}
// Morph: la nube transiciona fluyendo entre esfera y toro
function morph(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const S = Math.min(W, H) * 0.36, ry = t * 0.0004, rx = 0.5, m = 0.5 + 0.5 * Math.sin(t * 0.0004);
  for (let i = 0; i < SPH.length; i++) {
    const p = SPH[i], lon = Math.atan2(p.z, p.x), lat = Math.asin(Math.max(-1, Math.min(1, p.y))), R = 0.55, r = 0.25, c = Math.cos(lat * 2);
    const tx = (R + r * c) * Math.cos(lon), ty = r * Math.sin(lat * 2), tz = (R + r * c) * Math.sin(lon);
    const x = p.x * (1 - m) + tx * m, y = p.y * (1 - m) + ty * m, z = p.z * (1 - m) + tz * m, pr = P3(x, y, z, ry, rx, S, W, H);
    ctx.fillStyle = col((p.y + 1) / 2); ctx.globalAlpha = 0.3 + 0.6 * pr.sc;
    ctx.beginPath(); ctx.arc(pr.X, pr.Y, 1.3 * pr.sc + 0.4, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
// Constelación: nodos que derivan conectados por cercanía
const STARS: { x: number; y: number; px: number; py: number }[] = (() => { let sd = 9; const r = () => { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; }; const a: { x: number; y: number; px: number; py: number }[] = []; for (let i = 0; i < 70; i++) a.push({ x: r(), y: r(), px: r() * 6.283, py: r() * 6.283 }); return a; })();
function constelacion(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const pts = STARS.map((n) => ({ x: (0.05 + n.x * 0.9) * W + Math.sin(t * 0.0003 + n.px) * 16, y: (0.08 + n.y * 0.84) * H + Math.cos(t * 0.00026 + n.py) * 16 }));
  for (let i = 0; i < pts.length; i++) for (let k = i + 1; k < pts.length; k++) { const dx = pts[i].x - pts[k].x, dy = pts[i].y - pts[k].y, d = Math.hypot(dx, dy); if (d < W * 0.12) { ctx.strokeStyle = col(i / pts.length); ctx.globalAlpha = 0.18 * (1 - d / (W * 0.12)); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[k].x, pts[k].y); ctx.stroke(); } }
  ctx.globalAlpha = 1;
  pts.forEach((p, i) => { ctx.fillStyle = col(i / pts.length); ctx.beginPath(); ctx.arc(p.x, p.y, 2.1, 0, 6.283); ctx.fill(); });
}
// Vórtice: remolino 3D de puntos en espiral descendente
function vortice(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const S = Math.min(W, H) * 0.42, ry = t * 0.0004, rx = 0.95, N = 560, turns = 4;
  for (let i = 0; i < N; i++) { const u = i / N, th = u * turns * 6.283 + t * 0.0008, rad = 0.85 * (1 - u) + 0.04, y = -0.9 + u * 1.8; const pr = P3(rad * Math.cos(th), y, rad * Math.sin(th), ry, rx, S, W, H); ctx.fillStyle = col(u); ctx.globalAlpha = 0.25 + 0.6 * pr.sc; ctx.beginPath(); ctx.arc(pr.X, pr.Y, 1.2 * pr.sc + 0.4, 0, 6.283); ctx.fill(); }
  ctx.globalAlpha = 1;
}

export const POINTS: Record<string, PointVariant['fn']> = {
  pondas, pcresta, premolino, montanas, olas, datos, neural, adn, tunel, morph, constelacion, vortice,
  fusion, ptoro, pcubo, esfera, helice, poliedro, galaxia, enjambre, atractor,
  ripples, corrientes, lluvia, vortices, supernova, tornado, girasol, cometas,
};
