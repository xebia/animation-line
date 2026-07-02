import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d, depthAlpha } from '../core/geom';

// Octaedro: 6 vértices, 12 aristas — la base del cristal
const V: [number, number, number][] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const E: [number, number][] = [
  [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 4], [2, 5], [3, 4], [3, 5],
];

/** Cristal: tres octaedros anidados contrarrotando con respiración uniforme —
 *  un cristal de datos girando, perfectamente simétrico. */
export const cristal: Variant = {
  name: 'cristal',
  generate({ t, W, H }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) * 0.48;
    const rotX = 0.45 + 0.1 * Math.sin(t * 0.00022);
    const breathe = 1 + 0.06 * Math.sin(t * 0.0009);
    const shells = [0.45, 0.72, 1.0];
    const out: Polyline[] = [];
    shells.forEach((r, si) => {
      const dir = si % 2 === 0 ? 1 : -1;
      const rotY = dir * t * (0.00028 + si * 0.0001) + si * 0.5;
      const scale = r * breathe;
      for (const [ai, bi] of E) {
        const a = V[ai], b = V[bi];
        const steps = 10;
        const pts: number[] = [];
        let dsum = 0;
        for (let k = 0; k <= steps; k++) {
          const f = k / steps;
          const p = project3d(
            (a[0] + (b[0] - a[0]) * f) * scale,
            (a[1] + (b[1] - a[1]) * f) * scale,
            (a[2] + (b[2] - a[2]) * f) * scale,
            rotX, rotY, S, W, H,
          );
          pts.push(p.X, p.Y);
          dsum += p.d;
        }
        out.push({ pts, s: si / (shells.length - 1), a: depthAlpha(dsum / (steps + 1), 1.1) });
      }
    });
    return out;
  },
};
