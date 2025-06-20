import { VisionService } from './visionService';
import { AnalysisResult } from '../types';

class AnalysisService {
  private visionService: VisionService;

  constructor() {
    this.visionService = new VisionService();
  }

  async analyzeImage(imageBase64: string, filename: string): Promise<AnalysisResult> {
    try {
      console.log('🤖 Analyzing image with GPT-4 Vision API...');
      console.log(`📸 Processing image: ${filename}`);

      const result = await this.visionService.analyzeMallampatiClass(imageBase64);
      
      console.log('✅ Analysis complete:', {
        class: result.mallampatiClass,
        risk: result.riskLevel,
        confidence: result.confidence
      });

      return result;

    } catch (error) {
      console.error('❌ Analysis Error:', error);
      throw error;
    }
  }

}

// Lazy initialization to ensure environment variables are loaded
let analysisServiceInstance: AnalysisService | null = null;

export const getAnalysisService = (): AnalysisService => {
  if (!analysisServiceInstance) {
    analysisServiceInstance = new AnalysisService();
  }
  return analysisServiceInstance;
};