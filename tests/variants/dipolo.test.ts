import { describe, it, expect } from 'vitest';
import { dipolo } from '../../src/variants/dipolo';
import { allFinite } from './helpers';

describe('dipolo', () => {
  it('produces symmetric expanding field lines, finite & deterministic', () => {
    const a = dipolo.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(28); // 14 por lado
    expect(a[0].pts.length).toBe(61 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(dipolo.generate({ t: 500, W: 800, H: 600 }));
  });
});
