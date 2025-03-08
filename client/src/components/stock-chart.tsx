import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Line,
  ComposedChart,
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

export function StockChart({
  data,
  showFibonacci = true,
  showSMA = true,
  smaPeriods = [25, 50, 75, 200],
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
        ["#2196F3", "#FF9800", "#F44336"][i],
      ])
    ),
    // 必要に応じて追加
  };

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Area
          type="monotone"
          dataKey="close"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#chartFill)"
        />
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
      </ComposedChart>
    </ResponsiveContainer>
  );
}
