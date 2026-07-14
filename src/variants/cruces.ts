import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Cruces: cruces sobre una rejilla técnica finísima, como las marcas de registro de un plano.
 *  Dos pesos de línea: la rejilla, casi invisible, y la cruz, apenas más marcada. Nada gira; la
 *  onda alarga los brazos y aprieta el trazo. */
export const cruces: Variant = {
  name: 'cruces',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 9);
    const out: Polyline[] = [];

    // rejilla técnica: dos pasos, celda y sub-celda, a un pelo de ser invisible
    const sub = cell / 4;
    for (let x = -sub; x <= W + sub; x += sub) {
      const major = Math.abs(x % cell) < 1e-6;
      out.push({ pts: [x, -sub, x, H + sub], s: 0.08, a: major ? 0.22 : 0.09, w: major ? 0.5 : 0.35 });
    }
    for (let y = -sub; y <= H + sub; y += sub) {
      const major = Math.abs(y % cell) < 1e-6;
      out.push({ pts: [-sub, y, W + sub, y], s: 0.08, a: major ? 0.22 : 0.09, w: major ? 0.5 : 0.35 });
    }

    // cruces: en los nodos de la rejilla, alineadas con los ejes
    for (const { cx, cy } of squareTiles(W, H, cell)) {
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.4, freq: 1.1 });
      const arm = cell * 0.22 * (0.5 + 0.5 * (0.5 + 0.5 * b.w)) * b.scale;
      const w = 1.2 + 0.9 * (0.5 + 0.5 * b.w);
      out.push({ pts: [cx - arm, cy, cx + arm, cy], s: b.s, w });
      out.push({ pts: [cx, cy - arm, cx, cy + arm], s: b.s, w });
    }
    return out;
  },
};
