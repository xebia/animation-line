import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project, lattice, wave, grad } from '../core/iso';
import type { Cam } from '../core/iso';

/** Greca: el meandro griego, pero levantado del plano. La cinta se traza sobre una cota alta
 *  y va cayendo por escalones hasta el suelo, así que el meandro se lee como una moldura en
 *  relieve. El trazo avanza y se retira: la greca se dibuja sola. Solo ángulos rectos. */
export const greca: Variant = {
  name: 'greca',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 3.4);
    const cam: Cam = { ang: Math.PI / 4, k: 0.5, S, W, H };
    const out: Polyline[] = [];
    // el meandro: espiral cuadrada en coordenadas de celda
    const PATH: Array<[number, number]> = [
      [-0.42, 0.42], [-0.42, -0.42], [0.42, -0.42], [0.42, 0.28],
      [-0.28, 0.28], [-0.28, -0.28], [0.28, -0.28], [0.28, 0.14],
      [-0.14, 0.14], [-0.14, 0],
    ];

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t, 0.5, 0.0016);
      const s = grad(w);
      const lift = 0.35 + 0.3 * (0.5 + 0.5 * w); // la moldura sube y baja entera

      // cuánto está trazado: la onda recorre el campo dibujando y borrando las grecas
      const phase = 0.5 + 0.5 * Math.sin(t * 0.0016 - (n.i + n.j) * 0.6);
      const drawn = 2 + Math.floor(phase * (PATH.length - 2));

      // la cinta, a su cota: cada vuelta hacia dentro cae un escalón → relieve
      const pts: number[] = [];
      for (let k = 0; k < drawn; k++) {
        const [x, y] = PATH[k];
        const z = lift * (1 - k / (PATH.length - 1)); // se hunde hacia el centro de la espiral
        const p = project(cam, n.x + x, n.y + y, z);
        pts.push(p[0], p[1]);
      }
      if (pts.length >= 4) out.push({ pts, s, w: 2.0 });

      // una sola caída al suelo, en el arranque: ata la moldura al plano sin ensuciar
      const [x0, y0] = PATH[0];
      const a = project(cam, n.x + x0, n.y + y0, lift);
      const b = project(cam, n.x + x0, n.y + y0, 0);
      out.push({ pts: [a[0], a[1], b[0], b[1]], s, a: 0.6, w: 1.1 });
    }
    return out;
  },
};
