import type { Variant, Polyline, VariantEnv } from '../core/types';

/** Concentric regular polygons (hexagons) with a per-ring twist: geometric & symmetric. */
export const espiral: Variant = {
  name: 'espiral',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const N = lineCount ?? 40, sides = 6;
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.46;
    const out: Polyline[] = [];
    for (let l = 0; l < N; l++) {
      const s = l / (N - 1);
      const r = R * (0.06 + 0.94 * s);
      const rot = t * 0.0003 + s * 0.6; // twist per ring → spiral of polygons
      const pts: number[] = [];
      for (let k = 0; k <= sides; k++) {
        const a = rot + (k / sides) * 6.283;
        pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      out.push({ pts, s });
    }
    return out;
  },
};
