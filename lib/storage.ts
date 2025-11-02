/**
 * LocalStorage ユーティリティ
 */

/**
 * いいね済みの語録IDを取得
 */
export function getLikedQuotes(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const liked = localStorage.getItem('likedQuotes');
    if (liked) {
      const likedArray = JSON.parse(liked);
      return new Set(likedArray);
    }
  } catch (e) {
    console.error('Failed to parse liked quotes:', e);
  }
  
  return new Set();
}

/**
 * いいね済みの語録IDを保存
 */
export function saveLikedQuotes(likedQuotes: Set<number>): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('likedQuotes', JSON.stringify(Array.from(likedQuotes)));
  } catch (e) {
    console.error('Failed to save liked quotes:', e);
  }
}

/**
 * クライアント側の生成回数を取得
 */
export function getGenerationCount(date: Date): number {
  if (typeof window === 'undefined') return 0;
  
  const today = date.toDateString();
  const key = `generate_count_${today}`;
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * クライアント側の生成回数を更新
 */
export function updateGenerationCount(date: Date, increment: number = 1): void {
  if (typeof window === 'undefined') return;
  
  const today = date.toDateString();
  const key = `generate_count_${today}`;
  const stored = localStorage.getItem(key);
  const count = stored ? parseInt(stored, 10) : 0;
  localStorage.setItem(key, String(count + increment));
}

