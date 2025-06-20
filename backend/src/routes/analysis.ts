import express, { Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { OpenAI } from 'openai';
import { analysisService } from '../services/analysisService';
import { validateImageFile } from '../middleware/validation';
import path from 'path';

const router = express.Router();

// Multer設定 - メモリストレージを使用
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('サポートされていないファイル形式です。JPEG、PNG形式のファイルをアップロードしてください。'));
    }
  }
});

// 画像解析エンドポイント
router.post('/analyze', upload.single('image'), validateImageFile, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '画像ファイルがアップロードされていません。'
      });
    }

    console.log(`📸 Analyzing image: ${req.file.originalname} (${req.file.size} bytes)`);

    // 画像の前処理
    const processedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Base64エンコード
    const imageBase64 = processedImageBuffer.toString('base64');

    // GPT-4 Vision APIで解析
    const analysisResult = await analysisService.analyzeImage(imageBase64, req.file.originalname);

    console.log(`✅ Analysis completed for ${req.file.originalname}`);

    res.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('❌ Analysis error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(500).json({
          success: false,
          error: 'APIキーが設定されていません。管理者にお問い合わせください。'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: `画像解析中にエラーが発生しました: ${error.message}`
      });
    }

    res.status(500).json({
      success: false,
      error: '画像解析中に予期しないエラーが発生しました。'
    });
  }
});

// テスト用エンドポイント
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Analysis API is working!',
    timestamp: new Date().toISOString()
  });
});

export { router as analysisRouter };