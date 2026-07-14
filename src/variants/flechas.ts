import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Flechas: un chevrón por celda, y filas que apuntan en sentidos opuestos. La onda abre y
 *  cierra el vértice: cuando se abre del todo, los chevrones se alinean en bandas rectas; cuando
 *  se cierra, el campo se llena de puntas. */
export const flechas: Variant = {
  name: 'flechas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 13);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const cx = tile.cx + (tile.j & 1 ? cell * 0.5 : 0); // filas trabadas
      const cy = tile.cy;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.28, freq: 1.1 });
      const dir = tile.j & 1 ? -1 : 1;                    // filas alternas: la punta se invierte
      const h = cell * 0.42 * b.scale;
      const a = cell * 0.24 * (0.25 + 0.75 * (0.5 + 0.5 * b.w)); // el vértice se abre y se cierra

      out.push({
        pts: [cx - h, cy + dir * a, cx, cy - dir * a, cx + h, cy + dir * a],
        s: b.s,
        w: 0.9 + 0.7 * (0.5 + 0.5 * b.w),
      });
    }
    return out;
  },
};
