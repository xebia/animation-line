import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe, openSides } from '../core/tiling';

/** Extrusión: cada celda es un cuadrado con sus aristas de profundidad hacia un punto de
 *  fuga común — una caja abierta vista en perspectiva. El punto de fuga gira alrededor del
 *  lienzo, así que todas las cajas giran a la vez y el volumen se ve girar con ellas. */
export const extrusion: Variant = {
  name: 'extrusion',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 10);
    const out: Polyline[] = [];
    const fuga = t * 0.0007;                 // la dirección de fuga da vueltas
    const CORNERS: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

    for (const { cx, cy } of squareTiles(W, H, cell)) {
      const b = breathe(cx, cy, t, W, H, { scaleAmp: 0.2, freq: 1.0 });
      const r = cell * 0.34 * b.scale;
      // profundidad: el fondo se aleja y se acerca con la onda
      const depth = cell * 0.3 * (0.55 + 0.45 * b.w);
      const dx = Math.cos(fuga) * depth, dy = Math.sin(fuga) * depth;
      const gap = cell * 0.045;

      // cara frontal, con las esquinas abiertas
      const front: number[] = [];
      for (const [sx, sy] of CORNERS) front.push(cx + sx * r, cy + sy * r);
      for (const side of openSides(front, gap)) {
        out.push({ pts: side, s: b.s, w: 1.9 });
      }

      // cara del fondo, desplazada hacia la fuga: más fina y apagada, se lee detrás
      const back: number[] = [];
      for (const [sx, sy] of CORNERS) back.push(cx + sx * r + dx, cy + sy * r + dy);
      for (const side of openSides(back, gap)) {
        out.push({ pts: side, s: Math.min(1, b.s + 0.2), a: 0.5, w: 1.0 });
      }

      // aristas de profundidad: solo las dos esquinas que miran a la fuga → volumen, no caja doble
      CORNERS.forEach(([sx, sy], k) => {
        const ax = cx + sx * r, ay = cy + sy * r;
        const facing = (sx * dx + sy * dy) > 0; // esquina del lado de la fuga
        if (!facing) return;
        out.push({
          pts: [ax, ay, ax + dx, ay + dy],
          s: b.s,
          a: 0.75,
          w: 1.2 + 0.2 * (k & 1),
        });
      });
    }
    return out;
  },
};
