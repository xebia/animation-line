import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project, lattice, grad } from '../core/iso';
import type { Cam } from '../core/iso';

/** Acordeón: una lámina plegada en zigzag. Las crestas y los valles alternan fila a fila, y el
 *  pliegue viaja: lo que era cresta se hunde y el fuelle parece abrirse y cerrarse. Cada pliegue
 *  es una sola polilínea quebrada, sin nada por detrás. */
export const acordeon: Variant = {
  name: 'acordeon',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 5);
    const cam: Cam = { ang: Math.PI / 4, k: 0.5, S, W, H };
    const out: Polyline[] = [];
    const SPAN = 7; // celdas de largo de cada pliegue

    for (const n of lattice(cam, 1)) {
      if (n.i % SPAN !== 0) continue; // una polilínea cada SPAN celdas: el resto son sus vértices

      const pts: number[] = [];
      for (let k = 0; k <= SPAN; k++) {
        const i = n.i + k;
        // la altura alterna cresta/valle, y la amplitud del fuelle late con el tiempo
        const fold = (i & 1) ? 1 : -1;
        const amp = 0.45 * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.0016 - n.j * 0.5 + i * 0.25)));
        const p = project(cam, i, n.y, fold * amp);
        pts.push(p[0], p[1]);
      }
      const s = grad(Math.sin(n.j * 0.4 + t * 0.0012));
      out.push({ pts, s, w: 1.8 });
    }
    return out;
  },
};
