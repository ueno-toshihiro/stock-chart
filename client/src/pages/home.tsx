import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockSearch } from "@/components/stock-search";
import { StockChart } from "@/components/stock-chart";
import { PeriodSelector } from "@/components/period-selector";
import { fetchStockData, type Period } from "@/lib/yahoo-finance";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [symbol, setSymbol] = useState<string>("AAPL");
  const [period, setPeriod] = useState<Period>("1d");
  const [showFibonacci, setShowFibonacci] = useState(true);
  const [showSMA, setShowSMA] = useState(true);

  const { data: stockData, isLoading } = useQuery({
    queryKey: ["stockData", symbol, period],
    queryFn: () => fetchStockData(symbol, period),
    enabled: !!symbol,
  });

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <StockSearch onSelect={setSymbol} />
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="fibonacci"
              checked={showFibonacci}
              onCheckedChange={setShowFibonacci}
            />
            <Label htmlFor="fibonacci">フィボナッチレベル</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="sma" checked={showSMA} onCheckedChange={setShowSMA} />
            <Label htmlFor="sma">移動平均線</Label>
          </div>
          <PeriodSelector period={period} onChange={setPeriod} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{symbol} Stock Chart</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-[500px] items-center justify-center">
              <div className="text-lg text-muted-foreground">Loading...</div>
            </div>
          ) : stockData ? (
            <StockChart
              data={stockData}
              showFibonacci={showFibonacci}
              showSMA={showSMA}
              symbol={symbol}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
