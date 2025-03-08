export function calculateFibonacciLevels(high: number, low: number): number[] {
  const difference = high - low;
  return [
    high,  // 100%
    high - difference * 0.236, // 76.4%
    high - difference * 0.382, // 61.8%
    high - difference * 0.5,   // 50%
    high - difference * 0.618, // 38.2%
    high - difference * 0.786, // 23.6%
    low,   // 0%
  ];
}

export const FIBO_LEVELS = [1, 0.786, 0.618, 0.5, 0.382, 0.236, 0];
