import type { Variant, Polyline, VariantEnv } from '../core/types';
import { hexTiles, breathe, openSides } from '../core/tiling';

/** Triángulos: teselado triangular de lados sueltos. El triángulo apunta arriba o abajo según
 *  la paridad del nodo, y las esquinas nunca cierran. La onda los encoge, y al encogerse aparecen
 *  las juntas: el mosaico se abre en un retículo de trazos. */
export const triangulos: Variant = {
  name: 'triangulos',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 12);
    const out: Polyline[] = [];
    const R = cell * 0.577; // circunradio del triángulo de lado `cell`

    for (const tile of hexTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.3, freq: 1.2 });
      const up = ((tile.i + tile.j) & 1) === 0;
      const base = up ? -Math.PI / 2 : Math.PI / 2; // ángulos exactos: el triángulo no se tuerce
      const r = R * b.scale;

      const verts: number[] = [];
      for (let v = 0; v < 3; v++) {
        const a = base + (v / 3) * Math.PI * 2;
        verts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      for (const side of openSides(verts, cell * 0.08 * (1 + 0.7 * b.w))) {
        out.push({ pts: side, s: b.s, w: 0.9 + 0.6 * (0.5 + 0.5 * b.w) });
      }
    }
    return out;
  },
};
