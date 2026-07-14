import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Listones: pares de trazos paralelos por celda, en horizontal o en vertical según la paridad
 *  —el aparejo de un entarimado—. La onda separa el par y lo vuelve a juntar, y de paso alarga
 *  los listones hasta que se encuentran con los de la celda vecina. */
export const listones: Variant = {
  name: 'listones',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 12);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.26, freq: 1.0 });
      const horiz = ((tile.i + tile.j) & 1) === 0;
      const half = cell * 0.46 * b.scale;
      const sep = cell * 0.16 * (0.35 + 0.65 * (0.5 + 0.5 * b.w)); // el par se abre y se cierra

      for (const side of [-1, 1]) {
        const off = side * sep * 0.5;
        const pts = horiz
          ? [cx - half, cy + off, cx + half, cy + off]
          : [cx + off, cy - half, cx + off, cy + half];
        out.push({ pts, s: b.s, w: 0.9 + 0.6 * (0.5 + 0.5 * b.w) });
      }
    }
    return out;
  },
};
