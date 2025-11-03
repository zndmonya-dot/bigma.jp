import { Quote, QuotesData } from './types';
import { useSupabase } from './supabase';

/**
 * 語録データを読み込む（UI表示用 - user-generatedのみ）
 * Supabaseが利用可能な場合はSupabaseから、そうでない場合はファイルベース（quotes.jsonのみ）
 * base_quotes.jsonはFew-shot学習用のため、UIには表示されない（loadBaseQuotesForPromptで別途読み込み）
 */
export async function loadQuotes(): Promise<QuotesData> {
  // Supabaseが設定されている場合は、Supabaseから読み込み
  if (useSupabase()) {
    try {
      const { loadQuotesFromSupabase } = await import('./quotes-supabase');
      const supabaseData = await loadQuotesFromSupabase();
      
      // base_quotes.jsonはFew-shot学習用のため、UIには表示しない
      // UIにはSupabaseのデータのみを返す
      return supabaseData;
    } catch (error) {
      console.error('Failed to load quotes from Supabase, falling back to file-based:', error);
      // フォールバック: ファイルベースに
    }
  }
  
  // ファイルベースのロジック
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // ユーザー生成データを読み込み
    const userQuotesPath = path.join(process.cwd(), 'data', 'quotes.json');
    let userData: QuotesData;
    try {
      const userFileContents = await fs.readFile(userQuotesPath, 'utf8');
      userData = JSON.parse(userFileContents);
    } catch (userError) {
      console.warn('User quotes file not found, creating empty data');
      userData = {
        metadata: {
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
          description: 'Bigma -びぐま- データベース',
        },
        quotes: [],
      };
    }
    
    // base_quotes.jsonはFew-shot学習用のため、UIには表示しない
    // UIにはユーザー生成データのみを返す
    
    // 重複を除外（同じIDが複数ある場合、最初のものだけ残す）
    const seenIds = new Set<number>();
    const deduplicatedQuotes = userData.quotes.filter(q => {
      if (seenIds.has(q.id)) {
        return false;
      }
      seenIds.add(q.id);
      return true;
    });
    
    return {
      metadata: {
        ...userData.metadata,
        userQuotesCount: deduplicatedQuotes.length,
      },
      quotes: deduplicatedQuotes,
    };
  } catch (error) {
    console.error('Failed to load quotes:', error);
    // フォールバック: 空のデータを返す
    return {
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
        description: 'Bigma -びぐま- データベース',
      },
      quotes: [],
    };
  }
}

/**
 * 語録を追加する
 */
export async function addQuote(quote: Omit<Quote, 'id'>): Promise<void> {
  // Supabaseが設定されている場合は、Supabaseに追加
  if (useSupabase()) {
    try {
      const { addQuoteToSupabase } = await import('./quotes-supabase');
      await addQuoteToSupabase(quote);
      return;
    } catch (error) {
      console.error('Failed to add quote to Supabase, falling back to file-based:', error);
      // フォールバック: ファイルベースに
    }
  }
  
  // ファイルベースのロジック
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'data', 'quotes.json');
    
    // ユーザーデータのみを読み込んでIDを生成（base_quotesは含まない）
    const userDataForId = await loadQuotes();
    const newId = userDataForId.quotes.length > 0 
      ? Math.max(...userDataForId.quotes.map(q => q.id)) + 1 
      : 1; // 最初のIDは1から開始
    
    // ユーザーデータのみを読み込む（quotes.jsonのみ、base_quotes.jsonは含まない）
    let userData: QuotesData;
    try {
      const userFileContents = await fs.readFile(filePath, 'utf8');
      userData = JSON.parse(userFileContents);
    } catch (userError) {
      // quotes.jsonが存在しない場合は新規作成
      userData = {
        metadata: {
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
          description: 'Bigma -びぐま- データベース',
        },
        quotes: [],
      };
    }
    
    const newQuote: Quote = {
      ...quote,
      id: newId,
      likes: quote.likes ?? 0,
      retweets: quote.retweets ?? 0,
      quoteRetweets: quote.quoteRetweets ?? 0,
    };
    
    // ユーザーデータのみに追加（base_quotesは含めない）
    userData.quotes.push(newQuote);
    userData.metadata.lastUpdated = new Date().toISOString();
    userData.metadata.userQuotesCount = userData.quotes.length;
    
    // quotes.jsonにはユーザーデータのみを保存（base_quotesは含めない）
    await fs.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to add quote:', error);
    throw error;
  }
}

/**
 * Few-shot学習用にbase_quotes.jsonを読み込む（UIには表示しない裏側のデータ）
 */
export async function loadBaseQuotesForPrompt(): Promise<Quote[]> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const baseQuotesPath = path.join(process.cwd(), 'data', 'base_quotes.json');
    const baseFileContents = await fs.readFile(baseQuotesPath, 'utf8');
    const baseData = JSON.parse(baseFileContents) as QuotesData;
    
    if (baseData && baseData.quotes && baseData.quotes.length > 0) {
      return baseData.quotes;
    }
    return [];
  } catch (error) {
    console.warn('Base quotes file not found for few-shot learning:', error);
    return [];
  }
}

/**
 * Few-shot examples用に語録をフォーマット
 * スコア順（likes × retweets × quoteRetweets）で並び替えて、上位のものを優先的に選択
 */
export function formatQuotesForPrompt(quotes: Quote[], maxCount: number = 30): string {
  if (quotes.length === 0) {
    return '';
  }
  
  // スコア計算関数（likes × retweets × quoteRetweets）
  const calculateScore = (q: Quote): number => {
    const likes = q.likes || 0;
    const retweets = q.retweets || 0;
    const quoteRetweets = q.quoteRetweets || 0;
    return (likes + 1) * (retweets + 1) * (quoteRetweets + 1);
  };
  
  // スコア順でソート（高い順）
  const sortedQuotes = [...quotes].sort((a, b) => calculateScore(b) - calculateScore(a));
  
  // 上位maxCount件を選択
  const selectedQuotes = sortedQuotes.slice(0, maxCount);
  
  return selectedQuotes
    .map((quote) => {
      // 三段階フォーマットで表示
      if (quote.english) {
        return `本人「${quote.original}」\n通訳「${quote.english}」\n公式「${quote.translated}」`;
      } else {
        return `本人「${quote.original}」\n通訳「（省略）」\n公式「${quote.translated}」`;
      }
    })
    .join('\n\n');
}
