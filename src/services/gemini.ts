import { GoogleGenAI } from "@google/genai";

export async function generateExecutiveSummary(answers: any, results: any[]) {
  const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
  
  const top3 = results
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => `${r.category_id}: ${r.score}点 (${r.rank})`);

  const prompt = `
あなたはプロの企業リスクコンサルタントです。
以下の診断回答とリスクスコアに基づき、企業の経営者（社長）に向けた「3行のエグゼクティブ・サマリー」を作成してください。

【企業情報】
業種: ${answers.industries?.join(", ")}
従業員数: ${answers.employee_count}名
年商: ${answers.annual_revenue}万円
工場保有: ${answers.has_factory ? "あり" : "なし"}
ITシステム利用: ${answers.has_it_systems ? "あり" : "なし"}
輸出比率: ${answers.export_ratio}

【リスク診断結果（TOP3）】
${top3.join("\n")}

【制約事項】
・専門用語を使いすぎず、経営者が直感的に危機感と対策の必要性を感じる言葉を選んでください。
・「〜です」「〜ます」調で、3つの箇条書き（各行40文字程度）で出力してください。
・冒頭に「AIコンサルタントによる総評：」と付けてください。
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Summary Error:", error);
    return "診断結果に基づき、優先度の高いリスクから対策を検討することをお勧めします。詳細は各カテゴリの診断結果をご確認ください。";
  }
}
