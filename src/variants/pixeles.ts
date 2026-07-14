import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, openSides } from '../core/tiling';

/** Píxeles: tramado de semitono, pero cuadrado. Cada celda es un cuadrado cuyo tamaño mide la
 *  onda que pasa por encima: donde la señal es fuerte el píxel llena la celda, donde es débil
 *  se queda en un punto. Nada gira; solo crece y mengua. */
export const pixeles: Variant = {
  name: 'pixeles',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 14);
    const out: Polyline[] = [];

    for (const { cx, cy } of squareTiles(W, H, cell)) {
      const v = 0.5 + 0.5 * Math.sin(cx * 0.008 - t * 0.0016) * Math.cos(cy * 0.009 + t * 0.0012);
      const r = cell * 0.46 * (0.12 + 0.88 * v * v); // al cuadrado: el semitono tiene contraste
      if (r < 1.5) continue;                          // por debajo de un píxel no se pinta nada
      const verts = [cx - r, cy - r, cx + r, cy - r, cx + r, cy + r, cx - r, cy + r];
      for (const side of openSides(verts, r * 0.18)) {
        out.push({ pts: side, s: v, a: 0.4 + 0.6 * v, w: 1.1 + 1.2 * v });
      }
    }
    return out;
  },
};
