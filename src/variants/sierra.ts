import type { Variant, Polyline, VariantEnv } from '../core/types';
import { grad } from '../core/iso';
import type { Polyline as P } from '../core/types';

/** Sierra: filas de diente de sierra. Los dientes de filas contiguas van en contrafase, así que
 *  el campo se lee como una malla de rombos; cuando la onda aplana una fila, la malla se abre en
 *  bandas. Vértices en ángulo, nada de curvas. */
export const sierra: Variant = {
  name: 'sierra',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const rows = lineCount ?? 24;
    const teeth = 16;                 // dientes por fila
    const out: P[] = [];
    const stepY = H / (rows - 1);
    const stepX = W / teeth;

    for (let r = 0; r < rows; r++) {
      const y0 = r * stepY;
      // la amplitud del diente la marca una onda que viaja por las filas
      const amp = stepY * 0.5 * (0.15 + 0.85 * (0.5 + 0.5 * Math.sin(r * 0.6 - t * 0.0018)));
      const up = r & 1 ? 1 : -1;      // filas alternas, dientes en contrafase
      const pts: number[] = [];
      for (let k = 0; k <= teeth * 2; k++) {
        const x = (k / 2) * stepX;
        const y = y0 + (k % 2 === 0 ? 0 : up * amp);
        pts.push(x, y);
      }
      out.push({
        pts,
        s: grad(Math.sin(r * 0.6 - t * 0.0018)),
        w: 1.3 + 1.0 * (amp / (stepY * 0.5)),
      });
    }
    return out;
  },
};
