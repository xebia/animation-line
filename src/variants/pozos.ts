import type { Variant, Polyline, VariantEnv } from '../core/types';
import { cube, lattice, wave, grad } from '../core/iso';
import type { Cam } from '../core/iso';

/** Pozos: el negativo de los bloques. Las celdas se hunden por debajo del plano y el campo
 *  se lee como una placa perforada; la onda hace que los huecos suban y bajen. */
export const pozos: Variant = {
  name: 'pozos',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 4);
    const cam: Cam = { ang: Math.PI / 4, k: 0.52, S, W, H }; // isometría fija
    const out: Polyline[] = [];

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t, 0.6, 0.002);
      const depth = -(0.2 + 0.8 * (0.5 + 0.5 * w)); // altura negativa: el cubo cae hacia dentro
      const c = cube(cam, n.x, n.y, 0.4, depth, 4);
      const s = grad(-w);
      // aquí el "suelo" del cubo es la boca del pozo: es lo que se ve. El fondo no se dibuja,
      // así no aparecen líneas cruzándose por detrás de la boca.
      c.base.forEach((e) => out.push({ pts: e, s, w: 1.8 }));
      c.sides.forEach((e) => out.push({ pts: e, s, a: 0.7, w: 1.1 }));
    }
    return out;
  },
};
