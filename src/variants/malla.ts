import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d } from '../core/geom';

export const malla: Variant = {
  name: 'malla',
  generate({ t, W, H }: VariantEnv): Polyline[] {
    const rotY = t * 0.00022, rotX = 0.62 + 0.1 * Math.sin(t * 0.0003);
    const S = Math.min(W, H) * 0.36, tw = 1.35 + 0.55 * Math.sin(t * 0.00035);
    const rows = 42, cols = 42; // alta densidad → más intersección entre líneas
    const P = (u: number, v: number) => {
      const x = -1 + 2 * u, y = 1 - 2 * v;
      const z = ((-1 + 2 * u) * (1 - v) + (1 - 2 * u) * v) * tw;
      return project3d(x, y, z, rotX, rotY, S, W, H);
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
