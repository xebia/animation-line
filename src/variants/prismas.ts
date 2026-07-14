import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project, lattice, wave, grad, openEdge } from '../core/iso';
import type { Cam } from '../core/iso';

/** Prismas: panal hexagonal extruido, como una placa de celdas vista en volumen. Cada celda
 *  sube y baja con la onda; las aristas quedan abiertas en los vértices. */
export const prismas: Variant = {
  name: 'prismas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 3.6); // celdas grandes: el panal se lee
    const cam: Cam = { ang: Math.PI / 4, k: 0.5, S, W, H }; // isometría fija
    const out: Polyline[] = [];
    const R = 0.56; // radio del hexágono: las celdas se tocan lado con lado

    for (const n of lattice(cam, 1)) {
      // rejilla hexagonal: las filas impares van media celda desplazadas
      const x = n.x + (n.j & 1 ? 0.5 : 0);
      const y = n.y * 0.866;
      const w = wave(n.i, n.j, t, 0.6, 0.0022);
      const h = 0.3 + 0.95 * (0.5 + 0.5 * w);
      const s = grad(w);

      const top: Array<[number, number]> = [];
      const base: Array<[number, number]> = [];
      for (let v = 0; v < 6; v++) {
        const a = (v / 6) * Math.PI * 2 + Math.PI / 6;
        const dx = Math.cos(a) * R, dy = Math.sin(a) * R;
        top.push(project(cam, x + dx, y + dy, h));
        base.push(project(cam, x + dx, y + dy, 0));
      }
      for (let v = 0; v < 6; v++) {
        const u = (v + 1) % 6;
        out.push({ pts: openEdge(top[v][0], top[v][1], top[u][0], top[u][1], 4), s, w: 1.7 });
      }
      // solo las tres aristas verticales de delante: las de atrás no se verían
      const front = [...top.keys()].sort((a, b) => base[b][1] - base[a][1]).slice(0, 3);
      for (const v of front) {
        out.push({
          pts: openEdge(top[v][0], top[v][1], base[v][0], base[v][1], 4),
          s, a: 0.75, w: 1.1,
        });
      }
    }
    return out;
  },
};
