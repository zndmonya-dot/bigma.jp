import { NextRequest, NextResponse } from 'next/server';
import { loadQuotes } from '@/lib/quotes';
import {
  createSuccessResponse,
  handleApiError,
  log,
  LogLevel
} from '@/lib/api-helpers';
import crypto from 'crypto';

/**
 * データのハッシュを生成してETagとして使用
 */
function generateETag(data: any): string {
  const jsonString = JSON.stringify(data);
  return crypto.createHash('md5').update(jsonString).digest('hex');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const cursorParam = searchParams.get('cursor'); // lastId（未指定なら最新から）

    const limit = Math.min(Math.max(Number(limitParam) || 10, 1), 100); // 1..100
    const cursor = cursorParam ? Number(cursorParam) : undefined;

    const quotesData = await loadQuotes();
    const all = [...quotesData.quotes].sort((a, b) => b.id - a.id);
    const sliced = cursor ? all.filter(q => q.id < cursor) : all;
    const page = sliced.slice(0, limit);
    const hasMore = sliced.length > limit;
    const nextCursor = hasMore ? page[page.length - 1]?.id : null;
    
    // ETag生成（データのハッシュ）
    const etag = generateETag(quotesData);
    
    // If-None-Matchヘッダーをチェック（キャッシュ検証）
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === `"${etag}"`) {
      // データが変更されていない場合は304を返す
      log(LogLevel.DEBUG, 'キャッシュヒット（304）', {
        etag,
        totalCount: quotesData.quotes.length,
      });
      
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': `"${etag}"`,
          'Cache-Control': 'public, max-age=60, must-revalidate', // 60秒キャッシュ、再検証必須
        },
      });
    }
    
    log(LogLevel.DEBUG, '語録一覧取得', {
      totalCount: quotesData.quotes.length,
      returned: page.length,
      hasMore,
      etag,
    });
    
    // 通常レスポンス（ETag付き）
    const response = NextResponse.json(
      {
        success: true,
        data: { quotes: page, pageInfo: { hasMore, nextCursor } },
        count: page.length,
      },
      {
        status: 200,
        headers: {
          'ETag': `"${etag}"`,
          'Cache-Control': 'public, max-age=60, must-revalidate',
        },
      }
    );
    
    return response;
  } catch (error) {
    return handleApiError(error, '語録の読み込みに失敗しました');
  }
}
