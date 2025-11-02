import { NextRequest } from 'next/server';
import { addQuote } from '@/lib/quotes';
import { sanitizeInput, validateInput } from '@/lib/sanitize';
import { CHARACTER_LIMITS } from '@/lib/constants';
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
      original?: string;
      english?: string;
      translated?: string;
    }>(request);
    
    if ('error' in parseResult) {
      return parseResult.error;
    }
    
    const { original, english, translated } = parseResult.data;

    // バリデーション
    if (!original || !translated) {
      return createErrorResponse(
        'original（入力）とtranslated（公式）は必須です',
        400
      );
    }

    // 入力値のバリデーションとサニタイズ
    log(LogLevel.DEBUG, '保存API バリデーション開始', {
      originalLength: original?.length,
      translatedLength: translated?.length,
      englishLength: english?.length,
    });
    
    const originalValidation = validateInput(original, CHARACTER_LIMITS.INPUT_MAX);
    log(LogLevel.DEBUG, 'originalバリデーション', originalValidation);
    if (!originalValidation.valid) {
      log(LogLevel.WARN, 'originalバリデーション失敗', originalValidation.error);
      return createErrorResponse(
        `original: ${originalValidation.error}`,
        400
      );
    }

    const translatedValidation = validateInput(translated, CHARACTER_LIMITS.TRANSLATED_MAX);
    log(LogLevel.DEBUG, 'translatedバリデーション', translatedValidation);
    if (!translatedValidation.valid) {
      log(LogLevel.WARN, 'translatedバリデーション失敗', translatedValidation.error);
      return createErrorResponse(
        `translated: ${translatedValidation.error}`,
        400
      );
    }

    let sanitizedEnglish: string | undefined;
    if (english) {
      const englishValidation = validateInput(english, CHARACTER_LIMITS.ENGLISH_MAX);
      log(LogLevel.DEBUG, 'englishバリデーション', englishValidation);
      if (!englishValidation.valid) {
        log(LogLevel.WARN, 'englishバリデーション失敗', englishValidation.error);
        return createErrorResponse(
          `english: ${englishValidation.error}`,
          400
        );
      }
      sanitizedEnglish = sanitizeInput(english.trim());
    }
    log(LogLevel.DEBUG, '保存API バリデーション完了');

    // サニタイズされた値を保存
    await addQuote({
      original: sanitizeInput(original.trim()),
      english: sanitizedEnglish,
      translated: sanitizeInput(translated.trim()),
    });

    log(LogLevel.INFO, '語録追加成功', { original: original.substring(0, 20) + '...' });
    
    return createSuccessResponse(
      undefined,
      '語録が追加されました'
    );
  } catch (error) {
    return handleApiError(error, '語録の追加に失敗しました');
  }
}

