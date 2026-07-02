import { describe, it, expect } from 'vitest';
import { moire } from '../../src/variants/moire';
import { allFinite } from './helpers';

describe('moire', () => {
  it('produces two families of straight lines, finite & deterministic', () => {
    const a = moire.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(72); // 2 familias × 36
    expect(a.every((p) => p.pts.length === 4)).toBe(true); // rectas
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(moire.generate({ t: 500, W: 800, H: 600 }));
  });

  it('respects lineCount as total across both families', () => {
    const a = moire.generate({ t: 0, W: 800, H: 600, lineCount: 40 });
    expect(a.length).toBe(40);
  });
});
