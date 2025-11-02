import { NextRequest } from 'next/server';
import { loadQuotes } from '@/lib/quotes';
import {
  createSuccessResponse,
  handleApiError,
  log,
  LogLevel
} from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const quotesData = await loadQuotes();
    
    log(LogLevel.DEBUG, '語録一覧取得', {
      totalCount: quotesData.quotes.length,
      baseQuotes: quotesData.metadata.baseQuotesCount,
      userQuotes: quotesData.metadata.userQuotesCount,
    });
    
    return createSuccessResponse(quotesData, undefined, {
      count: quotesData.quotes.length,
    });
  } catch (error) {
    return handleApiError(error, '語録の読み込みに失敗しました');
  }
}
