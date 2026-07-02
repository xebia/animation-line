import { describe, it, expect } from 'vitest';
import { frunce } from '../../src/variants/frunce';
import { allFinite } from './helpers';

describe('frunce', () => {
  it('produces 64 vertical gathering lines, finite & deterministic', () => {
    const a = frunce.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(64);
    expect(a[0].pts.length).toBe(41 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(frunce.generate({ t: 500, W: 800, H: 600 }));
  });

  it('el alfa refleja la compresión (en [0,1])', () => {
    const a = frunce.generate({ t: 0, W: 800, H: 600 });
    for (const pl of a) { expect(pl.a).toBeGreaterThanOrEqual(0); expect(pl.a).toBeLessThanOrEqual(1); }
  });
});
