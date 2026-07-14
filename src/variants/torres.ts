import type { Variant, Polyline, VariantEnv } from '../core/types';
import { cube, lattice, wave, grad } from '../core/iso';
import type { Cam } from '../core/iso';

/** Torres: la altura de cada bloque la marca una onda que recorre el campo — un skyline de
 *  datos que sube y baja mientras la cámara gira. */
export const torres: Variant = {
  name: 'torres',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 4.5);
    const cam: Cam = { ang: Math.PI / 4, k: 0.5, S, W, H }; // isometría fija
    const out: Polyline[] = [];

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t, 0.5, 0.0022);
      const h = 0.25 + 1.5 * (0.5 + 0.5 * w) ** 2; // al cuadrado: las cimas destacan más
      const c = cube(cam, n.x, n.y, 0.34, h, 4);
      const s = grad(w);
      c.top.forEach((e) => out.push({ pts: e, s, w: 1.8 }));
      c.sides.forEach((e) => out.push({ pts: e, s, a: 0.8, w: 1.2 }));
    }
    return out;
  },
};
