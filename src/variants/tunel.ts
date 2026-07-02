import type { Variant, Polyline, VariantEnv } from '../core/types';

/** Túnel: anillos que vuelan hacia la cámara por un conducto que serpentea.
 *  Los anillos cercanos brillan y los lejanos se funden con el fondo. */
export const tunel: Variant = {
  name: 'tunel',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const rings = lineCount ?? 26, steps = 56;
    const S = Math.min(W, H) * 0.6;
    const range = 4, f = 2.1;
    const out: Polyline[] = [];
    for (let r = 0; r < rings; r++) {
      const fz = (((r / rings) * range - t * 0.0009) % range + range) % range; // 0 cerca → range lejos
      const z = fz - 0.55;
      // el túnel serpentea: el centro de cada anillo se desplaza según su profundidad
      const cx = 0.34 * Math.sin(fz * 1.1 + t * 0.0004);
      const cy = 0.24 * Math.cos(fz * 1.4 + t * 0.0005);
      const rad = 0.8 + 0.12 * Math.sin(fz * 2.2 + t * 0.0011);
      const sc = f / (f + z);
      const pts: number[] = [];
      for (let j = 0; j <= steps; j++) {
        const a = (j / steps) * 6.283 + fz * 0.35; // leve giro acumulado
        const x = cx + rad * Math.cos(a), y = cy + rad * Math.sin(a);
        pts.push(W / 2 + x * S * sc, H / 2 + y * S * sc);
      }
      const depth = fz / range;
      out.push({ pts, s: 1 - depth, a: Math.pow(1 - depth, 1.4) });
    }
    return out;
  },
};
