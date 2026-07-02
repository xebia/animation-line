import { describe, it, expect } from 'vitest';
import { mobius } from '../../src/variants/mobius';
import { allFinite } from './helpers';

describe('mobius', () => {
  it('produces 14 closed longitudinal loops, finite & deterministic', () => {
    const a = mobius.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(14);
    expect(a[0].pts.length).toBe(169 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(mobius.generate({ t: 500, W: 800, H: 600 }));
  });

  it('cada línea se cierra sobre sí misma (lazo de 4π)', () => {
    const a = mobius.generate({ t: 0, W: 800, H: 600 });
    for (const pl of a) {
      const n = pl.pts.length;
      expect(pl.pts[0]).toBeCloseTo(pl.pts[n - 2], 6);
      expect(pl.pts[1]).toBeCloseTo(pl.pts[n - 1], 6);
    }
  });
});
