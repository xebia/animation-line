import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

const BARS = 3; // barras por bloque

/** Trenzado: el tejido de cesta. Cada celda es un haz de barras paralelas, y el haz se pone en
 *  horizontal o en vertical según la paridad, de modo que la trama se lee como una urdimbre.
 *  La onda separa las barras del haz: el tejido se afloja y se vuelve a apretar. */
export const trenzado: Variant = {
  name: 'trenzado',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 10);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.2, freq: 1.0 });
      const warp = ((tile.i + tile.j) & 1) === 0; // urdimbre o trama
      const half = cell * 0.45 * (0.9 + 0.1 * b.scale);
      const spread = cell * 0.14 * (0.7 + 0.6 * (0.5 + 0.5 * b.w)); // el haz se abre y se cierra

      for (let k = 0; k < BARS; k++) {
        const off = (k - (BARS - 1) / 2) * spread;
        const pts = warp
          ? [cx - half, cy + off, cx + half, cy + off]
          : [cx + off, cy - half, cx + off, cy + half];
        out.push({ pts, s: b.s, a: k === 1 ? 1 : 0.75, w: 1.5 + 0.5 * b.w });
      }
    }
    return out;
  },
};
