# Vercel DNSレコード設定ガイド - bigma.jp

## ✅ ネームサーバー設定完了

ネームサーバーが正しくVercelに変更されています！

## 📝 次のステップ：VercelでDNSレコードを設定

### Step 1: Vercelダッシュボードを開く

1. https://vercel.com にアクセス
2. プロジェクト（bigma）を選択
3. **Settings** → **Domains** を開く
4. `bigma.jp` をクリック

### Step 2: DNSレコードを確認

**Configuration** セクションに、Vercelが推奨するDNSレコードが表示されているはずです。

通常、以下のいずれかが表示されます：

#### パターンA: Aレコード

```
Type: A
Name: @
Value: 76.76.21.21（または他のVercelのIPアドレス）
```

#### パターンB: CNAMEレコード

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com（Vercelが推奨するCNAME）
```

### Step 3: DNSレコードを自動設定（推奨）

もし **「Configure DNS」** または **「Add DNS Records」** ボタンが表示されている場合、それをクリックすると自動で設定されます。

### Step 4: 手動でDNSレコードを設定する場合

Vercelダッシュボードで手動設定が必要な場合：

1. **DNS Records** セクションを開く
2. **Add Record** をクリック

#### ルートドメイン（bigma.jp）の場合

**Aレコード**を追加：
```
Type: A
Name: @（または空白）
Value: 76.76.21.21（Vercelが表示するIPアドレス）
```

または **CNAMEレコード**：
```
Type: CNAME
Name: @（または空白）
Value: cname.vercel-dns.com（Vercelが表示する値）
```

#### wwwサブドメイン（www.bigma.jp）も追加する場合

**CNAMEレコード**を追加：
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com（Vercelが表示する値）
```

### Step 5: 設定の確認

DNSレコードを設定したら：

1. **数分待つ**（即座に反映されます）
2. Vercelダッシュボードで **「Valid Configuration」** と表示されれば完了
3. **SSL Certificate** が **「Valid」** と表示されれば完了（数分〜数時間かかります）

### Step 6: アクセステスト

1. https://bigma.jp でアクセス可能か確認
2. SSL証明書が正しく発行されているか確認（鍵マークが表示される）
3. 自動的にHTTPSリダイレクトが機能するか確認

## ⏰ 反映時間の目安

- **DNSレコードの設定**: 即座に反映される
- **SSL証明書の発行**: 数分〜数時間

## ✅ 正常な状態の確認

以下の状態になれば成功です：

1. ✅ nslookupでVercelのネームサーバーが表示される（完了）
2. ✅ VercelダッシュボードでDNSレコードが正しく設定されている
3. ✅ Vercelダッシュボードで「Valid Configuration」と表示される
4. ✅ Vercelダッシュボードで「SSL Certificate: Valid」と表示される
5. ✅ https://bigma.jp でアクセス可能
6. ✅ 自動的にHTTPSリダイレクトが機能する

---

## 🎯 現在の状態

✅ ネームサーバーの設定: 完了  
⏳ DNSレコードの設定: これから設定  
⏳ SSL証明書の発行: DNSレコード設定後  

VercelダッシュボードでDNSレコードを設定してください！

