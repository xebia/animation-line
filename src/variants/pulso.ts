import type { Variant, Polyline, VariantEnv } from '../core/types';

/** Pulso: ondas circulares que nacen en el centro y se expanden desvaneciéndose,
 *  ganando textura angular a medida que crecen (radar orgánico). */
export const pulso: Variant = {
  name: 'pulso',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const rings = lineCount ?? 18, steps = 80;
    const R = Math.min(W, H) * 0.78;
    const cx = W / 2 + Math.min(W, H) * 0.05 * Math.sin(t * 0.0003);
    const cy = H / 2 + Math.min(W, H) * 0.04 * Math.cos(t * 0.00037);
    const out: Polyline[] = [];
    for (let i = 0; i < rings; i++) {
      const fr = ((i / rings + t * 0.00016) % 1 + 1) % 1; // 0 nace → 1 se disipa
      const base = 0.06 + 0.94 * fr;
      const pts: number[] = [];
      for (let j = 0; j <= steps; j++) {
        const a = (j / steps) * 6.283;
        // la distorsión angular crece con el radio (nace limpia, muere agitada)
        const w = 1 + fr * (0.1 * Math.sin(a * 5 + t * 0.0009 + i)
          + 0.06 * Math.sin(a * 9 - t * 0.0013));
        const rr = R * base * w;
        pts.push(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
      }
      out.push({ pts, s: fr, a: Math.pow(1 - fr, 0.8) });
    }
    return out;
  },
};
