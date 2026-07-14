import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

const STEPS = 12;

/** Arcos: la misma malla, pero las barras no son rectas: cada tramo es un arco que se comba.
 *  La onda invierte la comba —de convexa a cóncava—, así que la retícula late entre celdas
 *  hinchadas y celdas apretadas. */
export const arcos: Variant = {
  name: 'arcos',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 9);
    const out: Polyline[] = [];

    for (const { cx, cy } of squareTiles(W, H, cell)) {
      const b = breathe(cx, cy, t, W, H, { scaleAmp: 0.12, freq: 1.0 });
      const half = cell * 0.5;
      const gap = cell * 0.06;
      const bend = cell * 0.22 * b.w; // la comba cambia de signo con la onda
      const w = 1.8 + 0.7 * b.w;

      // un arco horizontal y otro vertical por celda: juntos tejen la malla combada
      const hx: number[] = [], vy: number[] = [];
      for (let k = 0; k <= STEPS; k++) {
        const u = k / STEPS;
        const arc = Math.sin(u * Math.PI) * bend; // 0 en los extremos, máximo en el centro
        const x = cx - half + gap + u * (cell - 2 * gap);
        hx.push(x, cy + arc);
        const y = cy - half + gap + u * (cell - 2 * gap);
        vy.push(cx - arc, y);
      }
      out.push({ pts: hx, s: b.s, w });
      out.push({ pts: vy, s: Math.min(1, b.s + 0.12), w });
    }
    return out;
  },
};
