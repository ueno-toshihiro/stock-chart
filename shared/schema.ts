import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 株式情報を格納するテーブル定義
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(), // 主キー
  symbol: text("symbol").notNull(), // 株式シンボル(必須)
  name: text("name").notNull(), // 株式名(必須)
  price: numeric("price").notNull(), // 価格(必須)
  lastUpdated: timestamp("last_updated").notNull(), // 最終更新日時(必須)
});

// お気に入り株式を格納するテーブル定義
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(), // 主キー
  symbol: text("symbol").notNull(), // 株式シンボル(必須)
});

// バリデーション用のスキーマ定義
export const insertStockSchema = createInsertSchema(stocks).omit({ id: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true });

// 型定義
export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

// 株式データの型定義
export interface StockData {
  timestamp: number; // タイムスタンプ
  open: number;     // 始値
  high: number;     // 高値
  low: number;      // 安値
  close: number;    // 終値
  volume: number;   // 出来高
}
