import { describe, it, expect } from 'vitest';
import { rejilla } from '../../src/variants/rejilla';
import { allFinite } from './helpers';

describe('rejilla', () => {
  it('produces 48 polylines (24+24), finite & deterministic', () => {
    const a = rejilla.generate({ t: 700, W: 800, H: 600 });
    expect(a.length).toBe(48);
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(rejilla.generate({ t: 700, W: 800, H: 600 }));
  });
});
