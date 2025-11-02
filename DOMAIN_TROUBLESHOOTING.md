# ドメイン設定 トラブルシューティング - bigma.jp

## ⚠️ 「Invalid Configuration」エラーの解決方法

### エラーの意味

「Invalid Configuration」は、VercelがドメインのDNS設定を正しく検証できていないことを示します。

## 🔍 確認手順

### Step 1: Vercelが表示するDNSレコードを確認

1. Vercelダッシュボード → **Settings** → **Domains**
2. `bigma.jp` をクリック
3. **Configuration** セクションで、Vercelが推奨するDNSレコードを確認

通常、以下のいずれかが表示されます：

#### パターン1: CNAMEレコード

```
Type: CNAME
Name: @（または空白）
Value: cname.vercel-dns.com（または Vercelが表示するCNAME）
```

#### パターン2: Aレコード

```
Type: A
Name: @（または空白）
Value: 76.76.21.21（Vercelが表示するIPアドレス）
```

### Step 2: ドメイン取得元でDNS設定を確認

ドメイン取得元（お名前.com、ムームードメイン、GoDaddyなど）のDNS設定画面で、以下を確認してください：

1. **DNSレコードが正しく設定されているか**
2. **レコードタイプが一致しているか**（Aレコード or CNAMEレコード）
3. **レコード名（Name）が正しいか**（@ または空白）
4. **値（Value/Content）が正しいか**（Vercelが表示する値と完全に一致）

### Step 3: DNS設定の反映を確認

DNS設定の変更は、反映まで**数分〜48時間**かかることがあります。

#### コマンドラインで確認（Windows）

```cmd
nslookup bigma.jp
```

または

```cmd
ping bigma.jp
```

#### オンラインツールで確認

- https://dnschecker.org
- https://mxtoolbox.com/DNSLookup.aspx

`bigma.jp` を入力して、DNSレコードが正しく反映されているか確認してください。

## 🔧 解決方法

### 方法1: CNAMEレコードを使用（推奨）

VercelがCNAMEレコードを推奨している場合：

1. **ドメイン取得元のDNS設定画面を開く**
2. **既存のAレコードを削除**（ある場合）
3. **新しいCNAMEレコードを追加:**
   ```
   Type: CNAME
   Name: @（または空白、ルートドメイン）
   Value: cname.vercel-dns.com（Vercelが表示する値）
   TTL: 3600（デフォルト）
   ```

**注意**: 一部のドメイン取得元では、ルートドメイン（@）にCNAMEを設定できません。その場合は方法2を使用してください。

### 方法2: Aレコードを使用

ルートドメイン（@）でCNAMEが使用できない場合：

1. **ドメイン取得元のDNS設定画面を開く**
2. **Aレコードを追加:**
   ```
   Type: A
   Name: @（または空白）
   Value: 76.76.21.21（Vercelが表示するIPアドレス）
   TTL: 3600（デフォルト）
   ```

**複数のAレコードが必要な場合**、Vercelが表示するすべてのIPアドレスを追加してください。

### 方法3: wwwサブドメインを使用

ルートドメイン（@）で設定が難しい場合、まず `www.bigma.jp` で設定：

1. **Vercelで `www.bigma.jp` を追加**
2. **DNS設定:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com（Vercelが表示する値）
   ```
3. **設定後、Vercelでルートドメインを追加**

### 方法4: ネームサーバーをVercelに変更

一部のドメイン取得元では、ネームサーバーをVercelに変更する方法もあります：

1. Vercelダッシュボード → **Settings** → **Domains**
2. `bigma.jp` の設定で、**Use Vercel DNS** を選択
3. Vercelが提供するネームサーバーを確認
4. ドメイン取得元でネームサーバーを変更

## ⏰ DNS設定の反映を待つ

DNS設定を変更した後：

1. **数分〜数時間待つ**（通常は数分〜数十分）
2. Vercelダッシュボードで **「Refresh」** または **「Retry」** をクリック
3. **「Valid Configuration」** と表示されれば完了

## 🔍 よくある問題と解決方法

### 問題1: ルートドメイン（@）でCNAMEが設定できない

**解決方法:**
- Aレコードを使用（方法2）
- または、wwwサブドメインを使用（方法3）

### 問題2: 複数のDNSレコードが設定されている

**解決方法:**
- 不要なレコード（古いAレコードなど）を削除
- Vercelが推奨するレコードのみを残す

### 問題3: DNS設定が反映されない

**解決方法:**
1. DNS設定が正しいか再確認
2. DNSキャッシュをクリア（ブラウザ、ローカルDNS）
3. 別のDNSチェッカーツールで確認
4. 時間をおいて再度確認（最大48時間かかることがあります）

### 問題4: 「Invalid Configuration」が続く

**解決方法:**
1. Vercelのドメイン設定を一度削除して再追加
2. DNS設定を再確認
3. Vercelサポートに問い合わせ

## 📞 サポート

問題が解決しない場合：

1. **Vercelサポート**: https://vercel.com/support
2. **Vercelドキュメント**: https://vercel.com/docs/concepts/projects/domains

## ✅ 正常な状態の確認

以下の状態になれば成功です：

1. Vercelダッシュボードで「Valid Configuration」と表示される
2. SSL証明書が「Valid」と表示される
3. https://bigma.jp でアクセス可能
4. 自動的にHTTPSリダイレクトが機能する

---

## 🎯 次のステップ

DNS設定が正常になれば：

1. **SSL証明書の自動発行を待つ**（数分〜数時間）
2. **https://bigma.jp でアクセス可能か確認**
3. **www.bigma.jp → bigma.jp へのリダイレクト設定**（Vercelで自動設定可能）

---

**現在のDNS設定を確認して、上記の手順に従って設定してください。**

