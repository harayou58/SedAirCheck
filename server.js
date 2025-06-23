const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// アップロードディレクトリを作成
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// セキュリティミドルウェア設定
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://api.openai.com"]
    }
  }
}));

// CORS設定（本番環境用）
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静的ファイル配信（フロントエンド）
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// アップロードされたファイルの配信
app.use('/uploads', express.static(uploadDir));

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API ルート - バックエンドのビルド済みファイルを使用
try {
  const analysisRoutes = require('./backend/dist/routes/analysis');
  app.use('/api', analysisRoutes.analysisRouter);
} catch (error) {
  console.error('Failed to load API routes:', error.message);
  
  // フォールバック API レスポンス
  app.use('/api/*', (req, res) => {
    res.status(503).json({ 
      error: 'API service temporarily unavailable',
      message: 'Backend build files not found. Please run build process.'
    });
  });
}

// SPA fallback - すべてのルートでReactアプリを配信
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'frontend/dist/index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Frontend not found',
      message: 'Please run the build process to generate frontend files.'
    });
  }
});

// グローバルエラーハンドラ
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 SedAirCheck Server is running on port ${PORT}`);
  console.log(`📋 Health check: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/health`);
  console.log(`🔗 API endpoint: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/api`);
  console.log(`🌐 Frontend: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}`);
  
  // 環境変数チェック
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY is not set. Please set it in Render environment variables.');
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.log('✅ Running in production mode');
  }
});