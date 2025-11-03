import { Quote, QuotesData } from './types';
import { useSupabase } from './supabase';
import { FIELD_PLAYER_POSITIONS } from './constants';
import { shuffleWithSeed } from './random-seed';

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
 * ポジションを自動割り当て
 * 既存の語録から使用済みポジションを取得し、未使用のポジションをランダムに割り当てる
 * すべて使用済みの場合はランダムに割り当て（重複を許容）
 */
async function assignPosition(existingQuotes: Quote[], newId: number): Promise<string> {
  // 既存の語録から使用済みの野手ポジションを取得
  const usedPositions = new Set<string>(
    existingQuotes
      .filter(q => q.position && FIELD_PLAYER_POSITIONS.includes(q.position as any))
      .map(q => q.position!)
  );
  
  // 未使用のポジションを取得
  const availablePositions = FIELD_PLAYER_POSITIONS.filter(p => !usedPositions.has(p));
  
  // IDベースのシードでランダムに選択（同じIDには同じポジションが割り当てられる）
  if (availablePositions.length > 0) {
    const positionSeed = `position-${newId}`;
    const shuffledPositions = shuffleWithSeed([...availablePositions], positionSeed);
    return shuffledPositions[0];
  }
  
  // すべて使用済みの場合は、ランダムに割り当て（重複を許容）
  const allPositionsSeed = `position-${newId}`;
  const shuffledAll = shuffleWithSeed([...FIELD_PLAYER_POSITIONS], allPositionsSeed);
  return shuffledAll[0];
}

/**
 * 語録を追加する
 * positionが指定されていない場合は自動で割り当てる
 */
export async function addQuote(quote: Omit<Quote, 'id'>): Promise<void> {
  // 既存の語録を読み込んでポジション割り当てに使用
  const existingData = await loadQuotes();
  
  // IDを生成
  const newId = existingData.quotes.length > 0 
    ? Math.max(...existingData.quotes.map(q => q.id)) + 1 
    : 1;
  
  // positionが指定されていない場合は自動で割り当て
  let assignedPosition = quote.position;
  if (!assignedPosition || !FIELD_PLAYER_POSITIONS.includes(assignedPosition as any)) {
    assignedPosition = await assignPosition(existingData.quotes, newId);
  }
  
  // positionを含む新しい語録データを作成
  const quoteWithPosition: Omit<Quote, 'id'> = {
    ...quote,
    position: assignedPosition,
  };
  
  // Supabaseが設定されている場合は、Supabaseに追加
  if (useSupabase()) {
    try {
      const { addQuoteToSupabase } = await import('./quotes-supabase');
      await addQuoteToSupabase(quoteWithPosition);
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
      ...quoteWithPosition,
      id: newId,
      likes: quoteWithPosition.likes ?? 0,
      retweets: quoteWithPosition.retweets ?? 0,
      quoteRetweets: quoteWithPosition.quoteRetweets ?? 0,
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
 * Few-shot学習用にbase_quotesを読み込む（UIには表示しない裏側のデータ）
 * Supabaseが設定されている場合はSupabaseから、そうでない場合はファイルベース
 */
export async function loadBaseQuotesForPrompt(): Promise<Quote[]> {
  // Supabaseが設定されている場合は、Supabaseから読み込み
  if (useSupabase()) {
    try {
      const { loadBaseQuotesFromSupabase } = await import('./quotes-supabase');
      return await loadBaseQuotesFromSupabase();
    } catch (error) {
      console.error('Failed to load base quotes from Supabase, falling back to file-based:', error);
      // フォールバック: ファイルベースに
    }
  }
  
  // ファイルベースのロジック（フォールバックまたはSupabase未設定時）
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
 * base_quotesテーブルのデータを優先的に使用し、スコア順で並び替えて上位を選択
 * 配列の順序が保たれるため、base_quotesを先に配列に含めることで優先される
 */
export function formatQuotesForPrompt(quotes: Quote[], maxCount: number = 30): string {
  if (quotes.length === 0) {
    return '';
  }
  
  // スコア計算関数（likes × retweets × quoteRetweets）
  // base_quotesテーブルのデータは通常スコアが低いため、最小スコアを1に保証
  const calculateScore = (q: Quote): number => {
    const likes = q.likes || 0;
    const retweets = q.retweets || 0;
    const quoteRetweets = q.quoteRetweets || 0;
    const baseScore = (likes + 1) * (retweets + 1) * (quoteRetweets + 1);
    // base_quotesのデータ（スコアが0）でも最小1を保証
    return Math.max(baseScore, 1);
  };
  
  // スコア順でソート（高い順）
  // ただし、同じスコアの場合は配列の順序を保持（base_quotesが先に来るように）
  const sortedQuotes = [...quotes].sort((a, b) => {
    const scoreA = calculateScore(a);
    const scoreB = calculateScore(b);
    if (scoreA !== scoreB) {
      return scoreB - scoreA;  // スコアが高い順
    }
    // 同じスコアの場合は元の順序を保持（base_quotes優先）
    return 0;
  });
  
  // 上位maxCount件を選択
  const selectedQuotes = sortedQuotes.slice(0, maxCount);
  
  console.log(`[formatQuotesForPrompt] Selected ${selectedQuotes.length} quotes for prompt out of ${quotes.length} total`);
  
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
