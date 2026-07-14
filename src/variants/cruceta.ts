import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Cruceta: retícula de cruces de trazo fino, alineadas con los ejes — las marcas de registro
 *  de un plano técnico. Nada gira: la onda alarga los brazos hasta que las cruces se tocan y
 *  la retícula se cierra en cuadrícula, y luego los recoge hasta dejarlas sueltas. */
export const cruceta: Variant = {
  name: 'cruceta',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 13);
    const out: Polyline[] = [];

    for (const { cx, cy } of squareTiles(W, H, cell)) {
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.45, freq: 1.1 });
      // en la cresta el brazo llega al vecino: la cruz se convierte en cuadrícula continua
      const arm = cell * 0.5 * (0.35 + 0.65 * (0.5 + 0.5 * b.w));
      const w = 1.3 + 0.8 * (0.5 + 0.5 * b.w);
      out.push({ pts: [cx - arm, cy, cx + arm, cy], s: b.s, w });
      out.push({ pts: [cx, cy - arm, cx, cy + arm], s: b.s, w });
    }
    return out;
  },
};
