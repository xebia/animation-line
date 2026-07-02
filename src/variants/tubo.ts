import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d, irr, depthAlpha } from '../core/geom';

/** Tubo: cilindro de líneas retorcido que rota (efecto rollo). */
export const tubo: Variant = {
  name: 'tubo',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cols = lineCount ?? 44, steps = 40;
    const S = Math.min(W, H) * 0.48;
    const rotY = t * 0.0004, rotX = 0.5 + 0.12 * Math.sin(t * 0.0003);
    const r = 0.55, len = 1.7, twist = 1.6;
    const m = 0.5 + 0.5 * Math.sin(t * 0.0003); // 0 = cilindro geométrico · 1 = irregular
    const out: Polyline[] = [];
    for (let i = 0; i < cols; i++) {
      const a = (i / cols) * 6.283, s = i / cols;
      const pts: number[] = [];
      let dsum = 0;
      for (let j = 0; j <= steps; j++) {
        const v = j / steps, lx = -len / 2 + v * len, aa = a + v * twist + t * 0.0002;
        // parte de cilindro limpio (m=0) y se deforma a irregular (m=1)
        const rr = r * irr(v * 3 + a, 0.5 * m);
        const p = project3d(lx, rr * Math.cos(aa), rr * Math.sin(aa), rotX, rotY, S, W, H);
        pts.push(p.X, p.Y);
        dsum += p.d;
      }
      out.push({ pts, s, a: depthAlpha(dsum / (steps + 1), 0.9) });
    }
    return out;
  },
};
