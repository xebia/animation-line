import type { Variant, Polyline, VariantEnv } from '../core/types';
import { squareTiles, breathe } from '../core/tiling';

/** Tejido: urdimbre y trama. Dos familias de trazos cruzados, pero cada una se interrumpe donde
 *  pasa la otra, así que la trama se lee por encima y por debajo — el clásico entrelazado. La
 *  onda cambia cuál de las dos manda, y el tejido se invierte. */
export const tejido: Variant = {
  name: 'tejido',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const cell = Math.max(W, H) / (lineCount ?? 13);
    const out: Polyline[] = [];

    for (const tile of squareTiles(W, H, cell)) {
      const { cx, cy } = tile;
      const b = breathe(cx, cy, t, W, H, { rotAmp: 0, scaleAmp: 0.18, freq: 1.0 });
      // quién pasa por encima en esta celda: alterna como un tafetán, y la onda lo invierte
      const over = (((tile.i + tile.j) & 1) === 0) !== (b.w > 0.15);
      const half = cell * 0.5 * b.scale;
      const gap = cell * 0.14; // el hueco por donde pasa la otra familia

      // la que va por encima cruza entera; la de debajo se parte en dos y deja el hueco
      const whole: number[] = over
        ? [cx - half, cy, cx + half, cy]
        : [cx, cy - half, cx, cy + half];
      out.push({ pts: whole, s: b.s, w: 1.2 + 0.5 * b.w });

      const cut: number[][] = over
        ? [[cx, cy - half, cx, cy - gap], [cx, cy + gap, cx, cy + half]]
        : [[cx - half, cy, cx - gap, cy], [cx + gap, cy, cx + half, cy]];
      for (const seg of cut) out.push({ pts: seg, s: Math.min(1, b.s + 0.2), a: 0.85, w: 1.0 });
    }
    return out;
  },
};
