# base_quotesテーブル移行ガイド

## 概要

`base_quotes.json`をSupabaseの`base_quotes`テーブルに移行することで、定期的な更新・メンテナンスが容易になります。

## メリット

1. **管理が容易**: SupabaseのTable Editorから直接編集・追加・削除可能
2. **バージョン管理**: `is_active`フラグで無効化可能（削除ではなく無効化）
3. **定期更新**: 新しい語録を追加してAI精度を向上させやすい
4. **スケーラブル**: ファイルサイズの制約がない

## セットアップ手順

### 1. Supabaseでテーブル作成

1. Supabaseダッシュボードにアクセス
2. SQL Editorを開く
3. `supabase-base-quotes-schema.sql`の内容を実行

### 2. 既存データの移行（オプション）

`data/base_quotes.json`のデータを`base_quotes`テーブルに移行する場合：

```sql
-- base_quotes.jsonのデータをインポート（例）
INSERT INTO base_quotes (original, english, translated, likes, retweets, quote_retweets, position)
VALUES 
  ('チームメイトのおかげです', 'Thanks to my teammates', 'チームメイトは俺の勝利を支えただけだ', 120, 45, 25, NULL),
  ...
```

または、SupabaseのTable EditorからCSVインポート機能を使用することも可能です。

### 3. 動作確認

1. 環境変数が設定されていることを確認（`.env.local`とVercel）
2. AI生成機能をテストして、Few-shot学習が正常に動作することを確認
3. ログで`baseQuotesCount`が正しく表示されることを確認

## 使用方法

### 新しい学習データを追加

SupabaseのTable Editorから：

1. `base_quotes`テーブルを開く
2. 「Insert row」をクリック
3. 以下を入力：
   - `original`: 本人「〇〇」
   - `english`: 通訳「英語」
   - `translated`: 公式「△△」
   - `likes`, `retweets`, `quote_retweets`: スコア計算用（任意）
   - `is_active`: `true`（有効化）
4. 保存

### 学習データを無効化

削除ではなく、`is_active`を`false`に設定することで無効化できます。

### 定期メンテナンス

- 週次または月次で新しい語録を追加
- 品質の低いデータは`is_active = false`に設定
- スコア（likes/retweets/quote_retweets）を更新して、上位25件の選択を最適化

## コード変更点

- `lib/quotes.ts`: `loadBaseQuotesForPrompt()`がSupabaseに対応
- `lib/quotes-supabase.ts`: `loadBaseQuotesFromSupabase()`関数を追加
- フォールバック: Supabase未設定時は`base_quotes.json`を使用

## 注意事項

- `base_quotes`テーブルはUIに表示されません（学習用のみ）
- RLSポリシーにより、認証済みユーザーのみINSERT/UPDATE可能
- SELECTは全員が可能（Few-shot学習用）

