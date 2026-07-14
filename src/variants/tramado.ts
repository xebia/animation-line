import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Tramado: en cada celda, los cuatro lados de un rombo dibujados como trazos sueltos, con
 *  las esquinas abiertas. La onda los alarga, los gira y los acorta: la retícula de rombos
 *  se cierra por zonas y en otras se deshace en trazos diagonales sueltos. */
export const tramado: Variant = {
  name: 'tramado',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 20);
    const out: Polyline[] = [];

    for (const { cx, cy } of squareTiles(W, H, cell)) {
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0.7, scaleAmp: 0.45, freq: 1.1 });
      const r = cell * 0.5;                 // media diagonal del rombo
      const len = r * 1.414 * 0.72 * b.scale; // lado del rombo, recortado → esquinas abiertas

      // los cuatro lados: centro en el punto medio de cada lado, dirección a 45°
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          const ang = (sx * sy > 0 ? 3 : 1) * (Math.PI / 4) + b.rot;
          const dx = Math.cos(ang) * len * 0.5, dy = Math.sin(ang) * len * 0.5;
          const mx = cx + sx * r * 0.5, my = cy + sy * r * 0.5;
          out.push({
            pts: [mx - dx, my - dy, mx + dx, my + dy],
            s: b.s,
            w: 1.1 + 0.7 * (0.5 + 0.5 * b.w),
          });
        }
      }
    }
    return out;
  },
};
