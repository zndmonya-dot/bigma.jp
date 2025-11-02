# ネームサーバー設定完了後の確認手順 - bigma.jp

## ✅ ネームサーバー変更完了

お名前.comでネームサーバーをVercelのものに変更されたとのこと、正しい設定です！

## 🔍 次のステップ：確認と設定

### Step 1: DNS設定の反映を待つ

ネームサーバーの変更は反映まで**数分〜48時間**かかることがあります（通常は数分〜数時間）。

### Step 2: DNS設定の確認

以下のコマンドで、ネームサーバーが正しく変更されているか確認：

```cmd
nslookup -type=NS bigma.jp
```

Vercelのネームサーバーが表示されればOKです。

### Step 3: VercelでDNSレコードを設定

ネームサーバーをVercelに変更した場合、**VercelダッシュボードでDNSレコードを設定**する必要があります：

1. **Vercelダッシュボード** → **Settings** → **Domains**
2. `bigma.jp` をクリック
3. **DNS Records** セクションで以下を設定：

#### ルートドメイン（bigma.jp）の場合

**Aレコード**を追加：
```
Type: A
Name: @
Value: 76.76.21.21（またはVercelが表示するIPアドレス）
```

または**CNAMEレコード**：
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com（Vercelが表示する値）
```

#### wwwサブドメイン（www.bigma.jp）も設定する場合

**CNAMEレコード**を追加：
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com（Vercelが表示する値）
```

### Step 4: Vercelダッシュボードで確認

1. Vercelダッシュボード → **Settings** → **Domains** → `bigma.jp`
2. **Configuration** セクションで **「Valid Configuration」** と表示されれば完了
3. **SSL Certificate** が **「Valid」** と表示されれば完了（数分〜数時間かかります）

### Step 5: アクセステスト

DNS設定が反映されたら（通常数分〜数時間）：

1. https://bigma.jp でアクセス可能か確認
2. SSL証明書が正しく発行されているか確認（鍵マークが表示される）

## ⏰ 反映時間の目安

- **ネームサーバーの変更**: 数分〜48時間（通常は数分〜数時間）
- **DNSレコードの設定**: 即座に反映される（VercelのDNSを使用している場合）
- **SSL証明書の発行**: 数分〜数時間

## 🔧 トラブルシューティング

### 「Invalid Configuration」が続く場合

1. **DNS設定の反映を待つ**（最大48時間）
2. **VercelダッシュボードでDNSレコードが正しく設定されているか確認**
3. **Vercelダッシュボードで「Refresh」をクリック**

### nslookupで古いIPアドレスが返ってくる場合

1. **DNSキャッシュをクリア**:
   ```cmd
   ipconfig /flushdns
   ```
2. **時間をおいて再度確認**（DNSキャッシュの影響で反映が遅れる場合があります）

### SSL証明書が発行されない場合

1. **DNS設定が正しく反映されているか確認**
2. **Vercelダッシュボードで「Valid Configuration」と表示されているか確認**
3. **時間をおいて再度確認**（SSL証明書の発行には数分〜数時間かかります）

## ✅ 正常な状態の確認

以下の状態になれば成功です：

1. ✅ nslookupでVercelのネームサーバーが表示される
2. ✅ Vercelダッシュボードで「Valid Configuration」と表示される
3. ✅ Vercelダッシュボードで「SSL Certificate: Valid」と表示される
4. ✅ https://bigma.jp でアクセス可能
5. ✅ 自動的にHTTPSリダイレクトが機能する

---

## 🎯 現在の状態確認

ネームサーバーの変更が完了したら：

1. **数分〜数時間待つ**（DNS設定の反映を待つ）
2. **Vercelダッシュボードで「Refresh」をクリック**
3. **「Valid Configuration」と表示されるか確認**

まだ「Invalid Configuration」と表示される場合は、DNS設定の反映を待つ必要があります（最大48時間）。

反映され次第、Vercelダッシュボードで自動的に「Valid Configuration」に変わり、SSL証明書も自動で発行されます。

