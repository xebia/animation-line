import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d } from '../core/geom';

/** Órbitas: globo de meridianos (esfera armilar) girando, simétrico, con una
 *  onda de color que recorre la jaula y una respiración uniforme y suave. */
export const orbitas: Variant = {
  name: 'orbitas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const rings = lineCount ?? 22, steps = 72;
    const S = Math.min(W, H) * 0.42;
    const rotY = t * 0.00035, rotX = 0.35 + 0.1 * Math.sin(t * 0.00022);
    const breathe = 1 + 0.05 * Math.sin(t * 0.0008); // pulso uniforme (mantiene la simetría)
    const out: Polyline[] = [];
    for (let i = 0; i < rings; i++) {
      const phi = (i / rings) * Math.PI; // cada meridiano, girado sobre el eje
      const cphi = Math.cos(phi), sphi = Math.sin(phi);
      const pts: number[] = [];
      for (let j = 0; j <= steps; j++) {
        const a = (j / steps) * Math.PI * 2;
        const x = Math.cos(a) * cphi * breathe;
        const y = Math.sin(a) * breathe;
        const z = Math.cos(a) * sphi * breathe;
        const p = project3d(x, y, z, rotX, rotY, S, W, H);
        pts.push(p.X, p.Y);
      }
      // onda de color que barre la jaula de meridianos
      out.push({ pts, s: ((i / rings + t * 0.0002) % 1 + 1) % 1 });
    }
    return out;
  },
};
