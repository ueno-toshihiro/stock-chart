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
  LineChart,
} from "recharts";
import { format } from "date-fns";
import { type StockData } from "@shared/schema";
import { calculateFibonacciLevels, FIBO_LEVELS } from "@/lib/fibonacci";
import { calculateSMA } from "@/lib/technical-analysis";

interface StockChartProps {
  data: StockData[];
  showFibonacci?: boolean;
  showSMA?: boolean;
}

export function StockChart({
  data,
  showFibonacci = true,
  showSMA = true,
}: StockChartProps) {
  const { high, low, fiboLevels, sma50, sma100, sma200 } = useMemo(() => {
    const high = Math.max(...data.map((d) => d.high));
    const low = Math.min(...data.map((d) => d.low));
    const levels = calculateFibonacciLevels(high, low);

    // 移動平均線の計算
    const closes = data.map((d) => d.close);
    const sma50 = calculateSMA(closes, 50);
    const sma100 = calculateSMA(closes, 100);
    const sma200 = calculateSMA(closes, 200);

    return { high, low, fiboLevels: levels, sma50, sma100, sma200 };
  }, [data]);

  // データに移動平均線の値を追加
  const chartData = data.map((d, i) => ({
    ...d,
    sma50: sma50[i],
    sma100: sma100[i],
    sma200: sma200[i],
  }));

  console.log({ chartData });

  return (
    <ResponsiveContainer width="100%" height={500}>
      <AreaChart
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
            const data = payload[0].payload as StockData & {
              sma50: number;
              sma100: number;
              sma200: number;
            };
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
                  {showSMA && (
                    <>
                      <div>SMA50: ${data.sma50?.toFixed(2) ?? "N/A"}</div>
                      <div>SMA100: ${data.sma100?.toFixed(2) ?? "N/A"}</div>
                      <div>SMA200: ${data.sma200?.toFixed(2) ?? "N/A"}</div>
                    </>
                  )}
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
        {showSMA && (
          <>
            <Line
              type="monotone"
              dataKey="sma50"
              stroke="#2196F3"
              // dot={false}
              name="SMA 50"
              // isAnimationActive={false}
              // strokeWidth={2}
              // connectNulls
            />
            <Line
              type="monotone"
              dataKey="sma100"
              stroke="#FF9800"
              dot={false}
              name="SMA 100"
              isAnimationActive={false}
              strokeWidth={2}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="sma200"
              stroke="#F44336"
              dot={false}
              name="SMA 200"
              isAnimationActive={false}
              strokeWidth={2}
              connectNulls
            />
          </>
        )}
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
      </AreaChart>
    </ResponsiveContainer>
  );
}
