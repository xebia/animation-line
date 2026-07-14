import type { Variant, Polyline, VariantEnv } from '../core/types';
import { cube, project, lattice, wave, grad } from '../core/iso';
import type { Cam } from '../core/iso';

const HATCH = 3; // líneas de rayado por cara: pocas, si no la cara se emborrona

/** Rayado: cubos cuya cara superior va sombreada a rayas, como un grabado técnico. La
 *  densidad del rayado la marca la onda: las caras se oscurecen y se aclaran por zonas. */
export const rayado: Variant = {
  name: 'rayado',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 3.4); // cubos grandes: pocos y legibles
    // isometría exacta y fija: el teselado queda regular; lo que se mueve es el sombreado
    const cam: Cam = { ang: Math.PI / 4, k: 0.5, S, W, H };
    const out: Polyline[] = [];
    const s0 = 0.4;

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t, 0.55, 0.002);
      const h = 0.5 + 0.3 * w;
      const s = grad(w);
      const c = cube(cam, n.x, n.y, s0, h, 4);
      c.top.forEach((e) => out.push({ pts: e, s, w: 1.6 }));
      c.sides.forEach((e) => out.push({ pts: e, s, a: 0.8, w: 1.1 }));
      c.base.forEach((e) => out.push({ pts: e, s, a: 0.4, w: 0.8 }));

      // rayado de la cara superior: líneas paralelas en el plano del mundo, así que siguen
      // la perspectiva del cubo. Cuanto más alta la onda, más marcado el sombreado.
      const ink = 0.15 + 0.75 * (0.5 + 0.5 * w);
      for (let k = 1; k < HATCH; k++) {
        const u = -s0 + (2 * s0 * k) / HATCH;
        const a = project(cam, n.x + u, n.y - s0 * 0.82, h);
        const b = project(cam, n.x + u, n.y + s0 * 0.82, h);
        out.push({ pts: [a[0], a[1], b[0], b[1]], s, a: ink, w: 0.7 });
      }
    }
    return out;
  },
};
