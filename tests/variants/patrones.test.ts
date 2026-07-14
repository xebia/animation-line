import { describe, it, expect } from 'vitest';
import { cruces } from '../../src/variants/cruces';
import { tramado } from '../../src/variants/tramado';
import { mallax } from '../../src/variants/mallax';
import { panal } from '../../src/variants/panal';
import { teselas } from '../../src/variants/teselas';
import { allFinite } from './helpers';

const PATRONES = [cruces, tramado, mallax, panal, teselas];
const ENV = { t: 500, W: 800, H: 600 };

describe.each(PATRONES)('$name', (variant) => {
  it('teselada, finita y determinista', () => {
    const a = variant.generate(ENV);
    expect(a.length).toBeGreaterThan(20); // el patrón cubre el lienzo, no es una figura suelta
    expect(allFinite(a)).toBe(true);
    expect(a).toEqual(variant.generate(ENV));
    expect(a.every((p) => p.s >= 0 && p.s <= 1)).toBe(true);
  });

  it('se mueve con el tiempo', () => {
    expect(variant.generate(ENV)).not.toEqual(variant.generate({ ...ENV, t: 3000 }));
  });

  it('lleva grosor propio por trazo', () => {
    expect(variant.generate(ENV).every((p) => p.w !== undefined && p.w > 0)).toBe(true);
  });
});

describe('cruces', () => {
  it('mezcla la rejilla fina con las cruces gruesas', () => {
    const widths = cruces.generate(ENV).map((p) => p.w!);
    // lo que define la variante es el contraste de peso, no un grosor concreto
    expect(Math.max(...widths)).toBeGreaterThan(3 * Math.min(...widths));
  });
});
