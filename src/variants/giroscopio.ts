import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d } from '../core/geom';

/** Giroscopio: anillos concéntricos anidados que basculan cada uno sobre un
 *  eje distinto — instrumento de precisión girando, simétrico e hipnótico. */
export const giroscopio: Variant = {
  name: 'giroscopio',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const rings = lineCount ?? 16, steps = 80;
    const S = Math.min(W, H) * 0.5;
    const rotY = t * 0.0002, rotX = 0.35;
    const out: Polyline[] = [];
    for (let i = 0; i < rings; i++) {
      const v = i / (rings - 1);
      const r = 0.3 + 0.7 * v;
      // cada anillo bascula sobre su propio eje, alternando el sentido
      const dir = i % 2 === 0 ? 1 : -1;
      const a1 = dir * t * 0.0005 + i * 0.45;
      const c1 = Math.cos(a1), s1 = Math.sin(a1);
      const pts: number[] = [];
      for (let j = 0; j <= steps; j++) {
        const a = (j / steps) * Math.PI * 2;
        // círculo en xy → báscula sobre x propio del anillo
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * c1 * r;
        const z = Math.sin(a) * s1 * r;
        const p = project3d(x, y, z, rotX, rotY, S, W, H);
        pts.push(p.X, p.Y);
      }
      out.push({ pts, s: v });
    }
    return out;
  },
};
