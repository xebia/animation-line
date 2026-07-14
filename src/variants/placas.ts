import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project, lattice, wave, grad, openEdge } from '../core/iso';
import type { Cam } from '../core/iso';

/** Placas: solo la cara superior de cada celda, flotando a la altura que le marca la onda.
 *  Sin aristas verticales que las aten, las placas parecen levitar en escalones — el campo
 *  se lee como una superficie 3D despiezada. */
export const placas: Variant = {
  name: 'placas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 7);
    const cam: Cam = { ang: 0.4 + t * 0.0002, k: 0.5, S, W, H };
    const out: Polyline[] = [];
    const corners: Array<[number, number]> = [[-0.42, -0.42], [0.42, -0.42], [0.42, 0.42], [-0.42, 0.42]];

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t, 0.5, 0.0024);
      const z = 0.55 * w;                      // la placa sube y baja
      const s = grad(w);
      const p = corners.map(([dx, dy]) => project(cam, n.x + dx, n.y + dy, z));
      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        out.push({
          pts: openEdge(p[i][0], p[i][1], p[j][0], p[j][1], 6),
          s,
          // las placas altas pesan más: trazo más grueso y opaco
          a: 0.55 + 0.45 * (0.5 + 0.5 * w),
          w: 1.1 + 1.3 * (0.5 + 0.5 * w),
        });
      }
    }
    return out;
  },
};
