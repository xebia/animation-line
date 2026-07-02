import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d, irr, depthAlpha } from '../core/geom';

/** Embudo: hiperboloide/vórtice — líneas del borde superior a un anillo inferior girado. */
export const embudo: Variant = {
  name: 'embudo',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cols = lineCount ?? 90;
    const S = Math.min(W, H) * 0.4;
    const rotY = t * 0.0005, rotX = 0.6 + 0.1 * Math.sin(t * 0.0003);
    const topR = 0.75, botR = 0.1, swirl = 2.0;
    const m = 0.5 + 0.5 * Math.sin(t * 0.0003); // 0 = embudo geométrico · 1 = irregular
    const out: Polyline[] = [];
    for (let i = 0; i < cols; i++) {
      const a = (i / cols) * 6.283, s = i / cols;
      // parte de un embudo limpio (m=0) y se deforma a irregular (m=1)
      const tr = topR * irr(a, 0.5 * m);
      const br = botR * irr(a + 1.5, 0.6 * m);
      const A = project3d(tr * Math.cos(a), 0.7, tr * Math.sin(a), rotX, rotY, S, W, H);
      const bb = a + swirl + 0.6 * Math.sin(t * 0.0007) + t * 0.0004;
      const B = project3d(br * Math.cos(bb), -0.7, br * Math.sin(bb), rotX, rotY, S, W, H);
      out.push({ pts: [A.X, A.Y, B.X, B.Y], s, a: depthAlpha((A.d + B.d) / 2, 0.9) });
    }
    return out;
  },
};
