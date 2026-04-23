import React from "react";
import { GRADE_COLORS, GRADE_BG, GRADE_LABEL } from "./DiagnosisComponents";
import { RULES_META } from "../constants/rules_meta";
import { getRelatedCases } from "../utils/caseMatcher";
import { ALL_CASES } from "../data/cases";
import { evaluateCondition } from "../utils/ruleEngine";

// 特約の優先度別スタイル定義（add_on_products 用）
// 既存の index.css は @media print / @keyframes のみのため、
// Tailwind のユーティリティクラスで完結させる。
const PRIORITY_META: Record<
  string,
  { label: string; bg: string; border: string; text: string; badgeBg: string }
> = {
  critical: { label: "最優先", bg: "bg-red-50/70",     border: "border-red-400",     text: "text-red-800",     badgeBg: "bg-red-600" },
  high:     { label: "高優先", bg: "bg-amber-50/70",   border: "border-amber-400",   text: "text-amber-800",   badgeBg: "bg-amber-600" },
  medium:   { label: "中優先", bg: "bg-emerald-50/70", border: "border-emerald-400", text: "text-emerald-800", badgeBg: "bg-emerald-600" },
  low:      { label: "参考",   bg: "bg-slate-50/70",   border: "border-slate-300",   text: "text-slate-700",   badgeBg: "bg-slate-500" },
};

