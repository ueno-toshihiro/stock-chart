import { defineConfig } from "drizzle-kit";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from "./shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

// 環境変数からデータベースURLを取得
const connectionString = process.env.DATABASE_URL!;

// プールを作成
const pool = new Pool({ connectionString });

// drizzleインスタンスを作成
export const db = drizzle(pool, { schema });
