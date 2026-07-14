import type { Variant, Polyline, VariantEnv } from '../core/types';
import { hexTiles, breathe } from '../core/tiling';

const AXES = [0, Math.PI / 3, (2 * Math.PI) / 3]; // las tres direcciones del tejido triaxial

/** Triaxial: el tejido de tres ejes, el de las cestas de caña. Tres familias de barras a 60°
 *  cruzándose en cada nodo; en cada cruce una manda y las otras se interrumpen, y quién manda va
 *  rotando con el tiempo. El resultado es un entramado de triángulos que nunca se está quieto. */
export const triaxial: Variant = {
  name: 'triaxial',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 11);
    const out: Polyline[] = [];

    for (const tile of hexTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.12, freq: 1.0 });
      // el eje que pasa por encima rota nodo a nodo y con el tiempo
      const boss = (Math.floor(t * 0.0009 + tile.i * 0.4 + tile.j * 0.7) % 3 + 3) % 3;
      const half = cell * 0.5 * b.scale;
      const gap = cell * 0.12;

      AXES.forEach((a, k) => {
        const ux = Math.cos(a), uy = Math.sin(a);
        if (k === boss) {
          out.push({
            pts: [cx - ux * half, cy - uy * half, cx + ux * half, cy + uy * half],
            s: b.s, w: 1.4 + 0.4 * b.w,
          });
        } else {
          out.push({ pts: [cx - ux * half, cy - uy * half, cx - ux * gap, cy - uy * gap], s: b.s, a: 0.8, w: 1.0 });
          out.push({ pts: [cx + ux * gap, cy + uy * gap, cx + ux * half, cy + uy * half], s: b.s, a: 0.8, w: 1.0 });
        }
      });
    }
    return out;
  },
};
