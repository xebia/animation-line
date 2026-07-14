import type { Variant, Polyline, VariantEnv } from '../core/types';
import { hexTiles, breathe } from '../core/tiling';

const RINGS = 6;

/** Panal: anillos hexagonales concéntricos alrededor de cada nodo, con una Y gruesa en el
 *  centro. Los anillos laten hacia dentro y hacia fuera, como las curvas de nivel de un
 *  relieve que respira. */
export const panal: Variant = {
  name: 'panal',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 3);
    const out: Polyline[] = [];

    for (const tile of hexTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { scaleAmp: 0.06, rotAmp: 0.1, freq: 0.9, speed: 0.0005 });
      const flip = (tile.i + tile.j) & 1 ? Math.PI / 3 : 0; // nodos alternos, Y invertida

      for (let k = 0; k < RINGS; k++) {
        // cada anillo late con un retardo respecto al anterior → onda que sale del nodo
        const pulse = 1 + 0.06 * Math.sin(k * 0.9 - t * 0.0009 + (tile.i + tile.j) * 0.4);
        // el anillo mayor se queda por debajo de la media distancia entre filas (0.433·cell),
        // así los panales vecinos se rozan pero no se atraviesan
        const r = cell * (0.07 + k * 0.058) * b.scale * pulse;
        const pts: number[] = [];
        for (let v = 0; v <= 6; v++) {
          const a = (v / 6) * Math.PI * 2 + b.rot + flip;
          pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        out.push({ pts, s: b.s, a: 0.85, w: 1.3 });
      }

      // Y central: tres brazos gruesos hacia tres de los seis vecinos
      const arm = cell * 0.26 * b.scale;
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + Math.PI / 2 + b.rot + flip;
        out.push({
          pts: [cx, cy, cx + Math.cos(a) * arm, cy + Math.sin(a) * arm],
          s: Math.min(1, b.s + 0.25),
          w: cell * 0.028,
        });
      }
    }
    return out;
  },
};
