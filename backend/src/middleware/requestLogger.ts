import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // レスポンス完了時のログ
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, ip } = req;
    const { statusCode } = res;
    
    // 画像データは除外してログ出力
    const logData = {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    // ファイルアップロードの場合は追加情報
    if (req.file) {
      Object.assign(logData, {
        fileName: req.file.originalname,
        fileSize: `${(req.file.size / 1024).toFixed(2)}KB`,
        mimeType: req.file.mimetype
      });
    }

    console.log('📝 Request Log:', logData);
  });

  next();
};