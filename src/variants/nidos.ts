import type { Variant, Polyline, VariantEnv } from '../core/types';
import { cube, lattice, wave, grad } from '../core/iso';
import type { Cam } from '../core/iso';

const SHELLS = 3;

/** Nidos: cubos dentro de cubos. Las capas laten con retardo unas respecto a otras, así que
 *  el cubo interior asoma y se vuelve a meter — una caja que se abre sin abrirse. */
export const nidos: Variant = {
  name: 'nidos',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 5);
    const cam: Cam = { ang: 0.5 + t * 0.00025, k: 0.5, S, W, H };
    const out: Polyline[] = [];

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t, 0.5, 0.0016);
      const s = grad(w);
      for (let k = 0; k < SHELLS; k++) {
        // cada capa late con su retardo: el interior se adelanta al exterior
        const beat = Math.sin(t * 0.0022 - k * 1.1 + (n.i + n.j) * 0.35);
        const size = 0.42 * (1 - k * 0.28) * (1 + 0.16 * beat);
        const h = (0.75 - k * 0.2) * (1 + 0.2 * beat) + 0.15 * w;
        const c = cube(cam, n.x, n.y, size, h, 3);
        const fade = 1 - k * 0.22;
        c.top.forEach((e) => out.push({ pts: e, s, a: fade, w: 1.7 - k * 0.4 }));
        c.sides.forEach((e) => out.push({ pts: e, s, a: 0.75 * fade, w: 1.2 - k * 0.25 }));
      }
    }
    return out;
  },
};
