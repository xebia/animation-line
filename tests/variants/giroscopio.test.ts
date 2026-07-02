import { describe, it, expect } from 'vitest';
import { giroscopio } from '../../src/variants/giroscopio';
import { allFinite } from './helpers';

describe('giroscopio', () => {
  it('produces 18 identical precessing rings, finite & deterministic', () => {
    const a = giroscopio.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(18);
    expect(a[0].pts.length).toBe(91 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(giroscopio.generate({ t: 500, W: 800, H: 600 }));
  });

  it('cada anillo es un lazo cerrado', () => {
    const a = giroscopio.generate({ t: 0, W: 800, H: 600 });
    for (const pl of a) {
      const n = pl.pts.length;
      expect(pl.pts[0]).toBeCloseTo(pl.pts[n - 2], 5);
      expect(pl.pts[1]).toBeCloseTo(pl.pts[n - 1], 5);
    }
  });
});
