# Supabase positionカラム追加マイグレーション

## 概要

既存のSupabaseテーブルに`position`カラムを追加するマイグレーション手順です。

## 実行方法

1. Supabaseダッシュボードにログイン
2. **SQL Editor**を開く
3. `supabase-migration-add-position.sql`の内容をコピー＆ペースト
4. **Run**をクリックして実行

## マイグレーション内容

- `position`カラムが存在しない場合のみ追加（安全な実行）
- カラムタイプ: `TEXT`（NULL可）
- 既存データへの影響: なし（既存レコードの`position`は`NULL`のまま）

## 確認方法

マイグレーション後、以下で確認できます：

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quotes' AND column_name = 'position';
```

## 注意事項

- 既に`position`カラムが存在する場合は、エラーなくスキップされます
- 新規テーブル作成時は`supabase-schema.sql`を使用してください（`position`カラムは既に含まれています）

