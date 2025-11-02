import { NextRequest } from 'next/server';
import { loadQuotes } from '@/lib/quotes';
import { promises as fs } from 'fs';
import path from 'path';
import { validateNumber } from '@/lib/sanitize';
import {
  parseJsonRequest,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  log,
  LogLevel
} from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const parseResult = await parseJsonRequest<{
      quoteId?: number;
      action?: string;
    }>(request);
    
    if ('error' in parseResult) {
      return parseResult.error;
    }
    
    const { quoteId, action } = parseResult.data;

    // バリデーション
    const quoteIdValidation = validateNumber(quoteId, 1);
    if (!quoteIdValidation.valid || !quoteIdValidation.value) {
      return createErrorResponse(
        'Invalid quoteId (must be a number >= 1)',
        400
      );
    }

    const validatedQuoteId = quoteIdValidation.value;

    if (!action || typeof action !== 'string' || (action !== 'like' && action !== 'unlike')) {
      return createErrorResponse(
        'Invalid action (must be "like" or "unlike")',
        400
      );
    }
    
    log(LogLevel.DEBUG, 'いいねAPI呼び出し', { quoteId: validatedQuoteId, action });

    const filePath = path.join(process.cwd(), 'data', 'quotes.json');
    const data = await loadQuotes();

    const quoteIndex = data.quotes.findIndex(q => q.id === validatedQuoteId);
    if (quoteIndex === -1) {
      log(LogLevel.WARN, '語録が見つかりません', { quoteId: validatedQuoteId });
      return createErrorResponse('Quote not found', 404);
    }

    // いいね数の初期化
    if (!data.quotes[quoteIndex].likes) {
      data.quotes[quoteIndex].likes = 0;
    }

    // いいね/いいね解除の処理
    if (action === 'unlike') {
      // いいねを解除（1以上の場合のみ減らす）
      if (data.quotes[quoteIndex].likes! > 0) {
        data.quotes[quoteIndex].likes! -= 1;
      }
    } else {
      // いいねを追加
      data.quotes[quoteIndex].likes! += 1;
    }

    data.metadata.lastUpdated = new Date().toISOString();

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

    log(LogLevel.INFO, 'いいね更新成功', {
      quoteId: validatedQuoteId,
      action,
      newLikes: data.quotes[quoteIndex].likes,
    });

    return createSuccessResponse({
      quoteId: validatedQuoteId,
      likes: data.quotes[quoteIndex].likes,
    });
  } catch (error) {
    return handleApiError(error, 'いいねの更新に失敗しました');
  }
}

