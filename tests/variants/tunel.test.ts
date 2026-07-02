import { describe, it, expect } from 'vitest';
import { tunel } from '../../src/variants/tunel';
import { allFinite } from './helpers';

describe('tunel', () => {
  it('produces 26 rings flying toward the camera, finite & deterministic', () => {
    const a = tunel.generate({ t: 500, W: 800, H: 600 });
    expect(a.length).toBe(26);
    expect(a[0].pts.length).toBe(57 * 2);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(tunel.generate({ t: 500, W: 800, H: 600 }));
  });

  it('los anillos lejanos se desvanecen (a menor)', () => {
    const a = tunel.generate({ t: 0, W: 800, H: 600 });
    for (const pl of a) { expect(pl.a).toBeGreaterThanOrEqual(0); expect(pl.a).toBeLessThanOrEqual(1); }
  });
});
