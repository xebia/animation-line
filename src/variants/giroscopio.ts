import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d } from '../core/geom';

/** Giroscopio: escultura cinética — anillos idénticos repartidos uniformemente
 *  alrededor de un eje común, precesando todos al mismo ritmo. Se cruzan en dos
 *  polos y forman una jaula esférica que rueda sobre sí misma, perfectamente
 *  ordenada. */
export const giroscopio: Variant = {
  name: 'giroscopio',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const rings = lineCount ?? 18, steps = 90;
    const S = Math.min(W, H) * 0.48;
    const rotY = t * 0.00022, rotX = 0.5 + 0.08 * Math.sin(t * 0.0002);
    const R = 0.95;
    const prec = t * 0.0004; // precesión uniforme: todos giran a la vez
    const out: Polyline[] = [];
    for (let i = 0; i < rings; i++) {
      const phi = (i / rings) * Math.PI + prec; // reparto uniforme sobre el eje
      const cphi = Math.cos(phi), sphi = Math.sin(phi);
      const pts: number[] = [];
      for (let j = 0; j <= steps; j++) {
        const a = (j / steps) * Math.PI * 2;
        // círculo en xy girado sobre el eje x → todos comparten los dos polos
        const x = Math.cos(a) * R;
        const y = Math.sin(a) * cphi * R;
        const z = Math.sin(a) * sphi * R;
        const p = project3d(x, y, z, rotX, rotY, S, W, H);
        pts.push(p.X, p.Y);
      }
      out.push({ pts, s: i / rings });
    }
    return out;
  },
};
