/** Proyección axonométrica compartida por las tramas 3D.
 *  El mundo es una rejilla en el plano XY con la altura en Z. La cámara gira alrededor del
 *  eje vertical (`ang`) y aplasta la profundidad (`k`), sin punto de fuga: todas las celdas
 *  se proyectan igual, así que la trama sigue siendo una trama aunque se vea en volumen. */

export interface Cam {
  ang: number; // giro de la cámara alrededor del eje vertical (rad)
  k: number;   // aplastado de la profundidad, 0–1 (0.5 ≈ isométrico)
  S: number;   // escala: px por unidad de mundo
  W: number;
  H: number;
}

export function project(cam: Cam, x: number, y: number, z: number): [number, number] {
  const co = Math.cos(cam.ang), si = Math.sin(cam.ang);
  const X = (x * co - y * si) * cam.S;
  const Y = (x * si + y * co) * cam.k * cam.S - z * cam.S;
  return [cam.W / 2 + X, cam.H / 2 + Y];
}

/** Nodos de la rejilla del mundo cuya proyección cae dentro del lienzo (con margen).
 *  Se invierte la proyección sobre las cuatro esquinas del lienzo para saber qué trozo de
 *  mundo se ve, en vez de barrer una rejilla enorme a ciegas. */
export function lattice(cam: Cam, step: number, margin = 2): Array<{ i: number; j: number; x: number; y: number }> {
  const co = Math.cos(cam.ang), si = Math.sin(cam.ang);
  const corners: Array<[number, number]> = [[0, 0], [cam.W, 0], [0, cam.H], [cam.W, cam.H]];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [px, py] of corners) {
    const u = (px - cam.W / 2) / cam.S;
    const v = (py - cam.H / 2) / (cam.k * cam.S);
    const x = u * co + v * si;   // inversa del giro
    const y = -u * si + v * co;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const out: Array<{ i: number; j: number; x: number; y: number }> = [];
  const i0 = Math.floor(minX / step) - margin, i1 = Math.ceil(maxX / step) + margin;
  const j0 = Math.floor(minY / step) - margin, j1 = Math.ceil(maxY / step) + margin;
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) out.push({ i, j, x: i * step, y: j * step });
  }
  // de atrás hacia delante: lo de delante se pinta encima
  return out.sort((a, b) => (a.x + a.y) - (b.x + b.y));
}

/** Acorta un segmento por los dos extremos: las aristas no llegan a tocarse en los vértices. */
export function openEdge(ax: number, ay: number, bx: number, by: number, gap: number): number[] {
  const len = Math.hypot(bx - ax, by - ay) || 1;
  const g = Math.min(gap, len * 0.42);
  const ux = ((bx - ax) / len) * g, uy = ((by - ay) / len) * g;
  return [ax + ux, ay + uy, bx - ux, by - uy];
}

/** Onda en coordenadas de mundo: la que hace subir y bajar las alturas del campo. −1..1. */
export function wave(i: number, j: number, t: number, freq = 0.55, speed = 0.0018): number {
  return 0.5 * (Math.sin(i * freq + t * speed) + Math.cos(j * freq * 0.9 - t * speed * 0.8));
}

/** 0–1 a partir de la onda, para indexar el gradiente de color. */
export function grad(w: number): number {
  return Math.min(1, Math.max(0, 0.5 + 0.5 * w));
}

export interface CubeParts {
  top: number[][];   // aristas de la cara superior
  sides: number[][]; // aristas verticales visibles
  base: number[][];  // aristas del suelo que se ven por delante
  topFace: number[]; // los 4 vértices de la cara superior, por si hay que rayarla
}

/** Aristas visibles de un cubo (o prisma) apoyado en (x,y) de lado `s` y altura `h`, con los
 *  vértices abiertos. Se omite la arista vertical del fondo, que es la que no se vería. */
export function cube(cam: Cam, x: number, y: number, s: number, h: number, gap: number): CubeParts {
  const c: Array<[number, number]> = [[-s, -s], [s, -s], [s, s], [-s, s]];
  const base = c.map(([dx, dy]) => project(cam, x + dx, y + dy, 0));
  const top = c.map(([dx, dy]) => project(cam, x + dx, y + dy, h));

  // esquina más al fondo (la más alta en pantalla) y la más cercana (la más baja)
  let far = 0, near = 0;
  base.forEach((p, i) => {
    if (p[1] < base[far][1]) far = i;
    if (p[1] > base[near][1]) near = i;
  });

  const parts: CubeParts = { top: [], sides: [], base: [], topFace: top.flat() };
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    parts.top.push(openEdge(top[i][0], top[i][1], top[j][0], top[j][1], gap));
    if (i !== far) parts.sides.push(openEdge(top[i][0], top[i][1], base[i][0], base[i][1], gap));
    // solo los dos lados del suelo que salen de la esquina cercana
    if (i === near || j === near) {
      parts.base.push(openEdge(base[i][0], base[i][1], base[j][0], base[j][1], gap));
    }
  }
  return parts;
}