export function CategoryCard({ result, category, isTop, answers, clientMode }: any) {
  const grade = result.rank;
  const score = result.score;
  
  const customerCommentFn = (RULES_META.CUSTOMER_COMMENT as any)[category.id];
  const customerComment = customerCommentFn ? customerCommentFn(answers) : category.suggestion_template;

  const agentMemoFn = (RULES_META.AGENT_MEMO as any)[category.id];
  const agentMemo = agentMemoFn ? agentMemoFn(answers) : "";

  const nextActionFn = (RULES_META.NEXT_ACTION as any)[category.id];
  const nextAction = nextActionFn ? nextActionFn(answers) : "";
  const nextActions = nextAction ? [nextAction] : [];

  const industryChecklist = (RULES_META.INDUSTRY_CHECKLIST as any)[category.id] || {};

  // TOP3カテゴリまたはGrade B/Cの場合に関連事例を取得
  const showCases = isTop || grade === "B" || grade === "C";
  const relatedCases = showCases
    ? getRelatedCases(ALL_CASES, answers, category.id, 3)
    : [];

  return (
    <div
      className={`rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 relative overflow-hidden ${
        isTop ? "bg-white shadow-lg" : "bg-slate-50/50 border-slate-200"
      }`}
      style={{ borderColor: isTop ? GRADE_COLORS[grade] : undefined }}
    >
      {isTop && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: GRADE_COLORS[grade] }}
        />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-2.5 mb-1">
            <span className={isTop ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}>
              {category.icon}
            </span>
            <span
              className={`font-bold text-slate-800 ${
                isTop ? "text-base sm:text-lg" : "text-xs sm:text-sm"
              }`}
            >
              {category.name}
            </span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium leading-tight">
            {category.description}
          </div>
        </div>

        <div className="text-center flex-shrink-0 ml-2 sm:ml-4">
          <div
            className="rounded-lg border-2 px-2 sm:px-3 py-1 sm:py-1.5"
            style={{
              background: GRADE_BG[grade],
              borderColor: GRADE_COLORS[grade],
            }}
          >
            <div
              className={`font-black leading-none ${
                isTop ? "text-lg sm:text-xl" : "text-sm sm:text-base"
              }`}
              style={{ color: GRADE_COLORS[grade] }}
            >
              Grade {grade}
            </div>
            <div
              className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter mt-0.5"
              style={{ color: GRADE_COLORS[grade] }}
            >
              {GRADE_LABEL[grade]}
            </div>
          </div>
          {!clientMode && (
            <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold mt-1">
              {score}点
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${score}%`, background: GRADE_COLORS[grade] }}
          />
        </div>
        {!clientMode && (
          <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap uppercase tracking-widest">
            精度 {Math.round(result.data_completeness * 100)}%
          </span>
        )}
      </div>

      {!isTop && (
        <div
          className={`text-[10px] font-bold uppercase tracking-wider ${
            grade === "A"
              ? "text-red-600"
              : grade === "B"
              ? "text-amber-600"
              : "text-slate-400"
          }`}
        >
          {grade === "A"
            ? "⚡ 要確認：詳細な分析を推奨"
            : grade === "B"
            ? "📌 継続的な確認を推奨"
            : "✓ 現状維持"}
        </div>
      )}

      {(isTop || grade === "A" || grade === "B" || grade === "C") && (
        <div className="space-y-4 mt-4">
          {result.reasons.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-1 h-3 bg-slate-300 rounded-full" />
                リスク分析のポイント
              </div>
              <div className="space-y-1.5">
                {result.reasons.slice(0, 4).map((r: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-100"
                  >
                    <span className="font-bold" style={{ color: GRADE_COLORS[grade] }}>
                      ▸
                    </span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customerComment && (
            <div className="p-3 rounded-xl border text-xs leading-relaxed bg-emerald-50 border-emerald-200 text-emerald-800">
              {customerComment}
            </div>
          )}

          {/* 推奨する保険・特約（主契約 + 条件合致した特約の階層表示） */}
          {(() => {
            const mainProducts: string[] = category.main_products || [];
            const allAddOns: any[] = category.add_on_products || [];
            const matchedAddOns = allAddOns.filter((addon: any) =>
              evaluateCondition(addon.condition, answers)
            );
            // main も addon も無い場合はセクション全体を非表示
            if (mainProducts.length === 0 && matchedAddOns.length === 0) return null;
            return (
              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100">
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-3">
                  🛡️ 推奨する保険・特約
                </div>

                {/* 主契約 */}
                {mainProducts.length > 0 && (
                  <div className="space-y-1.5 mb-2.5">
                    {mainProducts.map((product, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-amber-200 shadow-sm"
                      >
                        <span className="text-emerald-600 font-black text-sm flex-shrink-0">✓</span>
                        <span className="text-xs font-bold text-slate-800">{product}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 特約（条件合致したもののみ） */}
                {matchedAddOns.length > 0 && (
                  <div className="space-y-2 sm:pl-4">
                    {matchedAddOns.map((addon: any) => {
                      const meta = PRIORITY_META[addon.priority] || PRIORITY_META.low;
                      return (
                        <div
                          key={addon.id}
                          className={`rounded-lg border-l-4 p-2.5 ${meta.bg} ${meta.border}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-start gap-1.5 flex-1 min-w-0">
                              <span className={`text-xs font-bold ${meta.text} flex-shrink-0 mt-0.5`}>
                                └▶
                              </span>
                              <span className={`text-xs font-bold ${meta.text} break-words`}>
                                {addon.product_name}
                              </span>
                            </div>
                            <span
                              className={`flex-shrink-0 text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded text-white ${meta.badgeBg}`}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600 leading-relaxed pl-4">
                            <span className="font-bold text-slate-700">判断根拠：</span>
                            {addon.reason}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {!clientMode && agentMemo && (
            <div
              className="p-4 rounded-xl border-l-4 bg-sky-50 border-sky-100"
              style={{ borderLeftColor: GRADE_COLORS[grade] }}
            >
              <div className="text-[10px] font-bold text-sky-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                💬 代理店向けメモ（非公開）
              </div>
              <div className="text-sm text-sky-900 leading-relaxed font-medium">
                {agentMemo}
              </div>
            </div>
          )}

          {!clientMode && nextActions.length > 0 && (
            <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-blue-700">
                  📋 次のアクション ({nextActions.length})
                </span>
              </div>

              {nextActions.map((item: string, i: number) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-xs text-blue-800 ${
                    i < nextActions.length - 1 ? "pb-2.5 border-b border-blue-100" : ""
                  }`}
                >
                  <span className="font-black text-blue-400"># {i + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {(() => {
            const inds = answers?.industries || [];
            const parentInds = [
              ...new Set(
                inds.map((v: string) => {
                  const parts = v.split("_");
                  const parentKeys = [
                    "manufacturing",
                    "construction",
                    "retail",
                    "food",
                    "transport",
                    "it",
                    "medical",
                    "real_estate",
                    "finance",
                    "service",
                    "agriculture",
                  ];
                  for (let i = parts.length; i > 0; i--) {
                    const candidate = parts.slice(0, i).join("_");
                    if (parentKeys.includes(candidate)) return candidate;
                  }
                  return v;
                })
              ),
            ];

            const checkItems = [
              ...new Set(
                parentInds.flatMap((ind) => {
                  const catList = industryChecklist as any;
                  if (!catList) return [];
                  return catList[ind as string] || catList["all"] || [];
                })
              ),
            ].slice(0, 6);

            if (checkItems.length === 0) return null;

            return (
              <div className="p-3.5 bg-orange-50/50 rounded-xl border border-orange-100">
                <div className="text-[10px] font-bold text-orange-700 uppercase tracking-widest mb-2.5">
                  🏷️ 業種別 必須確認チェックリスト
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {checkItems.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[11px] text-orange-900 font-medium"
                    >
                      <span className="w-3.5 h-3.5 rounded border border-orange-300 flex items-center justify-center text-[8px] bg-white">
                        □
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 関連事例カード表示（TOP3またはGrade B） */}
          {showCases && relatedCases.length > 0 && (
            <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100">
              <div className="text-[10px] font-bold text-rose-700 uppercase tracking-widest mb-3">
                📋 類似する実損事例（参考）
              </div>
              <div className="space-y-3">
                {relatedCases.map((caseItem: any) => (
                  <div
                    key={caseItem.case_id}
                    className="bg-white rounded-lg p-3 border border-rose-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="text-[11px] font-bold text-slate-800 leading-tight flex-1">
                        {caseItem.incident_type}
                      </div>
                      <div className="flex-shrink-0 text-[9px] font-black text-rose-700 bg-rose-100 rounded px-1.5 py-0.5 uppercase">
                        {caseItem.industry_major}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-700 leading-relaxed mb-2 whitespace-pre-line">
                      {caseItem.summary}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <div className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded px-2 py-0.5">
                        賠償額: {caseItem.damage_amount_range}
                      </div>
                    </div>
                    {caseItem.source_citation && (
                      <div className="mt-1.5 pt-1.5 border-t border-rose-50/70 text-[10px] text-slate-500 leading-relaxed">
                        <span className="mr-1">📖</span>{caseItem.source_citation}
                      </div>
                    )}
                    {!clientMode && caseItem.legal_basis && (
                      <div className="mt-1 text-[10px] text-slate-500 leading-relaxed">
                        <span className="font-bold text-slate-600">法的根拠：</span>{caseItem.legal_basis}
                      </div>
                    )}
                    {!clientMode && caseItem.sales_angle && (
                      <div className="mt-2 pt-2 border-t border-rose-50 text-[10px] text-rose-800 italic leading-relaxed">
                        💡 {caseItem.sales_angle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[9px] text-slate-500 italic">
                ※ 過去の判例・報道等を基に、事実情報を抽出・独自記述化した参考事例です
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
