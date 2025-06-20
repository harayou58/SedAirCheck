# SedAirCheck デプロイガイド

## 📋 デプロイ手順

### 1. 事前準備

#### 必要なアカウント
- GitHub アカウント
- OpenAI API アカウント（APIキーが必要）
- Vercel アカウント（フロントエンド用）
- Render アカウント（バックエンド用）

### 2. OpenAI API キー取得

1. https://platform.openai.com/ にアクセス
2. API Keys → Create new secret key
3. キーを安全に保管

### 3. GitHub にプッシュ

```bash
git add .
git commit -m "Initial SedAirCheck implementation"
git push origin main
```

### 4. バックエンドデプロイ（Render）

1. https://render.com/ にアクセス
2. GitHub リポジトリを接続
3. Web Service を作成
4. 設定：
   - Name: `sedaircheck-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment Variables:
     - `OPENAI_API_KEY`: [Your OpenAI API Key]
     - `CORS_ORIGIN`: `https://sedaircheck.vercel.app`

### 5. フロントエンドデプロイ（Vercel）

1. https://vercel.com/ にアクセス
2. GitHub リポジトリをインポート
3. プロジェクト設定：
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     - `VITE_API_URL`: `https://sedaircheck-backend.onrender.com/api`

### 6. 動作確認

- フロントエンド: `https://sedaircheck.vercel.app`
- バックエンド: `https://sedaircheck-backend.onrender.com/health`

## 🔧 トラブルシューティング

### よくある問題

1. **CORS エラー**
   - バックエンドの CORS_ORIGIN 設定を確認
   - フロントエンドURLと一致しているか確認

2. **API キーエラー**
   - Render の環境変数設定を確認
   - OpenAI API キーが正しく設定されているか確認

3. **ビルドエラー**
   - package.json の依存関係を確認
   - Node.js バージョンを確認

## 📱 共有方法

デプロイ完了後、以下の情報を共有：

```
SedAirCheck プロトタイプ

🌐 アクセスURL: https://sedaircheck.vercel.app

📋 使用方法:
1. 口腔内写真をアップロード
2. マランパティ分類の自動判定
3. 静脈麻酔リスクの評価

⚠️ 注意: これはプロトタイプです。実際の診断には使用しないでください。
```

## 🔄 更新方法

コードを更新する場合：

```bash
git add .
git commit -m "Update description"
git push origin main
```

Vercel と Render は自動的に新しいバージョンをデプロイします。