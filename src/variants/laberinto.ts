import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Laberinto: cada celda es una de las dos diagonales, y ya está — el viejo truco del
 *  «10 PRINT». La onda decide cuál toca en cada momento, así que las diagonales conmutan y el
 *  laberinto se reescribe solo, sin dejar de ser un laberinto. */
export const laberinto: Variant = {
  name: 'laberinto',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 18);
    const out: Polyline[] = [];
    const r = cell * 0.5;

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.14, freq: 1.0 });
      // la diagonal conmuta cuando la onda cruza el umbral de esta celda
      const slash = Math.sin(t * 0.0014 + tile.i * 1.7 + tile.j * 2.3) > 0;
      const d = r * (0.9 + 0.1 * b.scale);
      const pts = slash
        ? [cx - d, cy + d, cx + d, cy - d]
        : [cx - d, cy - d, cx + d, cy + d];
      out.push({ pts, s: b.s, w: 1.6 + 0.6 * b.w });
    }
    return out;
  },
};
