import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d } from '../core/geom';

/** Hélice: anillos circulares simétricos apilados en un perfil de barril que rota. */
export const helice: Variant = {
  name: 'helice',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const rings = lineCount ?? 24, steps = 48;
    const S = Math.min(W, H) * 0.48;
    const rotY = t * 0.0004, rotX = 0.5 + 0.1 * Math.sin(t * 0.0003);
    const len = 1.8, r = 0.62;
    const spin = t * 0.0007;
    const out: Polyline[] = [];
    for (let i = 0; i < rings; i++) {
      const v = i / (rings - 1), s = v;
      const y = -len / 2 + v * len;
      // perfil simétrico (barril) + onda viajera que ensancha/encoge los anillos en cascada
      const wave = 0.7 + 0.5 * Math.sin(v * Math.PI * 3 - t * 0.002);
      const rr = r * (0.25 + 0.75 * Math.sin(v * Math.PI)) * wave;
      const pts: number[] = [];
      for (let j = 0; j <= steps; j++) {
        const a = (j / steps) * 6.283 + spin;
        const p = project3d(rr * Math.cos(a), y, rr * Math.sin(a), rotX, rotY, S, W, H);
        pts.push(p.X, p.Y);
      }
      out.push({ pts, s });
    }
    return out;
  },
};
