import { Quote, QuotesData } from './types';

/**
 * 語録データを読み込む（user-generated + base quotes）
 * base_quotes.json（山本由伸の言っていない語録）とquotes.json（ユーザー生成データ）をマージ
 */
export async function loadQuotes(): Promise<QuotesData> {
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
    
    // ベースデータ（山本由伸の言っていない語録）を読み込み
    let baseData: QuotesData | null = null;
    try {
      const baseQuotesPath = path.join(process.cwd(), 'data', 'base_quotes.json');
      const baseFileContents = await fs.readFile(baseQuotesPath, 'utf8');
      baseData = JSON.parse(baseFileContents);
      if (baseData && baseData.quotes && baseData.quotes.length > 0) {
        console.log(`Loaded ${baseData.quotes.length} base quotes (言っていない語録)`);
      }
    } catch (baseError) {
      console.warn('Base quotes file not found, using user quotes only');
    }
    
    // 重複を除外してマージ（IDで重複チェック、ベースデータを先に配置）
    const baseQuotesIds = new Set(baseData?.quotes?.map(q => q.id) || []);
    // ユーザーデータからベースデータと重複するIDを除外
    const uniqueUserQuotes = userData.quotes.filter(q => !baseQuotesIds.has(q.id));
    
    // ベースデータとユニークなユーザーデータをマージ
    const mergedQuotes = baseData && baseData.quotes 
      ? [...baseData.quotes, ...uniqueUserQuotes]
      : uniqueUserQuotes;
    
    // さらに、mergedQuotes内の重複も除外（同じIDが複数ある場合、最初のものだけ残す）
    const seenIds = new Set<number>();
    const deduplicatedQuotes = mergedQuotes.filter(q => {
      if (seenIds.has(q.id)) {
        return false;
      }
      seenIds.add(q.id);
      return true;
    });
    
    return {
      metadata: {
        ...userData.metadata,
        baseQuotesCount: baseData?.quotes?.length || 0,
        userQuotesCount: uniqueUserQuotes.length,
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
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'data', 'quotes.json');
    
    // マージされたデータを読み込んでIDを生成（base_quotes + user_quotesの最大IDを使用）
    const mergedData = await loadQuotes();
    const newId = mergedData.quotes.length > 0 
      ? Math.max(...mergedData.quotes.map(q => q.id)) + 1 
      : 1001; // base_quotesが1001から始まるので、base_quotesがない場合は1001から
    
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
