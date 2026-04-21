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

function IndustrySelectionGuide() {
  const examples = [
    { a: "🏨 ホテル", b: "🍽️ レストラン", criterion: "外来客の売上比率" },
    { a: "🏭 製造業", b: "🛒 小売・EC", criterion: "自社通販の売上比率" },
    { a: "🍽️ 飲食", b: "🎂 ケータリング", criterion: "外販・出張料理の比率" },
    { a: "🛒 小売", b: "💻 EC", criterion: "ネット通販の売上比率" },
    { a: "💻 IT", b: "📊 コンサル", criterion: "助言業務の売上比率" },
    { a: "🏗️ 建設", b: "📐 設計", criterion: "設計単独受注の比率" },
  ];
  return (
    <div className="mb-5 rounded-2xl overflow-hidden border-2 border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/50">
      {/* Header */}
      <div className="px-4 py-3 bg-blue-600/90 text-white flex items-center gap-2">
        <span className="text-lg">💡</span>
        <div>
          <div className="text-sm font-black">複数事業があるときの選び方</div>
          <div className="text-[10px] text-blue-100 font-medium">迷ったら「売上3割の法則」</div>
        </div>
      </div>

      {/* Text-based decision guide */}
      <div className="p-4">
        <div className="text-[11px] font-bold text-slate-600 mb-1 text-center">付帯事業の売上比率で判断</div>
        <div className="text-[10px] text-slate-500 text-center mb-3 leading-relaxed">
          「付帯事業の売上 ÷ 会社全体の売上」が何%かで判断します<br/>
          <span className="text-slate-400">例：ホテルの全売上5億円のうち、レストラン売上が1.5億円なら30%</span>
        </div>
        <div className="space-y-2">
          <div className="bg-white rounded-xl border-2 border-blue-200 p-3 flex items-center gap-3">
            <div className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-lg bg-blue-100 min-w-[76px]">
              <span className="text-[9px] font-bold text-blue-500 leading-none mb-1">売上比率</span>
              <span className="text-base font-black text-blue-700 leading-none whitespace-nowrap">30%以上</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-blue-700 mb-0.5">✅ 両方を選択</div>
              <div className="text-[11px] text-slate-600 leading-relaxed">付帯事業が大きいため、独立したリスクとして別途評価が必要です</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border-2 border-slate-200 p-3 flex items-center gap-3">
            <div className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-lg bg-slate-100 min-w-[76px]">
              <span className="text-[9px] font-bold text-slate-400 leading-none mb-1">売上比率</span>
              <span className="text-base font-black text-slate-700 leading-none whitespace-nowrap">30%未満</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-700 mb-0.5">❌ メイン業種のみでOK</div>
              <div className="text-[11px] text-slate-500 leading-relaxed">付帯サービスは小さいため、主業種の補償でカバーできます</div>
            </div>
          </div>
        </div>

        {/* Exception cases: must pick both regardless of ratio */}
        <div className="mt-3 rounded-xl border-2 border-orange-200 bg-orange-50/60 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">⚠️</span>
            <span className="text-[11px] font-black text-orange-700">例外：売上比率に関わらず両方選択するケース</span>
          </div>
          <div className="space-y-2">
            <div className="bg-white rounded-lg p-2.5 border border-orange-100">
              <div className="text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1">
                <span>📍</span><span>事業を別々の拠点（建物）で運営している</span>
              </div>
              <div className="text-[10px] text-slate-600 leading-relaxed mb-1">
                <span className="text-slate-500">例：</span>本社工場と別地域の直営小売店／東京オフィスと大阪支店の別業態／本店とセントラルキッチン／路面店と別棟倉庫 など
              </div>
              <div className="text-[10px] text-slate-500 leading-relaxed">
                → <span className="font-bold text-orange-700">必ず両方選択</span>（別建物は火災・施設賠償・盗難などのリスクが独立）
              </div>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-orange-100">
              <div className="text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1">
                <span>🏢</span><span>同じ建物内でも「独立した事業」として運営</span>
              </div>
              <div className="text-[10px] text-slate-600 leading-relaxed mb-1.5">
                <span className="text-slate-500">例：</span>1F路面店＋上階は別業態／本社ビル内で別ブランドのサービスを提供／同一拠点でテナント的に別業態を運営
              </div>
              <div className="text-[10px] text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-700">以下2つ以上当てはまれば両方選択：</span><br/>
                ・独立した入口・看板・屋号（別ブランドで展開）<br/>
                ・営業許可・届出が別物件扱い（保健所／建設業／風営法 等）<br/>
                ・スタッフ・管理者・会計（売上/経費）が独立
              </div>
            </div>
            <div className="bg-amber-100/60 rounded-lg p-2 border border-amber-200 text-[10px] text-slate-700 leading-relaxed">
              💡 <span className="font-bold">迷ったら両方選ぶのが安全です。</span>リスクの見落としを防ぎます。
            </div>
          </div>
        </div>
      </div>

      {/* Examples grid */}
      <div className="px-4 pb-3">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">📘 よくある複合パターン</div>
        <div className="grid grid-cols-2 gap-1.5">
          {examples.map((ex, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-2">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-0.5">
                <span>{ex.a}</span>
                <span className="text-slate-400">＋</span>
                <span>{ex.b}</span>
              </div>
              <div className="text-[9px] text-slate-500 leading-tight">{ex.criterion}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fallback footer */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 leading-relaxed">
        💬 売上比率が分からない → <span className="font-bold text-slate-600">スタッフ工数</span> または <span className="font-bold text-slate-600">取引先数</span> で代替判断
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
      <IndustrySelectionGuide />
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
      <div className="text-lg font-bold text-slate-800 mb-3 leading-relaxed">{q.text}</div>

      {q.hint && q.type !== "industry_multi_select" && (
        <div className="mb-5 p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-[12px] text-slate-700 leading-relaxed whitespace-pre-line flex gap-2">
          <span className="flex-shrink-0 text-base leading-none">💡</span>
          <span>{q.hint}</span>
        </div>
      )}

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
          <input type="text" inputMode="numeric" value={value ?? ""}
            onChange={e => {
              const normalized = e.target.value.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).replace(/[^0-9]/g, "");
              onChange(q.id, normalized === "" ? undefined : Number(normalized));
            }}
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
