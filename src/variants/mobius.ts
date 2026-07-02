import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d } from '../core/geom';

/** Möbius: banda de Möbius geométrica y limpia — ancho constante, líneas
 *  longitudinales equiespaciadas y rotación serena. Cada línea recorre la
 *  banda dos vueltas (4π) para cerrarse sobre sí misma. */
export const mobius: Variant = {
  name: 'mobius',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const lines = lineCount ?? 14, steps = 168;
    const S = Math.min(W, H) * 0.42;
    const rotY = t * 0.00028, rotX = 0.5 + 0.06 * Math.sin(t * 0.0002);
    const R = 0.82, w = 0.3;
    const spin = t * 0.00035; // la banda gira sobre sí misma, lentamente
    const out: Polyline[] = [];
    for (let i = 0; i < lines; i++) {
      const c = i / (lines - 1); // offset 0 (centro) → 1 (borde)
      const pts: number[] = [];
      for (let j = 0; j <= steps; j++) {
        const u = (j / steps) * 4 * Math.PI + spin; // 2 vueltas → lazo cerrado
        const rr = R + c * w * Math.cos(u / 2);
        const p = project3d(rr * Math.cos(u), c * w * Math.sin(u / 2), rr * Math.sin(u), rotX, rotY, S, W, H);
        pts.push(p.X, p.Y);
      }
      out.push({ pts, s: c });
    }
    return out;
  },
};
