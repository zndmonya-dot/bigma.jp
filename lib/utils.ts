/**
 * ユーティリティ関数
 */

import { Quote } from './types';

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

