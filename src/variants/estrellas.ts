import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project, lattice, wave, grad, openEdge } from '../core/iso';
import type { Cam } from '../core/iso';

const POINTS = 8; // puntas de la estrella

/** Estrellas: una estrella de ocho puntas por celda, levantada sobre el plano. El contorno va
 *  entero a su cota y solo cuatro aristas bajan al suelo — lo justo para que se vea el
 *  volumen sin que se crucen líneas por detrás. Las puntas se afilan y se achatan con la onda. */
export const estrellas: Variant = {
  name: 'estrellas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 4);
    const cam: Cam = { ang: Math.PI / 4, k: 0.5, S, W, H };
    const out: Polyline[] = [];

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t, 0.5, 0.0019);
      const s = grad(w);
      const h = 0.25 + 0.4 * (0.5 + 0.5 * w);   // la estrella se eleva
      const R = 0.5;                            // punta: llega justo al vecino
      const r = 0.2 + 0.12 * (0.5 + 0.5 * w);   // valle: la estrella se afila y se achata

      // contorno estrellado: alterna punta y valle
      const verts: Array<[number, number]> = [];
      for (let k = 0; k < POINTS * 2; k++) {
        const a = (k / (POINTS * 2)) * Math.PI * 2;
        const rad = k % 2 === 0 ? R : r;
        verts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
      }
      const top = verts.map(([x, y]) => project(cam, n.x + x, n.y + y, h));
      for (let i = 0; i < top.length; i++) {
        const j = (i + 1) % top.length;
        out.push({ pts: openEdge(top[i][0], top[i][1], top[j][0], top[j][1], 3), s, w: 1.7 });
      }

      // solo las cuatro puntas de delante bajan al plano: el volumen se lee, la trama no se ensucia
      const tips = [0, 2, 4, 6, 8, 10, 12, 14]
        .sort((a, b) => top[b][1] - top[a][1])
        .slice(0, 4);
      for (const i of tips) {
        const foot = project(cam, n.x + verts[i][0], n.y + verts[i][1], 0);
        out.push({ pts: [top[i][0], top[i][1], foot[0], foot[1]], s, a: 0.7, w: 1.1 });
      }
    }
    return out;
  },
};
