import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project, lattice, grad, openEdge } from '../core/iso';
import type { Cam } from '../core/iso';

const LAYERS = 2; // dos planos bastan para el paralaje; con tres la trama se ensucia

/** Capas: tres rejillas paralelas a distinta altura que se deslizan a distinta velocidad.
 *  Al cruzarse en pantalla producen moiré, y como cada una está a su cota, el moiré tiene
 *  profundidad: se ve el paralaje entre plano y plano. */
export const capas: Variant = {
  name: 'capas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 3.5);
    const cam: Cam = { ang: Math.PI / 4, k: 0.5, S, W, H }; // isometría fija
    const out: Polyline[] = [];

    for (let L = 0; L < LAYERS; L++) {
      const z = L * 0.55;
      // cada capa deriva a su ritmo → paralaje: la de arriba parece ir más rápida
      const drift = t * 0.00028 * (1 + L * 0.7);
      const r = 0.4 - L * 0.06;
      const fade = 1 - L * 0.25;

      for (const n of lattice(cam, 1)) {
        const x = n.x + drift, y = n.y - drift * 0.6;
        const p: Array<[number, number]> = [[-r, -r], [r, -r], [r, r], [-r, r]]
          .map(([dx, dy]) => project(cam, x + dx, y + dy, z));
        const s = grad(Math.sin(n.i * 0.4 + n.j * 0.3 + t * 0.0015 + L));
        for (let i = 0; i < 4; i++) {
          const j = (i + 1) % 4;
          out.push({
            pts: openEdge(p[i][0], p[i][1], p[j][0], p[j][1], 5),
            s, a: fade, w: 1.6 - L * 0.4,
          });
        }
      }
    }
    return out;
  },
};
