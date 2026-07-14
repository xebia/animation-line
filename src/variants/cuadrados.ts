import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe, openSides } from '../core/tiling';

/** Cuadrados: el mismo juego que tramado, pero recto — los cuatro lados de un cuadrado como
 *  trazos sueltos, con las esquinas abiertas. La onda abre la esquina hasta que el cuadrado se
 *  deshace en cuatro rayas y la vuelve a cerrar. */
export const cuadrados: Variant = {
  name: 'cuadrados',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 14);
    const out: Polyline[] = [];

    for (const { cx, cy } of squareTiles(W, H, cell)) {
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.22, freq: 1.1 });
      const r = cell * 0.5 * b.scale;
      const gap = cell * 0.1 * (1.1 + 0.9 * b.w);
      const verts = [cx - r, cy - r, cx + r, cy - r, cx + r, cy + r, cx - r, cy + r];
      for (const side of openSides(verts, gap)) {
        out.push({ pts: side, s: b.s, w: 0.9 + 0.6 * (0.5 + 0.5 * b.w) });
      }
    }
    return out;
  },
};
