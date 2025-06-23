# SedAirCheck デプロイ仕様書
## プロトタイプ本番環境 構築計画

### 文書情報
- **プロジェクト名**: SedAirCheck
- **バージョン**: 1.0
- **作成日**: 2025-06-23
- **ステータス**: デプロイ計画書
- **目的**: プロトタイプの本番環境構築

---

## 1. デプロイ概要

### 1.1 デプロイ目標
- ローカル環境で動作するアプリケーションをクラウド上で公開
- プロトタイプとして安定した動作環境を提供
- 初心者でも管理しやすいシンプルな構成

### 1.2 現状分析
#### 動作確認済み環境
- **フロントエンド**: localhost:3000 (Vite + React + TypeScript)
- **バックエンド**: localhost:3001 (Express + TypeScript + OpenAI API)
- **機能**: 画像アップロード → ChatGPT API → マランパティ分類評価

#### 過去の課題
- Vercelでのバックエンドデプロイが失敗
- フロントエンド特化サービスでのフルスタック対応の限界

---

## 2. 推奨デプロイ方針

### 2.1 推奨案: Render（一体型デプロイ）

#### 選択理由
1. **フルスタック対応**: フロントエンド・バックエンドを同一サービスで管理
2. **初心者向け**: 設定がシンプルで学習コストが低い
3. **無料枠**: 開発・テスト用途で十分な無料利用枠
4. **Node.js最適化**: Express.jsアプリケーションに最適
5. **自動デプロイ**: GitHubとの連携で継続的デプロイ

#### 技術構成
```
┌─────────────────┐
│    Render       │
│                 │
│  ┌───────────┐  │
│  │Frontend   │  │  ← Vite Build → 静的ファイル
│  │(Static)   │  │
│  └───────────┘  │
│         │       │
│  ┌───────────┐  │
│  │Backend    │  │  ← Express.js サーバー
│  │(Web Service)│  │
│  └───────────┘  │
│         │       │
│  ┌───────────┐  │
│  │File Storage│  │  ← 画像一時保存
│  └───────────┘  │
└─────────────────┘
         │
   ┌───────────┐
   │OpenAI API │     ← 外部API呼び出し
   └───────────┘
```

### 2.2 実装方針

#### 2.2.1 プロジェクト構造調整
```
SedAirCheck/
├── package.json          ← ルートレベルでの統合管理
├── build.js             ← ビルドスクリプト
├── server.js            ← Render用エントリーポイント
├── frontend/            ← 既存フロントエンド
└── backend/             ← 既存バックエンド
```

#### 2.2.2 ビルド戦略
1. フロントエンドをビルドして静的ファイル生成
2. Express.jsでフロントエンドとAPIを統合サーブ
3. 単一のNode.jsアプリケーションとしてデプロイ

---

## 3. デプロイ手順書

### 3.1 事前準備

#### 3.1.1 環境変数設定
```bash
# 必要な環境変数
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
PORT=10000
```

#### 3.1.2 プロジェクト設定ファイル修正
- `package.json`: 統合ビルドスクリプト追加
- `server.js`: 本番環境用エントリーポイント作成
- `.gitignore`: 不要ファイル除外設定

### 3.2 Renderデプロイ手順

