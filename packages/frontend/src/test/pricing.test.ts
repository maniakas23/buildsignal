import { describe, it, expect } from 'vitest';
import { getPrice } from '@/lib/pricing';

describe('pricing', () => {
  it('returns correct prices for all plans', () => {
    expect(getPrice('scout')).toBe(9900);
    expect(getPrice('professional')).toBe(24900);
    expect(getPrice('business')).toBe(59900);
    expect(getPrice('enterprise')).toBeNull();
  });

  it('throws for invalid plan', () => {
    expect(() => getPrice('invalid')).toThrow();
  });
});
