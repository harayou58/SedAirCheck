import { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import sharp from 'sharp';
import OpenAI from 'openai';

// Analysis function
async function analyzeImage(openai: OpenAI, imageBase64: string, filename: string) {
  const prompt = `You are an expert anesthesiologist evaluating Mallampati classification from this oral cavity photograph. This is critical for airway management assessment.

CRITICAL INSTRUCTIONS:
1. Look carefully at the ENTIRE visible oral cavity anatomy
2. Focus on what structures are CLEARLY and COMPLETELY visible
3. Be conservative in your assessment - when in doubt, choose the higher class

DETAILED Mallampati Classification Criteria:

CLASS I (Best airway):
- COMPLETE visualization of: soft palate + FULL uvula + fauces + tonsillar pillars
- All 4 structures must be clearly visible
- Tonsillar pillars (anterior and posterior) should be distinctly visible on both sides

CLASS II (Good airway):
- Visible: soft palate + uvula + fauces
- Tonsillar pillars are HIDDEN or only partially visible
- Uvula should be completely visible

CLASS III (Potentially difficult airway):
- Visible: soft palate + only BASE/TIP of uvula
- Fauces and tonsillar pillars are NOT visible
- Only the lower portion of uvula is seen

CLASS IV (Difficult airway):
- ONLY hard palate visible
- Soft palate completely hidden
- No uvula, fauces, or pillars visible

EVALUATION STEPS:
1. Can you see tonsillar pillars clearly on BOTH sides? → If YES, likely Class I
2. Is the ENTIRE uvula visible from base to tip? → If YES and no pillars, likely Class II
3. Can you see only the base/tip of uvula? → If YES, likely Class III
4. Can you see only hard palate? → If YES, Class IV

Be especially careful to distinguish between Class I and Class II based on tonsillar pillar visibility.

Respond with this exact JSON format:

{
  "mallampatiClass": 1,
  "confidence": 0.85,
  "visibleStructures": ["soft palate", "uvula", "fauces", "tonsillar pillars"],
  "reasoning": "Detailed description of exactly what anatomical structures you can identify and why this leads to your classification"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from GPT-4 Vision API');
  }

  // Parse the JSON response
  const jsonMatch = content.match(/\{[\s\S]*?\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from GPT-4 Vision API');
  }

  const analysisData = JSON.parse(jsonMatch[0]);
  
  // Determine risk level based on Mallampati class
  const riskLevel = analysisData.mallampatiClass <= 2 ? 'low' : 'high';
  
  // Generate recommendation
  const recommendation = analysisData.mallampatiClass <= 2
    ? `Low risk identified (Mallampati Class ${analysisData.mallampatiClass}). Standard intravenous sedation can be safely administered with routine monitoring.`
    : `High risk identified (Mallampati Class ${analysisData.mallampatiClass}). Consider anesthesiologist consultation and prepare for potential difficult airway management. Alternative sedation methods or general anesthesia may be required.`;

  return {
    mallampatiClass: analysisData.mallampatiClass,
    riskLevel,
    confidence: analysisData.confidence,
    recommendation,
    details: {
      visibleStructures: analysisData.visibleStructures,
      reasoning: analysisData.reasoning,
    },
  };
}

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

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Analyze with GPT-4 Vision API
    const analysisResult = await analyzeImage(openai, imageBase64, file.originalname);

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