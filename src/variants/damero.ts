import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles } from '../core/tiling';

const LINES = 5; // rayas por casilla

/** Damero: tablero en el que cada casilla va rayada, y las casillas alternas rayan en la
 *  dirección contraria. Las rayas de una familia se van cerrando mientras las de la otra se
 *  abren, así que el damero se invierte entero, casilla a casilla. */
export const damero: Variant = {
  name: 'damero',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 10);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const black = ((tile.i + tile.j) & 1) === 0;
      // las dos familias se turnan: cuando una se llena, la otra se vacía
      const beat = Math.sin(t * 0.0016 - (tile.i * 0.4 + tile.j * 0.3)) * (black ? 1 : -1);
      const fill = 0.5 + 0.5 * beat;      // cuánta raya hay
      const half = cell * 0.46;
      const s = black ? 0.25 + 0.5 * fill : 0.75 - 0.5 * fill;

      for (let k = 0; k < LINES; k++) {
        const u = (k + 0.5) / LINES;
        const len = half * fill;          // la raya crece desde el centro de la casilla
        if (len < 1) continue;
        const off = -half + u * 2 * half;
        // casillas alternas: rayado horizontal o vertical, siempre en los ejes de la rejilla
        const pts = black
          ? [cx - len, cy + off, cx + len, cy + off]
          : [cx + off, cy - len, cx + off, cy + len];
        out.push({ pts, s, a: 0.35 + 0.65 * fill, w: 1.2 + 1.0 * fill });
      }
    }
    return out;
  },
};
