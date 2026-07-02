import { describe, it, expect } from 'vitest';
import { cristal } from '../../src/variants/cristal';
import { allFinite } from './helpers';

describe('cristal', () => {
  it('produces 3 nested octahedra (12 edges each), finite & deterministic', () => {
    const a = cristal.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(36); // 3 capas × 12 aristas
    expect(a[0].pts.length).toBe(11 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(cristal.generate({ t: 500, W: 800, H: 600 }));
  });
});
