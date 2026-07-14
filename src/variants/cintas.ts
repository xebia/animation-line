import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, openSides } from '../core/tiling';

/** Cintas: bandas horizontales de cuadrados que corren a distinta velocidad y en sentidos
 *  alternos, como registros de datos desfilando. Cada banda es un carril limpio: nada se cruza,
 *  y el desfase entre carriles hace que la trama nunca se repita a la vista. */
export const cintas: Variant = {
  name: 'cintas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 12);
    const out: Polyline[] = [];
    const wrap = (d: number) => ((((d + cell / 2) % cell) + cell) % cell) - cell / 2;

    for (const tile of squareTiles(W, H, cell)) {
      const lane = tile.j;
      const dir = lane & 1 ? -1 : 1;
      const speed = 0.02 + 0.035 * ((lane * 7) % 5) / 4; // cada carril, su velocidad
      const cx = tile.cx + wrap(dir * t * speed);
      const cy = tile.cy;

      // el cuadrado se estira en el sentido de la marcha: lectura de velocidad
      const rx = cell * (0.2 + 0.22 * ((lane * 3) % 4) / 3);
      const ry = cell * 0.2;
      const s = ((lane % 5) / 4 + 0.06 * Math.sin(t * 0.0012)) % 1;
      const verts = [cx - rx, cy - ry, cx + rx, cy - ry, cx + rx, cy + ry, cx - rx, cy + ry];
      for (const side of openSides(verts, cell * 0.05)) {
        out.push({ pts: side, s: Math.abs(s), w: 1.3 + 0.6 * ((lane % 3) / 2) });
      }
    }
    return out;
  },
};
