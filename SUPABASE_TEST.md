# Supabase動作確認手順

## ✅ 設定完了確認

以下の設定が完了しています：
- ✅ Supabaseプロジェクト作成
- ✅ `quotes`テーブル作成
- ✅ `.env.local`に環境変数設定
- ✅ Vercelに環境変数設定

## 🔍 動作確認方法

### 1. Vercelのデプロイ確認

1. Vercelダッシュボード → **Deployments**
2. 最新のデプロイが **Ready** になっているか確認
3. 環境変数追加後は自動で再デプロイが開始されます

### 2. ローカルでの動作確認（推奨）

1. 開発サーバーを起動：
```bash
npm run dev
```

2. `http://localhost:3000` にアクセス

3. **語録生成を試す**：
   - 入力欄に何か入力（例：「今日は調子が悪い」）
   - 「生成」ボタンをクリック
   - 生成が成功したら、自動保存されます

4. **Supabaseでデータ確認**：
   - Supabaseダッシュボード → **Table Editor** → `quotes`テーブル
   - 生成した語録が表示されているか確認
   - `created_at`が正しく設定されているか確認

### 3. 本番環境での動作確認

1. `https://bigma.jp` にアクセス
2. 語録生成を試す
3. Supabaseダッシュボードでデータ確認

### 4. 機能テスト

以下を順番にテストしてください：

#### ✅ 語録生成・保存
- [ ] 入力欄にテキストを入力
- [ ] 「生成」ボタンをクリック
- [ ] 生成結果が表示される
- [ ] Supabaseに保存されている（Table Editorで確認）

#### ✅ いいね機能
- [ ] 生成した語録の「いいね」ボタンをクリック
- [ ] いいね数が増える
- [ ] Supabaseで`likes`カラムが更新されている

#### ✅ ランキング機能
- [ ] 「新着」タブで最新順に表示される
- [ ] 「月間」タブで過去30日以内のデータが表示される（`created_at`使用）
- [ ] 「累計」タブでスコア順に表示される

### 5. エラーチェック

動作しない場合、以下を確認：

1. **ブラウザのコンソール**
   - F12キー → Consoleタブ
   - エラーメッセージを確認

2. **Vercelのログ**
   - Vercelダッシュボード → **Functions** タブ
   - APIエンドポイントのログを確認

3. **Supabaseのログ**
   - Supabaseダッシュボード → **Logs**
   - APIリクエストのログを確認

## 🐛 トラブルシューティング

### エラー: "Supabase is not configured"
- `.env.local`に環境変数が正しく設定されているか確認
- Vercelの環境変数が正しく設定されているか確認
- 環境変数名が `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` であることを確認

### エラー: "Failed to load quotes from Supabase"
- SupabaseのProject URLとAPI Keyが正しいか確認
- RLS（Row Level Security）ポリシーが正しく設定されているか確認
- Supabaseダッシュボードでテーブルが存在するか確認

### データが表示されない
- `base_quotes.json`のデータはSupabaseには移行されません（ファイルベースのまま）
- ユーザー生成データのみがSupabaseに保存されます
- まず語録を生成してから確認してください

### 月間ランキングが表示されない
- `created_at`が正しく設定されているか確認（SupabaseのTable Editorで確認）
- 過去30日以内のデータが存在するか確認

---

**次のステップ**: 動作確認が完了したら、データ移行（既存の`data/quotes.json`をSupabaseに移行）を検討できます。

