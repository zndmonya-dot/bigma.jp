# Supabase実装案（将来）

## 概要

現在はファイルベースで動作していますが、後からデータベースを追加できます。

---

## 実装手順

### 1. Supabaseアカウント作成

1. https://supabase.com にアクセス
2. 新しいプロジェクトを作成
3. リージョン: Asia Northeast (Tokyo)

### 2. テーブル作成

SQL Editorで以下を実行：

```sql
CREATE TABLE quotes (
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

-- RLSを有効化
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り・挿入・更新可能
CREATE POLICY "Anyone can read quotes" ON quotes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert quotes" ON quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update quotes" ON quotes FOR UPDATE USING (true);
```

### 3. 環境変数設定

Vercelダッシュボード → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. コード変更

- `lib/supabase.ts` 作成
- `lib/quotes-supabase.ts` 作成
- `lib/quotes.ts` に統合
- API routesを更新

### 5. 再デプロイ

環境変数追加後に自動デプロイされます。

---

## メリット

- ✅ ユーザー生成データが保存される
- ✅ いいね・リツイート機能が動作
- ✅ ランキング機能が完全に動作

---

**現在は読み込み専用として動作しています。必要に応じて後から追加できます！**

