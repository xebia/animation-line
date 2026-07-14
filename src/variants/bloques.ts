import type { Variant, Polyline, VariantEnv } from '../core/types';
import { cube, lattice, wave, grad } from '../core/iso';
import type { Cam } from '../core/iso';

/** Bloques: campo de cubos idénticos que la cámara recorre girando. Las aristas no cierran
 *  en los vértices, así que el volumen se lee sin dejar de ser una trama de líneas. */
export const bloques: Variant = {
  name: 'bloques',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 4);
    const cam: Cam = { ang: Math.PI / 4, k: 0.5, S, W, H }; // isometría fija
    const out: Polyline[] = [];

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t);
      const h = 0.62 + 0.22 * w;           // el cubo respira de alto
      const c = cube(cam, n.x, n.y, 0.36, h, 5);
      const s = grad(w);
      c.top.forEach((e) => out.push({ pts: e, s, w: 1.7 }));
      c.sides.forEach((e) => out.push({ pts: e, s, a: 0.85, w: 1.3 }));
    }
    return out;
  },
};
