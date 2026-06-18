import { describe, it, expect } from 'vitest';
import { VARIANTS } from '../../src/variants';
import { VARIANT_NAMES } from '../../src/core/types';

describe('VARIANTS registry', () => {
  it('has an entry for every name, keyed correctly', () => {
    for (const name of VARIANT_NAMES) {
      expect(VARIANTS[name]).toBeDefined();
      expect(VARIANTS[name].name).toBe(name);
    }
    expect(Object.keys(VARIANTS).length).toBe(VARIANT_NAMES.length);
  });
});
