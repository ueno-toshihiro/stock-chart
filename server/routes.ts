// このファイルはExpressサーバーのルーティングを設定するファイルです

import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertStockSchema, insertFavoriteSchema } from "@shared/schema";
import fetch from "node-fetch";
import debug from "debug";

import { StockPriceService } from "../service/stockPriceService";

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

// デバッグロガーの作成
const routesLogger = debug("app:routes");
const stockLogger = debug("app:stock");
const favoriteLogger = debug("app:favorite");

export async function registerRoutes(app: Express) {
  routesLogger("Registering routes...");

  // 株式情報の取得 API
  app.get("/api/stocks/:symbol", async (req, res) => {
    stockLogger(`GET /api/stocks/${req.params.symbol} requested`);
    const stock = await storage.getStock(req.params.symbol);
    if (!stock) {
      stockLogger(`Stock not found: ${req.params.symbol}`);
      res.status(404).json({ message: "Stock not found" });
      return;
    }
    stockLogger(`Returning stock: %O`, stock);
    res.json(stock);
  });

  // 株式情報の登録 API
  app.post("/api/stocks", async (req, res) => {
    stockLogger(`POST /api/stocks requested with data: %O`, req.body);
    const parsed = insertStockSchema.safeParse(req.body);
    if (!parsed.success) {
      stockLogger(`Invalid stock data: %O`, parsed.error);
      res.status(400).json({ message: "Invalid stock data" });
      return;
    }
    const stock = await storage.insertStock(parsed.data);
    stockLogger(`Stock inserted: %O`, stock);
    res.json(stock);
  });

  // お気に入り一覧の取得 API
  app.get("/api/favorites", async (_req, res) => {
    favoriteLogger("GET /api/favorites requested");
    const favorites = await storage.getFavorites();
    favoriteLogger(`Returning favorites: %O`, favorites);
    res.json(favorites);
  });

  // お気に入りの追加 API
  app.post("/api/favorites", async (req, res) => {
    favoriteLogger(`POST /api/favorites requested with data: %O`, req.body);
    const parsed = insertFavoriteSchema.safeParse(req.body);
    if (!parsed.success) {
      favoriteLogger(`Invalid favorite data: %O`, parsed.error);
      res.status(400).json({ message: "Invalid favorite data" });
      return;
    }
    const favorite = await storage.addFavorite(parsed.data);
    favoriteLogger(`Favorite added: %O`, favorite);
    res.json(favorite);
  });

  // お気に入りの削除 API
  app.delete("/api/favorites/:symbol", async (req, res) => {
    favoriteLogger(`DELETE /api/favorites/${req.params.symbol} requested`);
    await storage.removeFavorite(req.params.symbol);
    favoriteLogger(`Favorite removed: ${req.params.symbol}`);
    res.status(204).send();
  });

  // Yahoo Finance APIへのプロキシエンドポイント
  // 株価チャートデータの取得
  app.get("/api/yahoo/chart/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { range, interval } = req.query;
      routesLogger(
        `Yahoo chart requested: ${symbol}, range: ${range}, interval: ${interval}`
      );
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
      const response = await fetch(url);
      const data = (await response.json()) as YahooFinanceResponse;
      const result = data.chart.result[0];
      const quote = result.indicators.quote[0];

      const chartData = result.timestamp.map((timestamp, i) => ({
        timestamp,
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i],
      }));

      const stockPriceService = new StockPriceService();
      // データをStorageに保存
      try {
        await stockPriceService.saveStockPrices(symbol, chartData);
        routesLogger("Successfully saved stock prices for", symbol);
      } catch (error) {
        routesLogger("Error saving stock prices:", error);
        throw error;
      }

      res.json(data);
    } catch (error) {
      routesLogger("Yahoo Finance API error:", error);
      res.status(500).json({ message: "Failed to fetch stock data" });
    }
  });

  // 保存された株価データの取得
  app.get("/api/stocks/:symbol/history", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ message: "startDate and endDate are required" });
        return;
      }

      routesLogger("Fetching historical data:", {
        symbol,
        startDate,
        endDate,
        startDateObj: new Date(startDate as string),
        endDateObj: new Date(endDate as string)
      });

      const stockPriceService = new StockPriceService();
      const historicalData = await stockPriceService.getStockPrices(
        symbol,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      routesLogger(`Found ${historicalData.length} records`);
      res.json(historicalData);
    } catch (error) {
      routesLogger("Error fetching historical data:", error);
      res.status(500).json({ message: "Failed to fetch historical data" });
    }
  });

  // 株式銘柄の検索
  app.get("/api/yahoo/search", async (req, res) => {
    try {
      const { q } = req.query;
      routesLogger(`Yahoo search requested: ${q}`);
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
        q as string
      )}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      routesLogger("Yahoo Finance Search API error:", error);
      res.status(500).json({ message: "Failed to search stocks" });
    }
  });

  return createServer(app);
}
