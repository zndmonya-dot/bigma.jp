-- Bigma Supabase データベーススキーマ
-- Supabase SQL Editorで実行してください

-- quotesテーブル作成
CREATE TABLE IF NOT EXISTS quotes (
  id BIGSERIAL PRIMARY KEY,
  original TEXT NOT NULL,
  english TEXT,
  translated TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  quote_retweets INTEGER DEFAULT 0,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_likes ON quotes(likes DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_retweets ON quotes(retweets DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_retweets ON quotes(quote_retweets DESC);

-- RLS（Row Level Security）を有効化
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- ポリシー設定：全員が読み取り可能
CREATE POLICY "Anyone can read quotes" 
ON quotes FOR SELECT 
USING (true);

-- ポリシー設定：全員が挿入可能
CREATE POLICY "Anyone can insert quotes" 
ON quotes FOR INSERT 
WITH CHECK (true);

-- ポリシー設定：全員が更新可能
CREATE POLICY "Anyone can update quotes" 
ON quotes FOR UPDATE 
USING (true);

-- updated_atを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atを自動更新するトリガー
CREATE TRIGGER update_quotes_updated_at 
BEFORE UPDATE ON quotes 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

