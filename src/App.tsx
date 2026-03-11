import React, { useState, useCallback, useEffect } from "react";
import { QUESTIONS_DATA } from "./constants/questions";
import { RULES_DATA } from "./constants/rules";
import { getIndustryLabel, getIndustryParent } from "./constants/industry";
import { 
  runRuleEngine, 
  selectTop3, 
  calcTop3Hash, 
  selectNextQuestions, 
  getBranchQuestionsForAnswers,
  evaluateCondition
} from "./utils/ruleEngine";
import { ProgressBar, QuestionCard, GRADE_COLORS } from "./components/DiagnosisComponents";
import { CategoryCard } from "./components/ResultComponents";
import { generateExecutiveSummary } from "./services/gemini";
import { saveDiagnosis } from "./services/supabase";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

import html2pdf from "html2pdf.js";

export default function App() {
  const [phase, setPhase] = useState<"intro" | "form" | "iterating" | "result">("intro");
  const reportRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    
    const companyName = answers.company_name || "貴社";
    const dateStr = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "");
    const filename = `${dateStr}_${companyName}_リスク診断レポート.pdf`;

    const element = reportRef.current;
    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    // Temporarily hide elements with .no-print for the PDF generation
    const noPrintElements = element.querySelectorAll('.no-print');
    noPrintElements.forEach(el => (el as HTMLElement).style.display = 'none');

    html2pdf().set(opt).from(element).save().then(() => {
      // Restore the elements
      noPrintElements.forEach(el => (el as HTMLElement).style.display = '');
    });
  };
  const [answers, setAnswers] = useState<any>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [iterationStep, setIterationStep] = useState(0);
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [iterationQuestions, setIterationQuestions] = useState<any[]>([]);
  const [iterationAnswers, setIterationAnswers] = useState<any>({});
  const [top3, setTop3] = useState<any[]>([]);
  const [lastHash, setLastHash] = useState("");
  const [allResults, setAllResults] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [clientMode, setClientMode] = useState(false);
  const [printError, setPrintError] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState({
    name: "",
    person: "",
    phone: "",
    email: "",
    logoText: "🛡️ リスクマネジメント・パートナー"
  });
  const [showAgencyForm, setShowAgencyForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error("Print error:", err);
      setPrintError(true);
      setTimeout(() => setPrintError(false), 5000);
    }
  };

  const CORE_IDS = QUESTIONS_DATA.questions.filter(q => q.category === "core").map(q => q.id);
  const CURRENT_IDS = QUESTIONS_DATA.questions.filter(q => q.category === "current_contract").map(q => q.id);

  const visibleQuestions = useCallback(() => {
    const normalizedAnswers = { ...answers };
    if (Array.isArray(normalizedAnswers.industries)) {
      normalizedAnswers.industries = [...new Set(normalizedAnswers.industries.map((v: string) => getIndustryParent(v)))];
    }

    const list = QUESTIONS_DATA.questions.filter(q => {
      if (q.category !== "core") return false;
      if ((q as any).condition) {
        return evaluateCondition((q as any).condition, normalizedAnswers);
      }
      return true;
    });
    const branchIds = getBranchQuestionsForAnswers(normalizedAnswers);
    branchIds.forEach(id => {
      const q = QUESTIONS_DATA.questions.find(q => q.id === id);
      if (q) list.push(q);
    });
    CURRENT_IDS.forEach(id => {
      const q = QUESTIONS_DATA.questions.find(q => q.id === id);
      if (q) list.push(q);
    });
    return list;
  }, [answers]);

  const questions = visibleQuestions();
  const answeredCount = questions.filter(q => q.id in answers).length;

  const handleAnswer = useCallback((id: string, val: any) => {
    setAnswers((prev: any) => ({ ...prev, [id]: val }));
  }, []);

  const handleIterationAnswer = useCallback((id: string, val: any) => {
    setIterationAnswers((prev: any) => ({ ...prev, [id]: val }));
  }, []);

  const canProceed = () => {
    const visibleCore = visibleQuestions().filter(q => q.category === "core" && q.required);
    return visibleCore.every(q => {
      if (q.id === "industries") return Array.isArray(answers.industries) && answers.industries.length > 0;
      return q.id in answers;
    });
  };

  const startDiagnosis = () => {
    const snapshot = { ...answers };
    const results = runRuleEngine(snapshot);
    const t3 = selectTop3(results);
    const hash = calcTop3Hash(t3);
    setAllResults(results);
    setTop3(t3);
    setLastHash(hash);
    const needsIteration = t3.some(r => r.rank === "B") && iterationStep < 2;
    const nextQs = needsIteration ? selectNextQuestions(t3, snapshot, []) : [];

    if (needsIteration && nextQs.length > 0) {
      setIterationQuestions(nextQs);
      setAskedIds(nextQs.map(q => q.id));
      setPhase("iterating");
    } else {
      setPhase("result");
      generateSummary(snapshot, results);
      saveDiagnosisResult(snapshot, results);
    }
  };

  const submitIteration = () => {
    const snapshot = { ...answers, ...iterationAnswers };
    const results = runRuleEngine(snapshot);
    const t3 = selectTop3(results);
    const hash = calcTop3Hash(t3);
    setAllResults(results);
    setTop3(t3);
    const newStep = iterationStep + 1;
    setIterationStep(newStep);
    const converged = hash === lastHash;
    const noMoreB = !t3.some(r => r.rank === "B");
    const maxReached = newStep >= 2;
    
    const newAsked = [...askedIds];
    const nextQs = selectNextQuestions(t3, snapshot, newAsked);

    if (converged || noMoreB || maxReached || nextQs.length === 0) {
      setAnswers(snapshot);
      setPhase("result");
      generateSummary(snapshot, results);
      saveDiagnosisResult(snapshot, results);
    } else {
      setLastHash(hash);
      nextQs.forEach(q => { if (!newAsked.includes(q.id)) newAsked.push(q.id); });
      setIterationQuestions(nextQs);
      setAskedIds(newAsked);
      setIterationAnswers({});
      setPhase("iterating");
    }
  };

  const generateSummary = async (snap: any, res: any[]) => {
    setIsGeneratingSummary(true);
    const summary = await generateExecutiveSummary(snap, res);
    setAiSummary(summary || "");
    setIsGeneratingSummary(false);
  };

  const saveDiagnosisResult = async (snap: any, res: any[]) => {
    setSaveStatus("saving");
    const result = await saveDiagnosis(snap, res);
    setSaveStatus(result.success ? "saved" : "error");
  };

  const confidenceHint = () => {
    const avg = top3.reduce((s, r) => {
      const res = allResults.find(x => x.category_id === r.category_id);
      return s + (res?.data_completeness ?? 0.5);
    }, 0) / Math.max(top3.length, 1);
    const pct = Math.round(avg * 100);
    if (pct >= 80) return `診断充足率 ${pct}%。高精度な診断結果です。`;
    if (pct >= 60) return `診断充足率 ${pct}%。追加ヒアリングでさらに精度が上がります。`;
    return `診断充足率 ${pct}%。一部リスクに不確実性があります。詳細ヒアリングを推奨します。`;
  };

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-xl w-full animate-[fadeIn_0.6s_ease]">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">🛡️</div>
            <h1 className="text-3xl font-black text-white mb-3 leading-tight">法人リスク診断システム</h1>
            <p className="text-slate-400 text-base leading-relaxed">貴社の事業リスクを分析し、<br />優先度の高い保険をご提案します</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8 space-y-6">
            {[
              { icon: "📋", title: "15の基本質問", desc: "業種・規模・リスク特性を確認" },
              { icon: "🔍", title: "AIルールエンジン", desc: "8カテゴリ×50以上のルールで分析" },
              { icon: "📊", title: "TOP3リスク診断", desc: "優先度・根拠・提案方向性を出力" }
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-5 pb-5 border-b border-white/5 last:border-0 last:pb-0">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-200">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setPhase("form")}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98]">
            診断を開始する →
          </button>
          <p className="text-center text-[10px] text-slate-500 mt-6 uppercase tracking-widest font-bold">
            ※本診断は参考情報です。正確な保険設計には専門家によるご相談が必要です。
          </p>
        </div>
      </div>
    );
  }

  if (phase === "form") {
    const sections = [
      { label: "基本情報", ids: CORE_IDS },
      { label: "詳細・現契約", ids: questions.filter(q => q.category !== "core").map(q => q.id) }
    ];
    const currentSectionQs = sections[currentSection]?.ids
      .map(id => questions.find(q => q.id === id))
      .filter(Boolean) ?? [];
    const isLastSection = currentSection === sections.length - 1;

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="text-sm font-black text-slate-800 flex items-center gap-2">
              <span className="text-xl">🛡️</span> リスク診断
            </div>
            <div className="flex gap-2">
              {sections.map((s, i) => (
                <div key={i} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${i === currentSection ? "bg-blue-100 text-blue-700" : i < currentSection ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                  {i < currentSection ? "✓ " : ""}{s.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-10">
          <ProgressBar current={answeredCount} total={questions.length} />
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-1">{sections[currentSection].label}</h2>
            <p className="text-sm text-slate-500 font-medium">以下の項目にご回答ください。</p>
          </div>
          {currentSectionQs.map((q, i) => (
            <QuestionCard key={q.id} question={q} value={answers[q.id]} onChange={handleAnswer} index={i} total={currentSectionQs.length} />
          ))}
          <div className="flex gap-4 mt-10">
            {currentSection > 0 && (
              <button onClick={() => setCurrentSection(s => s - 1)}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                ← 前へ
              </button>
            )}
            <button
              onClick={() => {
                if (isLastSection) startDiagnosis();
                else setCurrentSection(s => s + 1);
              }}
              disabled={!canProceed() && currentSection === 0}
              className={`flex-[2] py-4 rounded-2xl font-black text-sm transition-all ${canProceed() ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
              {isLastSection ? "診断する →" : "次へ →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "iterating") {
    const iterDone = iterationQuestions.every(q => q.id in iterationAnswers);
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <div className="text-sm font-black text-slate-800">🛡️ リスク診断</div>
            <div className="bg-amber-100 border border-amber-200 rounded-full px-3 py-1 text-[10px] font-bold text-amber-800 uppercase tracking-widest">
              精度向上 — 追加確認 {iterationStep + 1}/2
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="text-sm font-black text-amber-900 mb-2 flex items-center gap-2">
              <span>📌</span> 確認が必要なリスクが見つかりました
            </div>
            <div className="text-xs text-amber-800 leading-relaxed font-medium">
              初回診断でTOP3リスクの一部に不確実性があります。以下の追加質問にご回答いただくことで、診断精度が向上します。
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-black text-slate-900 mb-1">追加確認（{iterationQuestions.length}問）</h2>
            <p className="text-sm text-slate-500 font-medium">リスク評価に重要な項目です。</p>
          </div>
          {iterationQuestions.map((q, i) => (
            <QuestionCard key={q.id} question={q} value={iterationAnswers[q.id]} onChange={handleIterationAnswer} index={i} total={iterationQuestions.length} />
          ))}
          <div className="flex gap-4 mt-8">
            <button onClick={() => { const snap = { ...answers, ...iterationAnswers }; setAnswers(snap); setPhase("result"); generateSummary(snap, allResults); saveDiagnosisResult(snap, allResults); }}
              className="flex-1 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-500 font-bold text-sm hover:bg-slate-50">
              スキップして結果を見る
            </button>
            <button onClick={submitIteration} disabled={!iterDone}
              className={`flex-[2] py-4 rounded-2xl font-black text-sm transition-all ${iterDone ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-400" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
              再診断する →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const otherResults = allResults
      .filter(r => !top3.find(t => t.category_id === r.category_id))
      .sort((a, b) => b.score - a.score);

    const hasUrgent = top3.some(r => r.rank === "A");
    const diagDate = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    const allScoreMap = Object.fromEntries(allResults.map(r => [r.category_id, r]));

    const chartData = RULES_DATA.categories.map(cat => ({
      subject: cat.name,
      A: allScoreMap[cat.id]?.score || 0,
      B: 65 + (Math.random() * 10 - 5), // Industry Average (Mock)
      fullMark: 100,
    }));

    return (
      <div className="min-h-screen bg-slate-100 font-['Noto_Sans_JP']" ref={reportRef}>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; color: black !important; }
            .min-h-screen { background: white !important; }
            .bg-slate-900 { background: #0f172a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .shadow-xl, .shadow-sm { box-shadow: none !important; }
            .border { border-color: #e2e8f0 !important; }
            .chart-print-container { width: 100% !important; height: 350px !important; display: block !important; }
            .radar-chart-svg { width: 100% !important; height: 100% !important; }
          }
        `}</style>

        {printError && (
          <div className="fixed top-4 right-4 z-[100] bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl animate-[fadeSlideIn_0.3s_ease] font-bold text-sm">
            ⚠️ 印刷機能が制限されています。ブラウザのメニューから印刷をお試しください。
          </div>
        )}

        <div className="bg-slate-900 px-6 pt-10 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8 no-print">
              <div className="flex items-center gap-3">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">🛡️ 法人リスク診断レポート</div>
                {saveStatus === "saving" && (
                  <span className="text-[10px] font-bold text-slate-400 bg-white/10 px-2 py-1 rounded-full animate-pulse">💾 保存中...</span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">✓ Supabaseに保存済み</span>
                )}
                {saveStatus === "error" && (
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full">⚠️ 保存失敗</span>
                )}
              </div>
              <div className="flex gap-3">
                <div className="flex items-center bg-white/10 rounded-xl px-3 border border-white/20 mr-2">
                  <span className={`text-[10px] font-bold mr-2 ${clientMode ? "text-slate-400" : "text-white"}`}>代理店用</span>
                  <button 
                    onClick={() => setClientMode(!clientMode)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${clientMode ? "bg-blue-500" : "bg-slate-600"}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${clientMode ? "left-6" : "left-1"}`} />
                  </button>
                  <span className={`text-[10px] font-bold ml-2 ${clientMode ? "text-white" : "text-slate-400"}`}>顧客提示用</span>
                </div>
                <button onClick={handlePrint}
                  className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/20 transition-colors active:scale-95 no-print">
                  🖨️ 印刷
                </button>
                <button onClick={handleDownloadPDF}
                  className="bg-blue-600 border border-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors active:scale-95 no-print">
                  💾 PDF保存
                </button>
                <button onClick={() => setShowAgencyForm(!showAgencyForm)}
                  className="bg-amber-600 border border-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-500 transition-colors active:scale-95 no-print">
                  ✏️ レポート編集
                </button>
                <button onClick={() => { setPhase("intro"); setAnswers({}); setIterationStep(0); setTop3([]); setAllResults([]); setAskedIds([]); setAiSummary(""); }}
                  className="bg-white/5 border border-white/10 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10">
                  再診断
                </button>
              </div>
            </div>

            {showAgencyForm && (
              <div className="mb-8 bg-white/5 border border-white/10 rounded-3xl p-6 no-print animate-[fadeSlideIn_0.3s_ease]">
                <div className="text-xs font-black text-blue-400 mb-4 uppercase tracking-widest">代理店情報のカスタマイズ</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">代理店名</label>
                    <input 
                      type="text" 
                      value={agencyInfo.name} 
                      onChange={e => setAgencyInfo({...agencyInfo, name: e.target.value})}
                      placeholder="例：〇〇保険サービス"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">担当者名</label>
                    <input 
                      type="text" 
                      value={agencyInfo.person} 
                      onChange={e => setAgencyInfo({...agencyInfo, person: e.target.value})}
                      placeholder="例：山田 太郎"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">電話番号</label>
                    <input 
                      type="text" 
                      value={agencyInfo.phone} 
                      onChange={e => setAgencyInfo({...agencyInfo, phone: e.target.value})}
                      placeholder="例：03-1234-5678"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">メールアドレス</label>
                    <input 
                      type="text" 
                      value={agencyInfo.email} 
                      onChange={e => setAgencyInfo({...agencyInfo, email: e.target.value})}
                      placeholder="例：yamada@example.com"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-[fadeSlideIn_0.6s_ease]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">診断日: {diagDate}</div>
                  {answers.agent_name && (
                    <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest border-l border-slate-700 pl-3">
                      作成: {answers.agent_name}
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="text-blue-500 text-xs font-black uppercase tracking-widest mb-1">FOR CLIENT</div>
                  <h1 className="text-4xl font-black text-white leading-tight">
                    {answers.company_name || "貴社"} 御中
                  </h1>
                </div>

                <h2 className="text-2xl font-black text-slate-200 leading-tight mb-6">
                  {hasUrgent ? "⚠️ 優先的に見直しが必要なリスクが検出されました" : "事業継続に向けたリスク診断結果報告書"}
                </h2>
                
                {Array.isArray(answers.industries) && answers.industries.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {answers.industries.map((v: string) => {
                      const info = getIndustryLabel(v);
                      return (
                        <span key={v} className="bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs text-slate-200 font-bold">
                          {info.icon} {info.sub || info.major}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-3 flex-wrap mb-8">
                  {answers.employee_count && (
                    <span className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-400 font-medium">
                      👥 従業員 {answers.employee_count}名
                    </span>
                  )}
                  {answers.annual_revenue && (
                    <span className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-400 font-medium">
                      💰 年商 {answers.annual_revenue >= 10000 ? (answers.annual_revenue/10000).toFixed(1)+"億円" : answers.annual_revenue+"万円"}
                    </span>
                  )}
                  <span className={`rounded-xl px-4 py-2 text-xs font-black border ${hasUrgent ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
                    {hasUrgent ? "⚠️ Grade A リスクあり" : "✓ 高優先度リスクなし"}
                  </span>
                </div>

                {/* AI Executive Summary */}
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    AIコンサルタントによる総評
                  </div>
                  {isGeneratingSummary ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
                      <div className="h-4 bg-white/5 rounded animate-pulse w-5/6" />
                      <div className="h-4 bg-white/5 rounded animate-pulse w-4/6" />
                    </div>
                  ) : (
                    <div className="text-slate-200 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                      {aiSummary}
                    </div>
                  )}
                </div>
              </div>

              {/* Radar Chart */}
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-4 border border-white/10 h-[400px] flex flex-col items-center justify-center animate-[fadeIn_1s_ease] chart-print-container">
                <div className="flex justify-center gap-6 mb-4 no-print">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-[10px] text-slate-400 font-bold">貴社スコア</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-500 rounded-full" />
                    <span className="text-[10px] text-slate-400 font-bold">業界平均</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData} className="radar-chart-svg">
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Industry Average"
                      dataKey="B"
                      stroke="rgba(255,255,255,0.2)"
                      fill="rgba(255,255,255,0.2)"
                      fillOpacity={0.2}
                    />
                    <Radar
                      name="Risk Score"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 -mt-10 pb-20">
          <div className="bg-white rounded-2xl p-5 mb-8 border border-slate-200 shadow-xl flex items-center gap-4">
            <span className="text-2xl">💡</span>
            <span className="text-sm text-slate-700 font-medium">
              {clientMode ? "本レポートは貴社の事業内容に基づき、潜在的なリスクを分析したものです。" : confidenceHint()}
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column: TOP3 Details */}
            <div className="xl:col-span-2 space-y-8">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                {clientMode ? "— 優先的に対策を検討すべきリスク —" : "— 優先対応 TOP 3 詳細 —"}
              </div>
              {top3.map((result, i) => {
                const cat = RULES_DATA.categories.find(c => c.id === result.category_id);
                if (!cat) return null;
                const medalColors = ["text-amber-600", "text-slate-500", "text-orange-800"];
                const medalBgs = ["bg-amber-50", "bg-slate-50", "bg-orange-50"];
                const medalBorders = ["border-amber-200", "border-slate-200", "border-orange-200"];
                return (
                  <div key={result.category_id} className="flex gap-4 items-start">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-lg mt-2 ${medalBgs[i]} ${medalBorders[i]} ${medalColors[i]}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <CategoryCard result={result} category={cat} isTop={true} answers={answers} clientMode={clientMode} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: All Scores & Others */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">📊 リスク分析一覧</div>
                <div className="space-y-5">
                  {RULES_DATA.categories.map(cat => {
                    const r = allScoreMap[cat.id];
                    if (!r) return null;
                    const isInTop3 = top3.some(t => t.category_id === cat.id);
                    const grade = r.rank;
                    const colors: any = { A: "bg-red-500", B: "bg-amber-500", C: "bg-slate-400" };
                    const textColors: any = { A: "text-red-600", B: "text-amber-600", C: "text-slate-400" };
                    return (
                      <div key={cat.id} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{cat.icon}</span>
                            <span className={`text-xs ${isInTop3 ? "font-black text-slate-800" : "font-medium text-slate-500"}`}>{cat.name}</span>
                          </div>
                          {!clientMode && <span className={`text-[10px] font-black ${textColors[grade]}`}>{r.score}点</span>}
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${colors[grade]}`} style={{ width: `${r.score}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">— その他リスク項目 —</div>
              <div className="space-y-4">
                {otherResults.map(result => {
                  const cat = RULES_DATA.categories.find(c => c.id === result.category_id);
                  if (!cat) return null;
                  return <CategoryCard key={result.category_id} result={result} category={cat} isTop={false} answers={answers} clientMode={clientMode} />;
                })}
              </div>
            </div>
          </div>

          {/* Agency Info Footer (White Label) */}
          {(agencyInfo.name || agencyInfo.person) && (
            <div className="mt-12 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">診断パートナー</div>
                <div className="text-lg font-black text-slate-900">{agencyInfo.name || "リスクマネジメント・パートナー"}</div>
                {agencyInfo.person && <div className="text-sm font-bold text-slate-600">担当：{agencyInfo.person}</div>}
              </div>
              <div className="text-right">
                {agencyInfo.phone && <div className="text-sm font-bold text-slate-700">📞 {agencyInfo.phone}</div>}
                {agencyInfo.email && <div className="text-sm font-bold text-slate-700">✉️ {agencyInfo.email}</div>}
              </div>
            </div>
          )}

          {!clientMode && (
            <div className="mt-20 bg-emerald-50 rounded-[40px] p-12 border border-emerald-100 relative overflow-hidden no-print">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative">
                <div className="text-sm font-black text-emerald-800 mb-10 flex items-center gap-3">
                  <span className="text-2xl">🎯</span> 代理店様の次のアクション
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { step: "1", icon: "🔴", label: "Grade A 項目を即アポに変換", desc: "「今すぐ提案」ラベルがついた保険は、この診断結果を持参して翌週以内にアポを取ることを推奨します" },
                    { step: "2", icon: "🟡", label: "Grade B 項目を次回ヒアリングのアジェンダに設定", desc: "「次回確認推奨」の項目は、ヒアリングシートを持参して詳細確認してください" },
                    { step: "3", icon: "📋", label: "必須特約チェックリストで補償ギャップを確認", desc: "各TOP3カードの業種別チェックリストで、現在未加入の特約を洗い出してください" },
                    { step: "4", icon: "💬", label: "提案トークをそのまま説明に活用", desc: "各カードの「代理店向け提案トーク」に保険商品名・限度額目安・根拠が入っています" },
                  ].map((action) => (
                    <div key={action.step} className="flex gap-5 items-start bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-emerald-100/50 shadow-sm hover:shadow-md transition-all">
                      <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-base font-black text-emerald-700">{action.step}</div>
                      <div>
                        <div className="text-xs font-black text-emerald-900 mb-1.5">{action.icon} {action.label}</div>
                        <div className="text-[11px] text-emerald-600 leading-relaxed font-medium">{action.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 bg-white rounded-3xl p-8 border border-red-100 shadow-sm">
            <div className="text-xs font-black text-red-600 mb-4 flex items-center gap-2">
              <span className="text-lg">⚠️</span> 注意事項
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              本診断はルールエンジンによる参考情報であり、保険契約のご提案・推奨を確約するものではありません。
              正確な保険設計・保険料試算には、資格を持つ保険代理店担当者によるヒアリングが必要です。
              各リスクの重要度・優先順位は、企業様の個別状況により異なります。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
