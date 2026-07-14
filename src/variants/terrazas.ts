import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project, lattice, wave, grad } from '../core/iso';
import type { Cam } from '../core/iso';

const LEVELS = 5; // cotas de la terraza

/** Terrazas: el relieve cuantizado en cotas, como un mapa topográfico. La altura de cada celda
 *  salta de escalón en escalón —nunca en medio—, así que el terreno se lee en bancales limpios
 *  que suben y bajan cuando la onda cruza el campo. Solo el borde alto de cada bancal. */
export const terrazas: Variant = {
  name: 'terrazas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 5);
    const cam: Cam = { ang: Math.PI / 4, k: 0.5, S, W, H };
    const out: Polyline[] = [];
    const r = 0.5;

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t, 0.42, 0.0016);
      const level = Math.round((0.5 + 0.5 * w) * (LEVELS - 1)); // la cota es discreta
      const h = level * 0.32;
      const s = grad(w);

      // tapa del bancal: el cuadrado a su cota
      const top = ([[-r, -r], [r, -r], [r, r], [-r, r]] as Array<[number, number]>)
        .map(([x, y]) => project(cam, n.x + x, n.y + y, h));
      const pts: number[] = [];
      for (const p of [...top, top[0]]) pts.push(p[0], p[1]);
      out.push({ pts, s, a: 0.55 + 0.45 * (level / (LEVELS - 1)), w: 1.5 });

      // el talud: solo donde la celda es más alta que su vecina de delante, y solo esa arista
      const east = Math.round((0.5 + 0.5 * wave(n.i + 1, n.j, t, 0.42, 0.0016)) * (LEVELS - 1));
      if (level > east) {
        const drop = (east) * 0.32;
        const a = project(cam, n.x + r, n.y - r, h), b = project(cam, n.x + r, n.y - r, drop);
        const c = project(cam, n.x + r, n.y + r, h), d = project(cam, n.x + r, n.y + r, drop);
        out.push({ pts: [a[0], a[1], b[0], b[1]], s, a: 0.7, w: 1.1 });
        out.push({ pts: [c[0], c[1], d[0], d[1]], s, a: 0.7, w: 1.1 });
      }
    }
    return out;
  },
};
