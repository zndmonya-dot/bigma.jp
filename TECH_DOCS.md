# Bigma 技術ドキュメント

## 概要

Bigma（ビッグマウス語録ジェネレータ）は、控えめな日本語コメントをハリウッド風の誇張された公式コメントに変換するAIジェネレーターです。

## アーキテクチャ

### 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React 19, TypeScript
- **スタイリング**: Tailwind CSS 4
- **AI**: OpenAI GPT-4o-mini
- **ホスティング**: Vercel（推奨）
- **データストレージ**: JSONファイル（`data/quotes.json`）

### ディレクトリ構造

```
yamamoro/
├── app/
│   ├── api/
│   │   ├── generate/route.ts      # AI生成API
│   │   └── quotes/
│   │       ├── add/route.ts       # 語録追加API
│   │       ├── like/route.ts      # いいねAPI
│   │       └── list/route.ts      # 語録一覧API
│   ├── admin/
│   │   └── page.tsx               # 管理画面
│   ├── page.tsx                   # メインページ
│   ├── layout.tsx                 # ルートレイアウト
│   └── globals.css                # グローバルスタイル
├── lib/
│   ├── api-helpers.ts             # API共通ヘルパー
│   ├── constants.ts               # 定数定義
│   ├── prompts.ts                 # プロンプト生成
│   ├── quotes.ts                  # 語録ユーティリティ
│   ├── rate-limit.ts             # レート制限
│   ├── sanitize.ts                # サニタイズ・バリデーション
│   ├── storage.ts                 # ローカルストレージ
│   ├── types.ts                   # TypeScript型定義
│   ├── utils.ts                   # 汎用ユーティリティ
│   └── random-seed.ts             # ランダムシード
├── data/
│   ├── base_quotes.json          # ベース語録（Few-shot学習用）
│   └── quotes.json               # ユーザー生成語録
└── public/
    ├── manifest.json             # PWA設定
    ├── icon-192.svg              # PWAアイコン
    └── icon-512.svg              # PWAアイコン
```

## API設計

### エンドポイント一覧

#### POST `/api/generate`

AI生成エンドポイント

**リクエスト:**
```typescript
{
  input: string; // 最大40文字
}
```

**レスポンス:**
```typescript
{
  success: true;
  data: {
    original: string;   // 本人のコメント
    english: string;     // 通訳（英語）
    translated: string;  // 公式コメント
  };
}
```

**エラー:**
- `400`: 無効な入力
- `429`: レート制限到達
- `500`: サーバーエラー

#### POST `/api/quotes/add`

語録追加エンドポイント

**リクエスト:**
```typescript
{
  original: string;    // 必須、最大40文字
  english?: string;    // 任意、最大30文字
  translated: string;  // 必須、最大50文字
}
```

**レスポンス:**
```typescript
{
  success: true;
  message: string;
}
```

#### POST `/api/quotes/like`

いいねエンドポイント

**リクエスト:**
```typescript
{
  quoteId: number;
  action: 'like' | 'unlike';
}
```

**レスポンス:**
```typescript
{
  success: true;
  data: {
    quoteId: number;
    likes: number;
  };
}
```

#### GET `/api/quotes/list`

語録一覧取得エンドポイント

**レスポンス:**
```typescript
{
  success: true;
  data: {
    metadata: {
      lastUpdated: string;
      baseQuotesCount: number;
      userQuotesCount: number;
    };
    quotes: Quote[];
  };
  count: number;
}
```

## データモデル

### Quote型

```typescript
interface Quote {
  id: number;
  original: string;        // 本人のコメント
  english?: string;         // 通訳（英語）
  translated: string;       // 公式コメント
  likes: number;            // いいね数
  retweets: number;        // リツイート数
  quoteRetweets: number;    // 引用リツイート数
  position?: string;        // ポジション（打線用）
}
```

## セキュリティ

### 実装済み対策

1. **入力サニタイズ**
   - HTMLエスケープ
   - 制御文字の除去
   - `lib/sanitize.ts`で実装

2. **入力バリデーション**
   - 文字数制限
   - 危険なパターンの検出
   - `lib/sanitize.ts`で実装

3. **レート制限**
   - サーバー側: IPベース + グローバル制限
   - クライアント側: localStorageベース
   - `lib/rate-limit.ts`で実装

4. **エラーハンドリング**
   - 詳細なエラー情報をログに記録
   - ユーザーには簡潔なエラーメッセージを表示

## パフォーマンス

### 最適化

1. **Few-shot Learning**: 上位30件の語録をプロンプトに含める
2. **データマージ**: ベース語録とユーザー語録を効率的にマージ
3. **重複チェック**: IDベースで重複を排除

### 制限値

- 入力文字数: 40文字
- 通訳文字数: 30文字
- 公式文字数: 50文字
- 合計出力: 80文字
- 表示上限: 各タブ100位まで

## レート制限

### サーバー側（本番環境のみ）

- **IPベース**: 1時間あたり20リクエスト
- **グローバル**: 1時間あたり100生成

### クライアント側

- **ローカルストレージ**: 1日あたり3生成（開発環境では無制限）

## 環境変数

### 必須

- `OPENAI_API_KEY`: OpenAI APIキー

### 任意

- `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID`: Google AdSenseクライアントID

## デプロイ

### Vercel

1. GitHubリポジトリにプッシュ
2. Vercelにプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

### 本番環境での注意点

- レート制限が有効になる
- ログレベルが制限される（DEBUGログは出力されない）
- OpenAI APIキーの設定が必須

## トラブルシューティング

### よくある問題

1. **OpenAI APIエラー**
   - APIキーが正しく設定されているか確認
   - 請求情報とクォータを確認
   - `OPENAI_SETUP.md`を参照

2. **データ重複**
   - `lib/quotes.ts`の重複チェック機能が動作しているか確認
   - `data/quotes.json`を直接編集しないこと

3. **レート制限エラー**
   - 開発環境では無効になっているか確認
   - 本番環境での制限値が適切か確認

## 開発ガイドライン

### コーディング規約

- TypeScriptの型安全性を維持
- エラーハンドリングは必ず実装
- ログ出力は`lib/api-helpers.ts`の`log`関数を使用
- 共通処理は`lib/api-helpers.ts`のヘルパー関数を使用

### コミット規約

- `feat:` 新機能
- `fix:` バグ修正
- `refactor:` リファクタリング
- `docs:` ドキュメント更新
- `style:` スタイル変更

