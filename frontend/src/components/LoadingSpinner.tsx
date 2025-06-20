import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="card text-center">
      <div className="space-y-6">
        {/* スピナー */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-medical-600"></div>
        </div>

        {/* メッセージ */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            画像を解析しています...
          </h3>
          <p className="text-gray-600 mb-4">
            GPT-4 Vision APIがマランパティ分類を判定中です。しばらくお待ちください。
          </p>
          
          <div className="text-sm text-gray-500">
            <p>通常、解析には10-30秒程度かかります</p>
          </div>
        </div>

        {/* プログレスバー風の表示 */}
        <div className="max-w-md mx-auto">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-medical-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* 解析ステップ */}
        <div className="text-left max-w-md mx-auto">
          <h4 className="text-sm font-medium text-gray-900 mb-3">解析中の処理</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              画像の前処理・品質チェック
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-medical-500 rounded-full mr-3 animate-pulse"></div>
              口腔内構造の認識・分析
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              マランパティ分類の判定
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              リスクレベルの評価
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};