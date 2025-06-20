import React from 'react';
import { AnalysisResult } from '../types';

interface ResultsProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
}

export const Results: React.FC<ResultsProps> = ({ result, onNewAnalysis }) => {
  const { mallampati, risk } = result;
  
  const getRiskColor = (level: 'low' | 'high') => {
    return level === 'high' 
      ? 'border-red-500 bg-red-50' 
      : 'border-green-500 bg-green-50';
  };

  const getRiskIcon = (level: 'low' | 'high') => {
    return level === 'high' ? (
      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ) : (
      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* リスクレベル表示 */}
      <div className={`card border-l-4 ${getRiskColor(risk.level)}`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {getRiskIcon(risk.level)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {risk.level === 'high' ? '高リスク' : '低リスク'}
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              {risk.recommendation}
            </p>
            <p className="text-gray-600">
              {risk.details}
            </p>
          </div>
        </div>
      </div>

      {/* 詳細結果 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* マランパティ分類 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            マランパティ分類
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">分類結果</span>
              <span className="text-2xl font-bold text-medical-600">
                Class {mallampati.class}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">信頼度</span>
              <span className={`text-lg font-semibold ${getConfidenceColor(mallampati.confidence)}`}>
                {(mallampati.confidence * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                {mallampati.description}
              </p>
            </div>
          </div>
        </div>

        {/* 推奨事項 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            臨床的推奨事項
          </h3>
          
          <div className="space-y-4">
            {risk.level === 'high' ? (
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    麻酔科専門医の同席を検討してください
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    全身麻酔への変更を検討してください
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    緊急時対応の準備を強化してください
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    通常の静脈麻酔での検査が可能です
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    標準的なモニタリングで対応可能です
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">重要な注意事項</h4>
            <p className="text-sm text-blue-800">
              この判定結果はプロトタイプによる参考情報です。実際の臨床判断は、
              患者の全身状態、既往歴、その他のリスク因子を総合的に評価した上で行ってください。
            </p>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onNewAnalysis}
          className="btn-primary"
        >
          新しい画像を解析
        </button>
        
        <button
          onClick={() => window.print()}
          className="btn-secondary"
        >
          結果を印刷
        </button>
      </div>

      {/* 解析情報 */}
      <div className="text-center text-sm text-gray-500">
        <p>解析日時: {new Date(result.timestamp).toLocaleString('ja-JP')}</p>
        <p>解析ID: {result.imageId}</p>
      </div>
    </div>
  );
};