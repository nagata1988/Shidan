import React, { useState } from "react";
import { GRADE_COLORS, GRADE_BG, GRADE_LABEL } from "./DiagnosisComponents";
import { RULES_META } from "../constants/rules_meta";

export function CategoryCard({ result, category, isTop, answers, clientMode }: any) {
  const [showInterview, setShowInterview] = useState(false);
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

  return (
    <div className={`rounded-2xl p-6 border-2 transition-all duration-300 relative overflow-hidden ${isTop ? "bg-white shadow-lg" : "bg-slate-50/50 border-slate-200"}`}
         style={{ borderColor: isTop ? GRADE_COLORS[grade] : undefined }}>
      {isTop && <div className="absolute top-0 left-0 right-0 h-1" style={{ background: GRADE_COLORS[grade] }} />}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-1">
            <span className={isTop ? "text-3xl" : "text-xl"}>{category.icon}</span>
            <span className={`font-bold text-slate-800 ${isTop ? "text-lg" : "text-sm"}`}>{category.name}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium leading-tight">{category.description}</div>
        </div>
        <div className="text-center flex-shrink-0 ml-4">
          <div className="rounded-lg border-2 px-3 py-1.5" style={{ background: GRADE_BG[grade], borderColor: GRADE_COLORS[grade] }}>
            <div className={`font-black leading-none ${isTop ? "text-xl" : "text-base"}`} style={{ color: GRADE_COLORS[grade] }}>Grade {grade}</div>
            <div className="text-[9px] font-bold uppercase tracking-tighter mt-0.5" style={{ color: GRADE_COLORS[grade] }}>{GRADE_LABEL[grade]}</div>
          </div>
          {!clientMode && <div className="text-[10px] text-slate-400 font-bold mt-1">{score}点</div>}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${score}%`, background: GRADE_COLORS[grade] }} />
        </div>
        {!clientMode && <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap uppercase tracking-widest">精度 {Math.round(result.data_completeness * 100)}%</span>}
      </div>

      {!isTop && (
        <div className={`text-[10px] font-bold uppercase tracking-wider ${grade === "A" ? "text-red-600" : grade === "B" ? "text-amber-600" : "text-slate-400"}`}>
          {grade === "A" ? "⚡ 要確認：詳細な分析を推奨" : grade === "B" ? "📌 継続的な確認を推奨" : "✓ 現状維持"}
        </div>
      )}

      {(isTop || grade === "A" || grade === "B") && (
        <div className="space-y-4 mt-4">
          {result.reasons.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-1 h-3 bg-slate-300 rounded-full" /> リスク分析のポイント
              </div>
              <div className="space-y-1.5">
                {result.reasons.slice(0, 4).map((r: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <span className="font-bold" style={{ color: GRADE_COLORS[grade] }}>▸</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customerComment && (
            <div className={`p-3 rounded-xl border text-xs leading-relaxed bg-emerald-50 border-emerald-200 text-emerald-800`}>
              {customerComment}
            </div>
          )}

          {/* Client Mode: Hide Agent Memo */}
          {!clientMode && agentMemo && (
            <div className="p-4 rounded-xl border-l-4 bg-sky-50 border-sky-100" style={{ borderLeftColor: GRADE_COLORS[grade] }}>
              <div className="text-[10px] font-bold text-sky-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                💬 代理店向けメモ（非公開）
              </div>
              <div className="text-sm text-sky-900 leading-relaxed font-medium">{agentMemo}</div>
            </div>
          )}

          {/* Client Mode: Hide Next Actions */}
          {!clientMode && nextActions.length > 0 && (
            <div>
              <button
                onClick={() => setShowInterview(v => !v)}
                className={`w-full flex items-center justify-between rounded-xl p-3 text-xs font-bold transition-colors ${showInterview ? "bg-blue-100 text-blue-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
              >
                <span>📋 次のアクション ({nextActions.length})</span>
                <span className={`transition-transform duration-300 ${showInterview ? "rotate-180" : ""}`}>▼</span>
              </button>
              {showInterview && (
                <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2.5 animate-[fadeSlideIn_0.2s_ease]">
                  {nextActions.map((item: string, i: number) => (
                    <div key={i} className={`flex items-start gap-2 text-xs text-blue-800 ${i < nextActions.length - 1 ? "pb-2.5 border-bottom border-blue-100" : ""}`}>
                      <span className="font-black text-blue-400"># {i+1}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Industry Checklist (Only for Top or A/B) */}
          {(() => {
            const inds = (answers?.industries || []);
            const parentInds = [...new Set(inds.map((v: string) => {
              const parts = v.split("_");
              const parentKeys = ["manufacturing","construction","retail","food","transport","it","medical","real_estate","finance","service","agriculture"];
              for (let i = parts.length; i > 0; i--) {
                const candidate = parts.slice(0, i).join("_");
                if (parentKeys.includes(candidate)) return candidate;
              }
              return v;
            }))];
            
            // Get checklist items for this specific category and the user's industries
            const checkItems = [...new Set(parentInds.flatMap(ind => {
              const catList = (industryChecklist as any);
              if (!catList) return [];
              return catList[ind as string] || catList['all'] || [];
            }))].slice(0, 6);

            if (checkItems.length === 0) return null;
            return (
              <div className="p-3.5 bg-orange-50/50 rounded-xl border border-orange-100">
                <div className="text-[10px] font-bold text-orange-700 uppercase tracking-widest mb-2.5">🏷️ 業種別 必須確認チェックリスト</div>
                <div className="grid grid-cols-1 gap-2">
                  {checkItems.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-orange-900 font-medium">
                      <span className="w-3.5 h-3.5 rounded border border-orange-300 flex items-center justify-center text-[8px] bg-white">□</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
