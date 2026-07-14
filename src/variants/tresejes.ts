import type { Variant, Polyline, VariantEnv } from '../core/types';
import { hexTiles, breathe } from '../core/tiling';

const AXES = [0, Math.PI / 3, (2 * Math.PI) / 3]; // las tres direcciones del tejido

/** Tres ejes: malla triangular — de cada nodo salen barras en las tres direcciones del
 *  entramado. La onda acorta unos ejes y alarga otros, así que el triángulo se deshace en
 *  bandas y se vuelve a armar. */
export const tresejes: Variant = {
  name: 'tresejes',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 11);
    const out: Polyline[] = [];

    for (const tile of hexTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { scaleAmp: 0.2, rotAmp: 0.18, freq: 1.2 });
      const gap = cell * 0.06 * (1 + b.w);

      AXES.forEach((axis, k) => {
        // cada eje respira con su propio desfase: el tejido nunca es isótropo
        const pull = 0.5 + 0.5 * Math.sin(t * 0.0016 + k * 2.1 + (tile.i + tile.j) * 0.3);
        const reach = cell * 0.5 * (0.55 + 0.55 * pull) * b.scale;
        const a = axis + b.rot;
        const ux = Math.cos(a), uy = Math.sin(a);
        out.push({
          pts: [cx + ux * gap, cy + uy * gap, cx + ux * reach, cy + uy * reach],
          s: b.s,
          a: 0.55 + 0.45 * pull,
          w: 1.5 + 1.1 * pull,
        });
        out.push({
          pts: [cx - ux * gap, cy - uy * gap, cx - ux * reach, cy - uy * reach],
          s: b.s,
          a: 0.55 + 0.45 * pull,
          w: 1.5 + 1.1 * pull,
        });
      });
    }
    return out;
  },
};
