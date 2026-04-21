import { RULES_DATA } from "../constants/rules";
import { getIndustryParent } from "../constants/industry";
import { QUESTIONS_DATA } from "../constants/questions";

export function evaluateCondition(condition: any, snapshot: any): boolean {
  const { field, op, value } = condition;
  const fieldVal = snapshot[field];
  if (condition.conditions) {
    if (op === "and") return condition.conditions.every((c: any) => evaluateCondition(c, snapshot));
    if (op === "or") return condition.conditions.some((c: any) => evaluateCondition(c, snapshot));
  }
  if (fieldVal === undefined || fieldVal === null) return false;
  switch (op) {
    case "eq":
      if (field === "industry" && Array.isArray(snapshot.industries)) return snapshot.industries.includes(value);
      if (Array.isArray(fieldVal)) return fieldVal.includes(value);
      return fieldVal === value;
    case "neq":
      if (field === "industry" && Array.isArray(snapshot.industries)) return !snapshot.industries.includes(value);
      if (Array.isArray(fieldVal)) return !fieldVal.includes(value);
      return fieldVal !== value;
    case "gt": return Number(fieldVal) > Number(value);
    case "gte": return Number(fieldVal) >= Number(value);
    case "lt": return Number(fieldVal) < Number(value);
    case "lte": return Number(fieldVal) <= Number(value);
    case "in":
      if (field === "industry" && Array.isArray(snapshot.industries)) return Array.isArray(value) && snapshot.industries.some(i => value.includes(i));
      if (Array.isArray(fieldVal)) return Array.isArray(value) && fieldVal.some(fv => value.includes(fv));
      return Array.isArray(value) && value.includes(fieldVal);
    case "contains": return Array.isArray(fieldVal) && fieldVal.includes(value);
    default: return false;
  }
}

export function runRuleEngine(snapshot: any) {
  const normalized = { ...snapshot };
  // NOTE: current_*_known fields are 3-valued (true / "partial" / false).
  // We intentionally do NOT collapse "partial" to false here — partial-specific
  // rules (fp_r012, cargo_r014, do_r018, int_r023, cyber_r017, etc.) rely on
  // the raw "partial" value being preserved.
  if (normalized.company_age_years && normalized.company_age_years >= 1900) {
    normalized.company_age_years = new Date().getFullYear() - normalized.company_age_years;
  }
  if (Array.isArray(normalized.industries) && normalized.industries.length > 0) {
    const parents = [...new Set(normalized.industries.map(v => getIndustryParent(v)))];
    normalized.industries = parents;
    // Keep industry as the first one for legacy rules, but industries array for better matching
    normalized.industry = parents[0];
  } else if (normalized.industry) {
    const parent = getIndustryParent(normalized.industry);
    normalized.industry = parent;
    normalized.industries = [parent];
  }
  // Determine if a rule is a top-level industry rule (industry=eq/in).
  // AND/OR composite rules that contain industry internally are NOT treated
  // as industry rules because they represent combined conditions.
  const isIndustryRule = (rule: any): boolean => {
    const cond = rule.condition;
    if (!cond) return false;
    if (cond.conditions) return false; // AND/OR composite
    return cond.field === "industry" && (cond.op === "eq" || cond.op === "in");
  };

  return RULES_DATA.categories.map(category => {
    let totalScore = 0;
    const firedRules: string[] = [];
    const reasons: string[] = [];
    let evaluableRules = 0;

    const industryRules = category.scoring_rules.filter(isIndustryRule);
    const otherRules = category.scoring_rules.filter(r => !isIndustryRule(r));

    // Industry rules: only the highest-scoring matching rule fires (多業種選択時の二重加算を抑制)
    let bestIndustryRule: any = null;
    for (const rule of industryRules) {
      if (evaluateCondition(rule.condition, normalized)) {
        if (!bestIndustryRule || rule.score > bestIndustryRule.score) {
          bestIndustryRule = rule;
        }
      }
    }
    if (bestIndustryRule) {
      totalScore += bestIndustryRule.score;
      firedRules.push(bestIndustryRule.id);
      reasons.push(bestIndustryRule.reason);
    }
    // industry ルールは data_completeness の分母には常に 1 として計上
    // （どの業種でも industry フィールドは必ず入力されるため）
    evaluableRules += industryRules.length > 0 ? 1 : 0;

    // Other rules: evaluate normally
    for (const rule of otherRules) {
      const field = (rule.condition as any).field;
      if (!(rule.condition as any).conditions && !(field in normalized)) { continue; }
      evaluableRules++;
      if (evaluateCondition(rule.condition, normalized)) {
        totalScore += rule.score;
        firedRules.push(rule.id);
        reasons.push(rule.reason);
      }
    }

    const normalizedScore = Math.min(Math.round((totalScore / category.max_score) * 100), 100);
    const rank = normalizedScore >= category.rank_thresholds.A ? "A" : normalizedScore >= category.rank_thresholds.B ? "B" : "C";
    const totalRules = otherRules.length + (industryRules.length > 0 ? 1 : 0);
    const completeness = totalRules > 0 ? (evaluableRules / totalRules) : 1.0;
    return { category_id: category.id, score: normalizedScore, rank, fired_rules: firedRules, reasons, data_completeness: completeness };
  });
}

