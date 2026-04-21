// ============================================================
// 事例データの型定義とマッチングアルゴリズム
// ============================================================

export interface CaseData {
  case_id: string;
  diagnostic_risk_id: string;
  diagnostic_risk_label: string;
  diagnostic_risk_ids_secondary: string[];
  diagnostic_industry_primary: string[];
  diagnostic_industry_secondary: string[];
  diagnostic_sub_industries: string[];
  diagnostic_impact_score: number; // 1-5
  sub_category: string;
  industry_major: string;
  industry_minor: string;
  company_size: string;
  region: string;
  incident_type: string;
  summary: string;
  damage_amount_range: string;
  damage_amount_reference: string;
  source_type: string;
  source_citation: string;
  legal_basis: string;
  sales_angle: string;
}

/**
 * 事例の関連度スコアを計算
 *
 * 計算式：
 *   relevance = industry_match × risk_match × impact_score
 *
 * industry_match:
 *   4 = サブ業種が一致（例：ホテル診断 × ホテル事例）
 *   3 = primary_industries に該当業種が含まれる
 *   2 = primary_industries に "ALL" / secondary_industries に該当業種
 *   1 = secondary_industries に "ALL"
 *   0 = どれにも該当しない
 *
 * risk_match:
 *   3 = diagnostic_risk_id が一致（メインリスク）
 *   1 = diagnostic_risk_ids_secondary に含まれる
 *   0 = どちらでもない
 *
 * impact_score:
 *   事例の diagnostic_impact_score (1〜5)
 */
export function calculateRelevance(
  caseData: CaseData,
  userIndustries: string[],  // 例：["food"] ※親業種配列
  userSubIndustries: string[], // 例：["food_hotel_banquet"] ※サブ業種配列
  targetRiskId: string
): number {
  // --- risk_match の計算 ---
  let riskMatch = 0;
  if (caseData.diagnostic_risk_id === targetRiskId) {
    riskMatch = 3;
  } else if (caseData.diagnostic_risk_ids_secondary.includes(targetRiskId)) {
    riskMatch = 1;
  }
  if (riskMatch === 0) return 0;

  // --- industry_match の計算 ---
  let industryMatch = 0;

  // 最高スコア: サブ業種一致
  const hasSubMatch = caseData.diagnostic_sub_industries.some(sub =>
    userSubIndustries.includes(sub)
  );
  if (hasSubMatch) {
    industryMatch = 4;
  }
  // 次点: primary に該当業種
  else if (caseData.diagnostic_industry_primary.some(ind => userIndustries.includes(ind))) {
    industryMatch = 3;
  }
  // primary に "ALL" または secondary に該当業種
  else if (
    caseData.diagnostic_industry_primary.includes("ALL") ||
    caseData.diagnostic_industry_secondary.some(ind => userIndustries.includes(ind))
  ) {
    industryMatch = 2;
  }
  // secondary に "ALL"
  else if (caseData.diagnostic_industry_secondary.includes("ALL")) {
    industryMatch = 1;
  }
  if (industryMatch === 0) return 0;

  // --- 総合スコア ---
  const impactScore = caseData.diagnostic_impact_score || 3;
  return industryMatch * riskMatch * impactScore;
}

/**
 * 指定リスクカテゴリに対する関連事例をTOP N件取得
 *
 * @param allCases    - 全100件の事例データ
 * @param userAnswers - 診断回答（industriesとサブ業種を含む）
 * @param targetRiskId - 対象リスクID（例："fire"）
 * @param topN         - 取得件数（デフォルト3件）
 * @returns 関連度順にソートされた事例配列
 */
export function getRelatedCases(
  allCases: CaseData[],
  userAnswers: any,
  targetRiskId: string,
  topN: number = 3
): Array<CaseData & { _relevance: number }> {
  // ユーザーの業種情報を抽出
  const rawIndustries: string[] = userAnswers.industries || [];

  // サブ業種（診断システムで入力された生の値）
  const userSubIndustries = rawIndustries.filter(v => v.includes("_"));

  // 親業種（食品→foodなど）
  const userParentIndustries = [...new Set(
    rawIndustries.map(v => {
      const parts = v.split("_");
      const parentKeys = [
        "manufacturing", "construction", "retail", "food", "transport",
        "it", "medical", "real_estate", "finance", "service", "agriculture", "other"
      ];
      for (let i = parts.length; i > 0; i--) {
        const candidate = parts.slice(0, i).join("_");
        if (parentKeys.includes(candidate)) return candidate;
      }
      return v;
    })
  )];

  // 各事例の関連度を計算
  const scored = allCases
    .map(c => ({
      ...c,
      _relevance: calculateRelevance(c, userParentIndustries, userSubIndustries, targetRiskId)
    }))
    .filter(c => c._relevance > 0)  // 関連度0の事例は除外
    .sort((a, b) => {
      // 関連度降順、同点時は impact_score 降順、さらに同点時は case_id昇順
      if (b._relevance !== a._relevance) return b._relevance - a._relevance;
      if (b.diagnostic_impact_score !== a.diagnostic_impact_score)
        return b.diagnostic_impact_score - a.diagnostic_impact_score;
      return a.case_id.localeCompare(b.case_id);
    });

  return scored.slice(0, topN);
}
