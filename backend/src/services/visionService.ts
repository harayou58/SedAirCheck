import OpenAI from 'openai';
import { AnalysisResult } from '../types';

export class VisionService {
  private openai: OpenAI;

  constructor() {
    if (!process.env['OPENAI_API_KEY']) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY'],
    });
  }

  async analyzeMallampatiClass(imageBase64: string): Promise<AnalysisResult> {
    try {
      console.log('🔑 OpenAI API Key configured:', process.env['OPENAI_API_KEY'] ? 'Yes' : 'No');
      console.log('📊 Starting OpenAI Vision API call...');
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

      const response = await this.openai.chat.completions.create({
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
        temperature: 0.1, // Low temperature for consistent medical assessment
      });

      console.log('✅ OpenAI API response received');
      console.log('📝 Response status:', response.choices[0]?.finish_reason);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from GPT-4 Vision API');
      }

      console.log('📄 Raw response content:', content);

      // Parse the JSON response
      console.log('🔍 Searching for JSON in response...');
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in response:', content);
        throw new Error('Invalid response format from GPT-4 Vision API');
      }

      console.log('📋 Extracted JSON:', jsonMatch[0]);
      
      let analysisData;
      try {
        analysisData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        console.error('❌ Raw JSON string:', jsonMatch[0]);
        throw new Error('Failed to parse JSON response from GPT-4 Vision API');
      }
      
      // Determine risk level based on Mallampati class
      const riskLevel = analysisData.mallampatiClass <= 2 ? 'low' : 'high';
      
      // Validate confidence and provide appropriate warnings
      let finalConfidence = analysisData.confidence;
      let recommendation = this.generateRecommendation(analysisData.mallampatiClass, riskLevel);
      
      // Add warning for low confidence results
      if (analysisData.confidence < 0.7) {
        recommendation += " ⚠️ 注意: 画像の品質や角度により判定の信頼度が低くなっています。可能であれば、より良い撮影条件で再評価を検討してください。";
        console.log('⚠️ Low confidence result:', analysisData.confidence);
      }
      
      // Add warning for potentially incorrect classifications
      if (analysisData.mallampatiClass === 1 && !analysisData.visibleStructures.includes('tonsillar pillars')) {
        console.log('🚨 Potential misclassification: Class I claimed but no tonsillar pillars mentioned');
        recommendation += " ⚠️ 分類の検証が必要: 扁桃柱の確認を再度行ってください。";
      }

      return {
        mallampatiClass: analysisData.mallampatiClass,
        riskLevel,
        confidence: finalConfidence,
        recommendation,
        details: {
          visibleStructures: analysisData.visibleStructures,
          reasoning: analysisData.reasoning,
        },
      };
    } catch (error: any) {
      console.error('Vision analysis error:', error);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        throw new Error('API quota exceeded. Please try again later.');
      }
      
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid API key configured.');
      }
      
      if (error.response?.status === 413) {
        throw new Error('Image file is too large for processing.');
      }
      
      if (error.response?.status === 400) {
        throw new Error('Invalid image format or corrupted file.');
      }
      
      throw new Error('Failed to analyze image. Please try again.');
    }
  }

  private generateRecommendation(mallampatiClass: number, riskLevel: string): string {
    if (riskLevel === 'high') {
      return `High risk identified (Mallampati Class ${mallampatiClass}). Consider anesthesiologist consultation and prepare for potential difficult airway management. Alternative sedation methods or general anesthesia may be required.`;
    } else {
      return `Low risk identified (Mallampati Class ${mallampatiClass}). Standard intravenous sedation can be safely administered with routine monitoring.`;
    }
  }
}