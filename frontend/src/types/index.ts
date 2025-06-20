// フロントエンド用の型定義
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