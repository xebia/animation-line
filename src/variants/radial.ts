import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

const SPOKES = 8; // radios por nodo, en ángulos exactos de 45°

/** Radial: un asterisco en cada nodo, con los radios en ángulos exactos de 45°. La onda no los
 *  gira: enciende y apaga radios, y estira los que quedan. El nodo pasa de punto a cruz, de
 *  cruz a estrella, y vuelta. */
export const radial: Variant = {
  name: 'radial',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 10);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.3, freq: 1.0 });
      const gap = cell * 0.06;

      for (let k = 0; k < SPOKES; k++) {
        const diag = k & 1; // los radios en diagonal son los primeros en apagarse
        const on = 0.5 + 0.5 * Math.sin(t * 0.0017 - (tile.i + tile.j) * 0.5 - (diag ? 1.4 : 0));
        if (diag && on < 0.45) continue;
        const len = cell * 0.44 * b.scale * (0.35 + 0.65 * on);
        const a = (k / SPOKES) * Math.PI * 2;
        const ux = Math.cos(a), uy = Math.sin(a);
        out.push({
          pts: [cx + ux * gap, cy + uy * gap, cx + ux * len, cy + uy * len],
          s: b.s,
          a: diag ? 0.55 + 0.45 * on : 1,
          w: diag ? 1.1 : 1.7,
        });
      }
    }
    return out;
  },
};
