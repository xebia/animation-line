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
function fusion(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.32, ry = t * 0.0003, rx = 0.5, sep = Math.sin(t * 0.0005) * 0.75; [-1, 1].forEach((side, ci) => { SPH.forEach((p) => { const pr = P3(p.x * 0.72 + side * sep, p.y * 0.72, p.z * 0.72, ry, rx, S, W, H); ctx.fillStyle = col(ci ? (p.y + 1) / 2 : 1 - (p.y + 1) / 2); ctx.globalAlpha = 0.25 + 0.6 * pr.sc; ctx.beginPath(); ctx.arc(pr.X, pr.Y, 1.2 * pr.sc + 0.5, 0, 6.283); ctx.fill(); }); }); ctx.globalAlpha = 1; }
function pcresta(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.82, rx = 0.7, gx = 124, gz = 60, xc = Math.sin(t * 0.0004) * 1.4; for (let j = gz - 1; j >= 0; j--) { const z = (j / (gz - 1) - 0.5) * 3.6; for (let i = 0; i < gx; i++) { const un = i / (gx - 1), x = (un - 0.5) * 4.4; const y = 0.95 * Math.exp(-Math.pow(x - xc, 2) * 1.5) + 0.16 * Math.sin(z * 3 - t * 0.001) + 0.1 * Math.sin(x * 4 - t * 0.0006); const p = P3(x, y, z, 0, rx, S, W, H); ctx.fillStyle = col(un); ctx.globalAlpha = 0.2 + 0.65 * p.sc; ctx.beginPath(); ctx.arc(p.X, p.Y, 0.9 * p.sc + 0.4, 0, 6.283); ctx.fill(); } } ctx.globalAlpha = 1; }
function premolino(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.8, rx = 0.65, gx = 112, gz = 60, cxw = Math.sin(t * 0.0003) * 1.0, czw = Math.cos(t * 0.00025) * 0.9; for (let j = gz - 1; j >= 0; j--) { const z = (j / (gz - 1) - 0.5) * 3.6; for (let i = 0; i < gx; i++) { const un = i / (gx - 1), x = (un - 0.5) * 4.4; const dx = x - cxw, dz = z - czw, d = Math.hypot(dx, dz), ang = Math.atan2(dz, dx) + (1.4 / (d + 0.4)) * Math.sin(t * 0.0006); const y = 0.4 * Math.sin(d * 3 - t * 0.001) + 0.2; const p = P3(cxw + Math.cos(ang) * d, y, czw + Math.sin(ang) * d, 0, rx, S, W, H); ctx.fillStyle = col(un); ctx.globalAlpha = 0.2 + 0.65 * p.sc; ctx.beginPath(); ctx.arc(p.X, p.Y, 0.9 * p.sc + 0.4, 0, 6.283); ctx.fill(); } } ctx.globalAlpha = 1; }
function pcubo(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) { const S = Math.min(W, H) * 0.3, ry = t * 0.0004, rx = 0.5 + 0.2 * Math.sin(t * 0.0003), n = 8, g = (a: number) => -1 + 2 * a / (n - 1), breathe = 1 + 0.18 * Math.sin(t * 0.0009), tw = 1.3 * Math.sin(t * 0.0005); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) { const x = g(i) * breathe, y = g(j) * breathe, z = g(k) * breathe, ang = y * tw, xr = x * Math.cos(ang) - z * Math.sin(ang), zr = x * Math.sin(ang) + z * Math.cos(ang); const p = P3(xr, y, zr, ry, rx, S, W, H); ctx.fillStyle = col((g(j) + 1) / 2); ctx.globalAlpha = 0.18 + 0.6 * p.sc; ctx.beginPath(); ctx.arc(p.X, p.Y, 1.1 * p.sc + 0.4, 0, 6.283); ctx.fill(); } ctx.globalAlpha = 1; }

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
// ——— Formas geométricas nuevas (tecnología / datos) ———

