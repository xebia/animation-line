import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe, openSides, snap } from '../core/tiling';

/** Nodos: malla fina con el nudo marcado — en cada cruce, un rombo abierto, como la isleta
 *  de soldadura de una placa. Las barras se despegan del nodo con la onda: la red se
 *  desconecta por zonas y se vuelve a conectar. */
export const nodos: Variant = {
  name: 'nodos',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 9);
    const out: Polyline[] = [];

    for (const { cx, cy } of squareTiles(W, H, cell)) {
      const b = breathe(cx, cy, t, W, H, { scaleAmp: 0.18, rotAmp: 0.35, freq: 1.0 });
      const pad = cell * 0.12 * b.scale;                 // tamaño de la isleta
      const gap = pad * (1.5 + 0.9 * b.w);               // hueco entre isleta y barra
      const half = cell * 0.5;
      const w = 1.4 + 0.6 * b.w;

      // las cuatro barras que salen del nodo, despegadas de él
      for (const [ux, uy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        out.push({
          pts: [cx + ux * gap, cy + uy * gap, cx + ux * half, cy + uy * half],
          s: b.s,
          w,
        });
      }

      // la isleta: rombo abierto que salta entre cuadrante y cuadrante (45°), sin ángulos sueltos
      const rot = snap(b.rot + t * 0.0004, 8);
      const co = Math.cos(rot), si = Math.sin(rot);
      const verts: number[] = [];
      for (const [dx, dy] of [[0, -pad], [pad, 0], [0, pad], [-pad, 0]]) {
        verts.push(cx + dx * co - dy * si, cy + dx * si + dy * co);
      }
      for (const side of openSides(verts, pad * 0.25)) {
        out.push({ pts: side, s: Math.min(1, b.s + 0.25), w: w + 0.6 });
      }
    }
    return out;
  },
};
