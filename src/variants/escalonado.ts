import type { Variant, Polyline, VariantEnv } from '../core/types';
import { grad } from '../core/iso';

/** Escalonado: caminos ortogonales que suben en escalera por todo el lienzo. Solo hay tramos
 *  horizontales y verticales —ni una diagonal—, y la altura del peldaño la marca una onda que
 *  recorre el campo: la escalera se empina y se aplana sin dejar de ser ortogonal. */
export const escalonado: Variant = {
  name: 'escalonado',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const paths = lineCount ?? 22;
    const steps = 14;
    const out: Polyline[] = [];
    const gapY = H / (paths - 1);
    const stepX = W / steps;

    for (let p = 0; p < paths; p++) {
      const y0 = p * gapY;
      const pts: number[] = [];
      let y = y0;
      pts.push(0, y);
      for (let k = 0; k < steps; k++) {
        const x1 = (k + 1) * stepX;
        pts.push(x1, y);                         // tramo horizontal, hasta el borde del peldaño
        // el peldaño sube o baja según la onda, y siempre en vertical
        y = y0 + gapY * 0.55 * Math.sin(k * 0.8 - t * 0.0016 + p * 0.5);
        pts.push(x1, y);                         // contrahuella: el tramo vertical
      }
      out.push({ pts, s: grad(Math.sin(p * 0.5 - t * 0.0012)), w: 1.5 });
    }
    return out;
  },
};
