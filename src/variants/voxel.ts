import type { Variant, Polyline, VariantEnv } from '../core/types';
import { cube, lattice, wave, grad } from '../core/iso';
import type { Cam } from '../core/iso';

const FLOORS = 3; // plantas de la rejilla 3D

/** Voxel: una rejilla de tres plantas donde cada casilla se enciende o se apaga según la onda.
 *  Los cubos aparecen y desaparecen en bloque, sin transición: la trama es un autómata, no una
 *  superficie. Campo disperso a propósito, para que se lea el volumen. */
export const voxel: Variant = {
  name: 'voxel',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const S = Math.min(W, H) / (lineCount ?? 4);
    const cam: Cam = { ang: Math.PI / 4, k: 0.5, S, W, H };
    const out: Polyline[] = [];

    for (const n of lattice(cam, 1)) {
      for (let f = 0; f < FLOORS; f++) {
        // el umbral sube con la planta: arriba solo se enciende en la cresta de la onda
        const w = wave(n.i, n.j + f * 2, t, 0.6, 0.002);
        if (w < -0.15 + f * 0.5) continue;
        const z = f * 0.62;
        const c = cube(cam, n.x, n.y, 0.28, 0.55, 4);
        const s = grad(w);
        // el cubo se dibuja a su planta: se desplaza en pantalla lo que sube en el mundo
        const lift = z * S;
        const move = (e: number[]): number[] => e.map((v, i) => (i % 2 ? v - lift : v));
        c.top.forEach((e) => out.push({ pts: move(e), s, a: 1 - f * 0.18, w: 1.6 }));
        c.sides.forEach((e) => out.push({ pts: move(e), s, a: 0.8 - f * 0.15, w: 1.1 }));
      }
    }
    return out;
  },
};
