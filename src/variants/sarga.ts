import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Sarga: el ligamento en diagonal del tejido vaquero. Los pasos por encima no alternan celda a
 *  celda como en el tafetán, sino que se desplazan uno cada fila, y eso hace que el entrelazado
 *  dibuje diagonales. La onda mueve el escalón y las diagonales viajan por el campo. */
export const sarga: Variant = {
  name: 'sarga',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 13);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.14, freq: 1.0 });
      // ligamento de sarga: el paso por encima se desplaza una celda por fila (2/2)
      const shift = Math.floor(t * 0.0015);
      const over = ((tile.i + tile.j * 2 + shift) % 4 + 4) % 4 < 2;
      const half = cell * 0.5 * b.scale;
      const gap = cell * 0.13;

      const whole = over
        ? [cx - half, cy, cx + half, cy]
        : [cx, cy - half, cx, cy + half];
      out.push({ pts: whole, s: b.s, w: 1.3 + 0.4 * b.w });

      const cut = over
        ? [[cx, cy - half, cx, cy - gap], [cx, cy + gap, cx, cy + half]]
        : [[cx - half, cy, cx - gap, cy], [cx + gap, cy, cx + half, cy]];
      for (const seg of cut) out.push({ pts: seg, s: Math.min(1, b.s + 0.2), a: 0.8, w: 1.0 });
    }
    return out;
  },
};
