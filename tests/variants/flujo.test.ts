import { describe, it, expect } from 'vitest';
import { flujo } from '../../src/variants/flujo';
import { allFinite } from './helpers';

describe('flujo', () => {
  it('produces 70 streamlines, finite & deterministic', () => {
    const a = flujo.generate({ t: 1000, W: 800, H: 600 });
    expect(a.length).toBe(70);
    expect(a[0].pts.length).toBe(91 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(flujo.generate({ t: 1000, W: 800, H: 600 }));
  });
});
