import { describe, it, expect } from 'vitest';
import { polylinesToSegments } from '../../src/core/lineGeometry';

describe('polylinesToSegments', () => {
  it('expands an N-point polyline into (N-1) clip-space segments', () => {
    // one polyline with 3 points → 2 segments → 4 vertices (8 floats for vec2)
    const r = polylinesToSegments([{ pts: [0, 0, 400, 300, 800, 600], s: 0.5 }], 800, 600);
    expect(r.position.length).toBe(4 * 2);
    expect(r.s.length).toBe(4);
    // first point (0,0) px → clip (-1, 1)
    expect(r.position[0]).toBeCloseTo(-1);
    expect(r.position[1]).toBeCloseTo(1);
    // last point (800,600) px → clip (1, -1)
    expect(r.position[6]).toBeCloseTo(1);
    expect(r.position[7]).toBeCloseTo(-1);
    expect(r.s.every((v) => v === 0.5)).toBe(true);
  });

  it('skips degenerate single-point polylines', () => {
    const r = polylinesToSegments([{ pts: [10, 10], s: 0 }], 800, 600);
    expect(r.position.length).toBe(0);
  });
});
