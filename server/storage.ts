// このファイルは株式情報とお気に入り情報を管理するためのストレージレイヤーを実装しています

// 必要な型定義をインポート
import { type Stock, type InsertStock, type Favorite, type InsertFavorite } from "@shared/schema";

// ストレージの操作を定義するインターフェース
export interface IStorage {
  getStock(symbol: string): Promise<Stock | undefined>;      // 株式情報の取得
  insertStock(stock: InsertStock): Promise<Stock>;          // 株式情報の登録
  getFavorites(): Promise<Favorite[]>;                      // お気に入り一覧の取得
  addFavorite(favorite: InsertFavorite): Promise<Favorite>; // お気に入りの追加
  removeFavorite(symbol: string): Promise<void>;            // お気に入りの削除
}

// メモリ上でデータを管理するストレージの実装
export class MemStorage implements IStorage {
  private stocks: Map<string, Stock>;         // 株式情報を保持するMap
  private favorites: Map<number, Favorite>;    // お気に入り情報を保持するMap
  private currentStockId: number;             // 株式情報のID採番用
  private currentFavoriteId: number;          // お気に入りのID採番用

  constructor() {
    this.stocks = new Map();
    this.favorites = new Map();
    this.currentStockId = 1;
    this.currentFavoriteId = 1;
  }

  // シンボルから株式情報を検索
  async getStock(symbol: string): Promise<Stock | undefined> {
    return Array.from(this.stocks.values()).find(
      (stock) => stock.symbol === symbol
    );
  }

  // 新しい株式情報を登録
  async insertStock(insertStock: InsertStock): Promise<Stock> {
    const id = this.currentStockId++;
    const stock: Stock = { ...insertStock, id };
    this.stocks.set(stock.symbol, stock);
    return stock;
  }

  // 全てのお気に入り情報を取得
  async getFavorites(): Promise<Favorite[]> {
    return Array.from(this.favorites.values());
  }

  // 新しいお気に入りを追加
  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentFavoriteId++;
    const favorite: Favorite = { ...insertFavorite, id };
    this.favorites.set(id, favorite);
    return favorite;
  }

  // シンボルを指定してお気に入りを削除
  async removeFavorite(symbol: string): Promise<void> {
    const favorite = Array.from(this.favorites.values()).find(
      (f) => f.symbol === symbol
    );
    if (favorite) {
      this.favorites.delete(favorite.id);
    }
  }
}

// ストレージのインスタンスをエクスポート
export const storage = new MemStorage();
