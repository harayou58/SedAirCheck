# 🚀 SedAirCheck デプロイメントガイド

消化器内科の先生が簡単にアクセスできるよう、無料でウェブデプロイする方法を説明します。

## 📋 概要

**完全無料** でVercelを使用してSedAirCheckシステムを公開します。
- フロントエンド: React アプリケーション
- バックエンド: サーバーレス関数
- 月間利用料: **0円**

## 🎯 手順1: GitHubにコードをプッシュ

```bash
# プロジェクトルートで実行
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## 🎯 手順2: Vercelアカウント作成・デプロイ

### 2.1 Vercelアカウント作成
1. [vercel.com](https://vercel.com) にアクセス
2. "Sign Up" をクリック
3. GitHubアカウントでログイン（推奨）

### 2.2 プロジェクトをデプロイ
1. Vercelダッシュボードで "New Project" をクリック
2. GitHubリポジトリ `SedAirCheck` を選択
3. "Import" をクリック
4. 設定はデフォルトのまま "Deploy" をクリック

## 🎯 手順3: 環境変数の設定

### 3.1 OpenAI APIキーの設定
1. Vercelダッシュボード → プロジェクト → Settings → Environment Variables
2. 以下を追加:
   ```
   Name: OPENAI_API_KEY
   Value: [あなたのOpenAI APIキー]
   Environment: Production, Preview, Development
   ```

### 3.2 その他の環境変数（オプション）
```
NODE_ENV: production
PORT: 3001
```

## 🎯 手順4: デプロイ完了

- デプロイが完了すると、URLが生成されます（例: `https://sed-air-check-xxx.vercel.app`）
- このURLを消化器内科の先生に共有

## 📱 使用方法（先生向け）

1. **ブラウザでアクセス**
   - 提供されたURL（`https://sed-air-check-xxx.vercel.app`）をクリック
   - スマートフォン・タブレット・PCから利用可能

2. **画像アップロード**
   - "画像をアップロード" ボタンをクリック
   - 口腔内写真を選択
   - 自動でマランパティ分類を判定

3. **結果確認**
   - 分類結果（Class I-IV）
   - リスクレベル（低/高）
   - 推奨事項

## 🔧 トラブルシューティング

### デプロイエラーが発生した場合
1. Vercelダッシュボード → Functions タブでエラーログを確認
2. 環境変数が正しく設定されているか確認
3. OpenAI APIキーが有効か確認

### 画像解析エラーが発生した場合
- OpenAI APIの使用量制限を確認
- APIキーの権限を確認

## 💰 コスト

### Vercel（無料）
- フロントエンド: 完全無料
- サーバーレス関数: 月100GB実行時間まで無料
- カスタムドメイン: 無料

### OpenAI API（従量課金）
- GPT-4o Vision: $0.01275/1K tokens
- 1回の解析: 約$0.01-0.03
- 月10回程度の使用: **約$0.30**

## 📞 サポート

デプロイに問題がある場合は、以下の情報と共にご連絡ください：
- Vercelのエラーメッセージ
- 実行したステップ
- ブラウザとOSの情報

---

**🎉 これで消化器内科の先生がいつでもウェブブラウザからSedAirCheckにアクセスできます！**