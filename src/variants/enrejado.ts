import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Enrejado: malla romboidal continua — barras largas a 45° que atraviesan el campo entero y se
 *  cruzan formando rombos, como una verja. La onda cambia el paso de la malla: los rombos se
 *  estiran y se aprietan sin que las barras dejen de ser rectas. */
export const enrejado: Variant = {
  name: 'enrejado',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 10);
    const out: Polyline[] = [];
    const K = Math.SQRT1_2;

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.3, freq: 1.1 });
      // la barra alcanza justo a la de la celda vecina: el enrejado no se rompe
      const half = cell * 0.72 * b.scale;
      const w = 1.1 + 0.6 * (0.5 + 0.5 * b.w);
      for (const [ux, uy] of [[K, K], [K, -K]]) {
        out.push({
          pts: [cx - ux * half, cy - uy * half, cx + ux * half, cy + uy * half],
          s: b.s, w,
        });
      }
    }
    return out;
  },
};