// Átomo de datos: núcleo + tres órbitas inclinadas 60° con electrones brillantes
function orbital(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const S = Math.min(W, H) * 0.44, ry = t * 0.00025, rx = 0.35, incl = 1.15, per = 70;
  for (let o = 0; o < 3; o++) {
    const tilt = o * Math.PI / 3;
    const ct = Math.cos(tilt), st = Math.sin(tilt), ci = Math.cos(incl), si = Math.sin(incl);
    const orb = (a: number) => {
      // círculo en xz → inclinación fija → giro de la órbita
      const x0 = Math.cos(a), y0 = Math.sin(a) * si, z0 = Math.sin(a) * ci;
      return { x: x0 * ct - z0 * st, y: y0, z: x0 * st + z0 * ct };
    };
    for (let i = 0; i < per; i++) {
      const p = orb((i / per) * 6.283);
      const pr = P3(p.x, p.y, p.z, ry, rx, S, W, H);
      ctx.fillStyle = col(o / 2); ctx.globalAlpha = 0.16 + 0.4 * pr.sc;
      ctx.beginPath(); ctx.arc(pr.X, pr.Y, 0.9 * pr.sc + 0.3, 0, 6.283); ctx.fill();
    }
    // electrón con estela
    for (let k = 0; k < 9; k++) {
      const p = orb(t * 0.0016 + o * 2.1 - k * 0.07);
      const pr = P3(p.x, p.y, p.z, ry, rx, S, W, H);
      const fade = 1 - k / 9;
      ctx.fillStyle = col(0.75 + 0.25 * fade); ctx.globalAlpha = (0.15 + 0.7 * fade) * (0.4 + 0.6 * pr.sc);
      ctx.beginPath(); ctx.arc(pr.X, pr.Y, (1 + 2.2 * fade) * pr.sc, 0, 6.283); ctx.fill();
    }
  }
  // núcleo compacto
  SPH.forEach((p, i) => {
    if (i % 6 !== 0) return;
    const pr = P3(p.x * 0.14, p.y * 0.14, p.z * 0.14, t * 0.0008, 0.4, S, W, H);
    ctx.fillStyle = col(0.5); ctx.globalAlpha = 0.35 + 0.5 * pr.sc;
    ctx.beginPath(); ctx.arc(pr.X, pr.Y, 1.6 * pr.sc, 0, 6.283); ctx.fill();
  });
  ctx.globalAlpha = 1;
}
// Celdas de datos: retícula hexagonal que pulsa en ondas concéntricas desde el centro
function panal(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const step = Math.min(W, H) / 15, dy = step * 0.866;
  const cx = W / 2, cy = H / 2, maxD = Math.hypot(cx, cy);
  const rows = Math.ceil(H / dy) + 2, cols = Math.ceil(W / step) + 2;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = (i + (j % 2) * 0.5) * step, y = j * dy;
      const d = Math.hypot(x - cx, y - cy) / maxD;
      const w = 0.5 + 0.5 * Math.sin(d * 9 - t * 0.0016); // onda radial hacia fuera
      ctx.fillStyle = col(0.2 + 0.6 * d + 0.2 * w);
      ctx.globalAlpha = 0.14 + 0.62 * w * w;
      ctx.beginPath(); ctx.arc(x, y, 1 + 3 * w * w, 0, 6.283); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
// Circuito: retícula de pistas con señales recorriéndolas (bus de datos)
function circuito(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const rows = 10, cols = 16, trail = 9;
  const ry = (j: number) => H * (j + 0.5) / rows, rxp = (i: number) => W * (i + 0.5) / cols;
  // pistas: puntos finos a lo largo de filas y columnas (la placa del circuito)
  for (let j = 0; j < rows; j++) for (let k = 0; k < 90; k++) {
    ctx.fillStyle = col(0.3); ctx.globalAlpha = 0.12;
    ctx.beginPath(); ctx.arc((k + 0.5) / 90 * W, ry(j), 0.6, 0, 6.283); ctx.fill();
  }
  for (let i = 0; i < cols; i += 2) for (let k = 0; k < 60; k++) {
    ctx.fillStyle = col(0.3); ctx.globalAlpha = 0.12;
    ctx.beginPath(); ctx.arc(rxp(i), (k + 0.5) / 60 * H, 0.6, 0, 6.283); ctx.fill();
  }
  // nodos de la retícula (intersecciones)
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const pulse = 0.5 + 0.5 * Math.sin(i * 1.7 + j * 2.3 + t * 0.0012);
    ctx.fillStyle = col(0.4); ctx.globalAlpha = 0.25 + 0.25 * pulse;
    ctx.beginPath(); ctx.arc(rxp(i), ry(j), 1.4 + 0.8 * pulse, 0, 6.283); ctx.fill();
  }
  // señales horizontales: una por fila, con estela
  for (let j = 0; j < rows; j++) {
    const sp = 0.05 + 0.07 * (0.5 + 0.5 * Math.sin(j * 5.7)), dir = j % 2 === 0 ? 1 : -1;
    const fh = ((t * sp * 0.001 + j * 0.37) % 1 + 1) % 1;
    const xh = (dir > 0 ? fh : 1 - fh) * W;
    for (let k = 0; k < trail; k++) {
      const x = xh - dir * k * 9, fade = 1 - k / trail;
      if (x < 0 || x > W) continue;
      ctx.fillStyle = col(0.5 + 0.4 * fade); ctx.globalAlpha = (0.1 + 0.6 * fade * fade) + (k === 0 ? 0.25 : 0);
      ctx.beginPath(); ctx.arc(x, ry(j), 1 + 1.6 * fade, 0, 6.283); ctx.fill();
    }
  }
  // señales verticales: una por columna alterna
  for (let i = 0; i < cols; i += 2) {
    const sp = 0.04 + 0.06 * (0.5 + 0.5 * Math.sin(i * 3.3)), dir = i % 4 === 0 ? 1 : -1;
    const fv = ((t * sp * 0.001 + i * 0.23) % 1 + 1) % 1;
    const yh = (dir > 0 ? fv : 1 - fv) * H;
    for (let k = 0; k < trail; k++) {
      const y = yh - dir * k * 9, fade = 1 - k / trail;
      if (y < 0 || y > H) continue;
      ctx.fillStyle = col(0.25 + 0.4 * fade); ctx.globalAlpha = (0.1 + 0.6 * fade * fade) + (k === 0 ? 0.25 : 0);
      ctx.beginPath(); ctx.arc(rxp(i), y, 1 + 1.6 * fade, 0, 6.283); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// ——— Estilo enjambre: movimiento colectivo emergente ———

// Bandada: murmuración — una nube densa que se estira, gira y se contrae como un organismo
function bandada(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const N = 460, R = Math.min(W, H);
  // el centro de la bandada deambula por el cuadro
  const cx = W * (0.5 + 0.22 * Math.sin(t * 0.00033) + 0.07 * Math.sin(t * 0.00013 + 2));
  const cy = H * (0.5 + 0.18 * Math.sin(t * 0.00027 + 1) + 0.06 * Math.cos(t * 0.00017));
  // la nube entera se alarga y gira (dirección de vuelo)
  const dirA = t * 0.00035, stretch = 1 + 0.9 * (0.5 + 0.5 * Math.sin(t * 0.00045));
  const ca = Math.cos(dirA), sa = Math.sin(dirA);
  for (let k = 0; k < N; k++) {
    const ph = k * 2.399963;
    // cada pájaro orbita el centro con su radio y fase, respirando
    const ang = ph + t * 0.0004 * (0.6 + 0.4 * Math.sin(ph * 3.1));
    const rad = R * (0.07 + 0.24 * (0.5 + 0.5 * Math.sin(ph * 5.3)))
      * (0.65 + 0.35 * Math.sin(t * 0.0008 + ph * 1.7));
    let x0 = Math.cos(ang) * rad * stretch, y0 = Math.sin(ang) * rad / (0.6 + 0.4 * stretch);
    const x = cx + x0 * ca - y0 * sa, y = cy + x0 * sa + y0 * ca;
    const tw = 0.5 + 0.5 * Math.sin(t * 0.0018 + ph * 7);
    ctx.fillStyle = col(0.25 + 0.5 * (rad / (R * 0.31)) + 0.25 * tw);
    ctx.globalAlpha = 0.25 + 0.55 * tw;
    ctx.beginPath(); ctx.arc(x, y, 0.8 + 1.2 * tw, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
// Cardumen: banco de puntos circulando en un bucle cerrado, en fila con carriles
function cardumen(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const N = 420, cx = W / 2, cy = H / 2;
  const Rx = W * 0.34, Ry = H * 0.3;
  for (let k = 0; k < N; k++) {
    const ph = k * 2.399963;
    const lane = Math.sin(ph * 1.7); // carril propio (dentro/fuera del bucle)
    const sp = 0.00022 + 0.00012 * (0.5 + 0.5 * Math.sin(ph * 2.3));
    const u = (ph * 0.03 + t * sp) % 6.283; // posición a lo largo del bucle
    // el bucle ondula: no es una elipse rígida
    const wob = 1 + 0.13 * Math.sin(u * 3 + t * 0.0006) + 0.1 * lane;
    const x = cx + Rx * wob * Math.cos(u) + 6 * Math.sin(ph * 9 + t * 0.002);
    const y = cy + Ry * wob * Math.sin(u) + 6 * Math.cos(ph * 8 - t * 0.002);
    const tw = 0.5 + 0.5 * Math.sin(t * 0.0016 + ph * 5);
    ctx.fillStyle = col(u / 6.283);
    ctx.globalAlpha = 0.25 + 0.55 * tw;
    ctx.beginPath(); ctx.arc(x, y, 0.9 + 1.2 * tw, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ——— Más formas geométricas (tecnología / datos) ———

// Espectro de señal: ecualizador de columnas de puntos, simétrico respecto al eje central
function espectro(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, col: Col) {
  const cols = 56, gap = H * 0.028, mid = H / 2;
  for (let c = 0; c < cols; c++) {
    const u = (c + 0.5) / cols;
    const d = Math.abs(u - 0.5) * 2; // distancia al centro → espectro simétrico
    const amp = (0.5 + 0.5 * Math.sin(d * 7 - t * 0.0014))
      * (0.6 + 0.4 * Math.sin(d * 13 + t * 0.0009))
      * (1 - d * 0.55);
    const n = Math.max(1, Math.round(amp * (H * 0.42) / gap));
    for (let k = 0; k < n; k++) {
      const fade = 1 - k / (n + 1);
      for (const side of [-1, 1]) {
        ctx.fillStyle = col(0.15 + 0.6 * (k * gap / (H * 0.42)) + 0.25 * (1 - d));
        ctx.globalAlpha = 0.2 + 0.6 * fade;
        ctx.beginPath(); ctx.arc(u * W, mid + side * (k + 0.5) * gap, 1.1 + 1.3 * fade, 0, 6.283); ctx.fill();
      }
    }
  }
  ctx.globalAlpha = 1;
}

export const POINTS: Record<string, PointVariant['fn']> = {
  pondas, pcresta, premolino, montanas, olas, datos, adn, morph,
  fusion, pcubo, enjambre, bandada, cardumen,
  ripples, corrientes, lluvia, vortices, supernova, tornado, girasol, cometas,
  orbital, panal, circuito, espectro,
};