export function selectTop3(results: any[]) {
  const rankPriority: Record<string, number> = { "A": 0, "B": 1, "C": 2 };
  return [...results]
    .sort((a, b) => {
      // 1. スコア降順（主ソート）
      if (b.score !== a.score) return b.score - a.score;
      // 2. ランクA優先（同点時：A > B > C）
      if (a.rank !== b.rank) return (rankPriority[a.rank] ?? 99) - (rankPriority[b.rank] ?? 99);
      // 3. データ充足率降順（回答情報が多いリスクを優先）
      if (a.data_completeness !== b.data_completeness) {
        return (b.data_completeness ?? 0) - (a.data_completeness ?? 0);
      }
      // 4. 最終的に category_id 昇順（決定性確保）
      return a.category_id.localeCompare(b.category_id);
    })
    .slice(0, 3);
}

export function calcTop3Hash(top3: any[]) {
  return top3.map(r => r.category_id).join(",");
}

export function selectNextQuestions(top3: any[], snapshot: any, askedIds: string[]) {
  const candidateIds = new Set<string>();
  const validBranchIds = getBranchQuestionsForAnswers(snapshot);

  for (const result of top3) {
    const policyQ = QUESTIONS_DATA.questions.find(q => (q as any).policy_unknown_flag && (q as any).related_category === result.category_id);
    if (policyQ && !(policyQ.id in snapshot) && !askedIds.includes(policyQ.id)) {
      candidateIds.add(policyQ.id);
    }
  }

  for (let i = 0; i < Math.min(2, top3.length); i++) {
    const cat = RULES_DATA.categories.find(c => c.id === top3[i].category_id);
    if (cat) cat.related_questions.forEach(qId => {
      if (!(qId in snapshot) && !askedIds.includes(qId)) {
        const q = QUESTIONS_DATA.questions.find(q => q.id === qId);
        if (q) {
          if ((q as any).condition && !evaluateCondition((q as any).condition, snapshot)) return;
          if (q.category === "branch") {
            if (validBranchIds.has(qId)) candidateIds.add(qId);
          } else {
            candidateIds.add(qId);
          }
        }
      }
    });
  }
  const sorted = [...candidateIds].sort((a, b) => {
    const qa = QUESTIONS_DATA.questions.find(q => q.id === a) as any;
    const qb = QUESTIONS_DATA.questions.find(q => q.id === b) as any;
    const pa = qa?.policy_unknown_flag ? 0 : 1;
    const pb = qb?.policy_unknown_flag ? 0 : 1;
    if (pa !== pb) return pa - pb;
    const rankA = top3.findIndex(t => {
      const cat = RULES_DATA.categories.find(c => c.id === t.category_id);
      return cat?.related_questions.includes(a);
    });
    const rankB = top3.findIndex(t => {
      const cat = RULES_DATA.categories.find(c => c.id === t.category_id);
      return cat?.related_questions.includes(b);
    });
    return (rankA === -1 ? 999 : rankA) - (rankB === -1 ? 999 : rankB);
  });
  if (sorted.length < 3) {
    QUESTIONS_DATA.questions.filter(q =>
      q.category === "branch" && 
      validBranchIds.has(q.id) &&
      !(q.id in snapshot) && 
      !askedIds.includes(q.id) && 
      !sorted.includes(q.id) &&
      (!(q as any).condition || evaluateCondition((q as any).condition, snapshot))
    ).forEach(q => sorted.push(q.id));
  }
  return sorted.slice(0, 3).map(id => QUESTIONS_DATA.questions.find(q => q.id === id)).filter(Boolean);
}

export function getBranchQuestionsForAnswers(answers: any) {
  const branchIds = new Set<string>();
  for (const q of QUESTIONS_DATA.questions) {
    if ((q as any).triggers_branch && q.id in answers) {
      const val = answers[q.id];
      if ((q as any).triggers_branch_on) {
        const cond = (q as any).triggers_branch_on;
        if (cond.neq !== undefined && val !== cond.neq) {
          (q as any).triggers_branch.forEach((id: string) => branchIds.add(id));
        }
      } else if (val === true) {
        (q as any).triggers_branch.forEach((id: string) => branchIds.add(id));
      }
    }
  }
  const industries = answers.industries || [];
  const hasAgriculture = Array.isArray(industries) && industries.some(v => v.startsWith("agriculture"));
  if (hasAgriculture) {
    branchIds.add("branch_agri_crop_type");
    branchIds.add("branch_agri_facility_value");
  }
  if (answers.has_vehicles !== undefined) {
    branchIds.add("branch_uses_employee_vehicles");
  }
  if (answers.handles_products === true || (answers.export_ratio && answers.export_ratio !== "0") || answers.has_vehicles === true) {
    branchIds.add("branch_has_delivery");
  }
  branchIds.add("branch_fixed_cost_level");
  branchIds.add("branch_has_shareholders");
  branchIds.add("harassment_measures");
  const nightInds = ["food","transport","agriculture","manufacturing","service","construction","medical"];
  const hasNightInd = Array.isArray(industries) && industries.some(v => nightInds.some(n => v.startsWith(n)));
  if (hasNightInd || answers.has_employees_work_accident_risk === "high") {
    branchIds.add("branch_night_work");
  }
  branchIds.add("branch_key_supplier_dependency");
  const hasExport = answers.export_ratio && answers.export_ratio !== "0";
  const hasProfessionalInd = Array.isArray(industries) && industries.some(v => v.startsWith("it") || v.startsWith("finance") || v.startsWith("service") || v.startsWith("manufacturing"));
  if (hasExport || hasProfessionalInd) {
    branchIds.add("branch_overseas_trip");
  }
  return branchIds;
}
