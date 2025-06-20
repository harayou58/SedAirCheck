import { Request, Response, NextFunction } from 'express';

export const validateImageFile = (req: Request, res: Response, next: NextFunction): Response | void => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: '画像ファイルがアップロードされていません。',
      code: 'NO_FILE_UPLOADED'
    });
  }

  const file = req.file;
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  // ファイル形式チェック
  if (!validTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: 'サポートされていないファイル形式です。JPEG、PNG形式のファイルをアップロードしてください。',
      code: 'INVALID_FILE_TYPE'
    });
  }

  // ファイルサイズチェック
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      error: 'ファイルサイズが大きすぎます。10MB以下のファイルをアップロードしてください。',
      code: 'FILE_TOO_LARGE'
    });
  }

  // 画像の基本的な整合性チェック
  if (file.size < 1000) { // 1KB未満は疑わしい
    return res.status(400).json({
      success: false,
      error: 'ファイルが小さすぎます。有効な画像ファイルをアップロードしてください。',
      code: 'FILE_TOO_SMALL'
    });
  }

  console.log(`✅ File validation passed: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
  next();
};