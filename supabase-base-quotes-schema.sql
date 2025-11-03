-- base_quotesテーブル（Few-shot学習用データ）
-- UIには表示されず、AI生成時のプロンプトにのみ使用される

-- 既存のテーブルがある場合は削除（注意: データは失われます）
-- DROP TABLE IF EXISTS base_quotes CASCADE;

CREATE TABLE IF NOT EXISTS base_quotes (
  id SERIAL PRIMARY KEY,
  original TEXT NOT NULL,
  english TEXT,
  translated TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  quote_retweets INTEGER DEFAULT 0,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_base_quotes_active ON base_quotes(is_active);
CREATE INDEX IF NOT EXISTS idx_base_quotes_created_at ON base_quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_base_quotes_score ON base_quotes(likes, retweets, quote_retweets) WHERE is_active = true;

-- Row Level Security (RLS) を有効化
ALTER TABLE base_quotes ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 全員がSELECT可能（読み取り専用）
CREATE POLICY "Anyone can read base_quotes"
  ON base_quotes
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- RLSポリシー: 認証済みユーザーのみINSERT可能（管理用）
CREATE POLICY "Authenticated users can insert base_quotes"
  ON base_quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLSポリシー: 認証済みユーザーのみUPDATE可能（管理用）
CREATE POLICY "Authenticated users can update base_quotes"
  ON base_quotes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_base_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_base_quotes_updated_at
  BEFORE UPDATE ON base_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_base_quotes_updated_at();

-- コメント追加
COMMENT ON TABLE base_quotes IS 'Few-shot学習用のベース語録データ。UIには表示されず、AI生成時のプロンプトにのみ使用される。';
COMMENT ON COLUMN base_quotes.id IS '主キー（自動採番）';
COMMENT ON COLUMN base_quotes.original IS '本人「〇〇」';
COMMENT ON COLUMN base_quotes.english IS '通訳「英語」';
COMMENT ON COLUMN base_quotes.translated IS '公式「△△」';
COMMENT ON COLUMN base_quotes.likes IS 'いいね数（学習用、スコア計算に使用）';
COMMENT ON COLUMN base_quotes.retweets IS 'リツイート数（学習用、スコア計算に使用）';
COMMENT ON COLUMN base_quotes.quote_retweets IS '引用リツイート数（学習用、スコア計算に使用）';
COMMENT ON COLUMN base_quotes.position IS 'ポジション（学習用、スコア計算時の参考）';
COMMENT ON COLUMN base_quotes.created_at IS '作成日時';
COMMENT ON COLUMN base_quotes.updated_at IS '更新日時';
COMMENT ON COLUMN base_quotes.is_active IS '有効/無効フラグ。falseにすると学習対象から除外される（削除ではなく無効化）。';

