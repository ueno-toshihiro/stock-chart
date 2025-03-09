## セットアップと実行方法

1. プロジェクトのビルド:

```bash
npm run build
```

2. 開発サーバーの起動:

```bash
npm run dev
```

アプリケーションは以下の URL でアクセスできます：
http://0.0.0.0:5001

## 技術スタック

- TypeScript
- Drizzle ORM (PostgreSQL データベース操作)
- PostgreSQL

## データベース管理

スキーマの変更を直接データベースに適用します

```bash
npm run db:push
```

## プロジェクト構造

### データモデル (`shared/schema.ts`)

#### 株式情報テーブル (stocks)

- `id`: 主キー (serial)
- `symbol`: 株式シンボル (text, 必須)
- `name`: 株式名 (text, 必須)
- `price`: 価格 (numeric, 必須)
- `lastUpdated`: 最終更新日時 (timestamp, 必須)

#### お気に入りテーブル (favorites)

- `id`: 主キー (serial)
- `symbol`: 株式シンボル (text, 必須)

### ストレージレイヤー (`server/storage.ts`)

#### IStorage インターフェース

主要な操作：

- `getStock(symbol)`: 特定の株式情報の取得
- `insertStock(stock)`: 新規株式情報の登録
- `getFavorites()`: お気に入り一覧の取得
- `addFavorite(favorite)`: お気に入りの追加
- `removeFavorite(symbol)`: お気に入りの削除

#### MemStorage クラス

- インメモリでデータを管理する実装
- `Map`を使用したデータストレージ
- CRUD 操作の提供

## 技術的特徴

### 型安全性

- TypeScript による完全な型サポート
- Drizzle ORM によるスキーマと型の自動生成
- コンパイル時の型チェック

### データベース操作

- Drizzle ORM による直感的なクエリビルダー
- マイグレーション管理機能
- PostgreSQL との互換性

### アーキテクチャ

- インターフェースによる抽象化
- メモリストレージから DB への移行を考慮した設計
- モジュール化された構造

---

## ローカル環境で PostgreSQL と drizzle-kit を設定する手順

1. PostgreSQL のインストール
   まず、ローカルマシンに PostgreSQL をインストールします。
   macOS（Homebrew を使用）の場合:

```bash
brew install postgresql@14
brew services start postgresql@14
```

手動でデータベースを作成:

```bash
createdb stock_chart
```

2. 環境変数の設定
   PostgreSQL 接続情報を設定するために、.env ファイルをプロジェクトのルートに作成します：

```
DATABASE_URL=postgres://<ユーザー名>:<パスワード>@localhost:5432/stock_chart
```

## 3. 依存関係の確認と追加

すでに`package.json`に drizzle 関連のパッケージがインストールされていますが、念のため確認しましょう：

- `drizzle-orm`：ORM ライブラリ本体
- `drizzle-kit`：マイグレーションツール
- `@neondatabase/serverless`：PostgreSQL クライアント（既にインストール済み）

もし不足しているパッケージがあれば、以下のコマンドでインストールできます：

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

## 4. データベースのマイグレーション実行

既存の`drizzle.config.ts`がすでに設定されているので、マイグレーションを実行するには：

```bash
npm run db:push
```

これにより、`shared/schema.ts`で定義されたスキーマに基づいてデータベースが更新されます。

## 5. データベース接続設定

サーバーの起動ファイルでデータベース接続を設定します。既に設定されている可能性もありますが、以下のようなコードが必要です：

```typescript
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "../shared/schema";

// 環境変数からデータベースURLを取得
const connectionString = process.env.DATABASE_URL!;

// プールを作成
const pool = new Pool({ connectionString });

// drizzleインスタンスを作成
export const db = drizzle(pool, { schema });
```

## 6. データベース操作の例

以下のようにデータベース操作を行うことができます：

```typescript
// 新しい株式情報を挿入
await db.insert(schema.stocks).values({
  symbol: "AAPL",
  name: "Apple Inc.",
  price: "150.25",
  lastUpdated: new Date(),
});

// 株式情報を取得
const stockInfo = await db
  .select()
  .from(schema.stocks)
  .where(eq(schema.stocks.symbol, "AAPL"));
```

## 7. 開発環境での実行

設定が完了したら、開発サーバーを起動してアプリケーションを実行できます：

```bash
npm run dev
```

## 8. PostgreSQL の管理ツール（オプション）

データベースを視覚的に管理したい場合

- pgAdmin 4

これらのツールを使用すると、テーブルの閲覧、データの操作、クエリの実行などを GUI で行うことができます。

pgAdmin 4 のインストール
まだインストールしていない場合は、以下の方法でインストールします。
macOS の場合（Homebrew を使用）:

```bash
brew install --cask pgadmin4
```

または、公式サイトからダウンロードしてインストールすることもできます。

---

## データベースのマイグレーション

データベースのマイグレーションを実行するには、以下のコマンドを実行します。

```bash
npm run db:push
```

## データベースのマイグレーションのロールバック

データベースのマイグレーションをロールバックするには、以下のコマンドを実行します。

```bash
npm run db:rollback
```

## データベースのマイグレーションのリセット

データベースのマイグレーションをリセットするには、以下のコマンドを実行します。

```bash
npm run db:reset
```

---

## ローカルで作動している PostgreSQL サーバーをリスタートする方法

Homebrew でインストールした場合、以下のコマンドで PostgreSQL をリスタートできます

```bash
brew services restart postgresql@14
```

## ローカルで作動している PostgreSQL サーバーを停止する方法

ローカルで動作している PostgreSQL サーバーを停止する方法はいくつかあります。
macOS で Homebrew を使って PostgreSQL をインストールしたときの主な停止方法

## Homebrew 経由で停止する方法（推奨）

Homebrew でインストールした場合、以下のコマンドで PostgreSQL を停止できます：

```bash
brew services stop postgresql
```

または特定のバージョンを停止する場合：

```bash
brew services stop postgresql@14
```

## 代替の停止方法

### pg_ctl コマンドを使用する方法

```bash
pg_ctl -D /usr/local/var/postgres stop
```

または特定のバージョンのデータディレクトリを指定する場合：

```bash
pg_ctl -D /usr/local/var/postgresql@14 stop
```

### サービスの状態確認

PostgreSQL サービスの状態を確認するには：

```bash
brew services list
```

これにより、実行中のサービス一覧とその状態が表示されます。PostgreSQL が「started」と表示されていれば実行中、「stopped」と表示されていれば停止しています。

### 完全に無効化する場合

PostgreSQL を自動起動しないようにしたい場合は、以下のコマンドでサービスを無効化できます：

```bash
brew services unload postgresql@14
```

これでマシンの再起動時に PostgreSQL が自動的に起動しなくなります。

### トラブルシューティング

もし上記の方法で停止できない場合は、PostgreSQL のプロセス ID を見つけて強制終了する方法もあります：

```bash
ps aux | grep postgres
```

上記で見つかったプロセス ID を使用して：

```bash
kill -9 プロセスID
```

ただし、この方法は緊急時のみ使用し、通常は brew コマンドで適切に停止することをお勧めします。適切に停止しないとデータが破損する可能性があります。

以上の方法で、ローカルで動作している PostgreSQL サーバーを停止できます。
