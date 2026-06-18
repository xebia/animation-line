import type { Variant, Polyline, VariantEnv } from '../core/types';
import { auto, lerp } from '../core/geom';

export const onda: Variant = {
  name: 'onda',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const N = lineCount ?? 150;
    const { mx, my } = auto(t);
    const top = H * 0.32, bot = H * 0.68, amp = H * 0.16 * (0.6 + my);
    const out: Polyline[] = [];
    for (let i = 0; i < N; i++) {
      const s = i / (N - 1);
      const x = lerp(W * 0.06, W * 0.94, s);
      const ph = t * 0.0011 + mx * 3;
      out.push({ pts: [x, top + Math.sin(s * 6.9 + ph) * amp, x, bot + Math.sin(s * 6.9 + ph + 1.2) * amp], s });
    }
    return out;
  },
};
