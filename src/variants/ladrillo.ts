import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Ladrillo: malla a matajunta — las filas van desplazadas media celda, así que las barras
 *  no se cruzan en X sino que se encuentran en T, como el aparejo de un muro. La onda separa
 *  las barras de sus nudos y las vuelve a juntar. */
export const ladrillo: Variant = {
  name: 'ladrillo',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 10);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const cx = tile.cx + (tile.j & 1 ? cell * 0.5 : 0); // fila desplazada: matajunta
      const cy = tile.cy;
      const b = breathe(cx, cy, t, W, H, { scaleAmp: 0.22, rotAmp: 0, freq: 1.0 });
      const gap = cell * 0.05 * (1 + b.w); // la junta se abre y se cierra
      const half = cell * 0.5 * b.scale;
      const w = 2.0 + 0.8 * b.w;

      // tendel: la barra horizontal del ladrillo, de vecino a vecino
      out.push({ pts: [cx - half + gap, cy, cx + half - gap, cy], s: b.s, w });
      // llaga: la barra vertical, que muere contra el tendel de la fila de arriba
      out.push({ pts: [cx, cy + gap, cx, cy + half - gap], s: Math.min(1, b.s + 0.15), w });
    }
    return out;
  },
};
