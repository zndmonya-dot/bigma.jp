# DNSレコード設定 - 今すぐやること

## 🎯 現在の状態

✅ ネームサーバー: 正しく設定されている（ns1.vercel-dns.com, ns2.vercel-dns.com）  
❌ DNSレコード: まだ設定されていない（古いIPアドレスが返ってきている）

## 📝 今すぐVercelダッシュボードで設定してください

### Step 1: Vercelダッシュボードを開く

1. https://vercel.com にアクセス
2. ログイン
3. **「bigma」プロジェクト**をクリック
4. **Settings** → **Domains** を開く
5. **`bigma.jp`** をクリック

### Step 2: Configurationセクションを確認

`bigma.jp` の詳細画面で、**Configuration** セクションを確認してください。

以下のような表示があるはずです：

```
Configuration

Add the following DNS record to your DNS provider:

Type: A
Name: @
Value: 76.76.21.21
```

または

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### Step 3: DNSレコードを設定

**パターンA: 「Configure DNS」ボタンがある場合**

1. **「Configure DNS」** ボタンをクリック
2. Vercelが自動でDNSレコードを設定します

**パターンB: 手動設定が必要な場合**

1. **「DNS Records」** または **「Add Record」** をクリック
2. Vercelが表示するDNSレコードを追加：
   - Type: A（またはCNAME）
   - Name: @（または空白）
   - Value: Vercelが表示する値

### Step 4: 設定後の確認

1. **数分待つ**（即座に反映されます）
2. Vercelダッシュボードで **「Valid Configuration」** と表示されれば完了

### Step 5: コマンドラインで確認

DNSレコード設定後、以下で確認：

```cmd
nslookup bigma.jp
```

正しく設定されていれば、VercelのIPアドレスが返ってくるはずです。

## ⚠️ 重要なポイント

- ネームサーバーは正しく設定されています
- あとは **VercelダッシュボードでDNSレコードを設定するだけ** です
- DNSレコードの設定は **即座に反映** されます

---

## 📸 確認したい情報

Vercelダッシュボードで以下を確認してください：

1. **Configurationセクション**に何が表示されていますか？
2. **Aレコード** と **CNAMEレコード** どちらを推奨していますか？
3. **表示されているIPアドレスまたはCNAME値**は何ですか？

この情報を共有いただければ、より具体的な手順を案内できます！

