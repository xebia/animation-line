import type { Variant, Polyline, VariantEnv } from '../core/types';
import { project3d } from '../core/geom';

export const cubo: Variant = {
  name: 'cubo',
  generate({ t, W, H }: VariantEnv): Polyline[] {
    const n = 4, S = Math.min(W, H) * 0.16, rotY = t * 0.0004, rotX = 0.5 + 0.25 * Math.sin(t * 0.0003);
    const breathe = 1 + 0.18 * Math.sin(t * 0.0009), shear = 0.25 * Math.sin(t * 0.0006);
    const g = (i: number) => -1 + (2 * i) / (n - 1);
    const grid: { X: number; Y: number; d: number }[][][] = [];
    for (let i = 0; i < n; i++) {
      grid[i] = [];
      for (let j = 0; j < n; j++) {
        grid[i][j] = [];
        for (let k = 0; k < n; k++) {
          const x = g(i) * breathe, y = g(j) * breathe + shear * g(k), z = g(k) * breathe;
          grid[i][j][k] = project3d(x, y, z, rotX, rotY, S, W, H);
        }
      }
    }
    const dcol = (p: { d: number }) => Math.max(0, Math.min(1, (p.d + 1.6) / 3.2));
    const out: Polyline[] = [];
    const edge = (a: { X: number; Y: number; d: number }, b: { X: number; Y: number; d: number }) =>
      out.push({ pts: [a.X, a.Y, b.X, b.Y], s: dcol(a) });
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
      const p = grid[i][j][k];
      if (i < n - 1) edge(p, grid[i + 1][j][k]);
      if (j < n - 1) edge(p, grid[i][j + 1][k]);
      if (k < n - 1) edge(p, grid[i][j][k + 1]);
    }
    return out;
  },
};
