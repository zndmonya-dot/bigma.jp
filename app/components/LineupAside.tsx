    'use client';

import { Quote } from '@/lib/types';
import { POSITION_MAP } from '@/lib/constants';

type Props = {
  lineup: Quote[];
  handleTweet: (quote: Quote) => void;
};

export default function LineupAside({ lineup, handleTweet }: Props) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 shadow-xl min-h-[600px]">
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
                    {/* ヘッダー行: 左カラムに番号+ポジション、右カラムに本文。折り返しは常に右カラムで開始 */}
                    <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                      <div className="flex items-center gap-1">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-sm font-extrabold">
                          {idx + 1}
                        </span>
                        {positionLabel && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm font-bold leading-none">
                            {positionLabel}
                          </span>
                        )}
                      </div>
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
                    {/* 打線欄は表示のみ（いいね機能は無効化） */}
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeWidth={2} />
                      </svg>
                      <span className="text-xs font-semibold">いいね</span>
                      <span className="font-bold text-xs tabular-nums min-w-[1.25rem] text-right">{quote.likes || 0}</span>
                    </div>
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


    