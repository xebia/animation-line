import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, openSides } from '../core/tiling';

const DEPTH = 3; // niveles máximos de partición

/** Subdivisión: un quadtree vivo. Cada celda se parte en cuatro cuando la onda pasa por
 *  encima, y las hijas se vuelven a partir; al retirarse la onda se funden otra vez. Todo son
 *  cuadrados alineados a la rejilla: la geometría es exacta y el movimiento, discreto. */
export const subdivision: Variant = {
  name: 'subdivision',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 5);
    const out: Polyline[] = [];

    // ¿esta celda se parte? Lo decide la onda en su centro, con umbral por nivel: cuanto más
    // hondo, más exigente, así que la partición profunda solo ocurre en la cresta.
    const split = (x: number, y: number, level: number): boolean => {
      const w = Math.sin(x * 0.011 - t * 0.0011) + Math.cos(y * 0.013 + t * 0.0009);
      return w > 0.2 + level * 0.55;
    };

    const emit = (x: number, y: number, size: number, level: number): void => {
      if (level < DEPTH && split(x, y, level)) {
        const h = size / 2, q = size / 4;
        emit(x - q, y - q, h, level + 1);
        emit(x + q, y - q, h, level + 1);
        emit(x - q, y + q, h, level + 1);
        emit(x + q, y + q, h, level + 1);
        return;
      }
      const r = size * 0.5;
      const verts = [x - r, y - r, x + r, y - r, x + r, y + r, x - r, y + r];
      for (const side of openSides(verts, size * 0.08)) {
        out.push({
          pts: side,
          s: level / DEPTH,               // el color delata la profundidad de la partición
          a: 0.5 + 0.5 * (level / DEPTH), // las hojas pequeñas pesan más
          w: 2.2 - level * 0.5,
        });
      }
    };

    for (const { cx, cy } of squareTiles(W, H, cell)) emit(cx, cy, cell * 0.94, 0);
    return out;
  },
};
