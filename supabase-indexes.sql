-- Quotes performance indexes

-- 新着: id降順の取得最適化
CREATE INDEX IF NOT EXISTS quotes_id_desc_idx
  ON quotes (id DESC);

-- 週間: 直近7日 + いいね降順 + id降順 の並びと一致
CREATE INDEX IF NOT EXISTS quotes_weekly_idx
  ON quotes (created_at DESC, likes DESC, id DESC);

-- 月間: 直近30日 + いいね降順 + id降順 の並びと一致
CREATE INDEX IF NOT EXISTS quotes_monthly_idx
  ON quotes (created_at DESC, likes DESC, id DESC);

-- 累計: いいね降順 + id降順
CREATE INDEX IF NOT EXISTS quotes_total_idx
  ON quotes (likes DESC, id DESC);

-- 大量データ時の時系列レンジスキャン用（任意）
-- CREATE INDEX IF NOT EXISTS quotes_created_at_brin
--   ON quotes USING BRIN (created_at);


