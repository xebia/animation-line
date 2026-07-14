import type { Variant, Polyline, VariantEnv } from '../core/types';
import { hexTiles, breathe } from '../core/tiling';

/** Hexmalla: la malla continua sobre rejilla hexagonal — de cada nodo salen tres barras que
 *  llegan a las de sus vecinos, y el tejido cierra en panal. En cada nodo una barra pasa por
 *  encima y las otras se interrumpen, así que el panal se lee entrelazado, no plano. */
export const hexmalla: Variant = {
  name: 'hexmalla',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 10);
    const out: Polyline[] = [];

    for (const tile of hexTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.14, freq: 1.0 });
      const flip = (tile.i + tile.j) & 1 ? Math.PI / 3 : 0;
      const reach = cell * 0.5 * b.scale;
      const boss = (Math.floor(t * 0.001 + tile.i * 0.5 + tile.j * 0.8) % 3 + 3) % 3;
      const gap = cell * 0.1;

      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + Math.PI / 2 + flip;
        const ux = Math.cos(a), uy = Math.sin(a);
        // la barra que manda arranca del nudo; las otras se despegan → paso por debajo
        const from = k === boss ? 0 : gap;
        out.push({
          pts: [cx + ux * from, cy + uy * from, cx + ux * reach, cy + uy * reach],
          s: b.s,
          a: k === boss ? 1 : 0.8,
          w: k === boss ? 1.5 + 0.4 * b.w : 1.0,
        });
      }
    }
    return out;
  },
};
