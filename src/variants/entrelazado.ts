import type { Variant, Polyline, VariantEnv } from '../core/types';
import { lerp } from '../core/geom';

/** Interweaving strands: two sine frequencies per line braid and cross. */
export const entrelazado: Variant = {
  name: 'entrelazado',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const N = lineCount ?? 80, samples = 120;
    const midY = H * 0.5, amp1 = H * 0.22, amp2 = H * 0.12;
    const out: Polyline[] = [];
    for (let l = 0; l < N; l++) {
      const s = l / (N - 1);
      const pts: number[] = [];
      for (let i = 0; i <= samples; i++) {
        const u = i / samples, x = lerp(W * 0.04, W * 0.96, u);
        const y = midY +
          Math.sin(u * 6.283 * 1.5 + t * 0.0009 + s * 6.283) * amp1 +
          Math.sin(u * 6.283 * 2.7 - t * 0.0006 + s * 9.0) * amp2;
        pts.push(x, y);
      }
      out.push({ pts, s });
    }
    return out;
  },
};
