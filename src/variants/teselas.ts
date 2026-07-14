import type { Variant, Polyline, VariantEnv } from '../core/types';
import { hexTiles, breathe } from '../core/tiling';

/** Teselas: en cada nodo, tres brazos a 120° — alternando orientación, componen la trama
 *  de tri-estrellas y hexágonos abiertos. La onda abre y cierra el ángulo entre brazos,
 *  y la trama pasa de estrella a hexágono y vuelve. */
export const teselas: Variant = {
  name: 'teselas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 16);
    const out: Polyline[] = [];

    for (const tile of hexTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { scaleAmp: 0.34, rotAmp: 0.9, freq: 1.2 });
      const flip = (tile.i + tile.j) & 1 ? Math.PI / 3 : 0; // Y hacia arriba / hacia abajo
      const spread = (Math.PI * 2) / 3 + 0.55 * b.w;        // los brazos se abren y cierran
      const arm = cell * 0.44 * b.scale;
      // el hueco central separa los brazos del nodo → estrella abierta, no aspa maciza
      const gap = cell * 0.06 * (1 - 0.5 * b.w);

      for (let k = 0; k < 3; k++) {
        const a = k * spread + Math.PI / 2 + b.rot + flip;
        const ux = Math.cos(a), uy = Math.sin(a);
        out.push({
          pts: [cx + ux * gap, cy + uy * gap, cx + ux * arm, cy + uy * arm],
          s: b.s,
          w: 1.3,
        });
      }
    }
    return out;
  },
};
