import { describe, it, expect } from 'vitest';
import { orbitas } from '../../src/variants/orbitas';
import { allFinite } from './helpers';

describe('orbitas', () => {
  it('produces 22 meridian rings, finite & deterministic', () => {
    const a = orbitas.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(22);
    expect(a[0].pts.length).toBe(73 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(orbitas.generate({ t: 500, W: 800, H: 600 }));
  });

  it('cada meridiano es un lazo cerrado', () => {
    const a = orbitas.generate({ t: 0, W: 800, H: 600 });
    for (const pl of a) {
      const n = pl.pts.length;
      expect(pl.pts[0]).toBeCloseTo(pl.pts[n - 2], 6);
      expect(pl.pts[1]).toBeCloseTo(pl.pts[n - 1], 6);
    }
  });
});
