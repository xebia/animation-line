import { describe, it, expect } from 'vitest';
import { LineField, VARIANTS, VARIANT_NAMES } from '../src/index';

describe('public API', () => {
  it('exports LineField, VARIANTS, VARIANT_NAMES', () => {
    expect(typeof LineField).toBe('function');
    expect(Object.keys(VARIANTS).length).toBe(80);
    expect(VARIANT_NAMES.length).toBe(80);
  });
});
