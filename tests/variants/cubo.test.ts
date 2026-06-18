import { describe, it, expect } from 'vitest';
import { cubo } from '../../src/variants/cubo';
import { allFinite } from './helpers';

describe('cubo', () => {
  it('produces lattice edge segments, finite & deterministic', () => {
    const a = cubo.generate({ t: 300, W: 800, H: 600 });
    expect(a.length).toBeGreaterThan(0);
    expect(a.every((p) => p.pts.length === 4)).toBe(true);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(cubo.generate({ t: 300, W: 800, H: 600 }));
  });
});
