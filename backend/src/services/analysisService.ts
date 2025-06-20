import { OpenAI } from 'openai';
import { AnalysisResult, MallampatiClassification, RiskAssessment } from '../types';

class AnalysisService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeImage(imageBase64: string, filename: string): Promise<AnalysisResult> {
    try {
      console.log('🤖 Sending request to GPT-4 Vision API...');

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: this.getAnalysisPrompt()
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1, // 一貫性を保つため低めに設定
      });

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('GPT-4からの応答が空です');
      }

      console.log('📝 GPT-4 Response:', result);

      // JSONレスポンスをパース
      const parsedResult = this.parseGPTResponse(result);
      
      // リスクレベルを決定
      const riskAssessment = this.determineRiskLevel(parsedResult.mallampati.class);

      return {
        mallampati: parsedResult.mallampati,
        risk: riskAssessment,
        timestamp: new Date().toISOString(),
        imageId: `img-${Date.now()}`
      };

    } catch (error) {
      console.error('❌ GPT-4 Vision API Error:', error);
      throw error;
    }
  }

  private getAnalysisPrompt(): string {
    return `
あなたは経験豊富な麻酔科医です。提供された口腔内写真を分析し、マランパティ分類を判定してください。

**マランパティ分類の定義:**
- Class I: 軟口蓋、口蓋垂、扁桃柱（前柱・後柱）がすべて見える
- Class II: 軟口蓋、口蓋垂、扁桃柱の上部が見える
- Class III: 軟口蓋、口蓋垂の一部のみ見える
- Class IV: 硬口蓋のみ見える

**分析手順:**
1. 口腔内の解剖学的構造を識別
2. 軟口蓋、口蓋垂、扁桃柱の見え方を評価
3. マランパティ分類を決定
4. 信頼度を評価

**出力形式（必ずJSON形式で回答）:**
{
  "mallampati": {
    "class": 1,
    "confidence": 0.85,
    "description": "Class I: 軟口蓋、口蓋垂、扁桃柱がすべて見える",
    "reasoning": "口腔内の全ての構造が明確に観察できるため"
  },
  "anatomicalObservations": {
    "softPalate": "完全に見える",
    "uvula": "完全に見える",
    "tonsillarPillars": "前柱・後柱ともに見える",
    "hardPalate": "見える"
  }
}

画像を慎重に分析し、医学的に正確な判定を行ってください。
`;
  }

  private parseGPTResponse(response: string): {
    mallampati: MallampatiClassification;
  } {
    try {
      // JSONの抽出を試行
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Valid JSON not found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // 基本的なバリデーション
      if (!parsed.mallampati || !parsed.mallampati.class) {
        throw new Error('Invalid response format');
      }

      const mallampatiClass = parsed.mallampati.class;
      if (![1, 2, 3, 4].includes(mallampatiClass)) {
        throw new Error('Invalid Mallampati class');
      }

      return {
        mallampati: {
          class: mallampatiClass as 1 | 2 | 3 | 4,
          confidence: parsed.mallampati.confidence || 0.7,
          description: parsed.mallampati.description || this.getClassDescription(mallampatiClass)
        }
      };

    } catch (error) {
      console.error('❌ Failed to parse GPT response:', error);
      console.log('Raw response:', response);
      
      // フォールバック: レスポンスからClass番号を抽出
      const classMatch = response.match(/Class\s+([I1-4V]+)/i);
      if (classMatch) {
        const classStr = classMatch[1];
        let classNum: 1 | 2 | 3 | 4;
        
        if (classStr === 'I' || classStr === '1') classNum = 1;
        else if (classStr === 'II' || classStr === '2') classNum = 2;
        else if (classStr === 'III' || classStr === '3') classNum = 3;
        else if (classStr === 'IV' || classStr === '4') classNum = 4;
        else throw new Error('Could not determine Mallampati class');

        return {
          mallampati: {
            class: classNum,
            confidence: 0.6,
            description: this.getClassDescription(classNum)
          }
        };
      }

      throw new Error('Could not parse analysis result');
    }
  }

  private getClassDescription(classNum: 1 | 2 | 3 | 4): string {
    const descriptions = {
      1: 'Class I: 軟口蓋、口蓋垂、扁桃柱がすべて見える',
      2: 'Class II: 軟口蓋、口蓋垂、扁桃柱の上部が見える',
      3: 'Class III: 軟口蓋、口蓋垂の一部のみ見える',
      4: 'Class IV: 硬口蓋のみ見える'
    };
    return descriptions[classNum];
  }

  private determineRiskLevel(mallampatiClass: 1 | 2 | 3 | 4): RiskAssessment {
    const isHighRisk = mallampatiClass >= 3;
    
    return {
      level: isHighRisk ? 'high' : 'low',
      recommendation: isHighRisk 
        ? '麻酔科専門医の同席または全身麻酔の検討を推奨します'
        : '通常の静脈麻酔での内視鏡検査が可能です',
      details: isHighRisk
        ? `マランパティ分類Class ${mallampatiClass}のため、静脈麻酔時のリスクが高いと判定されました。気道確保困難の可能性があるため、専門医による評価を推奨します。`
        : `マランパティ分類Class ${mallampatiClass}のため、静脈麻酔でのリスクは低いと判定されました。標準的なモニタリングでの内視鏡検査が可能です。`
    };
  }
}

export const analysisService = new AnalysisService();