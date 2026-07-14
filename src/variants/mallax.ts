import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Malla X: retícula girada de aspas gruesas de remate redondo. Los brazos llegan a los
 *  de las celdas vecinas, así que el campo se lee como una malla continua; la onda los
 *  engorda y adelgaza, y la malla se abre y se cierra. */
export const mallax: Variant = {
  name: 'mallax',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 5);
    const D = Math.hypot(W, H); // el campo girado tiene que cubrir la diagonal
    const tilt = 0.35 + 0.06 * Math.sin(t * 0.00018); // la malla deriva muy despacio
    const co = Math.cos(tilt), si = Math.sin(tilt);
    const ox = (W - D) / 2, oy = (H - D) / 2;
    const out: Polyline[] = [];

    for (const tile of squareTiles(D, D, cell)) {
      // centro de la celda, llevado al lienzo y girado alrededor de su centro
      const rx = tile.cx + ox - W / 2, ry = tile.cy + oy - H / 2;
      const cx = W / 2 + rx * co - ry * si;
      const cy = H / 2 + rx * si + ry * co;
      const b = breathe(cx, cy, t, W, H, { scaleAmp: 0.12, freq: 1.0, speed: 0.0005 });
      const arm = cell * 0.5 * b.scale; // media celda: los brazos se juntan con los del vecino
      const w = cell * 0.1 * (1 + 0.45 * b.w);

      // aspa hacia los cuatro vecinos ortogonales del marco girado → malla continua
      for (const a of [0, Math.PI / 2]) {
        const ang = a + tilt;
        const dx = Math.cos(ang) * arm, dy = Math.sin(ang) * arm;
        out.push({ pts: [cx - dx, cy - dy, cx + dx, cy + dy], s: b.s, w });
      }
    }
    return out;
  },
};
