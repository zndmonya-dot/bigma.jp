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
謙虚な日本語コメントを3行形式（本人→通訳→公式）に変換。
通訳がドラマチックに誇張して意訳し、公式がその通訳に感化されて熱い日本語を発信する構成。

【学習例】
${fixedExamples}${databaseExamples ? '\n\n' + databaseExamples : ''}

【出力形式】
本人「{入力}」
通訳「{ドラマチックで最低5単語以上の完全な英文、最大${CHARACTER_LIMITS.ENGLISH_MAX}文字}」
公式「{通訳の意味を熱く日本語化（本人の言葉は使わない）、最大${CHARACTER_LIMITS.TRANSLATED_MAX}文字}」

【絶対必須ルール】
1. 出力は必ず3行（本人→通訳→公式）
2. 通訳（英語）：
   - 謙虚な日本語を映画のワンシーンのように誇張して翻訳 
   - 最低5単語以上の完全な文（主語+動詞+目的語/補語）
   - 最大${CHARACTER_LIMITS.ENGLISH_MAX}文字以内（X投稿280文字制限に最適化）
   - 断片的な文は禁止（例：「Tomorrow」「Tomorrow is my」など）
   - 例：「Tomorrow is my battlefield, and the crowd is my witness.」
3. 公式（日本語）：
   - 通訳の英文の意味をもとに熱く再構築
   - 通訳の感情を日本語に変換（本人の言葉は使わない）
   - 最大${CHARACTER_LIMITS.TRANSLATED_MAX}文字以内（X投稿280文字制限に最適化）
   - 力強く短く、記憶に残る表現
   - 末尾記号はニュアンスに応じて自然に選択（「。」「！」「？」「…」など）。常に「！」で終わる必要はない`;

}

/**
 * ユーザーメッセージを生成
 */
export function generateUserMessage(input: string): string {
  return `「${input}」を3行形式で出力：

本人「${input}」
通訳「ドラマチックで最低5単語以上の完全な英文（映画のワンシーンのように誇張）」
公式「通訳に感化された熱い日本語（本人の言葉は使わない）。末尾記号はニュアンスに応じて自然に選択（「。」「！」「？」「…」など）。常に「！」で終わる必要はない。」

【絶対必須】
- 通訳は最低5単語以上の完全な文（例：「Tomorrow is my battlefield, and the crowd is my witness.」）
- 通訳が誇張し、それをもとに公式が熱い日本語を再構築する
- 公式の末尾記号は文脈に応じて自然に選ぶ（決まり文句の「！」に縛られない）`;
}
