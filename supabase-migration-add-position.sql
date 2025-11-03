-- Bigma Supabase マイグレーション: positionカラム追加
-- 既存のquotesテーブルにpositionカラムを追加するマイグレーション
-- Supabase SQL Editorで実行してください

-- positionカラムが存在しない場合のみ追加
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'position'
    ) THEN
        -- positionカラムを追加（TEXT型、NULL可）
        ALTER TABLE quotes 
        ADD COLUMN position TEXT;
        
        -- コメントを追加
        COMMENT ON COLUMN quotes.position IS 'ポジション（右、左、中、三、一、二、遊、捕、DH、指など）';
    END IF;
END $$;

-- インデックスは不要（positionは検索条件として使用しないため）

