import type { Variant, Polyline, VariantEnv } from '../core/types';

/** Aurora: cortina de líneas horizontales que se agrupan y despliegan como
 *  luz boreal — el ancho de la cortina ondula a lo largo y las líneas
 *  respiran entre densas y abiertas. 2D puro, sin proyección. */
export const aurora: Variant = {
  name: 'aurora',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const lines = lineCount ?? 56, steps = 90;
    const out: Polyline[] = [];
    for (let i = 0; i < lines; i++) {
      const v = i / (lines - 1);
      const pts: number[] = [];
      for (let j = 0; j <= steps; j++) {
        const u = j / steps;
        // pliegue de la cortina: cuánto se abre el haz en esta x
        const spread = 0.32 + 0.26 * Math.sin(u * 2.6 + t * 0.0004)
          + 0.12 * Math.sin(u * 5.1 - t * 0.0006 + 1.7);
        // ondulación compartida (la cortina entera se mece)
        const wave = 0.5 * Math.sin(u * 3.8 + t * 0.0005 + v * 1.4)
          + 0.3 * Math.sin(u * 7.1 - t * 0.0008 + v * 2.2)
          + 0.2 * Math.sin(u * 1.9 + t * 0.0003);
        const y = H * (0.5 + (v - 0.5) * spread + 0.11 * wave);
        pts.push(u * W, y);
      }
      // los bordes de la cortina se desvanecen
      out.push({ pts, s: v, a: 0.45 + 0.55 * Math.sin(v * Math.PI) });
    }
    return out;
  },
};
