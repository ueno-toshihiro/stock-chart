import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "../shared/schema";
import dotenv from "dotenv";

// 環境変数のロード
dotenv.config();

// 環境変数からデータベースURLを取得
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL環境変数が設定されていません。");
}

// プールを作成
const pool = new Pool({ connectionString });

// drizzleインスタンスを作成
export const db = drizzle(pool, { schema });
