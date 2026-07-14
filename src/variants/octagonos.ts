import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project, lattice, wave, grad, openEdge } from '../core/iso';
import type { Cam } from '../core/iso';

const K = 0.4142; // tan(22.5°): la proporción que hace regular al octógono

/** Octágonos: el teselado de octógono y cuadrado, pero extruido. Cada octógono es un prisma
 *  que sube y baja con la onda: se ve la cara alta, su huella en el plano y las aristas
 *  verticales del frente. Ángulos exactos de 45°, cámara isométrica fija. */
export const octagonos: Variant = {
  name: 'octagonos',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 4);
    const cam: Cam = { ang: Math.PI / 4, k: 0.5, S, W, H };
    const out: Polyline[] = [];
    const r = 0.5, c = r * K;
    const CORNERS: Array<[number, number]> = [
      [-c, -r], [c, -r], [r, -c], [r, c], [c, r], [-c, r], [-r, c], [-r, -c],
    ];

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t, 0.55, 0.002);
      const h = 0.18 + 0.5 * (0.5 + 0.5 * w); // altura del prisma
      const s = grad(w);

      const top = CORNERS.map(([x, y]) => project(cam, n.x + x, n.y + y, h));
      const foot = CORNERS.map(([x, y]) => project(cam, n.x + x, n.y + y, 0));
      // cara alta entera; del pie, solo el faldón de delante → nada de líneas ocultas cruzándose
      for (let i = 0; i < 8; i++) {
        const j = (i + 1) % 8;
        out.push({ pts: openEdge(top[i][0], top[i][1], top[j][0], top[j][1], 4), s, w: 1.7 });
      }
      const front = [...top.keys()].sort((a, b) => foot[b][1] - foot[a][1]).slice(0, 3);
      for (const i of front) {
        const j = (i + 1) % 8;
        out.push({ pts: [top[i][0], top[i][1], foot[i][0], foot[i][1]], s, a: 0.85, w: 1.2 });
        out.push({ pts: openEdge(foot[i][0], foot[i][1], foot[j][0], foot[j][1], 4), s, a: 0.5, w: 1.0 });
      }

      // el cuadrado que tapa el hueco entre cuatro octógonos, sobre el plano
      const q = 0.5 * (0.18 + 0.12 * (0.5 + 0.5 * w));
      const sq = ([[0, -q], [q, 0], [0, q], [-q, 0]] as Array<[number, number]>)
        .map(([x, y]) => project(cam, n.x + 0.5 + x, n.y + 0.5 + y, 0));
      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        out.push({
          pts: openEdge(sq[i][0], sq[i][1], sq[j][0], sq[j][1], 2),
          s: Math.min(1, s + 0.25), a: 0.7, w: 1.1,
        });
      }
    }
    return out;
  },
};
