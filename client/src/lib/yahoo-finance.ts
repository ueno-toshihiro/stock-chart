import { type StockData } from "@shared/schema";

export type Period = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y";

interface YahooFinanceResponse {
  chart: {
    result: [
      {
        timestamp: number[];
        indicators: {
          quote: [
            {
              open: number[];
              high: number[];
              low: number[];
              close: number[];
              volume: number[];
            }
          ];
        };
      }
    ];
  };
}

export async function fetchStockData(
  symbol: string,
  period: Period
): Promise<StockData[]> {
  const interval = period === "1d" ? "5m" : "1d";
  const url = `/api/yahoo/chart/${symbol}?range=${period}&interval=${interval}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch stock data: ${response.statusText}`);
  }

  const data: YahooFinanceResponse = await response.json();
  const result = data.chart.result[0];
  const quote = result.indicators.quote[0];

  return result.timestamp.map((timestamp, i) => ({
    timestamp,
    open: quote.open[i],
    high: quote.high[i],
    low: quote.low[i],
    close: quote.close[i],
    volume: quote.volume[i],
  }));
}

export async function searchStocks(
  query: string
): Promise<{ symbol: string; name: string }[]> {
  const url = `/api/yahoo/search?q=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to search stocks: ${response.statusText}`);
  }

  const data = await response.json();
  return data.quotes.map((quote: any) => ({
    symbol: quote.symbol,
    name: quote.longname || quote.shortname,
  }));
}
