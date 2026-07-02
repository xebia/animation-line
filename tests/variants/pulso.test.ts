import { describe, it, expect } from 'vitest';
import { pulso } from '../../src/variants/pulso';
import { allFinite } from './helpers';

describe('pulso', () => {
  it('produces 18 expanding rings, finite & deterministic', () => {
    const a = pulso.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(18);
    expect(a[0].pts.length).toBe(81 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(pulso.generate({ t: 500, W: 800, H: 600 }));
  });

  it('las ondas se desvanecen al expandirse', () => {
    const a = pulso.generate({ t: 0, W: 800, H: 600 });
    for (const pl of a) { expect(pl.a).toBeGreaterThanOrEqual(0); expect(pl.a).toBeLessThanOrEqual(1); }
  });
});
