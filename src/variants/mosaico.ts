import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe, snap } from '../core/tiling';

/** Mosaico: cada celda es un triángulo —media casilla partida por la diagonal— y la partición
 *  gira 90° a saltos, con retardo propio. Al conmutar, los triángulos vecinos se emparejan y se
 *  desemparejan: aparecen y desaparecen rombos y cuadrados por todo el campo. */
export const mosaico: Variant = {
  name: 'mosaico',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 12);
    const out: Polyline[] = [];
    const r = cell * 0.46;

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.16, freq: 1.0 });
      // la orientación del triángulo salta de cuadrante en cuadrante
      const rot = snap(Math.sin(t * 0.0012 - (tile.i * 0.6 + tile.j * 0.9)) * 3, 4);
      const co = Math.cos(rot), si = Math.sin(rot);
      const d = r * b.scale;
      const p = (x: number, y: number) => [cx + x * co - y * si, cy + x * si + y * co];

      // triángulo rectángulo: dos catetos y la hipotenusa, como polilínea abierta
      const [ax, ay] = p(-d, -d), [bx, by] = p(d, -d), [cxx, cyy] = p(-d, d);
      out.push({ pts: [bx, by, ax, ay, cxx, cyy], s: b.s, w: 1.5 + 0.6 * b.w });
      out.push({ pts: [bx, by, cxx, cyy], s: Math.min(1, b.s + 0.2), a: 0.8, w: 1.2 });
    }
    return out;
  },
};
