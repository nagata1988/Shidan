-- 法人リスク診断システム — Supabase テーブル定義
-- Supabase ダッシュボードの SQL Editor で実行してください

CREATE TABLE IF NOT EXISTS diagnoses (
  id             TEXT PRIMARY KEY,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  company_name   TEXT,
  industries     TEXT[],
  employee_count INTEGER,
  annual_revenue BIGINT,
  top3_results   JSONB,   -- TOP3リスク（カテゴリID・スコア・グレード）
  all_results    JSONB,   -- 8カテゴリ全スコア
  answers        JSONB,   -- 全回答データ（スナップショット）
  source         TEXT NOT NULL DEFAULT 'form'  -- 'form' | 'file_import'
);

-- 新しい診断が来た順に並べるためのインデックス
CREATE INDEX IF NOT EXISTS diagnoses_created_at_idx ON diagnoses (created_at DESC);

-- RLS（Row Level Security）を有効化する場合は以下を実行
-- ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "anon insert" ON diagnoses FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "anon select" ON diagnoses FOR SELECT TO anon USING (true);
