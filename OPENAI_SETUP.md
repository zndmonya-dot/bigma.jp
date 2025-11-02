# OpenAI API設定ガイド

## エラー：利用可能量に達したか、アカウントの支払いが無効です

このエラーが表示される場合、以下のいずれかの問題が発生しています：

1. **クレジット残高が不足している**
2. **支払い方法が設定されていない**
3. **APIキーが無効になっている**

## 対処方法

### 1. 支払い方法の設定

1. [OpenAI Platform - Billing](https://platform.openai.com/account/billing) にアクセス
2. 「Add payment method」をクリック
3. クレジットカード情報を入力
4. 保存を確認

### 2. クレジット残高の確認

1. [OpenAI Platform - Usage](https://platform.openai.com/account/usage) にアクセス
2. 現在のクレジット残高を確認
3. 不足している場合は、上記の支払い方法から追加

### 3. APIキーの確認

1. [OpenAI Platform - API Keys](https://platform.openai.com/api-keys) にアクセス
2. 使用中のAPIキーが有効か確認
3. 無効になっている場合は、新しいAPIキーを作成
4. `.env.local` ファイルを更新：

```env
OPENAI_API_KEY=sk-新しいAPIキー
```

### 4. 環境変数の確認

プロジェクトルートに `.env.local` ファイルが存在し、正しく設定されているか確認：

```env
OPENAI_API_KEY=sk-...
```

開発サーバーを再起動：

```bash
npm run dev
```

## よくある問題

### Q: 支払い方法を設定したのに、まだエラーが出る

A: 支払い方法の設定から反映まで数分かかる場合があります。数分待ってから再度お試しください。

### Q: クレジット残高は十分なのに、エラーが出る

A: APIキーが正しく設定されているか確認してください。`.env.local` ファイルの内容を確認し、開発サーバーを再起動してください。

### Q: 新しいAPIキーを作成したが、動作しない

A: `.env.local` ファイルを更新した後、必ず開発サーバーを再起動してください。環境変数は起動時に読み込まれます。

## サポート

問題が解決しない場合は、以下を確認してください：

- [OpenAI Platform Status](https://status.openai.com/) - サービス状態
- [OpenAI Documentation](https://platform.openai.com/docs) - 公式ドキュメント
- [OpenAI Community](https://community.openai.com/) - コミュニティフォーラム

