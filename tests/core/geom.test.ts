import { describe, it, expect } from 'vitest';
import { lerp, auto, project3d } from '../../src/core/geom';

describe('geom', () => {
  it('lerp interpolates', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it('auto returns oscillators in [0,1], deterministic', () => {
    const a = auto(1234);
    const b = auto(1234);
    expect(a).toEqual(b);
    expect(a.mx).toBeGreaterThanOrEqual(0);
    expect(a.mx).toBeLessThanOrEqual(1);
    expect(a.my).toBeGreaterThanOrEqual(0);
    expect(a.my).toBeLessThanOrEqual(1);
  });

  it('project3d returns finite screen coords', () => {
    const p = project3d(0.5, -0.3, 0.2, 0.4, 0.6, 100, 800, 600);
    expect(Number.isFinite(p.X)).toBe(true);
    expect(Number.isFinite(p.Y)).toBe(true);
  });
});
