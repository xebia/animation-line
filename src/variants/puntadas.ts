import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Puntadas: trazos cortos en filas trabadas, como un pespunte. Todos van a 45°, y la onda
 *  cambia la diagonal de cada puntada: la costura cambia de sentido por zonas y el campo se
 *  llena de bandas que aparecen y se deshacen. */
export const puntadas: Variant = {
  name: 'puntadas',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 18);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const cx = tile.cx + (tile.j & 1 ? cell * 0.5 : 0);
      const cy = tile.cy;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.3, freq: 1.2 });
      // la diagonal de la puntada conmuta con la onda: 45° o -45°, nunca en medio
      const slash = Math.sin(t * 0.0015 + tile.i * 0.9 + tile.j * 1.4) > 0;
      const len = cell * 0.5 * b.scale;
      const d = len * 0.5 * Math.SQRT1_2;
      const pts = slash
        ? [cx - d, cy + d, cx + d, cy - d]
        : [cx - d, cy - d, cx + d, cy + d];
      out.push({ pts, s: b.s, w: 0.9 + 0.7 * (0.5 + 0.5 * b.w) });
    }
    return out;
  },
};
