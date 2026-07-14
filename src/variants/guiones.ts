import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Guiones: una cuadrícula de líneas discontinuas. Lo que mide la onda es el largo del guion:
 *  donde la señal sube, los guiones se estiran hasta soldarse y la retícula se cierra; donde
 *  baja, se encogen hasta ser puntos y la retícula desaparece. */
export const guiones: Variant = {
  name: 'guiones',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 14);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0, freq: 1.2 });
      const fill = 0.5 + 0.5 * b.w;

      // guion horizontal y guion vertical: juntos tejen la cuadrícula discontinua
      const hx = cell * 0.5 * (0.1 + 0.9 * fill);
      const vy = cell * 0.5 * (0.1 + 0.9 * (1 - fill)); // el vertical va en contrafase
      out.push({ pts: [cx - hx, cy, cx + hx, cy], s: b.s, a: 0.35 + 0.65 * fill, w: 1.2 + 1.1 * fill });
      out.push({
        pts: [cx, cy - vy, cx, cy + vy],
        s: Math.min(1, b.s + 0.3),
        a: 0.35 + 0.65 * (1 - fill),
        w: 1.2 + 1.1 * (1 - fill),
      });
    }
    return out;
  },
};
