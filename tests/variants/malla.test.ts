import { describe, it, expect } from 'vitest';
import { malla } from '../../src/variants/malla';
import { allFinite } from './helpers';

describe('malla', () => {
  it('produces rows+cols polylines (42+42), finite & deterministic', () => {
    const a = malla.generate({ t: 600, W: 800, H: 600 });
    expect(a.length).toBe(84);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(malla.generate({ t: 600, W: 800, H: 600 }));
  });
});
