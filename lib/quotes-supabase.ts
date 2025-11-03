/**
 * Supabaseを使った語録の読み書き
 */

import { Quote, QuotesData } from './types';
import { mapRowToQuote, createInsertData, getSupabaseClientWithCheck } from './quotes-supabase-helpers';

/**
 * Supabaseから語録を読み込む
 */
export async function loadQuotesFromSupabase(): Promise<QuotesData> {
  const supabase = await getSupabaseClientWithCheck();

  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    throw new Error(`Failed to load quotes from Supabase: ${error.message}`);
  }

  const quotes: Quote[] = (data || []).map(mapRowToQuote);

  return {
    metadata: {
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      description: 'Quotes from Supabase',
      userQuotesCount: quotes.length,
    },
    quotes,
  };
}

/**
 * Supabaseに語録を追加
 */
export async function addQuoteToSupabase(
  quote: Omit<Quote, 'id'>
): Promise<number> {
  const typedSupabase = await getSupabaseClientWithCheck();
  const { data, error } = await typedSupabase
    .from('quotes')
    .insert(createInsertData(quote))
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to add quote to Supabase: ${error.message}`);
  }

  // TODO: Supabaseの型定義を追加して型アサーションを削除
  return (data as any)?.id || 0;
}

/**
 * Supabaseでカウントを更新する共通関数
 */
async function updateQuoteCount(
  quoteId: number,
  field: 'likes' | 'retweets' | 'quote_retweets',
  increment: boolean
): Promise<number> {
  const typedSupabase = await getSupabaseClientWithCheck();

  // 現在の値を取得
  const { data: currentData, error: fetchError } = await typedSupabase
    .from('quotes')
    .select(field)
    .eq('id', quoteId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch quote: ${fetchError.message}`);
  }

  // TODO: Supabaseの型定義を追加して型アサーションを削除
  const currentValue = (currentData as any)?.[field] || 0;
  const newValue = increment
    ? currentValue + 1
    : Math.max(currentValue - 1, 0);

  // 値を更新
  const { data, error } = await typedSupabase
    .from('quotes')
    .update({ [field]: newValue })
    .eq('id', quoteId)
    .select(field)
    .single();

  if (error) {
    throw new Error(`Failed to update ${field}: ${error.message}`);
  }

  // TODO: Supabaseの型定義を追加して型アサーションを削除
  return (data as any)?.[field] || 0;
}

/**
 * Supabaseでいいねを更新
 */
export async function updateQuoteLike(
  quoteId: number,
  increment: boolean
): Promise<number> {
  return updateQuoteCount(quoteId, 'likes', increment);
}

/**
 * Supabaseでリツイート数を更新
 */
export async function updateQuoteRetweet(
  quoteId: number,
  increment: boolean
): Promise<number> {
  return updateQuoteCount(quoteId, 'retweets', increment);
}

/**
 * Supabaseで引用リツイート数を更新
 */
export async function updateQuoteQuoteRetweet(
  quoteId: number,
  increment: boolean
): Promise<number> {
  return updateQuoteCount(quoteId, 'quote_retweets', increment);
}

/**
 * Supabaseからbase_quotes（Few-shot学習用）を読み込む
 * UIには表示されず、AI生成時のプロンプトにのみ使用される
 */
export async function loadBaseQuotesFromSupabase(): Promise<Quote[]> {
  const supabase = await getSupabaseClientWithCheck();

  // is_active = true のみを取得
  const { data, error } = await supabase
    .from('base_quotes')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: false });

  if (error) {
    throw new Error(`Failed to load base quotes from Supabase: ${error.message}`);
  }

  return (data || []).map(mapRowToQuote);
}

