import { describe, it, expect } from 'vitest';
import { onda } from '../../src/variants/onda';
import { allFinite } from './helpers';

describe('onda', () => {
  it('produces 150 2-point polylines, finite & deterministic', () => {
    const a = onda.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(150);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(onda.generate({ t: 500, W: 800, H: 600 }));
  });
});
