/**
 * Supabase関連のヘルパー関数
 */

import { Quote } from './types';

/**
 * Supabaseの行データをQuote型に変換
 * @param row Supabaseから取得した行データ
 */
export function mapRowToQuote(row: {
  id: number;
  original: string;
  english?: string | null;
  translated: string;
  likes?: number | null;
  retweets?: number | null;
  quote_retweets?: number | null;
  position?: string | null;
  created_at?: string | null;
}): Quote {
  return {
    id: row.id,
    original: row.original,
    english: row.english || undefined,
    translated: row.translated,
    likes: row.likes || 0,
    retweets: row.retweets || 0,
    quoteRetweets: row.quote_retweets || 0,
    position: row.position || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  };
}

/**
 * Supabaseのquoteテーブルへの挿入データを生成
 */
export function createInsertData(quote: Omit<Quote, 'id'>) {
  return {
    original: quote.original,
    english: quote.english || null,
    translated: quote.translated,
    likes: quote.likes || 0,
    retweets: quote.retweets || 0,
    quote_retweets: quote.quoteRetweets || 0,
    position: quote.position || null,
  };
}

/**
 * Supabaseクライアントの型安全なラッパー
 */
export function getTypedSupabaseClient(supabase: ReturnType<typeof import('./supabase').getSupabaseClient>) {
  if (!supabase) {
    throw new Error('Supabase client is not available');
  }
  // 型アサーションが必要な場合のヘルパー
  // TODO: 将来的にSupabaseの型定義を適切に設定して削除
  return supabase as any;
}

/**
 * Supabaseクライアントを取得し、型安全なラッパーを返す
 */
export async function getSupabaseClientWithCheck() {
  const { getSupabaseClient, useSupabase } = await import('./supabase');
  
  if (!useSupabase()) {
    throw new Error('Supabase is not configured');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not available');
  }

  return getTypedSupabaseClient(supabase);
}

