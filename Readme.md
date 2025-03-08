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

スキーマの変更を適用するには：

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
