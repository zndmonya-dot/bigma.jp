/**
 * 簡易レート制限実装（メモリベース）
 * 本番環境ではRedisなどの永続化ストレージを使用することを推奨
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * IPアドレスを取得
 */
export function getClientIp(request: { headers: { get: (key: string) => string | null } }): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

/**
 * レート制限チェック
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // 新しいウィンドウを開始
    const resetAt = now + windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime: resetAt,
    });
    
    // 古いレコードをクリーンアップ（簡易版）
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (now > v.resetTime) {
          rateLimitStore.delete(k);
        }
      }
    }

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetTime,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetTime,
  };
}

