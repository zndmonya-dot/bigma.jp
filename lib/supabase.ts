/**
 * Supabaseクライアント
 * 環境変数が設定されていない場合はnullを返す
 */

import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Supabaseが利用可能かどうかをチェック
 */
export function useSupabase(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Supabaseクライアントを取得
 */
export function getSupabaseClient() {
  if (!useSupabase()) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return supabaseClient;
}

/**
 * Supabaseクライアント（後方互換性のため）
 */
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    return client;
  },
});

