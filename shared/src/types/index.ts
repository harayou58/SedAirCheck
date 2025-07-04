// 共通型定義

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
  mallampati: MallampatiClassification;
  risk: RiskAssessment;
  timestamp: string;
  imageId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ImageUploadRequest {
  image: File;
}

export interface ImageAnalysisRequest {
  imageBase64: string;
  filename: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
}