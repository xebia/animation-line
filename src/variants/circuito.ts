import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project, lattice, wave, grad, cube } from '../core/iso';
import type { Cam } from '../core/iso';

/** Circuito: una placa impresa vista en isometría. Cada nodo aporta un único trazo: o una
 *  pista —un codo ortogonal que gira 90° a saltos, con su propio retardo, así que el trazado
 *  se reencamina solo— o un chip, una caja baja apoyada en la placa donde la onda sube. Nunca
 *  las dos cosas: así la trama respira y no se llena de líneas. */
export const circuito: Variant = {
  name: 'circuito',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 4);
    const cam: Cam = { ang: Math.PI / 4, k: 0.48, S, W, H }; // isometría fija: la placa no baila
    const out: Polyline[] = [];

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t, 0.5, 0.0018);
      const s = grad(w);

      if (w > 0.45) {
        // chip: solo en la cresta de la onda, y sin la base → silueta limpia
        const h = 0.12 + 0.16 * w;
        const c = cube(cam, n.x, n.y, 0.3, h, 3);
        const sc = Math.min(1, s + 0.2);
        c.top.forEach((e) => out.push({ pts: e, s: sc, w: 2.0 }));
        c.sides.forEach((e) => out.push({ pts: e, s: sc, a: 0.85, w: 1.3 }));
        continue;
      }

      // pista: codo de ángulo recto entre dos lados de la celda
      const k = Math.floor(t * 0.001 + n.i * 0.7 + n.j * 1.3) & 3;
      const a = (k * Math.PI) / 2;
      const co = Math.cos(a), si = Math.sin(a);
      const R = (dx: number, dy: number): [number, number] => [dx * co - dy * si, dx * si + dy * co];
      const path = ([[-0.46, 0], [0, 0], [0, -0.46]] as Array<[number, number]>)
        .map(([dx, dy]) => R(dx, dy))
        .map(([dx, dy]) => project(cam, n.x + dx, n.y + dy, 0));
      out.push({
        pts: [path[0][0], path[0][1], path[1][0], path[1][1], path[2][0], path[2][1]],
        s, a: 0.85, w: 1.6,
      });
    }
    return out;
  },
};
