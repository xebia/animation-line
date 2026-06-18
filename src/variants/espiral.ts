import type { Variant, Polyline, VariantEnv } from '../core/types';

/** Swirling curves that mix as they spiral out from the centre. */
export const espiral: Variant = {
  name: 'espiral',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const N = lineCount ?? 60, samples = 100;
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.46;
    const out: Polyline[] = [];
    for (let l = 0; l < N; l++) {
      const s = l / (N - 1);
      const phase = s * 6.283 + t * 0.0004;
      const pts: number[] = [];
      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const ang = u * 6.283 * 1.5 + phase;
        const rad = R * u * (0.6 + 0.4 * Math.sin(u * 6.283 + t * 0.0005 + s * 3));
        pts.push(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
      }
      out.push({ pts, s });
    }
    return out;
  },
};
