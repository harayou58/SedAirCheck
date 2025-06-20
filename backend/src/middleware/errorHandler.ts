import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  console.error('❌ Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Multerエラー
  if (error.message.includes('File too large')) {
    return res.status(400).json({
      success: false,
      error: 'ファイルサイズが大きすぎます。10MB以下のファイルをアップロードしてください。',
      code: 'FILE_TOO_LARGE'
    });
  }

  if (error.message.includes('サポートされていないファイル形式')) {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }

  // OpenAI APIエラー
  if (error.message.includes('API key')) {
    return res.status(500).json({
      success: false,
      error: 'APIキーが設定されていません。管理者にお問い合わせください。',
      code: 'API_KEY_ERROR'
    });
  }

  if (error.message.includes('quota')) {
    return res.status(429).json({
      success: false,
      error: 'APIの利用制限に達しました。しばらく時間をおいてから再度お試しください。',
      code: 'API_QUOTA_EXCEEDED'
    });
  }

  // デフォルトエラー
  res.status(500).json({
    success: false,
    error: 'サーバー内部エラーが発生しました。',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env['NODE_ENV'] === 'development' && { details: error.message })
  });
};