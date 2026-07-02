import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d, irr, depthAlpha } from '../core/geom';

/** Cono: líneas que se abren desde un vértice formando un cono que gira. */
export const cono: Variant = {
  name: 'cono',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cols = lineCount ?? 48, steps = 36;
    const S = Math.min(W, H) * 0.42;
    const rotY = t * 0.0004, rotX = 0.45 + 0.1 * Math.sin(t * 0.0003);
    const m = 0.5 + 0.5 * Math.sin(t * 0.0003); // 0 = cono geométrico · 1 = irregular
    const out: Polyline[] = [];
    for (let i = 0; i < cols; i++) {
      const a = (i / cols) * 6.283, s = i / cols;
      const pts: number[] = [];
      let dsum = 0;
      for (let j = 0; j <= steps; j++) {
        const v = j / steps, lx = -0.85 + v * 1.7, aa = a + t * 0.0003;
        const rr = (0.08 + v * 0.72) * irr(a + v * 2, 0.5 * m);
        const p = project3d(lx, rr * Math.cos(aa), rr * Math.sin(aa), rotX, rotY, S, W, H);
        pts.push(p.X, p.Y);
        dsum += p.d;
      }
      out.push({ pts, s, a: depthAlpha(dsum / (steps + 1), 0.8) });
    }
    return out;
  },
};
