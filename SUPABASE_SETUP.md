# Supabase セットアップ手順

## 1. プロジェクト作成

1. **Organization**: `bigma` を選択（Freeプラン）
2. **Project name**: 任意の名前（例: `bigma-production`）
3. **Database password**: 強力なパスワードを設定（後で必要になります）
   - 「Generate a password」ボタンで自動生成も可能
   - **設定したパスワード**: `nPjTKjPGknLfxAY0` (ローカルの `supabase-credentials.txt` に記録済み)
4. **Region**: `Asia Northeast (Tokyo)` を選択（パフォーマンス最適化）
5. 「Create new project」をクリック

**注意**: プロジェクトの作成には数分かかります（2-3分程度）

### パスワードの保存

データベースパスワードは以下の場所に記録されています：
- ローカル: `supabase-credentials.txt` (Gitにはコミットされません)
- このファイルは `.gitignore` に含まれているため、安全に管理できます

## 2. プロジェクト作成後の確認

プロジェクトが作成されたら、以下を確認します：

1. **Settings** → **API** に移動
2. 以下の情報をメモ：
   - **Project URL** (`https://xxxxx.supabase.co`)
   - **anon/public key** (`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. データベーススキーマの作成

1. **SQL Editor** に移動
2. `supabase-schema.sql` の内容をコピー
3. SQL Editorに貼り付け
4. 「Run」ボタンをクリック

これで `quotes` テーブルが作成されます。

## 4. 環境変数の設定

### Vercelでの設定

1. Vercelダッシュボード → プロジェクト → **Settings** → **Environment Variables**
2. 以下の環境変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL=あなたのProject URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのanon/public key
```

3. 各環境に設定：
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### ローカル開発環境での設定

`.env.local` ファイルに追加：

```env
NEXT_PUBLIC_SUPABASE_URL=あなたのProject URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのanon/public key
```

## 5. データの移行（オプション）

既存の `data/quotes.json` のデータをSupabaseに移行する場合：

1. **SQL Editor** で以下を実行：

```sql
-- 例：既存データを挿入
INSERT INTO quotes (id, original, english, translated, likes, retweets, quote_retweets, position)
VALUES 
  (1, 'パワハラ上司に対して報いるためには', 'To retaliate against my tyrant', '運命に反撃する、俺の力が試される時だ', 0, 0, 0, NULL),
  -- ... 他のデータも同様に
;
```

または、管理画面（`/admin`）から手動で追加することもできます。

## 6. 動作確認

1. 環境変数を設定後、Vercelが自動デプロイ
2. `https://bigma.jp` にアクセス
3. 語録生成を試す
4. 生成された語録がSupabaseに保存されているか確認：
   - Supabaseダッシュボード → **Table Editor** → `quotes` テーブル

## 7. トラブルシューティング

### エラー: "Supabase is not configured"
- 環境変数が正しく設定されているか確認
- Vercelで再デプロイが必要な場合があります

### エラー: "Failed to load quotes from Supabase"
- SupabaseのProject URLとAPI Keyが正しいか確認
- RLS（Row Level Security）ポリシーが正しく設定されているか確認

### データが表示されない
- `base_quotes.json` のデータはSupabaseには移行されません（ファイルベースのまま）
- ユーザー生成データのみがSupabaseに保存されます

## 8. フォールバック動作

環境変数が設定されていない場合、自動的にファイルベース（`data/quotes.json`）にフォールバックします。
これは開発中や環境変数の設定忘れにも対応するためです。

---

**次のステップ**: プロジェクト作成が完了したら、SQLスキーマを実行してください！

