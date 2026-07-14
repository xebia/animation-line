import type { Variant, Polyline, VariantEnv } from '../core/types';
import { hexTiles, breathe } from '../core/tiling';

const ARM = (Math.PI * 2) / 3; // 120° exactos: el ángulo del teselado, no se toca

/** Teselas: el teselado de tri-estrellas. Los brazos van a 120° exactos y la orientación
 *  alterna nodo a nodo, así que la trama cierra en hexágonos abiertos. Nada gira: lo que se
 *  mueve es el largo del brazo y el hueco del nudo, y el vuelco de 60°, que es un salto
 *  discreto de una orientación de la rejilla a la otra. */
export const teselas: Variant = {
  name: 'teselas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 12);
    const out: Polyline[] = [];

    for (const tile of hexTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { scaleAmp: 0.3, rotAmp: 0, freq: 1.1 });
      // vuelco discreto: la Y salta entre las dos orientaciones del teselado, con retardo propio
      const flipped = (Math.floor(t * 0.0013 + tile.i * 0.5 + tile.j * 0.9) & 1) !== ((tile.i + tile.j) & 1);
      const base = Math.PI / 2 + (flipped ? Math.PI / 3 : 0);

      const reach = cell * 0.5 * b.scale;         // media distancia al vecino: la trama cierra
      const gap = cell * 0.07 * (1 + 0.8 * b.w);  // el nudo se abre y se cierra

      for (let k = 0; k < 3; k++) {
        const a = base + k * ARM;
        const ux = Math.cos(a), uy = Math.sin(a);
        out.push({
          pts: [cx + ux * gap, cy + uy * gap, cx + ux * reach, cy + uy * reach],
          s: b.s,
          w: 1.4 + 0.9 * (0.5 + 0.5 * b.w),
        });
      }
    }
    return out;
  },
};
