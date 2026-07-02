import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d, depthAlpha } from '../core/geom';

/** Voluta: lámina que se enrolla en un scroll, con frunce viajero, twist a lo largo
 *  y radio que ondula — la forma se retuerce y se funde, no solo se enrolla. */
export const voluta: Variant = {
  name: 'voluta',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cols = lineCount ?? 50, steps = 30;
    const S = Math.min(W, H) * 0.48;
    const rotY = t * 0.0004, rotX = 0.5 + 0.1 * Math.sin(t * 0.0003);
    const wrap = 1.4 * Math.PI + 0.4 * Math.PI * Math.sin(t * 0.0005);
    const vtwist = 1.3 * Math.sin(t * 0.0004); // twist a lo largo (efecto raro)
    const len = 1.6;
    const out: Polyline[] = [];
    for (let i = 0; i < cols; i++) {
      const u = i / (cols - 1), s = u;
      const baseR = 0.5 * (0.55 + 0.45 * u) * (0.45 + 0.55 * Math.abs(Math.sin(u * Math.PI * 3 - t * 0.0011)));
      const pts: number[] = [];
      let dsum = 0;
      for (let j = 0; j <= steps; j++) {
        const v = j / steps, lx = -len / 2 + v * len;
        const aa = u * wrap + v * vtwist + t * 0.0003;
        const rr = baseR * (0.7 + 0.3 * Math.sin(v * Math.PI * 2 + t * 0.001));
        const p = project3d(lx, rr * Math.cos(aa), rr * Math.sin(aa), rotX, rotY, S, W, H);
        pts.push(p.X, p.Y);
        dsum += p.d;
      }
      out.push({ pts, s, a: depthAlpha(dsum / (steps + 1), 0.8) });
    }
    return out;
  },
};
