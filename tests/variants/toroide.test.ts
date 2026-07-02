import { describe, it, expect } from 'vitest';
import { toroide } from '../../src/variants/toroide';
import { allFinite } from './helpers';

describe('toroide', () => {
  it('produces 30 meridian rings around the torus, finite & deterministic', () => {
    const a = toroide.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(30);
    expect(a[0].pts.length).toBe(45 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(toroide.generate({ t: 500, W: 800, H: 600 }));
  });

  it('los meridianos lejanos se desvanecen (a en [0,1])', () => {
    const a = toroide.generate({ t: 0, W: 800, H: 600 });
    for (const pl of a) { expect(pl.a).toBeGreaterThanOrEqual(0); expect(pl.a).toBeLessThanOrEqual(1); }
  });
});
