import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d, depthAlpha } from '../core/geom';

/** Helicoide: string-art de cuerdas sobre un anillo 3D. Cada punto i se une a (i·mult),
 *  con un multiplicador que evoluciona en el tiempo → patrones de cruces que se transforman
 *  (cardioide/estrella), no un giro constante. */
export const helicoide: Variant = {
  name: 'helicoide',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const N = lineCount ?? 80;
    const S = Math.min(W, H) * 0.48;
    const rotY = t * 0.00015, rotX = 0.6 + 0.15 * Math.sin(t * 0.0002);
    const R = 1.0;
    const mult = 2 + 2.5 * (0.5 + 0.5 * Math.sin(t * 0.00028)); // evoluciona ~2..7
    const ring = (a: number) => ({
      x: R * Math.cos(a),
      y: R * Math.sin(a),
      z: 0.25 * Math.sin(a * 3 + t * 0.0006),
    });
    const out: Polyline[] = [];
    for (let i = 0; i < N; i++) {
      const s = i / N;
      const a1 = (i / N) * 6.283;
      const a2 = (((i * mult) % N) / N) * 6.283;
      const P = ring(a1), Q = ring(a2);
      const A = project3d(P.x, P.y, P.z, rotX, rotY, S, W, H);
      const B = project3d(Q.x, Q.y, Q.z, rotX, rotY, S, W, H);
      out.push({ pts: [A.X, A.Y, B.X, B.Y], s, a: depthAlpha((A.d + B.d) / 2, 0.9) });
    }
    return out;
  },
};
