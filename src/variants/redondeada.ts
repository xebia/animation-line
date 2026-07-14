import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

const ARC = 5; // segmentos por esquina redondeada

/** Redondeada: la celda de la malla en positivo — un cuadrado de esquinas redondeadas por
 *  hueco, girado como en la referencia. Lo que queda entre celda y celda es la barra de la malla.
 *  La onda engorda las celdas hasta casi tocarse, y la malla se afina. */
export const redondeada: Variant = {
  name: 'redondeada',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 9);
    const tilt = 0.35; // la malla va girada, como en la referencia
    const co = Math.cos(tilt), si = Math.sin(tilt);
    const D = Math.hypot(W, H);
    const ox = (W - D) / 2, oy = (H - D) / 2;
    const out: Polyline[] = [];

    for (const tile of squareTiles(D, D, cell)) {
      const rx = tile.cx + ox - W / 2, ry = tile.cy + oy - H / 2;
      const cx = W / 2 + rx * co - ry * si;
      const cy = H / 2 + rx * si + ry * co;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.16, freq: 1.0 });
      const r = cell * 0.42 * b.scale;   // media celda
      const k = r * 0.42;                // radio de la esquina redondeada

      const pts: number[] = [];
      // recorre el cuadrado esquina a esquina, redondeando cada una con un cuarto de vuelta
      const CORNERS: Array<[number, number]> = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
      for (let c = 0; c <= 4; c++) {
        const [sx, sy] = CORNERS[c % 4];
        const px = sx * (r - k), py = sy * (r - k);
        for (let a = 0; a <= ARC; a++) {
          const ang = Math.atan2(sy, sx) - Math.PI / 4 + (a / ARC) * (Math.PI / 2);
          const x = px + Math.cos(ang) * k, y = py + Math.sin(ang) * k;
          pts.push(cx + x * co - y * si, cy + x * si + y * co);
        }
      }
      out.push({ pts, s: b.s, w: 1.2 + 0.5 * b.w });
    }
    return out;
  },
};
