import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Aspas: una equis por celda, con el centro abierto — cuatro trazos que apuntan al nudo sin
 *  llegar a tocarlo. La onda los alarga hasta rozar los de la celda vecina y los recoge otra
 *  vez: la trama se cierra en malla diagonal y se vuelve a soltar en trazos. */
export const aspas: Variant = {
  name: 'aspas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 13);
    const out: Polyline[] = [];

    for (const { cx, cy } of squareTiles(W, H, cell)) {
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.35, freq: 1.1 });
      const reach = cell * 0.62 * (0.45 + 0.55 * (0.5 + 0.5 * b.w));
      const gap = cell * 0.08 * (1 + 0.8 * b.w);

      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const ux = sx * Math.SQRT1_2, uy = sy * Math.SQRT1_2; // 45° exactos
        out.push({
          pts: [cx + ux * gap, cy + uy * gap, cx + ux * reach, cy + uy * reach],
          s: b.s,
          w: 0.9 + 0.6 * (0.5 + 0.5 * b.w),
        });
      }
    }
    return out;
  },
};
