// バックエンド用の型定義

export interface MallampatiClassification {
  class: 1 | 2 | 3 | 4;
  confidence: number;
  description: string;
}

export interface RiskAssessment {
  level: 'low' | 'high';
  recommendation: string;
  details: string;
}

export interface AnalysisResult {
  mallampatiClass: number;
  riskLevel: 'low' | 'high';
  confidence: number;
  recommendation: string;
  details?: {
    visibleStructures: string[];
    reasoning: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
}

// GPT-4からのレスポンス用型
export interface GPTAnalysisResponse {
  mallampati: {
    class: 1 | 2 | 3 | 4;
    confidence: number;
    description: string;
    reasoning?: string;
  };
  anatomicalObservations?: {
    softPalate: string;
    uvula: string;
    tonsillarPillars: string;
    hardPalate: string;
  };
}