import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe, openSides, snap } from '../core/tiling';

/** Rejas: marcos rectangulares anidados, alternando el lado largo celda a celda. La onda
 *  estira el marco de horizontal a vertical, y como el giro va a saltos de 90°, la trama pasa
 *  de una retícula a la otra de golpe, sin ángulos intermedios. */
export const rejas: Variant = {
  name: 'rejas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 9);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { scaleAmp: 0.16, rotAmp: 0, freq: 1.0 });
      // el marco vuelca 90° cuando pasa la onda: retardo propio por celda
      const rot = snap(Math.sin(t * 0.0014 - (tile.i + tile.j) * 0.4) * 1.6, 4);
      const co = Math.cos(rot), si = Math.sin(rot);

      for (const k of [0, 1]) {
        const rx = cell * (0.44 - k * 0.16) * b.scale;
        const ry = cell * (0.22 - k * 0.08) * b.scale;
        const verts: number[] = [];
        for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          const x = sx * rx, y = sy * ry;
          verts.push(cx + x * co - y * si, cy + x * si + y * co);
        }
        for (const side of openSides(verts, cell * 0.045)) {
          out.push({ pts: side, s: k ? Math.min(1, b.s + 0.3) : b.s, a: 1 - k * 0.25, w: 1.7 - k * 0.5 });
        }
      }
    }
    return out;
  },
};
