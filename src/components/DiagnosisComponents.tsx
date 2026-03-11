import React, { useState } from "react";
import { INDUSTRY_TREE, getIndustryLabel, getIndustryParent } from "../constants/industry";

export const GRADE_COLORS: Record<string, string> = { A: "#ef4444", B: "#f59e0b", C: "#6b7280" };
export const GRADE_BG: Record<string, string> = { A: "#fef2f2", B: "#fffbeb", C: "#f9fafb" };
export const GRADE_LABEL: Record<string, string> = { A: "今すぐ提案", B: "次回確認推奨", C: "状況確認" };

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
        <span>回答進捗</span>
        <span>{current} / {total} 問</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
}

export function IndustryMultiSelect({ values, onChange, hint }: { values: string[]; onChange: (vals: string[]) => void; hint?: string }) {
  const [expandedMajor, setExpandedMajor] = useState<string | null>(null);

  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const getSubSelectedCount = (majorVal: string) =>
    values.filter(v => getIndustryParent(v) === majorVal).length;

  const isMajorSelected = (majorVal: string) =>
    values.some(v => getIndustryParent(v) === majorVal || v === majorVal);

  return (
    <div>
      {hint && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 mb-4 text-sm text-blue-700 flex gap-2.5">
          <span className="flex-shrink-0">💡</span><span>{hint}</span>
        </div>
      )}
      {values.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">選択中の業種</div>
          <div className="flex flex-wrap gap-1.5">
            {values.map(v => {
              const info = getIndustryLabel(v);
              return (
                <div key={v} className="flex items-center gap-1.5 bg-blue-50 border border-blue-300 rounded-full px-3 py-1 text-xs text-blue-700 font-semibold">
                  <span>{info.icon}</span>
                  <span>{info.sub || info.major}</span>
                  <button onClick={() => toggle(v)} className="text-blue-300 hover:text-blue-500 ml-1 text-base leading-none">×</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">業種を選択（複数可）</div>
      <div className="flex flex-col gap-1.5">
        {INDUSTRY_TREE.map(major => {
          const isOpen = expandedMajor === major.value;
          const selectedCount = getSubSelectedCount(major.value);
          const majorSelected = isMajorSelected(major.value);
          return (
            <div key={major.value} className={`border-2 rounded-xl overflow-hidden transition-colors ${majorSelected ? "border-blue-300" : "border-slate-200"}`}>
              <button onClick={() => setExpandedMajor(isOpen ? null : major.value)}
                className={`w-full p-3 flex items-center gap-3 text-left ${majorSelected ? "bg-blue-50/50" : "bg-white"}`}>
                <span className="text-2xl flex-shrink-0">{major.icon}</span>
                <span className={`flex-1 text-sm ${majorSelected ? "font-bold text-blue-700" : "font-medium text-slate-800"}`}>{major.label}</span>
                {selectedCount > 0 && (
                  <span className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">{selectedCount}選択中</span>
                )}
                <span className="text-slate-400 text-[10px] ml-1">{isOpen ? "▲" : "▼"}</span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 p-2 bg-slate-50/30 animate-[fadeSlideIn_0.2s_ease]">
                  <div className="flex flex-col gap-1">
                    {major.sub.map(sub => {
                      const isSel = values.includes(sub.value);
                      return (
                        <button key={sub.value} onClick={() => toggle(sub.value)}
                          className={`p-2.5 rounded-lg border text-left text-sm flex items-center gap-2.5 transition-all ${isSel ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold" : "border-slate-200 bg-white text-slate-600"}`}>
                          <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSel ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white"}`}>
                            {isSel && <span className="text-white text-[10px]">✓</span>}
                          </span>
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function QuestionCard({ question, value, onChange, index, total }: any) {
  const q = question;
  return (
    <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100 mb-5 animate-[fadeSlideIn_0.3s_ease]">
      <div className="text-[10px] text-slate-400 mb-2.5 font-bold tracking-widest uppercase">
        {q.category === "core" ? "基本情報" : q.category === "branch" ? "詳細確認" : "現在の契約"}
        {total && <span className="ml-2 opacity-50">/ {index + 1} of {total}</span>}
      </div>
      <div className="text-lg font-bold text-slate-800 mb-5 leading-relaxed">{q.text}</div>

      {q.type === "industry_multi_select" && (
        <IndustryMultiSelect values={Array.isArray(value) ? value : []} onChange={(vals) => onChange(q.id, vals)} hint={q.hint} />
      )}

      {q.type === "boolean" && (
        <div className="flex gap-3">
          {[{ v: true, l: "はい" }, { v: false, l: "いいえ" }].map(({ v, l }) => (
            <button key={String(v)} onClick={() => onChange(q.id, v)}
              className={`flex-1 py-3.5 rounded-xl border-2 font-bold text-base transition-all ${value === v ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
              {l}
            </button>
          ))}
        </div>
      )}

      {q.type === "select" && (
        <div className="flex flex-col gap-2">
          {q.options.map((opt: any) => (
            <button key={opt.value} onClick={() => onChange(q.id, opt.value)}
              className={`p-3.5 rounded-xl border-2 text-left text-sm transition-all ${value === opt.value ? "border-blue-600 bg-blue-50 text-blue-700 font-bold" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {q.type === "multi_select" && (
        <div className="flex flex-col gap-2">
          {q.options.map((opt: any) => {
            const selected = Array.isArray(value) && value.includes(opt.value);
            return (
              <button key={opt.value} onClick={() => {
                const cur = Array.isArray(value) ? value : [];
                onChange(q.id, selected ? cur.filter(v => v !== opt.value) : [...cur, opt.value]);
              }}
                className={`p-3.5 rounded-xl border-2 text-left text-sm flex items-center gap-3 transition-all ${selected ? "border-blue-600 bg-blue-50 text-blue-700 font-bold" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
                <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`}>
                  {selected && <span className="text-white text-[10px]">✓</span>}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {q.type === "number" && (
        <div className="flex items-center gap-3">
          <input type="number" value={value ?? ""} min={q.min} max={q.max}
            onChange={e => onChange(q.id, e.target.value === "" ? undefined : Number(e.target.value))}
            className="flex-1 p-3.5 rounded-xl border-2 border-slate-200 text-base outline-none text-slate-800 font-semibold focus:border-blue-500 transition-colors"
            placeholder={q.placeholder || "数値を入力"} />
          {q.unit && <span className="text-slate-500 font-bold text-sm">{q.unit}</span>}
        </div>
      )}

      {q.type === "text" && (
        <div className="flex items-center gap-3">
          <input type="text" value={value ?? ""}
            onChange={e => onChange(q.id, e.target.value)}
            className="flex-1 p-3.5 rounded-xl border-2 border-slate-200 text-base outline-none text-slate-800 font-semibold focus:border-blue-500 transition-colors"
            placeholder={q.placeholder || "テキストを入力"} />
        </div>
      )}
    </div>
  );
}
