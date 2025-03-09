import { useMemo } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Line,
  LineChart,
  Legend,
  CartesianGrid,
  Customized,
  Rectangle,
} from "recharts";
import { format } from "date-fns";
import { type StockData } from "@shared/schema";
import { calculateFibonacciLevels, FIBO_LEVELS } from "@/lib/fibonacci";
import { calculateSMA } from "@/lib/technical-analysis";

interface StockChartProps {
  data: StockData[];
  showFibonacci?: boolean;
  showSMA?: boolean;
  smaPeriods?: number[]; // 表示したい移動平均線の期間を指定
}

// カスタムロウソク足コンポーネント
const CustomizedCandlestick = (props: any) => {
  const { formattedGraphicalItems } = props;
  
  // 高値と安値のポイントを取得
  const highPoints = formattedGraphicalItems[0]?.props?.points || [];
  const lowPoints = formattedGraphicalItems[1]?.props?.points || [];
  const openPoints = formattedGraphicalItems[2]?.props?.points || [];
  const closePoints = formattedGraphicalItems[3]?.props?.points || [];

  return highPoints.map((point: any, index: number) => {
    if (!point || !lowPoints[index] || !openPoints[index] || !closePoints[index]) {
      return null;
    }

    const { x } = point;
    const highY = point.y;
    const lowY = lowPoints[index].y;
    const openY = openPoints[index].y;
    const closeY = closePoints[index].y;
    
    // ロウソク足の本体（始値と終値の間）
    const bodyY = Math.min(openY, closeY);
    const bodyHeight = Math.abs(closeY - openY);
    const isIncreasing = closeY < openY; // 株価チャートでは上に行くほどY座標は小さくなる
    
    // ロウソク足の太さ
    const candleWidth = 4;
    
    // 上下の髭の太さ
    const wickWidth = 1;

    return (
      <g key={index}>
        {/* 上下のヒゲ */}
        <line
          x1={x}
          y1={highY}
          x2={x}
          y2={lowY}
          stroke="#85929e"
          strokeWidth={wickWidth}
        />
        
        {/* ロウソク足の本体 */}
        <Rectangle
          x={x - candleWidth / 2}
          y={bodyY}
          width={candleWidth}
          height={bodyHeight || 1} // 始値と終値が同じ場合は最小高さを1にする
          fill={isIncreasing ? "#4CAF50" : "#F44336"}
          stroke={isIncreasing ? "#4CAF50" : "#F44336"}
        />
      </g>
    );
  });
};

export function StockChart({
  data,
  showFibonacci = true,
  showSMA = true,
  smaPeriods = [7, 14, 21, 50],
}: StockChartProps) {
  const { high, low, fiboLevels, smaData } = useMemo(() => {
    const high = Math.max(...data.map((d) => d.high));
    const low = Math.min(...data.map((d) => d.low));
    const levels = calculateFibonacciLevels(high, low);

    // 移動平均線の計算
    const closes = data.map((d) => d.close);

    // SMAの計算を期間ごとに行い、データに対して安全に計算
    const smaData: Record<string, (number | null)[]> = {};

    smaPeriods.forEach((period) => {
      // 計算結果の配列（データ長と同じ）を初期化
      const smaValues = new Array(data.length).fill(null);

      // 十分なデータがある場合のみ計算
      if (closes.length >= period) {
        // 各期間のSMAを計算
        const calculatedSMA = calculateSMA(closes, period);

        // 計算結果をデータ長に合わせて配置
        // （計算開始位置は period - 1 から）
        for (let i = period - 1; i < data.length; i++) {
          smaValues[i] = calculatedSMA[i - (period - 1)];
        }
      }

      smaData[`sma${period}`] = smaValues;
    });

    return { high, low, fiboLevels: levels, smaData };
  }, [data, smaPeriods]);

  // データに移動平均線の値を追加
  const chartData = data.map((d, i) => {
    const enhancedData: any = { ...d };

    // 各SMA期間の値を追加
    smaPeriods.forEach((period) => {
      enhancedData[`sma${period}`] = smaData[`sma${period}`][i];
    });

    return enhancedData;
  });

  // SMAごとの色を定義
  const smaColors: Record<string, string> = {
    ...Object.fromEntries(
      smaPeriods.map((period, i) => [
        `sma${period}`,
        ["#2196F3", "#FF9800", "#F44336", "#4CAF50"][i % 4],
      ])
    ),
  };

  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(timestamp) =>
            format(new Date(timestamp * 1000), "HH:mm")
          }
        />
        <YAxis domain={["auto", "auto"]} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const data = payload[0].payload;
            return (
              <div className="rounded-lg border bg-background p-2 shadow-md">
                <div className="font-medium">
                  {format(new Date(data.timestamp * 1000), "PP pp")}
                </div>
                <div className="mt-1 space-y-1 text-sm">
                  <div>Open: ${data.open.toFixed(2)}</div>
                  <div>High: ${data.high.toFixed(2)}</div>
                  <div>Low: ${data.low.toFixed(2)}</div>
                  <div>Close: ${data.close.toFixed(2)}</div>
                  {showSMA &&
                    smaPeriods.map((period) => (
                      <div
                        key={period}
                        style={{ color: smaColors[`sma${period}`] || "#000" }}
                      >
                        SMA{period}: $
                        {data[`sma${period}`]?.toFixed(2) ?? "N/A"}
                      </div>
                    ))}
                  <div>Volume: {data.volume.toLocaleString()}</div>
                </div>
              </div>
            );
          }}
        />
        <Legend />
        
        {/* ロウソク足のためのデータライン（非表示） */}
        <Line type="monotone" dataKey="high" stroke="none" dot={false} />
        <Line type="monotone" dataKey="low" stroke="none" dot={false} />
        <Line type="monotone" dataKey="open" stroke="none" dot={false} />
        <Line type="monotone" dataKey="close" stroke="none" dot={false} />
        
        {/* カスタムロウソク足 */}
        <Customized component={<CustomizedCandlestick />} />
        
        {/* 移動平均線 */}
        {showSMA &&
          smaPeriods.map((period) => (
            <Line
              key={period}
              type="monotone"
              dataKey={`sma${period}`}
              stroke={smaColors[`sma${period}`] || "#000"}
              dot={false}
              name={`SMA ${period}`}
              connectNulls={true}
            />
          ))}
          
        {/* フィボナッチライン */}
        {showFibonacci &&
          fiboLevels.map((level, i) => (
            <ReferenceLine
              key={i}
              y={level}
              stroke="#ff7300"
              strokeDasharray="3 3"
              label={{
                value: `${(FIBO_LEVELS[i] * 100).toFixed(1)}%`,
                position: "right",
              }}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
}