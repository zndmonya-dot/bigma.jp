'use client';

import { Quote } from '@/lib/types';
import { DISPLAY_CONFIG } from '@/lib/constants';

type Props = {
  displayedQuotes: Quote[];
  likedQuotes: Set<number>;
  onLike: (id: number) => void;
  onTweet: (quote: Quote) => void;
  hasMore: boolean;
  totalCount: number;
  onLoadMore: () => void;
};

export default function QuotesList({ displayedQuotes, likedQuotes, onLike, onTweet, hasMore, totalCount, onLoadMore }: Props) {
  return (
    <div className="space-y-4 sm:space-y-6 min-h-[400px]">
      {displayedQuotes.map((quote) => {
        const isLiked = likedQuotes.has(quote.id);
        return (
          <div key={quote.id}>
            <article className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 sm:p-6 hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors shadow-lg">
              <div className="space-y-3">
                <div className="space-y-2.5">
                  <p className="text-base text-gray-900 dark:text-white leading-relaxed break-words">本人「{quote.original}」</p>
                  {quote.english && (
                    <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed break-words">通訳「{quote.english}」</p>
                  )}
                  <p className="text-base text-gray-900 dark:text-white font-bold leading-relaxed break-words">公式「{quote.translated}」</p>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 pt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLike(quote.id);
                    }}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                      isLiked ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-semibold">いいね</span>
                    <span className="text-sm font-bold tabular-nums min-w-[1.5rem] text-right">{quote.likes || 0}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTweet(quote);
                    }}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 rounded-full px-4 py-2 transition-colors"
                    title="リポスト"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-sm font-semibold">リポスト</span>
                  </button>
                </div>
              </div>
            </article>
          </div>
        );
      })}

      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={onLoadMore}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-full px-6 py-3 text-base transition-colors shadow-sm hover:shadow"
          >
            次の{DISPLAY_CONFIG.LOAD_MORE_INCREMENT}件を表示
          </button>
        </div>
      )}
    </div>
  );
}


