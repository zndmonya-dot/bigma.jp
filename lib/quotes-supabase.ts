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

  // 必要最小限のカラムのみ取得（通信量削減）
  const { data, error } = await supabase
    .from('quotes')
    .select('id, original, english, translated, likes, retweets, quote_retweets, position, created_at')
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

  // is_active = true のみを取得（必要最小限のカラムのみ）
  const { data, error } = await supabase
    .from('base_quotes')
    .select('id, original, english, translated, likes, retweets, quote_retweets, position, created_at')
    .eq('is_active', true)
    .order('id', { ascending: false });

  if (error) {
    throw new Error(`Failed to load base quotes from Supabase: ${error.message}`);
  }

  return (data || []).map(mapRowToQuote);
}

/**
 * 日次スタメン（打線）を保存
 * JST日付（YYYY-MM-DD形式）をキーに、選ばれた語録IDの配列を保存
 */
export async function saveDailyLineup(dateString: string, quoteIds: number[]): Promise<void> {
  const supabase = await getSupabaseClientWithCheck();
  
  const { error } = await supabase
    .from('lineup_daily')
    .upsert({
      run_date: dateString,
      quote_ids: quoteIds,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'run_date',
    });

  if (error) {
    // テーブルが未作成などの環境では失敗を無視（フォールバック運用）
    const msg = (error as any)?.message || '';
    const code = (error as any)?.code || '';
    if (
      code === '42P01' || // undefined_table
      code === 'PGRST202' || // relation not found (PostgREST)
      msg.includes("Could not find the table 'public.lineup_daily'") ||
      msg.includes('relation "lineup_daily" does not exist')
    ) {
      return; // no-op: DBなしで続行
    }
    throw new Error(`Failed to save daily lineup: ${error.message}`);
  }
}

/**
 * 日次スタメン（打線）を取得
 * 指定日（JST、YYYY-MM-DD形式）のスタメンを返す。存在しない場合はnull
 */
export async function loadDailyLineup(dateString: string): Promise<number[] | null> {
  const supabase = await getSupabaseClientWithCheck();
  
  const { data, error } = await supabase
    .from('lineup_daily')
    .select('quote_ids')
    .eq('run_date', dateString)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // レコードが見つからない場合はnullを返す（エラーではない）
      return null;
    }
    // テーブル未作成などの環境ではnullを返す（フォールバック運用）
    const msg = (error as any)?.message || '';
    const code = (error as any)?.code || '';
    if (
      code === '42P01' || // undefined_table
      code === 'PGRST202' || // relation not found (PostgREST)
      msg.includes("Could not find the table 'public.lineup_daily'") ||
      msg.includes('relation "lineup_daily" does not exist')
    ) {
      return null;
    }
    throw new Error(`Failed to load daily lineup: ${error.message}`);
  }

  return (data as any)?.quote_ids || null;
}

