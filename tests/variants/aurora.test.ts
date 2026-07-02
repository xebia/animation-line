import { describe, it, expect } from 'vitest';
import { aurora } from '../../src/variants/aurora';
import { allFinite } from './helpers';

describe('aurora', () => {
  it('produces 56 curtain lines, finite & deterministic', () => {
    const a = aurora.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(56);
    expect(a[0].pts.length).toBe(91 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(aurora.generate({ t: 500, W: 800, H: 600 }));
  });

  it('fades the curtain edges via per-line alpha', () => {
    const a = aurora.generate({ t: 0, W: 800, H: 600 });
    const mid = a[Math.floor(a.length / 2)].a!;
    expect(a[0].a!).toBeLessThan(mid);
    expect(a[a.length - 1].a!).toBeLessThan(mid);
  });
});
