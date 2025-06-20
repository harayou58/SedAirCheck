// 共通ユーティリティ関数

export const MALLAMPATI_DESCRIPTIONS = {
  1: 'Class I: 軟口蓋、口蓋垂、扁桃柱がすべて見える',
  2: 'Class II: 軟口蓋、口蓋垂、扁桃柱の上部が見える',
  3: 'Class III: 軟口蓋、口蓋垂の一部のみ見える',
  4: 'Class IV: 硬口蓋と舌根のみ見える'
} as const;

export const RISK_RECOMMENDATIONS = {
  low: '通常の静脈麻酔での内視鏡検査が可能です',
  high: '麻酔科専門医の同席または全身麻酔の検討を推奨します'
} as const;

export function getMallampatiDescription(classNum: 1 | 2 | 3 | 4): string {
  return MALLAMPATI_DESCRIPTIONS[classNum];
}

export function getRiskRecommendation(level: 'low' | 'high'): string {
  return RISK_RECOMMENDATIONS[level];
}

export function determineRiskLevel(mallampatiClass: 1 | 2 | 3 | 4): 'low' | 'high' {
  return mallampatiClass >= 3 ? 'high' : 'low';
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'サポートされていないファイル形式です。JPEG、PNG形式のファイルをアップロードしてください。'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'ファイルサイズが大きすぎます。10MB以下のファイルをアップロードしてください。'
    };
  }

  return { isValid: true };
}