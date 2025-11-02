/**
 * APIルート共通ヘルパー関数
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * エラーレスポンスの型
 */
export interface ApiErrorResponse {
  error: string;
  success?: false;
  [key: string]: any;
}

/**
 * 成功レスポンスの型
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  [key: string]: any;
}

/**
 * JSONリクエストをパース（エラーハンドリング付き）
 */
export async function parseJsonRequest<T = any>(
  request: NextRequest
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const data = await request.json();
    return { data };
  } catch (error) {
    return {
      error: NextResponse.json(
        { success: false, error: '無効なJSONリクエストです' },
        { status: 400 }
      ),
    };
  }
}

/**
 * 標準エラーレスポンスを生成
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  additionalData?: Record<string, any>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...additionalData,
    },
    { status }
  );
}

/**
 * 標準成功レスポンスを生成
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  additionalData?: Record<string, any>
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...additionalData,
  });
}

/**
 * APIエラーハンドラー（try-catchブロック用）
 */
export function handleApiError(
  error: unknown,
  defaultMessage: string = 'リクエストの処理中にエラーが発生しました'
): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return createErrorResponse(
      `${defaultMessage}: ${error.message}`,
      500
    );
  }
  
  return createErrorResponse(defaultMessage, 500);
}

/**
 * ログレベル
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * 本番環境かどうか
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * ログ出力（本番環境ではERRORとWARNのみ）
 */
export function log(
  level: LogLevel,
  message: string,
  data?: any
): void {
  if (isProduction && level === LogLevel.DEBUG) {
    return; // 本番環境ではDEBUGログを出力しない
  }
  
  const timestamp = new Date().toISOString();
  const logData = data ? ` ${JSON.stringify(data)}` : '';
  
  switch (level) {
    case LogLevel.ERROR:
      console.error(`[${timestamp}] [${level}] ${message}${logData}`);
      break;
    case LogLevel.WARN:
      console.warn(`[${timestamp}] [${level}] ${message}${logData}`);
      break;
    case LogLevel.INFO:
      console.log(`[${timestamp}] [${level}] ${message}${logData}`);
      break;
    case LogLevel.DEBUG:
      console.log(`[${timestamp}] [${level}] ${message}${logData}`);
      break;
  }
}

