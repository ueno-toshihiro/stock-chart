import { eq, and, between, sql } from "drizzle-orm";
// import { db } from "../server/db";
import { db } from "../drizzle.config";
import { stockPrices } from "../shared/schema";
import type { StockData } from "../shared/schema";
import debug from "debug";

const serviceLogger = debug("app:stockPriceService");

export class StockPriceService {
  // 日付のみを取得する関数（YYYY-MM-DD形式）
  private getDateOnly(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async saveStockPrices(symbol: string, data: StockData[]): Promise<void> {
    const stockPriceData = data.map((price) => ({
      symbol,
      date: this.getDateOnly(new Date(price.timestamp * 1000)),
      open: price.open.toString(),
      high: price.high.toString(),
      low: price.low.toString(),
      close: price.close.toString(),
      volume: price.volume,
    }));

    for (const price of stockPriceData) {
      await db
        .insert(stockPrices)
        .values(price)
        .onConflictDoUpdate({
          target: [stockPrices.symbol, stockPrices.date],
          set: {
            open: price.open,
            high: price.high,
            low: price.low,
            close: price.close,
            volume: price.volume,
          },
        });
    }
  }

  async getStockPrices(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<StockData[]> {
    const startDateStr = this.getDateOnly(startDate);
    const endDateStr = this.getDateOnly(endDate);

    serviceLogger("Querying stock prices:", {
      symbol,
      startDate: startDateStr,
      endDate: endDateStr
    });

    const result = await db
      .select()
      .from(stockPrices)
      .where(
        and(
          eq(stockPrices.symbol, symbol),
          between(
            stockPrices.date,
            startDateStr,
            endDateStr
          )
        )
      )
      .orderBy(stockPrices.date);

    serviceLogger(`Found ${result.length} records in database`);

    return result.map((price) => ({
      timestamp: new Date(price.date).getTime() / 1000, // Unix timestamp in seconds
      open: Number(price.open),
      high: Number(price.high),
      low: Number(price.low),
      close: Number(price.close),
      volume: Number(price.volume),
    }));
  }

  async hasStoredData(symbol: string, date: Date): Promise<boolean> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(stockPrices)
      .where(
        and(
          eq(stockPrices.symbol, symbol),
          eq(stockPrices.date, date.toISOString())
        )
      );

    return result[0].count > 0;
  }
}
