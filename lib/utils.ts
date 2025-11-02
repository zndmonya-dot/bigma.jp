/**
 * ユーティリティ関数
 */

import { Quote } from './types';

/**
 * スコア計算: (いいね + 1) × (リツイート + 1) × (引用リツイート + 1)
 */
export function calculateScore(quote: Quote): number {
  const likes = (quote.likes || 0) + 1;
  const retweets = (quote.retweets || 0) + 1;
  const quoteRetweets = (quote.quoteRetweets || 0) + 1;
  return likes * retweets * quoteRetweets;
}

/**
 * X（Twitter）用に語録をフォーマット
 */
export function formatQuoteForTwitter(quote: Quote): string {
  let text = `本人「${quote.original}」\n`;
  if (quote.english) {
    text += `通訳「${quote.english}」\n`;
  }
  text += `公式「${quote.translated}」`;
  return text;
}

/**
 * X（Twitter）投稿URLを生成
 */
export function createTweetUrl(text: string, url?: string): string {
  const params = new URLSearchParams();
  params.set('text', text);
  if (url) {
    params.set('url', url);
  }
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

