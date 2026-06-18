import { describe, it, expect } from 'vitest';
import { espiral } from '../../src/variants/espiral';
import { allFinite } from './helpers';

describe('espiral', () => {
  it('produces 60 swirling curves, finite & deterministic', () => {
    const a = espiral.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(60);
    expect(a[0].pts.length).toBe(101 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(espiral.generate({ t: 500, W: 800, H: 600 }));
  });
});
