import { describe, it, expect } from 'vitest';
import { VARIANTS } from '../../src/variants';
import { PATTERN_NAMES } from '../../src/core/types';
import { allFinite } from './helpers';

const ENV = { t: 500, W: 800, H: 600 };

describe.each(PATTERN_NAMES)('trama %s', (name) => {
  const variant = VARIANTS[name];

  it('tesela el lienzo, finita y determinista', () => {
    const a = variant.generate(ENV);
    expect(a.length).toBeGreaterThan(20); // cubre el lienzo, no es una figura suelta
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(variant.generate(ENV));
    expect(a.every((p) => p.s >= 0 && p.s <= 1)).toBe(true);
  });

  it('lleva grosor propio por trazo', () => {
    expect(variant.generate(ENV).every((p) => p.w !== undefined && p.w > 0)).toBe(true);
  });

  it('se mueve de forma apreciable en medio segundo', () => {
    const a = variant.generate(ENV);
    const b = variant.generate({ ...ENV, t: ENV.t + 500 });
    // desplazamiento medio de los vértices: la animación tiene que notarse, no ser un temblor
    let sum = 0, n = 0;
    a.forEach((pl, i) => {
      const q = b[i];
      if (!q || q.pts.length !== pl.pts.length) return;
      for (let k = 0; k < pl.pts.length; k += 2) {
        sum += Math.hypot(pl.pts[k] - q.pts[k], pl.pts[k + 1] - q.pts[k + 1]);
        n++;
      }
    });
    expect(n).toBeGreaterThan(0);
    expect(sum / n).toBeGreaterThan(1); // > 1 px de media
  });
});
