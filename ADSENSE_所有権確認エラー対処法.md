# Google AdSense 所有権確認エラー対処法

## エラーメッセージ

> 「お客様のサイトは確認できませんでした」
> 「サイトの所有権を確認できませんでした。サイトの変更内容を公開し、Google AdSense クローラがアクセスできるようにしてください。」

---

## ✅ 対処完了

以下のファイルを作成・更新しました：

1. **`public/robots.txt`** - クローラーがサイトをインデックスできるように設定
2. **`app/sitemap.ts`** - サイトマップ生成
3. **`app/layout.tsx`** - robotsメタタグを追加

---

## 📋 追加で確認すべき項目

### 1. ads.txtファイルの作成（重要！）

Google AdSenseでは、広告ネットワークの正規性を証明するために`ads.txt`ファイルが必要です。

**作成方法:**

1. `public/ads.txt` ファイルを作成
2. 以下の内容を記述：

```
google.com, pub-4335284954366086, DIRECT, f08c47fec0942fa0
```

**注意**: Publisher IDは `pub-4335284954366086` を使用してください。

### 2. DNSプロパゲーション待機

DNSの変更が完全に反映されるまで、最大48時間かかることがあります。

- `nslookup bigma.jp` でIPアドレスを確認
- 全てのDNSサーバーで `bigma.jp` がVercelのIPアドレスに解決されているか確認

### 3. サイトの公開状態確認

以下の項目を確認：

- [ ] `https://bigma.jp` にアクセスできる
- [ ] SSL証明書が有効（https://）
- [ ] パスワード保護がない
- [ ] メンテナンスモードではない
- [ ] ロボットがサイトをブロックしていない

### 4. AdSenseコードの確認

- [ ] AdSenseコードが正しく埋め込まれている
- [ ] 複数のAdSenseコードが重複していない
- [ ] エラーメッセージがない

### 5. サイトマップの確認

- [ ] `/sitemap.xml` にアクセスできる
- [ ] `/robots.txt` にアクセスできる

---

## 🔧 次のステップ

### ads.txt の作成

以下のコマンドで作成：

```bash
echo google.com, pub-4335284954366086, DIRECT, f08c47fec0942fa0 > public/ads.txt
```

または手動で作成：

1. `public/ads.txt` ファイルを作成
2. 以下の1行を記述：
   ```
   google.com, pub-4335284954366086, DIRECT, f08c47fec0942fa0
   ```

### デプロイ

ads.txtを作成したら：

```bash
git add public/ads.txt
git commit -m "Add ads.txt for AdSense verification"
git push
```

---

## ⏰ 時間

以下を考慮：

1. **DNSプロパゲーション**: 最大48時間
2. **ads.txt反映**: 数時間〜24時間
3. **AdSenseクローラー**: 数時間〜数日

**推奨**: 24〜48時間待ってから再度申請を試してください。

---

## 📞 それでも確認できない場合

以下のオプションがあります：

1. **HTMLタグによる確認**
   - AdSense提供のHTMLタグを `<head>` に追加
   - AdSenseダッシュボードでHTMLタグを取得

2. **Google Search Console連携**
   - Search Consoleでサイトを所有権確認
   - AdSenseでSearch Console認証を使用

3. **AdSenseサポート問い合わせ**
   - サポートフォーラムで質問
   - 直接サポートに連絡

---

**まずはads.txtを作成して再デプロイしてください！**

