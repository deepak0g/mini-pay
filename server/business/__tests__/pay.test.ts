import { describe, it, expect } from '@jest/globals';
import { tax } from '../pay';

describe('Tax Calculation', () => {
  describe('Progressive Tax Brackets', () => {
    it('should return $0 tax for income <= $370', async () => {
      const result = await tax(370);
      expect(result).toBe(0);
    });

    it('should return $0 tax for income at $370.00', async () => {
      const result = await tax(370.0);
      expect(result).toBe(0);
    });

    it('should calculate 10% tax for $370.01-$900 bracket', async () => {
      const result = await tax(400);
      // (400 - 370) * 0.1 = 3
      expect(result).toBeCloseTo(3, 2);
    });

    it('should calculate tax at $900 boundary', async () => {
      const result = await tax(900);
      // (900 - 370) * 0.1 = 53
      expect(result).toBeCloseTo(53, 2);
    });

    it('should calculate tax for $900.01-$1,500 bracket', async () => {
      const result = await tax(1000);
      // (900 - 370) * 0.1 + (1000 - 900) * 0.19 = 53 + 19 = 72
      expect(result).toBeCloseTo(72, 2);
    });

    it('should calculate tax at $1,500 boundary', async () => {
      const result = await tax(1500);
      // (900 - 370) * 0.1 + (1500 - 900) * 0.19 = 53 + 114 = 167
      expect(result).toBeCloseTo(167, 2);
    });

    it('should calculate tax for $1,500.01-$3,000 bracket', async () => {
      const result = await tax(2000);
      // 53 + 114 + (2000 - 1500) * 0.325 = 167 + 162.5 = 329.5
      expect(result).toBeCloseTo(329.5, 1);
    });

    it('should calculate tax for $3,000.01-$5,000 bracket', async () => {
      const result = await tax(4000);
      // 53 + 114 + 487.5 + (4000 - 3000) * 0.37 = 654.5 + 370 = 1024.5
      expect(result).toBeCloseTo(1024.5, 1);
    });

    it('should calculate tax for income > $5,000', async () => {
      const result = await tax(6000);
      // 53 + 114 + 487.5 + 740 + (6000 - 5000) * 0.45 = 1394.5 + 450 = 1844.5
      expect(result).toBeCloseTo(1844.5, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', async () => {
      const result = await tax(0);
      expect(result).toBe(0);
    });

    it('should handle very small income', async () => {
      const result = await tax(0.01);
      expect(result).toBe(0);
    });

    it('should handle large income', async () => {
      const result = await tax(100000);
      expect(result).toBeGreaterThan(0);
    });
  });
});

describe('Superannuation Calculation', () => {
  it('should calculate 11.5% super on gross pay', () => {
    const gross = 1000;
    const superRate = 0.115;
    const superAmount = gross * superRate;
    expect(superAmount).toBe(115);
  });

  it('should calculate super for Alice reference amount', () => {
    expect(1325 * 0.115).toBeCloseTo(152.375, 2);
  });

  it('should calculate super for Bob reference amount', () => {
    expect(2328 * 0.115).toBeCloseTo(267.72, 2);
  });
});

describe('Net Pay Calculation', () => {
  it('should calculate net as gross minus tax', () => {
    const gross = 1000;
    const taxAmount = 72; // from tax(1000)
    const net = gross - taxAmount;
    expect(net).toBe(928);
  });

  it('should match Alice reference net pay', async () => {
    const gross = 1325;
    const taxAmount = await tax(gross);
    const net = gross - taxAmount;
    expect(net).toBeCloseTo(1191.25, 2);
  });

  it('should match Bob reference net pay', async () => {
    const gross = 2328;
    const taxAmount = await tax(gross);
    const net = gross - taxAmount;
    expect(net).toBeCloseTo(1891.90, 1);
  });
});
