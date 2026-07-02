import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d, depthAlpha } from '../core/geom';

/** Cinta: lazo/ribbon que se retuerce sobre su eje (líneas transversales). */
export const cinta: Variant = {
  name: 'cinta',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const steps = lineCount ?? 80;
    const S = Math.min(W, H) * 0.48;
    const rotY = t * 0.0003, rotX = 0.5 + 0.1 * Math.sin(t * 0.0004);
    const halfW = 0.55, len = 1.8, turns = 1.5;
    const out: Polyline[] = [];
    for (let j = 0; j <= steps; j++) {
      const u = j / steps;
      const cx = -len / 2 + u * len;
      const ang = u * turns * 6.283 + t * 0.0006;
      const dy = Math.cos(ang), dz = Math.sin(ang);
      // la cinta se frunce: el ancho se pellizca en bandas que viajan
      const hw = halfW * (0.25 + 0.75 * Math.abs(Math.sin(u * Math.PI * 2.5 - t * 0.0012)));
      const A = project3d(cx, hw * dy, hw * dz, rotX, rotY, S, W, H);
      const B = project3d(cx, -hw * dy, -hw * dz, rotX, rotY, S, W, H);
      out.push({ pts: [A.X, A.Y, B.X, B.Y], s: u, a: depthAlpha((A.d + B.d) / 2, 0.7) });
    }
    return out;
  },
};
