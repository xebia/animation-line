import type { Variant, Polyline, VariantEnv } from '../core/types';
import { auto } from '../core/geom';

export const rejilla: Variant = {
  name: 'rejilla',
  generate({ t, W, H }: VariantEnv): Polyline[] {
    const { mx, my } = auto(t);
    const rows = 24, cols = 24, rotY = (mx - 0.5) * 1.1, rotX = 0.5 + (my - 0.5) * 0.6, f = 520;
    const P = (u: number, v: number) => {
      const x = (u - 0.5) * 2, z = (v - 0.5) * 2;
      const y = 0.45 * Math.sin(x * 2.4 + t * 0.0011) * Math.cos(z * 2 - t * 0.0008);
      const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
      const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
      const y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
      const sc = f / (f + z2 * 260);
      return { X: W / 2 + x1 * 260 * sc, Y: H / 2 + y1 * 260 * sc };
    };
    const out: Polyline[] = [];
    for (let r = 0; r < rows; r++) {
      const v = r / (rows - 1); const pts: number[] = [];
      for (let c = 0; c < cols; c++) { const p = P(c / (cols - 1), v); pts.push(p.X, p.Y); }
      out.push({ pts, s: r / (rows - 1) });
    }
    for (let c = 0; c < cols; c++) {
      const u = c / (cols - 1); const pts: number[] = [];
      for (let r = 0; r < rows; r++) { const p = P(u, r / (rows - 1)); pts.push(p.X, p.Y); }
      out.push({ pts, s: c / (cols - 1) });
    }
    return out;
  },
};
