/**
 * 共通型定義
 */

export interface Quote {
  id: number;
  original: string;      // 本人「〇〇」
  english?: string;       // 通訳「英語」（オプション）
  translated: string;     // 公式「△△」
  likes?: number;         // いいね数
  retweets?: number;      // リツイート数
  quoteRetweets?: number; // 引用リツイート数
  position?: string;      // ポジション（右、左、中、三、一、二、遊、捕、DH、指など）
}

export interface QuotesData {
  metadata: {
    lastUpdated: string;
    version: string;
    description: string;
    baseQuotesCount?: number;  // ベース語録（言っていない語録）の数
    userQuotesCount?: number;  // ユーザー生成語録の数
    [key: string]: any;  // その他の任意のプロパティを許可
  };
  quotes: Quote[];
}

export type TabType = 'new' | 'monthly' | 'total';

