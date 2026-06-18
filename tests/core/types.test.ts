import { describe, it, expect } from 'vitest';
import type { LineFieldOptions, Polyline, VariantEnv } from '../../src/core/types';
import { VARIANT_NAMES } from '../../src/core/types';

describe('types', () => {
  it('exposes the 10 variant names', () => {
    expect(VARIANT_NAMES).toEqual([
      'oscilacion', 'onda', 'interferencia', 'malla', 'rejilla',
      'pliegues', 'cubo', 'flujo', 'entrelazado', 'espiral',
    ]);
  });

  it('shapes compile', () => {
    const env: VariantEnv = { t: 0, W: 800, H: 600 };
    const pl: Polyline = { pts: [0, 0, 1, 1], s: 0.5 };
    const opts: LineFieldOptions = {
      variant: 'oscilacion',
      palette: ['#000000', '#ffffff'],
      background: { type: 'solid', color: '#000000' },
    };
    expect(env.W + pl.s + opts.palette.length).toBeGreaterThan(0);
  });
});
