import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env as any).SUPABASE_URL as string | undefined;
const supabaseAnonKey = (process.env as any).SUPABASE_ANON_KEY as string | undefined;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export async function saveDiagnosis(
  answers: any,
  results: any[]
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!supabase) {
    console.warn("[Supabase] SUPABASE_URL / SUPABASE_ANON_KEY が未設定のため保存をスキップします");
    return { success: false, error: "Supabase未設定" };
  }

  const top3 = [...results]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const id = Date.now().toString();

  const { error } = await supabase.from("diagnoses").insert({
    id,
    company_name: answers.company_name || null,
    industries: answers.industries || [],
    employee_count: answers.employee_count || null,
    annual_revenue: answers.annual_revenue || null,
    top3_results: top3,
    all_results: results,
    answers,
    source: "form",
  });

  if (error) {
    console.error("[Supabase] 保存エラー:", error.message);
    return { success: false, error: error.message };
  }

  console.log(`[Supabase] 診断結果を保存しました: ${id}`);
  return { success: true, id };
}
