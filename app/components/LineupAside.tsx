    'use client';

import { Quote } from '@/lib/types';
import { POSITION_MAP } from '@/lib/constants';

type Props = {
  lineup: Quote[];
  likedQuotes: Set<number>;
  handleLike: (id: number) => void;
  handleTweet: (quote: Quote) => void;
};

export default function LineupAside({ lineup, likedQuotes, handleLike, handleTweet }: Props) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 shadow-xl">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">打線</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">本日のスタメン</p>
      </div>
      {lineup.length === 0 ? (
        <p className="text-base text-gray-500 dark:text-gray-400">データがありません</p>
      ) : (
        <div className="space-y-3">
          {lineup.map((quote, idx) => {
            const positionLabel = quote.position ? (POSITION_MAP[quote.position] || `(${quote.position})`) : '';
            return (
              <div key={quote.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-bold">
                        {idx + 1}
                      </span>
                      {positionLabel && (
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{positionLabel}</span>
                      )}
                      <p className="text-base text-gray-900 dark:text-white leading-relaxed break-words m-0">
                        本人「{quote.original}」
                      </p>
                    </div>
                    {quote.english && (
                      <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed break-words">通訳「{quote.english}」</p>
                    )}
                    <p className="text-base text-gray-900 dark:text-white font-bold leading-relaxed break-words">公式「{quote.translated}」</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => handleLike(quote.id)}
                      className={`flex items-center gap-1 hover:text-red-500 dark:hover:text-red-400 transition-colors ${likedQuotes.has(quote.id) ? 'text-red-500 dark:text-red-400' : ''}`}
                      title={likedQuotes.has(quote.id) ? 'いいねを解除' : 'いいね'}
                    >
                      <svg className="w-4 h-4" fill={likedQuotes.has(quote.id) ? 'currentColor' : 'none'} stroke={likedQuotes.has(quote.id) ? 'none' : 'currentColor'} viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeWidth={likedQuotes.has(quote.id) ? 0 : 2} />
                      </svg>
                      <span className="text-xs font-semibold">いいね</span>
                      <span className="font-bold text-xs tabular-nums min-w-[1.25rem] text-right">{quote.likes || 0}</span>
                    </button>
                    <button
                      onClick={() => handleTweet(quote)}
                      className="flex items-center gap-1 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                      title="リポスト"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="text-xs font-semibold">リポスト</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


    