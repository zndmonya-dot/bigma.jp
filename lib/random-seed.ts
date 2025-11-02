/**
 * 日付ベースのシードランダム関数
 * 同じ日付の間は同じ順序を保つ
 */

/**
 * 今日の日付文字列を取得（YYYY-MM-DD形式）
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * シード値を数値に変換（簡易的なハッシュ関数）
 */
function seedToNumber(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return Math.abs(hash);
}

/**
 * シードベースの乱数生成器
 */
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = seedToNumber(seed);
  }

  /**
   * 0以上1未満の乱数を生成
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * シードを使って配列をシャッフル
 */
export function shuffleWithSeed<T>(array: T[], seed: string): T[] {
  const seededRandom = new SeededRandom(seed);
  const result = [...array];
  
  // Fisher-Yates shuffle with seeded random
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom.next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

