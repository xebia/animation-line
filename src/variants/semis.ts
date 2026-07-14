import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe, snap } from '../core/tiling';

/** Semis: tres lados de un cuadrado —una U— que gira a saltos de 90°. Al conmutar, las bocas de
 *  celdas vecinas se enfrentan o se dan la espalda, y el campo alterna entre cuadrículas casi
 *  cerradas y un tejido de ganchos abiertos. */
export const semis: Variant = {
  name: 'semis',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 11);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.2, freq: 1.0 });
      const rot = snap(Math.sin(t * 0.0011 - (tile.i * 0.7 + tile.j * 0.4)) * 3.2, 4);
      const co = Math.cos(rot), si = Math.sin(rot);
      const r = cell * 0.42 * b.scale;
      const p = (x: number, y: number) => [cx + x * co - y * si, cy + x * si + y * co];

      const [ax, ay] = p(-r, -r), [bx, by] = p(-r, r), [dx, dy] = p(r, r), [ex, ey] = p(r, -r);
      out.push({ pts: [ax, ay, bx, by, dx, dy, ex, ey], s: b.s, w: 0.9 + 0.7 * (0.5 + 0.5 * b.w) });
    }
    return out;
  },
};
