# ドメイン設定ガイド - bigma.jp

## 📋 ドメイン設定方法の比較

### 方法1: Vercelで直接設定（推奨）

**メリット:**
- ✅ 設定がシンプル
- ✅ SSL証明書が自動で発行・更新される
- ✅ VercelのCDNが自動で有効化される
- ✅ DNS設定が簡単（VercelのDNSを使用）

**デメリット:**
- ❌ Cloudflareの追加機能（DDoS保護など）は使用不可

### 方法2: Cloudflare経由で設定

**メリット:**
- ✅ CloudflareのCDN・セキュリティ機能が使える
- ✅ DDoS保護
- ✅ より細かい設定が可能
- ✅ Cloudflareのキャッシュ機能

**デメリット:**
- ❌ 設定が少し複雑（2段階設定が必要）
- ❌ VercelとCloudflareの両方を設定する必要がある

## 🎯 推奨: Vercelで直接設定

BigmaのようなWebアプリケーションの場合、**Vercelで直接設定する方が簡単でおすすめ**です。

理由:
- VercelのCDNで十分なパフォーマンスが得られる
- SSL証明書が自動で管理される
- 設定が簡単

## 📝 Vercelでのドメイン設定手順

### Step 1: Vercelダッシュボードを開く

1. https://vercel.com にアクセス
2. プロジェクトのダッシュボードを開く

### Step 2: ドメインを追加

1. **Settings** → **Domains** を開く
2. **Add Domain** をクリック
3. `bigma.jp` を入力して **Add** をクリック

### Step 3: DNS設定（ドメイン取得元で設定）

Vercelが提供するDNSレコードを、ドメイン取得元（例：お名前.com、ムームードメインなど）のDNS設定で追加します。

#### パターン1: ルートドメイン（bigma.jp）の場合

Vercelが表示する以下のレコードを追加：

**Aレコード:**
```
Type: A
Name: @（または空白）
Value: 76.76.21.21（Vercelが表示するIPアドレス）
```

**または CNAMEレコード:**
```
Type: CNAME
Name: @（または空白）
Value: cname.vercel-dns.com（Vercelが表示するCNAME）
```

**注意**: ドメイン取得元によっては、ルートドメイン（@）にCNAMEを設定できない場合があります。その場合はAレコードを使用してください。

#### パターン2: サブドメイン（www.bigma.jp）の場合

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com（Vercelが表示するCNAME）
```

### Step 4: DNS設定の反映確認

1. DNS設定を変更後、**最大48時間**（通常は数分〜数時間）で反映されます
2. Vercelダッシュボードで「Valid Configuration」と表示されれば完了

### Step 5: SSL証明書の自動発行

- Vercelが自動でSSL証明書を発行します（数分〜数時間）
- 「SSL Certificate」が「Valid」と表示されれば完了

## 🌐 Cloudflare経由で設定する場合（オプション）

Cloudflareを使用する場合は、以下の手順になります：

### Step 1: Cloudflareにドメインを追加

1. https://cloudflare.com にアクセス
2. アカウントを作成（無料プランで可）
3. 「Add a Site」をクリック
4. `bigma.jp` を入力
5. プランを選択（Free プランで可）

### Step 2: ネームサーバーを変更

Cloudflareから提供されるネームサーバーを、ドメイン取得元のネームサーバー設定で変更します。

例:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

### Step 3: CloudflareでDNSレコードを設定

1. Cloudflareダッシュボード → **DNS** → **Records**
2. 以下のレコードを追加：

**ルートドメインの場合:**
```
Type: A
Name: @
Content: 76.76.21.21（Vercelが提供するIPアドレス）
Proxy status: Proxied（オレンジの雲のアイコン）
```

**または CNAME:**
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com（Vercelが提供するCNAME）
Proxy status: Proxied（オレンジの雲のアイコン）
```

**サブドメイン（www）の場合:**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com（Vercelが提供するCNAME）
Proxy status: Proxied（オレンジの雲のアイコン）
```

### Step 4: Vercelでドメインを追加

1. Vercelダッシュボード → **Settings** → **Domains**
2. `bigma.jp` と `www.bigma.jp` を追加

### Step 5: Cloudflareの設定（オプション）

- **SSL/TLS**: Full（strict）モードに設定
- **Always Use HTTPS**: ONにすることを推奨
- **Caching**: 適切なキャッシュ設定

## ⚙️ Cloudflareを使うべき場合

以下の場合、Cloudflareを使うことを検討してください：

1. **より強力なDDoS保護が必要**
2. **世界中からのアクセスが多い**
3. **セキュリティ機能（WAF）が必要**
4. **より細かいキャッシュ制御が必要**
5. **無料でより高度な機能を使いたい**

## 🎯 Bigmaの場合の推奨

**まずはVercelで直接設定することをおすすめします。**

理由:
- 設定が簡単
- VercelのCDNで十分なパフォーマンス
- SSL証明書が自動管理
- トラブルシューティングが簡単

将来的にCloudflareの機能が必要になったら、後から追加できます。

## 📋 設定後の確認事項

1. **DNS設定が正しいか確認**
   ```bash
   # コマンドラインで確認
   nslookup bigma.jp
   # または
   dig bigma.jp
   ```

2. **SSL証明書が有効か確認**
   - https://bigma.jp でアクセス可能か確認

3. **リダイレクト設定**
   - `www.bigma.jp` → `bigma.jp` へのリダイレクトを設定（Vercelで自動設定可能）

## 🔧 トラブルシューティング

### DNS設定が反映されない

- 最大48時間かかる場合があります
- DNSキャッシュをクリア: `ipconfig /flushdns`（Windows）

### SSL証明書が発行されない

- DNS設定が正しく反映されているか確認
- Vercelダッシュボードで「Valid Configuration」と表示されているか確認

### Cloudflare経由でエラーが出る場合

- SSL/TLSモードを「Full」に設定
- Vercelのドメイン設定で正しいCNAMEが設定されているか確認

---

## 💡 まとめ

**推奨: Vercelで直接設定**

1. シンプルで簡単
2. 自動でSSL証明書が管理される
3. VercelのCDNで十分なパフォーマンス

Cloudflareは後から追加することも可能です。まずはVercelで設定して、必要に応じてCloudflareを検討してください。

