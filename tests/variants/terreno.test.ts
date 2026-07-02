import { describe, it, expect } from 'vitest';
import { terreno } from '../../src/variants/terreno';
import { allFinite } from './helpers';

describe('terreno', () => {
  it('produces 44 advancing ridge lines, finite & deterministic', () => {
    const a = terreno.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(44);
    expect(a[0].pts.length).toBe(73 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(terreno.generate({ t: 500, W: 800, H: 600 }));
  });
});
