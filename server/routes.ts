import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertStockSchema, insertFavoriteSchema } from "@shared/schema";
import fetch from "node-fetch";

export async function registerRoutes(app: Express) {
  app.get("/api/stocks/:symbol", async (req, res) => {
    const stock = await storage.getStock(req.params.symbol);
    if (!stock) {
      res.status(404).json({ message: "Stock not found" });
      return;
    }
    res.json(stock);
  });

  app.post("/api/stocks", async (req, res) => {
    const parsed = insertStockSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid stock data" });
      return;
    }
    const stock = await storage.insertStock(parsed.data);
    res.json(stock);
  });

  app.get("/api/favorites", async (_req, res) => {
    const favorites = await storage.getFavorites();
    res.json(favorites);
  });

  app.post("/api/favorites", async (req, res) => {
    const parsed = insertFavoriteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid favorite data" });
      return;
    }
    const favorite = await storage.addFavorite(parsed.data);
    res.json(favorite);
  });

  app.delete("/api/favorites/:symbol", async (req, res) => {
    await storage.removeFavorite(req.params.symbol);
    res.status(204).send();
  });

  // Proxy endpoints for Yahoo Finance
  app.get("/api/yahoo/chart/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { range, interval } = req.query;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Yahoo Finance API error:', error);
      res.status(500).json({ message: "Failed to fetch stock data" });
    }
  });

  app.get("/api/yahoo/search", async (req, res) => {
    try {
      const { q } = req.query;
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q as string)}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Yahoo Finance Search API error:', error);
      res.status(500).json({ message: "Failed to search stocks" });
    }
  });

  return createServer(app);
}