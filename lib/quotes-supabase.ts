/**
 * Supabaseを使った語録の読み書き
 */

import { getSupabaseClient, useSupabase } from './supabase';
import { Quote, QuotesData } from './types';

/**
 * Supabaseから語録を読み込む
 */
export async function loadQuotesFromSupabase(): Promise<QuotesData> {
  if (!useSupabase()) {
    throw new Error('Supabase is not configured');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not available');
  }

  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    throw new Error(`Failed to load quotes from Supabase: ${error.message}`);
  }

  const quotes: Quote[] = (data || []).map((row: any) => ({
    id: row.id,
    original: row.original,
    english: row.english || undefined,
    translated: row.translated,
    likes: row.likes || 0,
    retweets: row.retweets || 0,
    quoteRetweets: row.quote_retweets || 0,
    position: row.position || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  }));

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
  if (!useSupabase()) {
    throw new Error('Supabase is not configured');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not available');
  }

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      original: quote.original,
      english: quote.english || null,
      translated: quote.translated,
      likes: quote.likes || 0,
      retweets: quote.retweets || 0,
      quote_retweets: quote.quoteRetweets || 0,
      position: quote.position || null,
    } as any)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to add quote to Supabase: ${error.message}`);
  }

  return (data as any)?.id || 0;
}

/**
 * Supabaseでいいねを更新
 */
export async function updateQuoteLike(
  quoteId: number,
  increment: boolean
): Promise<number> {
  if (!useSupabase()) {
    throw new Error('Supabase is not configured');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not available');
  }

  // まず現在のいいね数を取得
  const { data: currentData, error: fetchError } = await supabase
    .from('quotes')
    .select('likes')
    .eq('id', quoteId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch quote: ${fetchError.message}`);
  }

  const newLikes = increment
    ? (currentData.likes || 0) + 1
    : Math.max((currentData.likes || 0) - 1, 0);

  // いいね数を更新
  const { data, error } = await supabase
    .from('quotes')
    .update({ likes: newLikes } as any)
    .eq('id', quoteId)
    .select('likes')
    .single();

  if (error) {
    throw new Error(`Failed to update likes: ${error.message}`);
  }

  return (data as any)?.likes || 0;
}

/**
 * Supabaseでリツイート数を更新
 */
export async function updateQuoteRetweet(
  quoteId: number,
  increment: boolean
): Promise<number> {
  if (!useSupabase()) {
    throw new Error('Supabase is not configured');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not available');
  }

  const { data: currentData, error: fetchError } = await supabase
    .from('quotes')
    .select('retweets')
    .eq('id', quoteId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch quote: ${fetchError.message}`);
  }

  const newRetweets = increment
    ? (currentData.retweets || 0) + 1
    : Math.max((currentData.retweets || 0) - 1, 0);

  const { data, error } = await supabase
    .from('quotes')
    .update({ retweets: newRetweets } as any)
    .eq('id', quoteId)
    .select('retweets')
    .single();

  if (error) {
    throw new Error(`Failed to update retweets: ${error.message}`);
  }

  return (data as any)?.retweets || 0;
}

/**
 * Supabaseで引用リツイート数を更新
 */
export async function updateQuoteQuoteRetweet(
  quoteId: number,
  increment: boolean
): Promise<number> {
  if (!useSupabase()) {
    throw new Error('Supabase is not configured');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not available');
  }

  const { data: currentData, error: fetchError } = await supabase
    .from('quotes')
    .select('quote_retweets')
    .eq('id', quoteId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch quote: ${fetchError.message}`);
  }

  const newQuoteRetweets = increment
    ? (currentData.quote_retweets || 0) + 1
    : Math.max((currentData.quote_retweets || 0) - 1, 0);

  const { data, error } = await supabase
    .from('quotes')
    .update({ quote_retweets: newQuoteRetweets } as any)
    .eq('id', quoteId)
    .select('quote_retweets')
    .single();

  if (error) {
    throw new Error(`Failed to update quote retweets: ${error.message}`);
  }

  return (data as any)?.quote_retweets || 0;
}

/**
 * Supabaseからbase_quotes（Few-shot学習用）を読み込む
 * UIには表示されず、AI生成時のプロンプトにのみ使用される
 */
export async function loadBaseQuotesFromSupabase(): Promise<Quote[]> {
  if (!useSupabase()) {
    throw new Error('Supabase is not configured');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not available');
  }

  // is_active = true のみを取得
  const { data, error } = await supabase
    .from('base_quotes')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: false });

  if (error) {
    throw new Error(`Failed to load base quotes from Supabase: ${error.message}`);
  }

  const quotes: Quote[] = (data || []).map((row: any) => ({
    id: row.id,
    original: row.original,
    english: row.english || undefined,
    translated: row.translated,
    likes: row.likes || 0,
    retweets: row.retweets || 0,
    quoteRetweets: row.quote_retweets || 0,
    position: row.position || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  }));

  return quotes;
}

