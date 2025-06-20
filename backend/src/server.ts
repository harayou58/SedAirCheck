// 環境変数を最初にロード
import dotenv from 'dotenv';
import path from 'path';

// 環境変数の読み込みを最優先で実行
dotenv.config({ path: path.join(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import { analysisRouter } from './routes/analysis';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();
const PORT = process.env['PORT'] || 3001;

// アップロードディレクトリを作成
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ミドルウェア設定
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ロギング
app.use(requestLogger);

// ヘルスチェック
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API ルート
app.use('/api', analysisRouter);

// エラーハンドリング
app.use(errorHandler);

// 404 ハンドラ
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 SedAirCheck Backend Server is running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
  
  // 環境変数チェック
  if (!process.env['OPENAI_API_KEY']) {
    console.warn('⚠️  OPENAI_API_KEY is not set. Please check your .env file.');
  }
});

export default app;