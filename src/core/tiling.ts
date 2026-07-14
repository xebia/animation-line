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
  const speed = o.speed ?? 0.0011;
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
