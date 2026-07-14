import type { Variant, Polyline, VariantEnv } from '../core/types';
import { cube, lattice, wave, grad } from '../core/iso';
import type { Cam } from '../core/iso';

/** Teclas: un teclado visto en isometría. Cada tecla está arriba o pulsada —dos cotas, nada
 *  intermedio— y la pulsación recorre el campo en oleadas. La tecla pulsada pierde el costado:
 *  se ve hundida, y la trama se lee de un vistazo. */
export const teclas: Variant = {
  name: 'teclas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 5);
    const cam: Cam = { ang: Math.PI / 4, k: 0.5, S, W, H };
    const out: Polyline[] = [];

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t, 0.45, 0.0018);
      const down = w > 0.25;                 // pulsada o no: sin estados intermedios
      const h = down ? 0.12 : 0.42;
      const c = cube(cam, n.x, n.y, 0.42, h, 5); // teclas casi pegadas, como en un teclado real
      const s = grad(w);

      c.top.forEach((e) => out.push({ pts: e, s, w: down ? 1.3 : 1.9 }));
      // la tecla arriba enseña el costado; la pulsada casi no: el hundido se nota
      c.sides.forEach((e) => out.push({ pts: e, s, a: down ? 0.4 : 0.85, w: down ? 0.9 : 1.3 }));
    }
    return out;
  },
};
