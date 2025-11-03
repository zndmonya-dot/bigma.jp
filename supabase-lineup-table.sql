-- 日次スタメン（打線）を固定保存するテーブル
-- JST 0時に1日1回更新される想定

CREATE TABLE IF NOT EXISTS lineup_daily (
  run_date DATE PRIMARY KEY,
  quote_ids BIGINT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS lineup_daily_run_date_idx
  ON lineup_daily (run_date DESC);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_lineup_daily_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lineup_daily_updated_at_trigger
  BEFORE UPDATE ON lineup_daily
  FOR EACH ROW
  EXECUTE FUNCTION update_lineup_daily_updated_at();

-- コメント
COMMENT ON TABLE lineup_daily IS '日次スタメン（打線）の固定保存テーブル。JST 0時に1日1回更新';
COMMENT ON COLUMN lineup_daily.run_date IS '実行日（JST、YYYY-MM-DD）';
COMMENT ON COLUMN lineup_daily.quote_ids IS '選ばれた語録IDの配列（最大9件）';

