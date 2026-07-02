import { describe, it, expect } from 'vitest';
import { polylinesToSegments, halfWidthPx } from '../../src/core/lineGeometry';

describe('polylinesToSegments', () => {
  it('expands an N-point polyline into thick-line triangles (quads + caps)', () => {
    // 3 puntos colineales → 2 segmentos × 6 vértices = 12, sin unión (colineal),
    // más los dos caps semicirculares en los extremos
    const r = polylinesToSegments([{ pts: [0, 0, 400, 300, 800, 600], s: 0.5 }], 800, 600, { thickness: 2 });
    expect(r.position.length).toBeGreaterThanOrEqual(12 * 2);
    expect(r.s.length).toBe(r.position.length / 2);
    expect(r.edge.length).toBe(r.position.length / 2);
    expect(r.a.length).toBe(r.position.length / 2);
    expect([...r.position].every(Number.isFinite)).toBe(true);
    expect([...r.s].every((v) => v === 0.5)).toBe(true);
    expect([...r.a].every((v) => v === 1)).toBe(true); // sin a → alfa 1
  });

  it('añade unión redondeada cuando hay giro (más vértices que en línea recta)', () => {
    const recta = polylinesToSegments([{ pts: [0, 300, 400, 300, 800, 300], s: 0 }], 800, 600, { thickness: 2 });
    const giro = polylinesToSegments([{ pts: [0, 300, 400, 300, 400, 600], s: 0 }], 800, 600, { thickness: 2 });
    expect(giro.position.length).toBeGreaterThan(recta.position.length);
  });

  it('propaga el alfa por polilínea al atributo a', () => {
    const r = polylinesToSegments([{ pts: [0, 0, 800, 600], s: 0, a: 0.4 }], 800, 600);
    expect([...r.a].every((v) => Math.abs(v - 0.4) < 1e-6)).toBe(true);
  });

  it('centra los vértices cerca del punto en clip space (grosor pequeño)', () => {
    const r = polylinesToSegments([{ pts: [0, 0, 800, 600], s: 1 }], 800, 600, { thickness: 0 });
    // primer vértice (esquina del punto (0,0)) ≈ clip (-1, 1); queda el margen de feather
    expect(r.position[0]).toBeCloseTo(-1, 1);
    expect(r.position[1]).toBeCloseTo(1, 1);
    expect(halfWidthPx(0)).toBeCloseTo(0.75);
  });

  it('skips degenerate single-point polylines', () => {
    const r = polylinesToSegments([{ pts: [10, 10], s: 0 }], 800, 600);
    expect(r.position.length).toBe(0);
  });
});
