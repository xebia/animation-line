import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe, openSides } from '../core/tiling';

const RINGS = 3;

/** Diamante: rombos concéntricos por celda, con los vértices abiertos. Los anillos laten con
 *  retardo unos respecto a otros, de dentro afuera, así que la trama parece emitir desde cada
 *  nodo. Diagonales exactas: el rombo no se tuerce nunca. */
export const diamante: Variant = {
  name: 'diamante',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 9);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.16, freq: 1.0 });

      for (let k = 0; k < RINGS; k++) {
        // cada anillo late detrás del anterior: la onda sale del centro de la celda
        const beat = Math.sin(t * 0.002 - k * 1.2 - (tile.i + tile.j) * 0.4);
        const r = cell * 0.5 * (0.32 + k * 0.24) * b.scale * (1 + 0.12 * beat);
        const verts = [cx, cy - r, cx + r, cy, cx, cy + r, cx - r, cy];
        for (const side of openSides(verts, cell * 0.035 * (1 + 0.5 * beat))) {
          out.push({ pts: side, s: b.s, a: 1 - k * 0.2, w: 1.7 - k * 0.35 });
        }
      }
    }
    return out;
  },
};
