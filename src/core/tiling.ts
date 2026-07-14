/** Teselado y respiración compartidos por las variantes de patrón.
 *  Las variantes solo describen su forma dentro de una celda; aquí se repite y se anima,
 *  así las cinco se mueven con el mismo pulso. */

export interface Tile { cx: number; cy: number; i: number; j: number; }

const TAU = Math.PI * 2;

/** Centros de una rejilla cuadrada de paso `cell`, con una celda de sangrado por lado
 *  para que el patrón no muera en el borde del lienzo. */
export function squareTiles(W: number, H: number, cell: number): Tile[] {
  const cols = Math.ceil(W / cell) + 2;
  const rows = Math.ceil(H / cell) + 2;
  const out: Tile[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      out.push({ cx: (i - 0.5) * cell, cy: (j - 0.5) * cell, i, j });
    }
  }
  return out;
}

/** Centros de una rejilla triangular/hexagonal de paso `cell` (filas impares desplazadas
 *  media celda), con sangrado. Cada nodo tiene 6 vecinos equidistantes. */
export function hexTiles(W: number, H: number, cell: number): Tile[] {
  const rowH = cell * 0.866; // √3/2
  const cols = Math.ceil(W / cell) + 2;
  const rows = Math.ceil(H / rowH) + 2;
  const out: Tile[] = [];
  for (let j = 0; j < rows; j++) {
    const shift = (j & 1) ? cell * 0.5 : 0;
    for (let i = 0; i < cols; i++) {
      out.push({ cx: (i - 0.5) * cell + shift, cy: (j - 0.5) * rowH, i, j });
    }
  }
  return out;
}

/** Lados de un polígono cerrado, cada uno acortado `gap` px por cada extremo: la figura se
 *  lee entera pero los vértices quedan abiertos, que es lo que hace que la trama respire
 *  sin encerrarse. `verts` = [x0,y0, x1,y1, …] sin repetir el primer vértice. */
export function openSides(verts: number[], gap: number): number[][] {
  const n = verts.length / 2;
  const sides: number[][] = [];
  for (let i = 0; i < n; i++) {
    const ax = verts[i * 2], ay = verts[i * 2 + 1];
    const j = (i + 1) % n;
    const bx = verts[j * 2], by = verts[j * 2 + 1];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const g = Math.min(gap, len * 0.45); // nunca comerse el lado entero
    const ux = ((bx - ax) / len) * g, uy = ((by - ay) / len) * g;
    sides.push([ax + ux, ay + uy, bx - ux, by - uy]);
  }
  return sides;
}

export interface BreatheOpts {
  freq?: number;     // ondas por lienzo
  speed?: number;    // velocidad de avance de la onda
  angle?: number;    // dirección de avance (rad)
  scaleAmp?: number; // cuánto crece/mengua la celda
  rotAmp?: number;   // cuánto gira la celda (rad)
  moveAmp?: number;  // desplazamiento de la celda (px)
}

export interface Breath {
  scale: number; // multiplicador de tamaño de la forma
  rot: number;   // giro de la forma (rad)
  dx: number;    // desplazamiento en px
  dy: number;
  s: number;     // posición en el gradiente, 0–1
  w: number;     // la onda cruda, -1..1 (para modular grosores)
}

/** Onda que recorre el campo: dos frentes cruzados, uno de avance y otro oblicuo,
 *  de modo que la deformación nunca se lee como un simple barrido lineal. */
export function breathe(
  cx: number, cy: number, t: number, W: number, H: number, o: BreatheOpts = {},
): Breath {
  const freq = o.freq ?? 1.4;
  const speed = o.speed ?? 0.0024;
  const angle = o.angle ?? 0.6;
  const u = cx / W, v = cy / H;
  const p = u * Math.cos(angle) + v * Math.sin(angle);
  const main = Math.sin(p * TAU * freq - t * speed);
  const cross = Math.sin((u * 1.3 - v * 0.7) * TAU * freq * 0.6 + t * speed * 0.7);
  const w = 0.5 * (main + cross); // -1..1
  return {
    scale: 1 + (o.scaleAmp ?? 0.32) * w,
    rot: (o.rotAmp ?? 0.5) * cross,
    dx: (o.moveAmp ?? 0) * cross,
    dy: (o.moveAmp ?? 0) * main,
    s: Math.min(1, Math.max(0, 0.5 + 0.5 * w)),
    w,
  };
}
