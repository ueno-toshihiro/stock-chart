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
/**
 * 50日移動平均線(SMA50)の計算方法:
 * 
 * 1. 50日分の終値データを取得します
 * 2. 50日分のデータの合計を計算します
 * 3. 合計を50で割って平均値を算出します
 * 4. 1日ずつずらしながら同じ計算を繰り返します
 * 
 * 例:
 * データ: [100, 101, 102, 103, 104, ...]
 * 1日目: データが不足しているためNaN
 * 2日目: データが不足しているためNaN
 * ...
 * 50日目: (100 + 101 + ... + 149) / 50
 * 51日目: (101 + 102 + ... + 150) / 50
 * 
 * calculateSMA関数に period = 50 を指定することで計算できます:
 * const sma50 = calculateSMA(prices, 50);
 */
