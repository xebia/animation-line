import type { Variant, Polyline, VariantEnv } from '../core/types';
import { hexTiles, breathe } from '../core/tiling';

/** Celdilla: malla continua de nudos en Y — cada nodo lanza tres barras a tres vecinos y el
 *  tejido se cierra en panal. La onda encoge las barras: los nudos se sueltan, la celdilla se
 *  abre y vuelve a coser. */
export const celdilla: Variant = {
  name: 'celdilla',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 9);
    const out: Polyline[] = [];

    for (const tile of hexTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { scaleAmp: 0.26, rotAmp: 0.2, freq: 1.1 });
      const flip = (tile.i + tile.j) & 1 ? Math.PI / 3 : 0; // nudos alternos: el panal cierra
      const reach = cell * 0.5 * b.scale;   // media distancia al vecino: las barras se tocan
      const gap = cell * 0.05 * (1 + 0.8 * b.w);

      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + Math.PI / 2 + b.rot + flip;
        const ux = Math.cos(a), uy = Math.sin(a);
        out.push({
          pts: [cx + ux * gap, cy + uy * gap, cx + ux * reach, cy + uy * reach],
          s: b.s,
          w: 2.2 + 0.9 * b.w,
        });
      }
    }
    return out;
  },
};
