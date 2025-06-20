import { useState } from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { Results } from './components/Results';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AnalysisResult } from './types';
import { analysisAPI } from './services/api';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // 実際のAPI呼び出し
      const result = await analysisAPI.analyzeImage(file);
      setResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '画像の解析中にエラーが発生しました。もう一度お試しください。';
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* プロトタイプの注意書き */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  プロトタイプ版について
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    これはプロトタイプ版です。実際の医療現場での診断には使用せず、
                    消化器内科医の先生による使用感評価のみを目的としています。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          {!result && !isAnalyzing && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  口腔内写真をアップロードしてください
                </h2>
                <p className="text-gray-600 mb-8">
                  iPhoneで撮影した口腔内写真から、マランパティ分類を自動判定し、
                  静脈麻酔のリスクレベルを評価します。
                </p>
              </div>
              
              <ImageUpload onUpload={handleImageUpload} />
              
              {/* 撮影ガイド */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">撮影のポイント</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-2 h-2 bg-medical-500 rounded-full mt-2 mr-3"></span>
                    患者さんに口を大きく開けてもらい、舌を最大限前に出してもらう
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-2 h-2 bg-medical-500 rounded-full mt-2 mr-3"></span>
                    口腔内全体が明るく、はっきりと見えるように撮影する
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-2 h-2 bg-medical-500 rounded-full mt-2 mr-3"></span>
                    軟口蓋、口蓋垂、扁桃柱の見え方を確認できる角度で撮影する
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-2 h-2 bg-medical-500 rounded-full mt-2 mr-3"></span>
                    ブレや影がないように注意する
                  </li>
                </ul>
              </div>
            </div>
          )}

          {isAnalyzing && <LoadingSpinner />}
          
          {result && (
            <Results 
              result={result} 
              onNewAnalysis={handleNewAnalysis}
            />
          )}
          
          {error && (
            <div className="card border-l-4 border-red-500">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
              <button
                onClick={handleNewAnalysis}
                className="mt-4 btn-primary"
              >
                再試行
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;