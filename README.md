# SedAirCheck

医療機器プロトタイプ - 内視鏡検査における静脈麻酔リスク評価システム

## 概要

SedAirCheckは、口腔内写真からマランパティ分類を自動判定し、消化管内視鏡検査時の静脈麻酔リスクを評価するWebアプリケーションです。

## プロジェクト構成

```
SedAirCheck/
├── frontend/          # React + TypeScript フロントエンド
├── backend/           # Node.js + Express バックエンド
├── shared/            # 共通型定義・ユーティリティ
├── docs/              # ドキュメント
└── README.md          # このファイル
```

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- Vite
- Tailwind CSS

### バックエンド
- Node.js 18
- Express
- TypeScript
- GPT-4 Vision API

## 開発環境

### 必要な環境
- Node.js 18.0+
- npm 9.0+

### セットアップ

1. プロジェクトルートで依存関係をインストール
```bash
npm install
```

2. フロントエンド開発サーバー起動
```bash
cd frontend
npm run dev
```

3. バックエンド開発サーバー起動
```bash
cd backend
npm run dev
```

## 開発状況

- [x] プロジェクト基本構造作成
- [ ] フロントエンド実装
- [ ] バックエンド実装
- [ ] GPT-4 Vision API連携
- [ ] テスト実装

## 注意事項

⚠️ **重要**: これはプロトタイプです。実際の医療現場での診断には使用しないでください。