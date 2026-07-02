import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d, depthAlpha } from '../core/geom';

/** Toroide: donut de anillos meridianos equiespaciados girando en 3D,
 *  con una respiración uniforme del tubo — geometría pura. */
export const toroide: Variant = {
  name: 'toroide',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cols = lineCount ?? 30, steps = 44;
    const S = Math.min(W, H) * 0.48;
    const rotY = t * 0.00032, rotX = 0.85 + 0.15 * Math.sin(t * 0.00024);
    const R = 0.72, r = 0.3 * (1 + 0.12 * Math.sin(t * 0.0008)); // el tubo respira uniforme
    const out: Polyline[] = [];
    for (let i = 0; i < cols; i++) {
      const u = (i / cols) * Math.PI * 2; // posición del meridiano en el aro
      const cu = Math.cos(u), su = Math.sin(u);
      const pts: number[] = [];
      let dsum = 0;
      for (let j = 0; j <= steps; j++) {
        const v = (j / steps) * Math.PI * 2;
        const rr = R + r * Math.cos(v);
        const p = project3d(rr * cu, r * Math.sin(v), rr * su, rotX, rotY, S, W, H);
        pts.push(p.X, p.Y);
        dsum += p.d;
      }
      out.push({ pts, s: i / cols, a: depthAlpha(dsum / (steps + 1), 0.9) });
    }
    return out;
  },
};
