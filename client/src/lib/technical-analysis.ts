/**
 * 移動平均線を計算する
 * @param data 株価データ配列
 * @param period 期間（日数）
 * @returns 移動平均値の配列
 */
export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    sma.push(sum / period);
  }
  
  return sma;
}
