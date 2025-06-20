import axios from 'axios';
import { AnalysisResult, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// Axiosインスタンスを作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60秒（画像解析には時間がかかる場合がある）
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// レスポンスインターセプターでエラーハンドリング
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // サーバーからエラーレスポンスが返された場合
      throw new Error(error.response.data.error || 'サーバーエラーが発生しました');
    } else if (error.request) {
      // リクエストが送信されたがレスポンスがない場合
      throw new Error('サーバーに接続できません。バックエンドサーバーが起動しているか確認してください。');
    } else {
      // その他のエラー
      throw new Error('予期しないエラーが発生しました');
    }
  }
);

export const analysisAPI = {
  // 画像解析API
  analyzeImage: async (file: File): Promise<AnalysisResult> => {
    const formData = new FormData();
    formData.append('image', file);

    console.log('📤 Sending image to backend:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    const response = await apiClient.post<ApiResponse<AnalysisResult>>('/analyze', formData);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || '解析に失敗しました');
    }

    return response.data.data;
  },

  // ヘルスチェック
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  // テストAPI
  testConnection: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/test');
      return response.data.success;
    } catch (error) {
      return false;
    }
  }
};