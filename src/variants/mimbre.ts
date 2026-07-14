import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Mimbre: el entrelazado, pero en diagonal. Dos familias de barras a 45° que se cruzan, y en
 *  cada cruce una pasa por encima y la otra se interrumpe — el paso por debajo. Quién manda
 *  alterna como en un tafetán, y la onda invierte el tejido entero por zonas. */
export const mimbre: Variant = {
  name: 'mimbre',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 12);
    const out: Polyline[] = [];
    const K = Math.SQRT1_2;

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.14, freq: 1.0 });
      const over = (((tile.i + tile.j) & 1) === 0) !== (b.w > 0.2);
      const half = cell * 0.72 * b.scale * 0.5;
      const gap = cell * 0.13; // el hueco por donde pasa la otra familia

      // la de encima cruza entera; la de debajo se parte y deja el hueco del cruce
      const dirs: Array<[number, number]> = [[K, K], [K, -K]];
      dirs.forEach(([ux, uy], k) => {
        const on = (k === 0) === over;
        if (on) {
          out.push({
            pts: [cx - ux * half, cy - uy * half, cx + ux * half, cy + uy * half],
            s: b.s, w: 1.3 + 0.5 * b.w,
          });
        } else {
          out.push({ pts: [cx - ux * half, cy - uy * half, cx - ux * gap, cy - uy * gap], s: Math.min(1, b.s + 0.2), a: 0.85, w: 1.1 });
          out.push({ pts: [cx + ux * gap, cy + uy * gap, cx + ux * half, cy + uy * half], s: Math.min(1, b.s + 0.2), a: 0.85, w: 1.1 });
        }
      });
    }
    return out;
  },
};
