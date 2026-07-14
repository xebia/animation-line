import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project, lattice, wave, grad } from '../core/iso';
import type { Cam } from '../core/iso';

/** Circuito: pistas ortogonales sobre el plano del mundo, vistas en volumen, con una torre
 *  en los nodos donde la onda está alta — una placa de circuito impreso en perspectiva, con
 *  sus componentes asomando. Las pistas se reenrutan solas: cada nodo gira su codo 90° en su
 *  propio momento. */
export const circuito: Variant = {
  name: 'circuito',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 6);
    const cam: Cam = { ang: 0.5 + t * 0.00012, k: 0.48, S, W, H };
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

      // componente: solo donde la onda está alta, asoma una torre sobre el nodo
      if (w > 0.35) {
        const h = 0.25 + 0.5 * w;
        const base = project(cam, n.x, n.y, 0);
        const top = project(cam, n.x, n.y, h);
        out.push({ pts: [base[0], base[1], top[0], top[1]], s: Math.min(1, s + 0.2), w: 2.2 });
        // cabeza del componente: un rombo pequeño en la cota alta
        const head: number[] = [];
        for (const [dx, dy] of [[-0.14, 0], [0, -0.14], [0.14, 0], [0, 0.14], [-0.14, 0]]) {
          const q = project(cam, n.x + dx, n.y + dy, h);
          head.push(q[0], q[1]);
        }
        out.push({ pts: head, s: Math.min(1, s + 0.2), w: 1.2 });
      }
    }
    return out;
  },
};
