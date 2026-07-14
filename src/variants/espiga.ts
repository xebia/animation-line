import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Espiga: el aparejo en espina de pez. Cada celda lleva una barra a 45°, y la inclinación
 *  alterna columna a columna, así que las barras encajan unas con otras en zigzag. La onda las
 *  alarga y las acorta: la espiga se aprieta y se suelta. */
export const espiga: Variant = {
  name: 'espiga',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 16);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const cx = tile.cx + (tile.j & 1 ? cell * 0.5 : 0); // filas trabadas
      const cy = tile.cy;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.3, freq: 1.1 });
      const ang = (tile.i & 1 ? 1 : -1) * (Math.PI / 4); // 45° exactos, alternos
      const len = cell * 0.82 * b.scale;
      const dx = Math.cos(ang) * len * 0.5, dy = Math.sin(ang) * len * 0.5;
      out.push({
        pts: [cx - dx, cy - dy, cx + dx, cy + dy],
        s: b.s,
        w: 1.4 + 0.9 * (0.5 + 0.5 * b.w),
      });
    }
    return out;
  },
};
