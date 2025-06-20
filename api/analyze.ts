import { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import sharp from 'sharp';
import { getAnalysisService } from '../backend/src/services/analysisService';

// Multer setup for Vercel
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('サポートされていないファイル形式です。JPEG、PNG形式のファイルをアップロードしてください。'));
    }
  }
});

// Helper to run multer in Vercel serverless environment
function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('image'));

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: '画像ファイルがアップロードされていません。'
      });
    }

    console.log(`📸 Analyzing image: ${file.originalname} (${file.size} bytes)`);

    // Image preprocessing
    const processedImageBuffer = await sharp(file.buffer)
      .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Base64 encode
    const imageBase64 = processedImageBuffer.toString('base64');

    // Analyze with GPT-4 Vision API
    const analysisResult = await getAnalysisService().analyzeImage(imageBase64, file.originalname);

    console.log(`✅ Analysis completed for ${file.originalname}`);

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
}