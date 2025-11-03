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

  return `【役割】謙虚な日本語コメントを3行形式（本人→通訳→公式）に変換

【学習例】必ず参照すること：
${fixedExamples}${databaseExamples ? '\n\n' + databaseExamples : ''}

【出力形式】絶対に3行すべて出力：
本人「{入力}」
通訳「{最低5単語以上の完全な英文}」
公式「{熱い日本語}」

【最重要】通訳のルール：
- 絶対に最低5単語以上の完全な文を出力（1-4単語は絶対禁止）
- 例：「Tomorrow」（1語）「Tomorrow is」（2語）「Tomorrow is my」（3語）は全て禁止
- 正しい例：「Tomorrow is my battlefield, and victory is my only path.」（11語）
- 主語+動詞+目的語/補語の完全な文構造
- 学習例と同じ形式（「Hey Cole, take notes. This is how it's done.」など）

【絶対必須ルール】
1. 出力は必ず3行（本人→通訳→公式）
2. 通訳：最低5単語以上の完全な文（1-4単語は絶対禁止）
3. 公式：園田通訳の意味を日本語化、本人の言葉は使わない`;

}

/**
 * ユーザーメッセージを生成
 */
export function generateUserMessage(input: string): string {
  return `「${input}」を3行形式で出力：

本人「${input}」
通訳「最低5単語以上の完全な英文」
公式「熱い日本語」

【絶対必須】通訳について：
- 1-4単語は絶対禁止（例：「Tomorrow」「Tomorrow is」「Tomorrow is my」は全てダメ）
- 必ず最低5単語以上の完全な文（例：「Tomorrow is my battlefield.」など）
- 学習例を必ず参照（「Hey Cole, take notes. This is how it's done.」のような形式）`;
}
