import { fixedBalance } from './index';

describe('fixedBalance', () => {
  test('should return array with average weights', () => {
    const weights = [1, 2, 3, 4, 5];
    const result = fixedBalance(weights);
    expect(result).toHaveLength(weights.length);
    expect(result).toEqual(Array(weights.length).fill(3));
  });

  test('should handle empty array', () => {
    const weights: number[] = [];
    expect(fixedBalance(weights)).toEqual([]);
  });

  test('should handle single weight', () => {
    const weights = [10];
    const result = fixedBalance(weights);
    expect(result).toHaveLength(1);
    expect(result).toEqual([10]);
  });

  test('should handle negative weights', () => {
    const weights = [-1, -2, -3];
    const result = fixedBalance(weights);
    expect(result).toHaveLength(weights.length);
    expect(result).toEqual(Array(weights.length).fill(-2));
  });

  test('should handle mixed positive and negative weights', () => {
    const weights = [-1, 1, -2, 2];
    const result = fixedBalance(weights);
    expect(result).toHaveLength(weights.length);
    expect(result).toEqual(Array(weights.length).fill(0));
  });

  test('should handle decimal weights', () => {
    const weights = [0.1, 0.2, 0.3];
    const result = fixedBalance(weights);
    expect(result).toHaveLength(weights.length);
    result.forEach(value => {
      expect(value).toBeCloseTo(0.2);
    });
  });
}); 