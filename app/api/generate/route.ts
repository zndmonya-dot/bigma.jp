import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { loadQuotes, formatQuotesForPrompt } from '@/lib/quotes';
import { getClientIp, checkRateLimit } from '@/lib/rate-limit';
import { RATE_LIMIT, CHARACTER_LIMITS } from '@/lib/constants';
import { sanitizeInput, validateInput } from '@/lib/sanitize';
import { generateSystemPrompt, generateUserMessage } from '@/lib/prompts';
import {
  parseJsonRequest,
  createErrorResponse,
  createSuccessResponse,
  log,
  LogLevel
} from '@/lib/api-helpers';

/**
 * レート制限の時間ウィンドウ（1時間）
 */
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1時間（ミリ秒）

export async function POST(request: NextRequest) {
  try {
    const parseResult = await parseJsonRequest<{ input?: string }>(request);
    
    if ('error' in parseResult) {
      return parseResult.error;
    }
    
    const { input } = parseResult.data;

    // 入力値のバリデーションとサニタイズ
    if (!input || typeof input !== 'string') {
      return createErrorResponse('入力が必要です', 400);
    }

    const validation = validateInput(input, CHARACTER_LIMITS.INPUT_MAX);
    if (!validation.valid) {
      log(LogLevel.WARN, '入力バリデーション失敗', validation.error);
      return createErrorResponse(validation.error || '無効な入力です', 400);
    }

    const sanitizedInput = sanitizeInput(input.trim());
    
    // 開発環境では完全にレート制限をスキップ
    // NODE_ENVが'production'でない場合は開発環境とみなす
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // 開発環境ではレート制限チェックを完全にスキップ
    if (!isDevelopment) {
      // 本番環境のみレート制限をチェック
      const clientIp = getClientIp(request);
      const rateLimit = checkRateLimit(
        `generate:${clientIp}`,
        RATE_LIMIT.SERVER_HOURLY_REQUESTS,
        RATE_LIMIT_WINDOW
      );
      
      if (!rateLimit.allowed) {
        const resetMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
        return NextResponse.json(
          { 
            error: `サーバー側のレート制限に達しました。${resetMinutes}分後に再試行してください。`,
            retryAfter: resetMinutes,
            isServerRateLimit: true
          },
          { 
            status: 429,
            headers: {
              'Retry-After': String(resetMinutes * 60),
              'X-RateLimit-Limit': String(RATE_LIMIT.SERVER_HOURLY_REQUESTS),
              'X-RateLimit-Remaining': String(rateLimit.remaining),
              'X-RateLimit-Reset': String(rateLimit.resetAt),
            }
          }
        );
      }
      
      const globalRateLimit = checkRateLimit(
        'generate:global',
        RATE_LIMIT.SERVER_HOURLY_GENERATIONS,
        RATE_LIMIT_WINDOW
      );
      
      if (!globalRateLimit.allowed) {
        const resetMinutes = Math.ceil((globalRateLimit.resetAt - Date.now()) / 60000);
        return NextResponse.json(
          { 
            error: `現在サーバーが混雑しています。${resetMinutes}分後に再試行してください。`,
            retryAfter: resetMinutes,
            isServerRateLimit: true
          },
          { 
            status: 503,
            headers: {
              'Retry-After': String(resetMinutes * 60),
            }
          }
        );
      }
    }

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: '入力テキストが必要です' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('=== OpenAI API Key Missing ===');
      console.error('OPENAI_API_KEY環境変数が設定されていません');
      console.error('環境変数ファイル（.env.local）を確認してください');
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません。環境変数ファイル（.env.local）を確認してください。' },
        { status: 500 }
      );
    }

    // APIキーの確認（デバッグ用、最初の3文字と最後の3文字のみ表示）
    const apiKeyLength = process.env.OPENAI_API_KEY.length;
    const apiKeyPrefix = process.env.OPENAI_API_KEY.substring(0, 3);
    const apiKeySuffix = process.env.OPENAI_API_KEY.substring(apiKeyLength - 3);
    console.log('=== OpenAI API Key Check ===');
    console.log('API Key length:', apiKeyLength);
    console.log('API Key prefix:', apiKeyPrefix + '...');
    console.log('API Key suffix:', '...' + apiKeySuffix);
    console.log('API Key format valid:', apiKeyLength > 20 && apiKeyLength < 200);
    console.log('=== End API Key Check ===');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('OpenAI client initialized');

    const quotesData = await loadQuotes();
    console.log('=== Few-shot Examples Loading ===');
    console.log('データベース内の語録数:', quotesData.quotes.length);
    
    const realQuotesExamples = formatQuotesForPrompt(quotesData.quotes, 25);
    console.log('Few-shot examples generated:', realQuotesExamples ? 'Yes' : 'No');
    console.log('Examples length:', realQuotesExamples?.length || 0);
    if (realQuotesExamples) {
      console.log('Examples preview:', realQuotesExamples.substring(0, 200) + '...');
    }
    
    const defaultExamples = `本人「本当の意味で憧れるのをやめなければ」
通訳「I must stop admiring in the true sense」
公式「憧れは終わった、今こそ俺自身が伝説になる時だ」`;

    const examplesSection = realQuotesExamples || defaultExamples;
    console.log('使用するexamples:', realQuotesExamples ? '実際の語録データベース' : 'デフォルト例');
    console.log('Examples count:', realQuotesExamples ? (examplesSection.match(/\n\n/g)?.length || 0) + 1 : 1);
    console.log('=== End Few-shot Examples ===');

    const systemPrompt = generateSystemPrompt(examplesSection);

    // OpenAI API呼び出し前のログ
    console.log('=== OpenAI API Call Start ===');
    console.log('Input:', sanitizedInput.substring(0, 50) + '...');
    console.log('Model: gpt-4o-mini');
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('API Key length:', process.env.OPENAI_API_KEY?.length || 0);
    
    const startTime = Date.now();
    let completion;
    try {
      console.log('Sending request to OpenAI API...');
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: generateUserMessage(sanitizedInput)
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
        top_p: 0.9,
      });
      
      const endTime = Date.now();
      console.log(`OpenAI API call successful in ${endTime - startTime}ms`);
      console.log('Response received:', {
        hasChoices: !!completion.choices,
        choicesLength: completion.choices?.length || 0,
        firstChoiceContent: completion.choices?.[0]?.message?.content?.substring(0, 100) || 'N/A',
      });
    } catch (openaiError: any) {
      const endTime = Date.now();
      console.error(`OpenAI API call failed after ${endTime - startTime}ms`);
      // OpenAI APIエラーを詳細にログ出力（デバッグ用）
      console.error('=== OpenAI API Call Failed ===');
      console.error('Error type:', typeof openaiError);
      console.error('Error constructor:', openaiError?.constructor?.name);
      console.error('Error instanceof Error:', openaiError instanceof Error);
      
      // OpenAI SDKのエラーオブジェクトの全プロパティを確認
      if (openaiError && typeof openaiError === 'object') {
        console.error('Error properties:', Object.keys(openaiError));
        console.error('Error details:', {
          name: openaiError.name,
          message: openaiError.message,
          status: openaiError.status,
          code: openaiError.code,
          type: openaiError.type,
          // OpenAI SDK v6のエラー構造
          error: openaiError.error,
          headers: openaiError.headers,
          // レスポンスがある場合
          ...(openaiError.response && {
            responseStatus: openaiError.response.status,
            responseStatusText: openaiError.response.statusText,
            responseHeaders: openaiError.response.headers,
            responseBody: openaiError.response.body,
          }),
        });
      } else {
        console.error('Error value:', openaiError);
      }
      
      console.error('=== End OpenAI API Error ===');
      throw openaiError; // 再スローしてcatch節で処理
    }

    const rawResult = completion.choices[0]?.message?.content?.trim();

    if (!rawResult) {
      return NextResponse.json(
        { error: '生成に失敗しました' },
        { status: 500 }
      );
    }

    let english = '';
    let translated = '';
    
    const englishMatch = rawResult.match(/通訳「([^」]+)」/);
    const translatedMatch = rawResult.match(/公式「([^」]+)」/);
    
    if (englishMatch) {
      english = englishMatch[1].trim();
    }
    if (translatedMatch) {
      translated = translatedMatch[1].trim();
    } else {
      translated = rawResult.replace(/本人「[^」]+」\s*通訳「[^」]+」\s*/g, '').trim();
      if (translated.startsWith('公式「') && translated.endsWith('」')) {
        translated = translated.slice(3, -1).trim();
      }
    }

    // 後処理：個別文字数制限と合計文字数制限を適用
    // まず個別の制限を適用
    if (english && english.length > CHARACTER_LIMITS.ENGLISH_MAX) {
      console.log(`英語が${CHARACTER_LIMITS.ENGLISH_MAX}文字を超えています。${english.length}文字 -> ${CHARACTER_LIMITS.ENGLISH_MAX}文字に切り詰めます`);
      english = english.substring(0, CHARACTER_LIMITS.ENGLISH_MAX);
    }
    if (translated && translated.length > CHARACTER_LIMITS.TRANSLATED_MAX) {
      console.log(`公式が${CHARACTER_LIMITS.TRANSLATED_MAX}文字を超えています。${translated.length}文字 -> ${CHARACTER_LIMITS.TRANSLATED_MAX}文字に切り詰めます`);
      translated = translated.substring(0, CHARACTER_LIMITS.TRANSLATED_MAX);
    }
    
    // 次に合計文字数制限を適用（通訳30文字、公式50文字を目安）
    const totalLength = (english || '').length + (translated || '').length;
    if (totalLength > CHARACTER_LIMITS.OUTPUT_TOTAL_MAX) {
      console.log(`合計が${CHARACTER_LIMITS.OUTPUT_TOTAL_MAX}文字を超えています。${totalLength}文字 -> ${CHARACTER_LIMITS.OUTPUT_TOTAL_MAX}文字に調整します`);
      const targetLength = CHARACTER_LIMITS.OUTPUT_TOTAL_MAX;
      const ratio = targetLength / totalLength;
      const englishMaxLength = Math.min(Math.floor((english || '').length * ratio), CHARACTER_LIMITS.ENGLISH_MAX);
      const translatedMaxLength = Math.min(Math.floor((translated || '').length * ratio), CHARACTER_LIMITS.TRANSLATED_MAX);
      
      if (english && english.length > englishMaxLength) {
        english = english.substring(0, englishMaxLength);
      }
      if (translated && translated.length > translatedMaxLength) {
        translated = translated.substring(0, translatedMaxLength);
      }
    }
    
    log(LogLevel.DEBUG, '後処理後の文字数', {
      english: english?.length || 0,
      translated: translated?.length || 0,
      total: (english?.length || 0) + (translated?.length || 0),
    });

    log(LogLevel.INFO, 'AI生成成功', {
      inputLength: sanitizedInput.length,
      englishLength: english?.length || 0,
      translatedLength: translated?.length || 0,
    });

    return createSuccessResponse({
      english: english || '',
      translated: translated || rawResult,
      input: sanitizedInput, // 保存時に使用（サニタイズ済み）
    });
  } catch (error) {
    // OpenAI APIエラーの詳細調査とログ出力
    console.error('=== Generate API Error ===');
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Error instanceof Error:', error instanceof Error);
    
    // エラーの全プロパティをログ出力
    if (error && typeof error === 'object') {
      console.error('Error properties:', Object.keys(error));
      console.error('Error values:', {
        name: (error as any).name,
        message: (error as any).message,
        code: (error as any).code,
        status: (error as any).status,
        type: (error as any).type,
        error: (error as any).error,
        // OpenAI APIエラーのレスポンス
        response: (error as any).response ? {
          status: (error as any).response.status,
          statusText: (error as any).response.statusText,
          headers: (error as any).response.headers,
          body: (error as any).response.body,
        } : undefined,
        headers: (error as any).headers,
        // その他のプロパティ
        ...(Object.keys(error as any).reduce((acc, key) => {
          if (!['name', 'message', 'code', 'status', 'type', 'error', 'response', 'headers', 'stack'].includes(key)) {
            const value = (error as any)[key];
            // 循環参照を避けるため、オブジェクトは簡略化
            acc[key] = typeof value === 'object' ? '[Object]' : value;
          }
          return acc;
        }, {} as any)),
      });
      
      // スタックトレースも出力（最初の1000文字）
      if ((error as any).stack) {
        console.error('Stack trace:', (error as any).stack.substring(0, 1000));
      }
    } else {
      console.error('Error value:', error);
    }
    
    // エラーの種類に応じた詳細なメッセージを返す
    let errorMessage = '生成中にエラーが発生しました';
    let statusCode = 500;
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      const errorName = error.name.toLowerCase();
      const errorCode = (error as any).code;
      const errorStatus = (error as any).status;
      
      // OpenAI APIエラーの詳細判定
      // OpenAI SDK v6は通常、APIErrorオブジェクトを返す
      const isOpenAIError = errorName.includes('api') || 
                           errorName.includes('openai') ||
                           errorMsg.includes('openai') ||
                           errorCode ||
                           errorStatus ||
                           (error as any).error ||
                           (error as any).response;
      
      // エラーコードベースの判定（OpenAI APIの公式エラーコード）
      // 注意：errorStatus === 429は、サーバー側のレート制限ではなく、OpenAI APIのエラーであることを確認する必要がある
      // OpenAI APIのエラーは通常、errorCodeまたはerror.error.codeに含まれる
      const openaiErrorCode = errorCode || (error as any).error?.code;
      const openaiStatusCode = errorStatus || (error as any).error?.status;
      
      console.log('=== Error Analysis ===');
      console.log('OpenAI error code:', openaiErrorCode);
      console.log('OpenAI error status:', openaiStatusCode);
      console.log('isOpenAIError:', isOpenAIError);
      console.log('Error name:', errorName);
      console.log('Error message:', errorMsg);
      console.log('Error code (raw):', errorCode);
      console.log('Error status (raw):', errorStatus);
      console.log('=== End Error Analysis ===');
      
      if (openaiErrorCode === 'invalid_api_key' || openaiErrorCode === 'authentication_error' || openaiStatusCode === 401) {
        errorMessage = 'OpenAI APIキーが無効です。環境変数を確認してください。';
        statusCode = 401;
      } else if (openaiErrorCode === 'rate_limit_exceeded') {
        // OpenAI APIのレート制限（errorCodeが明確に'rate_limit_exceeded'の場合のみ）
        errorMessage = 'OpenAI APIのレート制限に達しました。しばらく待ってから再試行してください。';
        statusCode = 429;
      } else if (openaiStatusCode === 429 && isOpenAIError && errorName.includes('api')) {
        // OpenAI APIのレート制限（HTTP 429かつOpenAI APIエラーであることが確実な場合）
        errorMessage = 'OpenAI APIのレート制限に達しました。しばらく待ってから再試行してください。';
        statusCode = 429;
      } else if (errorCode === 'insufficient_quota' || errorCode === 'billing_not_active' || errorStatus === 402) {
        console.error('=== OpenAI API Quota/Billing Error ===');
        console.error('Error code:', errorCode);
        console.error('Error status:', errorStatus);
        console.error('Error message:', error.message);
        console.error('詳細：OpenAIアカウントのクレジット残高が不足しているか、支払い方法が設定されていません');
        console.error('対処法：');
        console.error('  1. https://platform.openai.com/account/billing で支払い方法を設定');
        console.error('  2. https://platform.openai.com/account/usage でクレジット残高を確認');
        console.error('  3. APIキーが有効か確認: https://platform.openai.com/api-keys');
        console.error('=== End Quota/Billing Error ===');
        errorMessage = 'OpenAI APIの利用可能量に達したか、アカウントの支払いが無効です。\n\n以下の手順で確認してください：\n1. 支払い方法の設定: https://platform.openai.com/account/billing\n2. クレジット残高の確認: https://platform.openai.com/account/usage\n3. APIキーの確認: https://platform.openai.com/api-keys';
        statusCode = 402;
      } else if (errorCode === 'invalid_request_error' || errorStatus === 400) {
        errorMessage = `OpenAI APIへのリクエストが無効です: ${error.message}`;
        statusCode = 400;
      } else if (errorCode === 'server_error' || errorStatus === 500 || errorStatus === 502 || errorStatus === 503) {
        errorMessage = 'OpenAI APIサーバーでエラーが発生しました。しばらく待ってから再試行してください。';
        statusCode = 503;
      } else if (errorMsg.includes('api key') || errorMsg.includes('invalid api key') || errorMsg.includes('authentication')) {
        errorMessage = 'OpenAI APIキーの設定に問題があります。環境変数を確認してください。';
        statusCode = 401;
      } else if (errorMsg.includes('rate limit') && (errorMsg.includes('openai') || isOpenAIError)) {
        // メッセージに"rate limit"と"openai"の両方が含まれる場合のみOpenAI APIのレート制限と判定
        errorMessage = 'OpenAI APIのレート制限に達しました。しばらく待ってから再試行してください。';
        statusCode = 429;
      } else if (errorMsg.includes('quota') || errorMsg.includes('billing') || errorMsg.includes('insufficient')) {
        errorMessage = 'OpenAI APIの利用可能量に達しました。アカウント設定を確認してください。';
        statusCode = 402;
      } else if (errorMsg.includes('network') || errorMsg.includes('timeout') || errorMsg.includes('fetch') || errorMsg.includes('econnrefused')) {
        errorMessage = 'ネットワークエラーが発生しました。接続を確認して再試行してください。';
        statusCode = 503;
      } else if (isOpenAIError) {
        // OpenAI API関連のその他のエラー（エラーコードとメッセージを表示）
        errorMessage = `OpenAI APIエラー (${errorCode || errorStatus || 'unknown'}): ${error.message}`;
        statusCode = errorStatus || 500;
      } else {
        // その他のエラー（詳細を表示）
        errorMessage = `生成エラー: ${error.message || '原因不明のエラーが発生しました'}`;
      }
    } else {
      console.error('Non-Error object thrown:', JSON.stringify(error, null, 2));
    }
    
    console.error('=== End Error Details ===');
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
