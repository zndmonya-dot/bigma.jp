export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          免責事項・利用規約
        </h1>
        
        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">重要な免責事項</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white">1. 本サービスについて</h3>
            <p className="mb-4">
              Bigma（以下「本サービス」）は、エンターテインメント目的のAIジェネレーターサービスです。本サービスが生成するすべてのコンテンツは、<strong>実際の発言や事実を反映したものではありません</strong>。
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white">2. 生成されるコンテンツについて</h3>
            <p className="mb-4">
              本サービスで生成されるすべての「語録」は以下の通りです：
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>本人「〇〇」</strong>: 「言いそうな言葉」を創作したネタ（<strong>実際の発言ではありません</strong>）</li>
              <li><strong>通訳「英語」</strong>: 映画的な誇張を交えた意訳（<strong>実在の通訳ではありません</strong>）</li>
              <li><strong>公式「△△」</strong>: 上記の通訳に感化された体の短い日本語文（<strong>実在の公式コメントではありません</strong>）</li>
            </ul>
            <p className="mb-4 font-bold text-red-600 dark:text-red-400">
              <strong>本サービスは、特定の人物の実際の発言、通訳、公式コメントを提供するものではありません。</strong>
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white">3. 免責事項</h3>
            <p className="mb-4">
              本サービスの運営者（以下「当方」）は、以下の事項について一切の責任を負いません：
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>事実誤認・誤解を招く可能性</strong>: 本サービスが生成するコンテンツは、エンターテインメント目的であり、事実や実際の発言を反映したものではありません。本サービスのコンテンツを真実や事実として解釈・利用したことによるいかなる損害についても責任を負いません。</li>
              <li><strong>名誉毀損・プライバシーの侵害</strong>: 本サービスは特定の人物や団体を誹謗中傷する意図はありませんが、本サービスのコンテンツが誤解を招く可能性があることをご理解ください。本サービスのコンテンツによる名誉毀損・プライバシー侵害の訴えについて、当方は一切の責任を負いません。</li>
              <li><strong>サービスの中断・変更・終了</strong>: 当方は事前の通知なく、本サービスの内容を変更、中断、または終了することができます。サービス中断・終了によるいかなる損害についても責任を負いません。</li>
              <li><strong>技術的な問題</strong>: 本サービスはAI技術を使用しており、生成されるコンテンツの正確性・適切性を保証するものではありません。サービスが利用できない、またはエラーが発生した場合のいかなる損害についても責任を負いません。</li>
              <li><strong>第三者による利用</strong>: 本サービスのコンテンツを第三者（SNS、メディア、他のウェブサイトなど）が利用したことによるいかなる問題についても責任を負いません。</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white">4. 利用規約</h3>
            
            <h4 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-white">4.1 利用条件</h4>
            <p className="mb-4">
              本サービスを利用することにより、以下の利用規約に同意したものとみなされます。
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-white">4.2 禁止事項</h4>
            <p className="mb-2">以下の行為を禁止します：</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>違法行為・公序良俗に反する行為</strong>: 本サービスを違法行為に利用すること、公序良俗に反するコンテンツを生成・投稿すること</li>
              <li><strong>特定の人物への誹謗中傷</strong>: 特定の人物を誹謗中傷する目的で本サービスを利用すること</li>
              <li><strong>不適切なコンテンツの生成</strong>: 卑猥な言葉、不適切な表現、暴力的な内容を含むコンテンツを生成すること</li>
              <li><strong>サービスの悪用</strong>: 本サービスを悪用して、他人に迷惑をかけること、システムに不正にアクセスすること</li>
              <li><strong>個人情報の入力</strong>: 氏名、住所、電話番号、メールアドレス、アカウントID、顔写真・音声・位置情報、その他本人を特定できる情報の入力・投稿を禁止します</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-white">4.3 生成コンテンツの取り扱い</h4>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>本サービスで生成されたコンテンツの著作権は、生成したユーザーに帰属します</li>
              <li>生成したコンテンツをSNSや他のプラットフォームで投稿・利用する場合、ユーザー自身の責任で行ってください</li>
              <li><strong>削除について</strong>: 生成されたデータはシステム最適化と安全運用のため保存・キャッシュされます。<u>一度公開・保存されたデータは、原則としてユーザー個別の申請による削除に対応していません</u>（法令上の要請等を除く）。入力内容には十分ご注意ください</li>
            </ul>

            <h3 id="privacy" className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white">5. プライバシーに関する取り扱い</h3>
            
            <h4 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-white">5.1 収集する情報</h4>
            <p className="mb-2">本サービスでは、以下の情報を収集・保存します：</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>生成されたコンテンツ（本人・通訳・公式の各テキスト）</li>
              <li>いいね数（匿名集計）</li>
              <li>IPアドレス（不正防止・レート制限のために一時的に利用）</li>
              <li>ブラウザ情報、デバイス情報（パフォーマンス改善のための統計）</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-white">5.2 情報の利用目的</h4>
            <p className="mb-4">収集した情報は、サービスの提供・運営、統計情報の取得のために使用します。</p>

            <h4 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-white">5.3 Cookie・ローカルストレージ</h4>
            <p className="mb-4">
              本サービスは、ブラウザのローカルストレージを使用して、いいね状態やキャッシュ（ETag・ランキング順）を保持します。Google AdSense は Cookie 等を使用して広告を配信します（詳細は Google のポリシーをご確認ください）。
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-white">5.4 プライバシーに関するお問い合わせ</h4>
            <p className="mb-4">
              プライバシーに関するご質問やご要望は、X（旧Twitter）のDM（ダイレクトメッセージ）にてお願いいたします。
            </p>
            <p className="mb-4">
              <strong>問い合わせ先</strong>: <a href="https://twitter.com/Rasenooon" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline">@Rasenooon</a>
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white">6. 知的財産権について</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>本サービスのコンテンツ（デザイン、ロゴ、機能など）の著作権は、当方に帰属します</li>
              <li>本サービスで生成されたコンテンツの著作権は、生成したユーザーに帰属します</li>
              <li>本サービスは、特定の人物名やイメージを参考にしていますが、それらの知的財産権は各権利者に帰属します</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white">7. 特定の人物に関する取り扱い</h3>
            <p className="mb-4">
              本サービスは、特定の人物に関連するエンターテインメントコンテンツを提供しますが、本サービスが生成するすべてのコンテンツは、<strong>実際の発言や事実を反映したものではありません</strong>。本サービスは、特定の人物の実際の発言、通訳、公式コメントを提供するものではありません。
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white">8. お問い合わせ</h3>
            <p className="mb-4">
              本サービスに関するお問い合わせは、X（旧Twitter）のDM（ダイレクトメッセージ）にてお願いいたします。
            </p>
            <p className="mb-4">
              <strong>問い合わせ先</strong>: <a href="https://twitter.com/Rasenooon" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline">@Rasenooon</a>
            </p>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              ※お問い合わせへの返信は、運営側の都合により遅れる場合があります。また、すべてのお問い合わせに返信できない場合があります。あらかじめご了承ください。
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white">9. 準拠法・管轄裁判所</h3>
            <p className="mb-4">
              本利用規約は、日本法に準拠して解釈されます。本サービスに関する紛争については、当方の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
            </p>

            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-bold">
                本サービスの利用は、上記の免責事項・利用規約に同意したものとみなされます。
              </p>
            </div>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p>最終更新日: 2025年11月5日</p>
              <p className="mt-1">注: X（旧Twitter）およびそのロゴは各社の商標です。本サービスはこれらの企業・団体と提携していません。</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

