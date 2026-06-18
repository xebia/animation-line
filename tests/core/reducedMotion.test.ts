import { describe, it, expect, vi } from 'vitest';
import { prefersReducedMotion } from '../../src/core/reducedMotion';

describe('prefersReducedMotion', () => {
  it('returns true when the media query matches', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q }));
    expect(prefersReducedMotion()).toBe(true);
  });

  it('returns false when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(prefersReducedMotion()).toBe(false);
  });
});
