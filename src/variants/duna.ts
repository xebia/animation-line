import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d, depthAlpha } from '../core/geom';

/** Duna: líneas paralelas que drapean sobre una cresta suave en perspectiva. */
export const duna: Variant = {
  name: 'duna',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const lines = lineCount ?? 40, steps = 60;
    const S = Math.min(W, H) * 0.48;
    const rotY = -0.4 + 0.12 * Math.sin(t * 0.0003), rotX = 0.55;
    const out: Polyline[] = [];
    for (let r = 0; r < lines; r++) {
      const zc = (r / (lines - 1) - 0.5) * 2, s = r / (lines - 1);
      const pts: number[] = [];
      let dsum = 0;
      for (let j = 0; j <= steps; j++) {
        const u = j / steps, x = (u - 0.5) * 2;
        const g = 0.4 + 0.6 * Math.abs(Math.sin(zc * 2.2 - t * 0.001)); // frunce viajando en z
        const y = 0.55 * Math.exp(-Math.pow(x * 1.4, 2)) * g + 0.12 * Math.sin(x * 5 + zc * 3 + t * 0.001);
        const p = project3d(x, y, zc, rotX, rotY, S, W, H);
        pts.push(p.X, p.Y);
        dsum += p.d;
      }
      out.push({ pts, s, a: depthAlpha(dsum / (steps + 1), 1) });
    }
    return out;
  },
};
