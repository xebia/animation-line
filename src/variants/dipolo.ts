import type { Variant, Polyline, VariantEnv } from '../core/types';

/** Dipolo: líneas de campo magnético (r = L·sin²θ) emanando de un núcleo y
 *  expandiéndose hacia fuera en ciclos — energía ordenada y simétrica. */
export const dipolo: Variant = {
  name: 'dipolo',
  generate({ t, W, H, lineCount }: VariantEnv): Polyline[] {
    const linesPerSide = Math.round((lineCount ?? 28) / 2), steps = 60;
    const S = Math.min(W, H) * 0.52;
    const cx = W / 2, cy = H / 2;
    const tilt = 0.35 * Math.sin(t * 0.00022); // el eje bascula suavemente
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const out: Polyline[] = [];
    for (let i = 0; i < linesPerSide; i++) {
      // cada línea de campo nace pequeña y se expande hacia fuera
      const fr = ((i / linesPerSide + t * 0.00012) % 1 + 1) % 1;
      const L = 0.25 + 1.6 * fr;
      for (const side of [1, -1]) {
        const pts: number[] = [];
        for (let j = 0; j <= steps; j++) {
          const th = 0.12 + (j / steps) * (Math.PI - 0.24);
          const r = L * Math.sin(th) * Math.sin(th);
          const x0 = r * Math.cos(th), y0 = side * r * Math.sin(th);
          pts.push(cx + (x0 * ct - y0 * st) * S, cy + (x0 * st + y0 * ct) * S);
        }
        out.push({ pts, s: fr, a: Math.pow(1 - fr, 0.7) });
      }
    }
    return out;
  },
};
