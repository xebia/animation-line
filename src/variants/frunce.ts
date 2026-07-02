import type { Variant, Polyline, VariantEnv } from '../core/types';

/** Frunce: cortina de líneas verticales que se agolpan y se abren en ondas de
 *  compresión viajeras — donde se fruncen, brillan (densidad = energía). */
export const frunce: Variant = {
  name: 'frunce',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const lines = lineCount ?? 64, steps = 40;
    const out: Polyline[] = [];
    for (let i = 0; i < lines; i++) {
      const u = i / (lines - 1);
      // desplazamiento que agolpa las líneas (ondas de compresión)
      const w1 = u * 9 - t * 0.001, w2 = u * 21 + t * 0.0006;
      const x0 = u + 0.055 * Math.sin(w1) + 0.022 * Math.sin(w2);
      // compresión local (derivada del desplazamiento): >0 = líneas juntas
      const comp = Math.max(0, -(0.055 * 9 * Math.cos(w1) + 0.022 * 21 * Math.cos(w2)) / 1.6);
      const pts: number[] = [];
      for (let j = 0; j <= steps; j++) {
        const v = j / steps;
        // ondulación vertical suave, distinta por línea
        const sway = 0.012 * Math.sin(v * 5 + u * 6 + t * 0.0007)
          + 0.006 * Math.sin(v * 11 - t * 0.0005 + u * 3);
        pts.push((x0 + sway) * W, v * H);
      }
      out.push({ pts, s: u, a: 0.35 + 0.65 * Math.min(1, comp) });
    }
    return out;
  },
};
