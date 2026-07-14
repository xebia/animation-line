import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project, lattice, wave, grad, cube, openEdge } from '../core/iso';
import type { Cam } from '../core/iso';

/** Circuito: una placa impresa vista en isometría. Las pistas son codos ortogonales sobre el
 *  plano y se reenrutan solas — cada nodo gira su codo 90° en su propio momento. Donde la onda
 *  sube, aparece un chip: una caja baja apoyada en la placa, no un mástil. */
export const circuito: Variant = {
  name: 'circuito',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 4);
    const cam: Cam = { ang: Math.PI / 4, k: 0.48, S, W, H }; // isometría fija: la placa no baila
    const out: Polyline[] = [];

    for (const n of lattice(cam, 1)) {
      const w = wave(n.i, n.j, t, 0.5, 0.0018);
      const s = grad(w);
      // codo de pista: gira 90° a saltos, con retardo propio → el trazado se reencamina
      const k = Math.floor(t * 0.001 + n.i * 0.7 + n.j * 1.3) & 3;
      const a = (k * Math.PI) / 2;
      const co = Math.cos(a), si = Math.sin(a);
      const R = (dx: number, dy: number): [number, number] => [dx * co - dy * si, dx * si + dy * co];

      const [e0x, e0y] = R(-0.5, 0);
      const [e1x, e1y] = R(0, 0);
      const [e2x, e2y] = R(0, -0.5);
      const p0 = project(cam, n.x + e0x, n.y + e0y, 0);
      const p1 = project(cam, n.x + e1x, n.y + e1y, 0);
      const p2 = project(cam, n.x + e2x, n.y + e2y, 0);
      out.push({ pts: [p0[0], p0[1], p1[0], p1[1], p2[0], p2[1]], s, a: 0.8, w: 1.5 });

      // isleta de soldadura: un cuadrado plano en el nodo, siempre
      const pad: Array<[number, number]> = [[-0.09, -0.09], [0.09, -0.09], [0.09, 0.09], [-0.09, 0.09]]
        .map(([dx, dy]) => project(cam, n.x + dx, n.y + dy, 0));
      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        out.push({
          pts: openEdge(pad[i][0], pad[i][1], pad[j][0], pad[j][1], 2),
          s, a: 0.7, w: 1.0,
        });
      }

      // chip: donde la onda sube, una caja baja apoyada en la placa
      if (w > 0.3) {
        const h = 0.1 + 0.18 * w;       // muy bajita: es un encapsulado, no una antena
        const c = cube(cam, n.x, n.y, 0.3, h, 3);
        const sc = Math.min(1, s + 0.2);
        c.top.forEach((e) => out.push({ pts: e, s: sc, w: 2.0 }));
        c.sides.forEach((e) => out.push({ pts: e, s: sc, a: 0.85, w: 1.4 }));
        c.base.forEach((e) => out.push({ pts: e, s: sc, a: 0.5, w: 1.0 }));
      }
    }
    return out;
  },
};
