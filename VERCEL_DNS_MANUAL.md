# Vercel DNSレコード手動設定ガイド

## 問題点

「Configuration」セクションが表示されない場合、手動でDNSレコードを設定する必要があります。

## 📝 手動設定手順

### Step 1: Vercelダッシュボードを開く

1. https://vercel.com にアクセス
2. プロジェクト（bigma）を選択
3. **Settings** → **Domains** を開く
4. `bigma.jp` をクリック

### Step 2: DNS Recordsセクションを探す

1. **DNS Records** または **Add DNS Records** セクションを探す
2. もし見つからない場合、画面上部の **「DNS」** タブをクリック

### Step 3: DNSレコードを追加

**Add Record** または **Add DNS Record** ボタンをクリックして、以下を設定：

#### ルートドメイン（bigma.jp）の場合

**Aレコード**を追加：
```
Type: A
Name: @
Value: 76.76.21.21
```

または **CNAMEレコード**：
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### Step 4: 別の方法：Settingsタブを確認

もしDNS Recordsが見つからない場合：

1. Settings タブ内の各セクションを確認
2. **Domains** セクションを確認
3. または **DNS Settings** セクションを確認

### Step 5: よくある状況

#### 状況A: ドメインがまだ追加されていない

1. **「Add Domain」** または **「Add a Domain」** ボタンをクリック
2. `bigma.jp` を入力
3. **Add** をクリック

#### 状況B: ネームサーバーを使用する設定になっている

ネームサーバーをVercelに変更した場合、**Vercelが自動でDNSレコードを管理**します。

この場合、追加の設定は不要かもしれません。反映を待ってください。

### Step 6: 反映を確認

1. **数分〜数時間待つ**（ネームサーバー変更後、初めての設定は時間がかかることがあります）
2. Vercelダッシュボードで **「Valid Configuration」** と表示されれば完了
3. コマンドラインで確認：

```cmd
nslookup bigma.jp
```

正しく設定されていれば、VercelのIPアドレスが返ってくるはずです。

---

## 🔍 確認事項

Vercelダッシュボードで以下を確認してください：

1. `bigma.jp` が追加されていますか？
2. どのようなセクションが表示されていますか？
3. 「DNS Records」、「Add Record」、「DNS Settings」などのボタンはありますか？

具体的にどのような画面が表示されているか教えてください。

