/**
 * AI生成用プロンプト生成ロジック
 */

import { CHARACTER_LIMITS } from './constants';

/**
 * システムプロンプトを生成
 */
export function generateSystemPrompt(examplesSection: string): string {
  // 最小限の3個の例（Miniモデル用に軽量化）
  const fixedExamples = `本人「いや、特別なことはしてないです。見て感じてもらえたら嬉しいです。」
通訳「Hey Cole, take notes. This is how it's done.」
公式「コール、メモを取っとけよ」

本人「勝ち負けじゃなくて、常にベストを尽くすだけです。」
通訳「Defeat is not an option for me.」
公式「負けという選択肢はない」

本人「自分に任せてもらえたら、全力で応えたいだけです。」
通訳「Putting me on the mound is the best move you can make.」
公式「俺を出すことが最善の選択肢だ」`;

  // データベース例は最大2個まで追加（軽量化）
  const databaseExamples = examplesSection && examplesSection.trim()
    ? examplesSection.split('\n\n').slice(0, 2).join('\n\n')
    : '';

  return `【役割】
謙虚な日本語コメントを3行形式（本人→通訳→公式）に変換

【学習例】
${fixedExamples}${databaseExamples ? '\n\n' + databaseExamples : ''}

【出力形式】
本人「{入力}」
通訳「{完結した英文、最低5単語以上、完全な文で終わる、ハリウッド風に誇張}」
公式「{熱い日本語、園田通訳の意味から生成}」

【絶対必須ルール】
1. 出力は3行構成（本人→通訳→公式）
2. 通訳（英語）：
   - 最低5単語以上の完全な文（主語+動詞+目的語/補語）
   - 短い断片表現は禁止
   - 謙虚な内容を誇張して翻訳（例：緊張→battlefield / destiny awaits）
   - 毎回異なる語彙を使う（繰り返し禁止）
3. 公式（日本語）：
   - 通訳の英語の意味をもとに日本語化
   - 本人の言葉は使わない
   - 熱く、力強く、短く印象的に`;

}

/**
 * ユーザーメッセージを生成
 */
export function generateUserMessage(input: string): string {
  return `「${input}」を3行形式で出力：

本人「${input}」
通訳「完結した英文（最低5単語以上、完全な文で終わる、誇張）」
公式「熱い日本語（園田通訳から生成、本人の言葉は使わない）」

【絶対必須】
- 通訳は必ず最低5単語以上の完全な文
- 学習例を参照し、毎回異なる表現を使う`;
}
