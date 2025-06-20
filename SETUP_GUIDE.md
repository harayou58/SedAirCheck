# SedAirCheck セットアップガイド

## 必要な環境

- Node.js 18以上
- npm または yarn
- OpenAI API キー（GPT-4 Vision API アクセス権限付き）

## セットアップ手順

### 1. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の内容を設定してください：

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 2. 依存関係のインストール

```bash
# プロジェクトルートで実行
npm install

# バックエンドの依存関係
cd backend
npm install

# フロントエンドの依存関係
cd ../frontend
npm install
```

### 3. 開発サーバーの起動

#### 方法1: 個別に起動

```bash
# ターミナル1 - バックエンド
cd backend
npm run dev

# ターミナル2 - フロントエンド
cd frontend
npm run dev
```

#### 方法2: 同時起動（プロジェクトルートから）

```bash
npm run dev
```

### 4. アプリケーションへのアクセス

- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:3001
- ヘルスチェック: http://localhost:3001/health

## 動作確認

### 1. APIヘルスチェック

```bash
curl http://localhost:3001/health
```

期待される応答:
```json
{
  "status": "ok",
  "timestamp": "2025-06-20T12:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. 画像解析テスト

1. ブラウザで http://localhost:5173 を開く
2. 口腔内写真をアップロード（JPEG/PNG、最大10MB）
3. 解析結果の確認:
   - マランパティ分類（Class I-IV）
   - リスクレベル（低リスク/高リスク）
   - 推奨事項

## トラブルシューティング

### OpenAI API エラー

エラー: "APIキーが設定されていません"
- `.env` ファイルに `OPENAI_API_KEY` が正しく設定されているか確認
- APIキーがGPT-4 Vision APIへのアクセス権限を持っているか確認

### ポート競合エラー

エラー: "EADDRINUSE: address already in use"
- 別のプロセスがポートを使用していないか確認
- `.env` ファイルでポート番号を変更

### CORS エラー

エラー: "CORS policy blocked"
- `.env` の `CORS_ORIGIN` がフロントエンドのURLと一致しているか確認
- 開発環境では `http://localhost:5173` を使用

## プロダクションビルド

```bash
# バックエンド
cd backend
npm run build

# フロントエンド
cd ../frontend
npm run build
```

## デプロイメント

詳細なデプロイメント手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。