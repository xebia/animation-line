import type { Variant, Polyline, VariantEnv } from '../core/types';
import { cube, lattice, wave, grad } from '../core/iso';
import type { Cam } from '../core/iso';

const STEPS = 5; // peldaños antes de volver a empezar

/** Escaleras: la altura sube por peldaños con la diagonal del campo y vuelve a cero — una
 *  escalera infinita que no acaba de subir nunca. El escalón viaja con el tiempo. */
export const escaleras: Variant = {
  name: 'escaleras',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 7);
    const cam: Cam = { ang: 0.78, k: 0.5, S, W, H };
    const out: Polyline[] = [];
    const march = Math.floor(t * 0.0022); // el peldaño avanza a saltos: la escalera "corre"

    for (const n of lattice(cam, 1)) {
      const step = (((n.i + n.j + march) % STEPS) + STEPS) % STEPS;
      const h = 0.25 + step * 0.42 + 0.12 * wave(n.i, n.j, t);
      const c = cube(cam, n.x, n.y, 0.42, h, 4); // cubos casi pegados: forman la rampa
      const s = grad(step / (STEPS - 1) * 2 - 1);
      c.top.forEach((e) => out.push({ pts: e, s, w: 1.7 }));
      c.sides.forEach((e) => out.push({ pts: e, s, a: 0.8, w: 1.2 }));
      c.base.forEach((e) => out.push({ pts: e, s, a: 0.4, w: 0.9 }));
    }
    return out;
  },
};
