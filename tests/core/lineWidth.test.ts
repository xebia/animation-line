import { describe, it, expect } from 'vitest';
import { polylinesToSegments, halfWidthPx } from '../../src/core/lineGeometry';

describe('grosor por polilínea', () => {
  it('usa el thickness de la instancia cuando la polilínea no trae w', () => {
    const r = polylinesToSegments([{ pts: [0, 0, 800, 600], s: 0 }], 800, 600, { thickness: 3 });
    expect([...r.hw].every((v) => Math.abs(v - halfWidthPx(3)) < 1e-6)).toBe(true);
  });

  it('el w de la polilínea manda sobre el thickness de la instancia', () => {
    const r = polylinesToSegments([{ pts: [0, 0, 800, 600], s: 0, w: 12 }], 800, 600, { thickness: 3 });
    expect([...r.hw].every((v) => Math.abs(v - halfWidthPx(12)) < 1e-6)).toBe(true);
  });

  it('trazos de distinto grosor conviven en el mismo lote', () => {
    const r = polylinesToSegments(
      [{ pts: [0, 0, 800, 0], s: 0, w: 0.5 }, { pts: [0, 300, 800, 300], s: 1, w: 20 }],
      800, 600, { thickness: 3 },
    );
    const widths = new Set([...r.hw]);
    expect(widths).toEqual(new Set([halfWidthPx(0.5), halfWidthPx(20)]));
    expect(r.hw.length).toBe(r.position.length / 2);
  });

  it('el trazo grueso ocupa más ancho en clip space que el fino', () => {
    const spanY = (w: number) => {
      const r = polylinesToSegments([{ pts: [0, 300, 800, 300], s: 0, w }], 800, 600);
      const ys = [...r.position].filter((_, i) => i % 2 === 1);
      return Math.max(...ys) - Math.min(...ys);
    };
    expect(spanY(20)).toBeGreaterThan(spanY(1));
  });
});
