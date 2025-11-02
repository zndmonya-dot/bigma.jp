# デプロイ手順 - Bigma

## ✅ GitHubへのプッシュ完了

- リポジトリ: https://github.com/zndmonya-dot/Bigma.git
- ブランチ: main
- コミット: 完了

## 🚀 Vercelでのデプロイ手順

### Step 1: Vercelにログイン

1. https://vercel.com にアクセス
2. GitHubアカウントでログイン（推奨）

### Step 2: 新規プロジェクト作成

1. ダッシュボードの「Add New Project」をクリック
2. リポジトリをインポート:
   - 「Import Git Repository」をクリック
   - `zndmonya-dot/Bigma` を検索して選択
   - 「Import」をクリック

### Step 3: プロジェクト設定

1. **Project Name**: 以下から選択（必須：小文字のみ、100文字以下、使用可能な文字: 小文字、数字、`.`, `_`, `-`のみ）
   - 推奨: `bigma-app`（既に使用されている場合は以下を試してください）
   - 代替案:
     - `bigma-web`
     - `bigma-generator`
     - `bigma-quotes`
     - `bigma-2025`
     - `big-mouth-generator`
     - `bigma-site`
   - ✅ 正しい例: `bigma-app`, `bigma-web`, `bigma_2025`
   - ❌ 間違った例: `Bigma`（大文字は使用不可）, `Bigma-App`（大文字は使用不可）
   
   **注意**: 「The specified name is already used」というエラーが出た場合は、上記の代替案から別の名前を選択してください。
2. **Framework Preset**: `Next.js`（自動検出されるはず）
3. **Root Directory**: `./`（デフォルト）
4. **Build Command**: `next build`（デフォルト）
5. **Output Directory**: `.next`（デフォルト）

### Step 4: 環境変数の設定

**重要**: デプロイ前に環境変数を設定してください。

1. 「Environment Variables」セクションを開く
2. 以下の環境変数を追加:

#### 必須環境変数

- **Name**: `OPENAI_API_KEY`
- **Value**: 本番用のOpenAI APIキー（`sk-...`）
- **Environment**: ✅ Production, ✅ Preview, ✅ Development すべてにチェック
- 「Add」をクリック

#### 任意環境変数（広告を表示する場合のみ）

- **Name**: `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID`
- **Value**: Google AdSenseクライアントID（`ca-pub-...`）
- **Environment**: ✅ Production, ✅ Preview, ✅ Development すべてにチェック
- 「Add」をクリック

### Step 5: デプロイ実行

1. 「Deploy」ボタンをクリック
2. ビルドログを確認（2-3分かかります）
3. デプロイ完了後、本番URLが表示されます
   - 例: `https://bigma.vercel.app`

### Step 6: 本番環境での動作確認

デプロイ完了後、以下の機能をテストしてください：

- [ ] メインページが正常に表示される
- [ ] 語録生成が正常に動作する
- [ ] 自動保存が正常に動作する
- [ ] いいね機能が正常に動作する
- [ ] X投稿機能が正常に動作する
- [ ] タブ機能（新着・月間・累計）が正常に動作する
- [ ] 打線ランキングが正常に表示される
- [ ] 免責事項ページ（`/legal`）が正常に表示される
- [ ] フッターが正常に表示される
- [ ] レスポンシブデザインが正常に動作する
- [ ] ダークモードが正常に動作する

## 🔧 トラブルシューティング

### ビルドエラーが出る場合

1. ビルドログを確認
2. エラーメッセージを確認
3. 環境変数が正しく設定されているか確認

### 環境変数エラーが出る場合

1. Vercelの設定画面で環境変数を確認
2. 環境変数名が正しいか確認（大文字・小文字を含む）
3. すべての環境（Production, Preview, Development）に設定されているか確認

### OpenAI APIエラーが出る場合

1. APIキーが正しく設定されているか確認
2. OpenAIアカウントのクレジット残高を確認
3. 支払い方法が設定されているか確認
4. `OPENAI_SETUP.md` を参照

## 📝 次のステップ

デプロイ完了後は：

1. **モニタリング設定**
   - Vercelのダッシュボードでアクセス状況を確認
   - OpenAIの使用量ダッシュボードを確認

2. **カスタムドメイン設定**（任意）
   - Vercelの設定画面からカスタムドメインを追加可能

3. **継続的な改善**
   - ユーザーフィードバックを収集
   - エラーログを定期的に確認
   - パフォーマンスを最適化

## 🔗 関連リンク

- **GitHubリポジトリ**: https://github.com/zndmonya-dot/Bigma.git
- **Vercelダッシュボード**: https://vercel.com/dashboard
- **OpenAI Platform**: https://platform.openai.com

---

**デプロイ完了後、本番URLを確認して動作確認を行ってください！**

