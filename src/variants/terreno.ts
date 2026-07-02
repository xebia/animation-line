import type { Variant, Polyline, VariantEnv } from '../core/types';

/** Terreno: sobrevuelo infinito de crestas (synthwave) — las líneas del horizonte
 *  avanzan hacia la cámara con un valle central despejado. */
export const terreno: Variant = {
  name: 'terreno',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const rows = lineCount ?? 44, steps = 72;
    const S = Math.min(W, H) * 0.6;
    const range = 3.4, spacing = range / rows, scroll = t * 0.0011, f = 1.6;
    const out: Polyline[] = [];
    for (let r = 0; r < rows; r++) {
      // la línea viaja hacia la cámara; su relieve viaja con ella (worldZ constante por ciclo)
      const fz = ((r * spacing - scroll) % range + range) % range;
      const worldZ = fz + scroll;
      const sc = f / (f + fz);
      const pts: number[] = [];
      for (let j = 0; j <= steps; j++) {
        const u = j / steps, x = (u - 0.5) * 3.2;
        const valle = Math.min(1, x * x * 1.9); // valle central despejado
        const y = valle * (
          0.42 * Math.pow(Math.abs(Math.sin(x * 1.6 + worldZ * 0.9)), 1.4)
          + 0.18 * Math.sin(x * 3.3 + worldZ * 1.7)
          + 0.08 * Math.sin(x * 6.1 - worldZ * 1.2)
        );
        pts.push(W / 2 + x * S * sc, H * 0.36 + (0.52 - y) * S * 0.62 * sc);
      }
      const depth = fz / range;
      out.push({ pts, s: 1 - depth, a: 0.2 + 0.8 * Math.pow(1 - depth, 1.3) });
    }
    return out;
  },
};
