import type { Variant, Polyline, VariantEnv } from '../core/types';
import { cube, lattice, wave, grad } from '../core/iso';
import type { Cam } from '../core/iso';

/** Barras: prismas finos y separados, como un gráfico de barras 3D que se recalcula solo.
 *  La onda viaja en diagonal, así que las barras se levantan por filas. */
export const barras: Variant = {
  name: 'barras',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 6);
    const cam: Cam = { ang: 0.35 + 0.12 * Math.sin(t * 0.0004), k: 0.46, S, W, H };
    const out: Polyline[] = [];

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i + n.j, n.j, t, 0.7, 0.0026); // frente diagonal
      const h = 0.15 + 1.9 * (0.5 + 0.5 * w);
      const c = cube(cam, n.x, n.y, 0.17, h, 3); // barra estrecha: se ve el suelo entre ellas
      const s = grad(w);
      c.top.forEach((e) => out.push({ pts: e, s, w: 1.6 }));
      c.sides.forEach((e) => out.push({ pts: e, s, a: 0.9, w: 1.4 }));
      c.base.forEach((e) => out.push({ pts: e, s, a: 0.4, w: 0.8 }));
    }
    return out;
  },
};
