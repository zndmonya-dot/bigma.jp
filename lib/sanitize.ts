/**
 * セキュリティ対策用のサニタイズ関数
 */

import { CHARACTER_LIMITS } from './constants';

/**
 * HTMLエスケープ（XSS対策）
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (s) => map[s]);
}

/**
 * 文字列をサニタイズ（HTMLエスケープ + 制御文字除去）
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // 制御文字を除去（改行・タブは許可）
  const cleaned = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // HTMLエスケープ
  return escapeHtml(cleaned);
}

/**
 * 入力値のバリデーション
 */
export function validateInput(input: string, maxLength: number): { valid: boolean; error?: string } {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: '入力が必要です' };
  }
  
  if (input.trim().length === 0) {
    return { valid: false, error: '空の入力は無効です' };
  }
  
  if (input.length > maxLength) {
    return { valid: false, error: `文字数は${maxLength}文字以内で入力してください` };
  }
  
  // 危険な文字列パターンをチェック
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return { valid: false, error: '無効な入力が検出されました' };
    }
  }
  
  return { valid: true };
}

/**
 * 数値のバリデーション
 */
export function validateNumber(value: any, min?: number, max?: number): { valid: boolean; value?: number; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: '数値が必要です' };
  }
  
  const num = Number(value);
  
  if (isNaN(num)) {
    return { valid: false, error: '有効な数値を入力してください' };
  }
  
  if (min !== undefined && num < min) {
    return { valid: false, error: `最小値は${min}です` };
  }
  
  if (max !== undefined && num > max) {
    return { valid: false, error: `最大値は${max}です` };
  }
  
  return { valid: true, value: num };
}

