import type { Variant, Polyline, VariantEnv } from '../core/types';
import { lerp } from '../core/geom';

/** Flow field: strands follow a sin-based field, bunching and weaving. */
export const flujo: Variant = {
  name: 'flujo',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const N = lineCount ?? 70, steps = 90, step = W * 0.011;
    const out: Polyline[] = [];
    for (let l = 0; l < N; l++) {
      const s = l / (N - 1);
      let x = W * 0.02, y = lerp(H * 0.08, H * 0.92, s);
      const pts: number[] = [x, y];
      for (let i = 0; i < steps; i++) {
        const ang =
          Math.sin(x * 0.006 + t * 0.0006) * 1.4 +
          Math.cos(y * 0.008 - t * 0.0004) * 1.2;
        x += Math.cos(ang) * step;
        y += Math.sin(ang) * step;
        pts.push(x, y);
      }
      out.push({ pts, s });
    }
    return out;
  },
};