#### Step 1: Renderアカウント作成・設定
1. Render (https://render.com) にアカウント登録
2. GitHubアカウントと連携
3. リポジトリへのアクセス権限設定

#### Step 2: Web Service作成
1. "New Web Service" を選択
2. GitHub リポジトリを選択
3. 以下の設定を入力:
   ```
   Name: sedaircheck
   Environment: Node
   Build Command: npm install && npm run build:production
   Start Command: npm start
   Instance Type: Free
   ```

#### Step 3: 環境変数設定
1. Environment タブで環境変数を設定
2. `OPENAI_API_KEY` を追加
3. `NODE_ENV=production` を設定

#### Step 4: デプロイ実行
1. "Create Web Service" でデプロイ開始
2. ビルドログを監視
3. デプロイ完了後、URLにアクセスして動作確認

### 3.3 動作確認項目
- [ ] フロントエンド画面の表示
- [ ] 画像アップロード機能
- [ ] ChatGPT API連携
- [ ] 結果表示機能
- [ ] エラーハンドリング

---

## 4. 設定ファイル詳細

### 4.1 統合package.json
```json
{
  "scripts": {
    "build:production": "cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build",
    "start": "node backend/dist/server.js",
    "postinstall": "npm run build:production"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 4.2 本番用サーバー設定
```javascript
// server.js (本番用エントリーポイント)
const express = require('express');
const path = require('path');
const app = express();

// 静的ファイル配信
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// API routes
app.use('/api', require('./backend/dist/routes'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 5. 代替案検討

### 5.1 代替案A: Vercel + Railway分離構成

#### 構成
- **フロントエンド**: Vercel (静的サイト)
- **バックエンド**: Railway (Node.js API)

#### メリット
- 各サービスの専門性を活用
- Vercelの高速CDN
- Railwayの安定したAPI提供

#### デメリット
- 設定が複雑（CORS設定必要）
- 2つのサービス管理が必要
- 初心者には設定難易度が高い

### 5.2 代替案B: Firebase構成

#### 構成
- **フロントエンド**: Firebase Hosting
- **バックエンド**: Firebase Cloud Functions

#### メリット
- Googleの安定したインフラ
- 既存アカウント利用可能
- 豊富な機能セット

#### デメリット
- Cloud Functionsへの移植が必要
- 従量課金制（コスト予測困難）
- ExpressからFirebase Functionsへの大幅な改修必要

### 5.3 代替案C: Docker + Google Cloud Run

#### 構成
- **コンテナ**: Docker化したフルスタックアプリ
- **デプロイ**: Google Cloud Run

#### メリット
- 環境の完全な再現性
- スケーラビリティ
- 既存のDocker環境活用

#### デメリット
- Docker設定の学習コスト
- GCPの設定が複雑
- 初心者には難易度が高い

---

## 6. 推奨理由まとめ

### 6.1 Render推奨の決定要因

#### 技術的メリット
1. **最小限の変更**: 既存コードの大幅な修正不要
2. **統合管理**: フロントエンド・バックエンドを一元管理
3. **簡単設定**: 複雑なCORS設定やマイクロサービス設定不要

#### 運用面メリット
1. **初心者向け**: 直感的なダッシュボード
2. **無料枠**: プロトタイプ段階では十分
3. **自動デプロイ**: GitHubプッシュで自動更新

#### 学習コスト
1. **低コスト**: 新しい技術習得が最小限
2. **標準技術**: Express.js + React の既存知識で対応可能
3. **トラブルシューティング**: 一般的な情報が豊富

### 6.2 成功率の高さ
- **実績**: Express.jsアプリのデプロイ実績多数
- **サポート**: 充実したドキュメント
- **コミュニティ**: 活発な情報交換

---

## 7. リスク分析と対策

### 7.1 技術的リスク

#### リスク1: ビルドエラー
- **原因**: 依存関係の不整合
- **対策**: package-lock.jsonの管理、ビルドスクリプトの事前テスト

#### リスク2: API制限
- **原因**: OpenAI APIの利用制限
- **対策**: 使用量監視、エラーハンドリング強化

#### リスク3: 画像アップロードサイズ制限
- **原因**: Renderのファイルサイズ制限
- **対策**: 画像圧縮機能の実装

### 7.2 運用リスク

#### リスク1: 無料枠の制限
- **対策**: 使用量監視、必要に応じて有料プランへ移行
- **判断基準**: 月間750時間を超過した場合

#### リスク2: サービス停止
- **対策**: 複数の代替案を準備、バックアップ計画

---

## 8. 成功指標

### 8.1 デプロイ成功基準
- [ ] アプリケーションが正常にアクセス可能
- [ ] すべての機能が期待通りに動作
- [ ] レスポンス時間が30秒以内
- [ ] エラー率が5%未満

### 8.2 運用安定性指標
- [ ] 24時間連続稼働
- [ ] 複数デバイスからのアクセス確認
- [ ] 異なるブラウザでの動作確認

---

## 9. 次のステップ

### 9.1 実装前確認事項
1. OpenAI APIキーの準備確認
2. Renderアカウントの作成確認
3. GitHub リポジトリのアクセス権限確認

### 9.2 実装スケジュール（目安）
- **Day 1**: プロジェクト設定修正、ビルドスクリプト作成
- **Day 2**: Render設定、初回デプロイ
- **Day 3**: 動作確認、調整、最終化

### 9.3 承認後の作業フロー
1. **仕様書承認** ← 現在のステップ
2. **実装準備**: 設定ファイル修正
3. **デプロイ実行**: Render上でのデプロイ
4. **動作確認**: 全機能の検証
5. **ドキュメント更新**: 運用マニュアル作成

---

## 付録

### A. 参考リンク
- [Render公式ドキュメント](https://render.com/docs)
- [Express.js本番デプロイガイド](https://expressjs.com/en/advanced/best-practice-performance.html)

### B. トラブルシューティング
- ビルドエラー時の対処法
- 環境変数設定の確認方法
- ログの確認と分析方法

### C. 承認
- **作成者**: AI開発チーム  
- **確認要**: プロジェクト責任者
- **承認後**: 実装開始予定