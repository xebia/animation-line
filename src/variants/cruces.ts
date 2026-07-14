import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Cruces: rejilla técnica finísima con una cruz gruesa en cada celda.
 *  La onda gira las cruces y las engorda: en la cresta el brazo se acorta y se ensancha
 *  hasta leerse como una estrella de 4 puntas. */
export const cruces: Variant = {
  name: 'cruces',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 7);
    const out: Polyline[] = [];

    // Rejilla técnica de fondo: trazo casi invisible, dos pasos (celda y sub-celda)
    const sub = cell / 4;
    for (let x = -sub; x <= W + sub; x += sub) {
      const major = Math.abs(x % cell) < 1e-6;
      out.push({ pts: [x, -sub, x, H + sub], s: 0.1, a: major ? 0.28 : 0.12, w: major ? 0.9 : 0.5 });
    }
    for (let y = -sub; y <= H + sub; y += sub) {
      const major = Math.abs(y % cell) < 1e-6;
      out.push({ pts: [-sub, y, W + sub, y], s: 0.1, a: major ? 0.28 : 0.12, w: major ? 0.9 : 0.5 });
    }

    // Cruces
    for (const { cx, cy } of squareTiles(W, H, cell)) {
      // giro corto: la cruz cabecea pero nunca deja de leerse como cruz recta
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0.22, scaleAmp: 0.3 });
      const arm = cell * 0.2 * (1.15 - 0.3 * b.w); // en la cresta el brazo se acorta…
      const w = cell * 0.05 * (1 + 0.9 * b.w);     // …y engorda: se lee como estrella
      const co = Math.cos(b.rot), si = Math.sin(b.rot);
      const px = (ax: number, ay: number) => [cx + ax * co - ay * si, cy + ax * si + ay * co];
      const [h1x, h1y] = px(-arm, 0), [h2x, h2y] = px(arm, 0);
      const [v1x, v1y] = px(0, -arm), [v2x, v2y] = px(0, arm);
      out.push({ pts: [h1x, h1y, h2x, h2y], s: b.s, w });
      out.push({ pts: [v1x, v1y, v2x, v2y], s: b.s, w });
    }
    return out;
  },
};
