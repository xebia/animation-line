import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe, snap } from '../core/tiling';

/** Ganchos: escuadras — dos trazos en ángulo recto por celda, como las marcas de corte de un
 *  plano. La escuadra salta de cuadrante en cuadrante (90° exactos, con retardo propio), así que
 *  el campo parpadea en rotaciones limpias. */
export const ganchos: Variant = {
  name: 'ganchos',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 12);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.3, freq: 1.0 });
      const rot = snap(Math.sin(t * 0.0013 - (tile.i * 0.5 + tile.j * 0.8)) * 3.2, 4);
      const co = Math.cos(rot), si = Math.sin(rot);
      const r = cell * 0.34 * b.scale;
      const p = (x: number, y: number) => [cx + x * co - y * si, cy + x * si + y * co];

      // la escuadra: brazo horizontal y brazo vertical, unidos en la esquina
      const [ax, ay] = p(-r, r), [bx, by] = p(-r, -r), [dx, dy] = p(r, -r);
      out.push({ pts: [ax, ay, bx, by, dx, dy], s: b.s, w: 1.0 + 0.7 * (0.5 + 0.5 * b.w) });
    }
    return out;
  },
};
