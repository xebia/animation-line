import type { Variant, Polyline, VariantEnv } from '../core/types';
import { hexTiles, breathe, openSides } from '../core/tiling';

/** Hexágonos: panal de lados sueltos — seis trazos por celda con los vértices abiertos. La onda
 *  abre el vértice y encoge el hexágono: el panal se desarma en trazos y se vuelve a coser. */
export const hexagonos: Variant = {
  name: 'hexagonos',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 11);
    const out: Polyline[] = [];

    for (const { cx, cy } of hexTiles(W, H, cell)) {
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.24, freq: 1.1 });
      const r = cell * 0.5 * b.scale;
      const verts: number[] = [];
      for (let v = 0; v < 6; v++) {
        const a = (v / 6) * Math.PI * 2;
        verts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      for (const side of openSides(verts, cell * 0.07 * (1 + 0.8 * b.w))) {
        out.push({ pts: side, s: b.s, w: 0.9 + 0.6 * (0.5 + 0.5 * b.w) });
      }
    }
    return out;
  },
};
