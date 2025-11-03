'use client';

import { useState, useEffect } from 'react';
import { Quote, TabType } from '@/lib/types';
import { 
  RATE_LIMIT, 
  CHARACTER_LIMITS, 
  DISPLAY_CONFIG, 
  FIELD_PLAYER_POSITIONS, 
  POSITION_MAP,
  GENERATE_BUTTON_COLOR 
} from '@/lib/constants';
import { getLikedQuotes, saveLikedQuotes, getGenerationCount, updateGenerationCount } from '@/lib/storage';
import { calculateScore, formatQuoteForTwitter, createTweetUrl } from '@/lib/utils';
import { getTodayString, shuffleWithSeed } from '@/lib/random-seed';

/**
 * スピナーコンポーネント
 */
const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-t-transparent rounded-full animate-spin`}
      style={{ borderColor: `${GENERATE_BUTTON_COLOR.PRIMARY} transparent transparent transparent` }}
    ></div>
  );
};

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [displayedQuotes, setDisplayedQuotes] = useState<Quote[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(DISPLAY_CONFIG.INITIAL_QUOTES_COUNT);
  const [loading, setLoading] = useState(true);
  const [likedQuotes, setLikedQuotes] = useState<Set<number>>(new Set());
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ english: string; translated: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('new');

  useEffect(() => {
    setLikedQuotes(getLikedQuotes());
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const response = await fetch('/api/quotes/list');
      const data = await response.json();
      if (data.success) {
        const quotesList = (data.data.quotes || []).map((q: Quote) => ({
          ...q,
          likes: q.likes || 0,
          retweets: q.retweets || 0,
          quoteRetweets: q.quoteRetweets || 0,
        }));
        setAllQuotes(quotesList);
        updateQuotesByTab(quotesList, activeTab);
      }
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuotesByTab = (quotesList: Quote[], tab: TabType) => {
    let sorted: Quote[] = [];
    
    switch (tab) {
      case 'new':
        // 新着：ID降順（最新から）
        sorted = [...quotesList].sort((a, b) => b.id - a.id);
        break;
      case 'monthly':
        // 月間：スコア順ランキング（将来的にcreatedAtで30日以内をフィルタ）
        sorted = [...quotesList].sort((a, b) => calculateScore(b) - calculateScore(a));
        break;
      case 'total':
        // 累計：スコア順ランキング
        sorted = [...quotesList].sort((a, b) => calculateScore(b) - calculateScore(a));
        break;
    }
    
    setQuotes(sorted.slice(0, DISPLAY_CONFIG.MAX_RANKING_QUOTES));
    setDisplayedQuotes(sorted.slice(0, DISPLAY_CONFIG.INITIAL_QUOTES_COUNT));
    setDisplayCount(DISPLAY_CONFIG.INITIAL_QUOTES_COUNT);
  };

  useEffect(() => {
    if (allQuotes.length > 0) {
      updateQuotesByTab(allQuotes, activeTab);
    }
  }, [activeTab, allQuotes]);

  const handleLoadMore = () => {
    const nextCount = displayCount + DISPLAY_CONFIG.LOAD_MORE_INCREMENT;
    setDisplayCount(nextCount);
    setDisplayedQuotes(quotes.slice(0, Math.min(nextCount, quotes.length)));
  };

  /**
   * クライアント側のレート制限チェック
   * 開発環境（localhost）では無効化
   */
  const checkClientRateLimit = (): boolean => {
    // 開発環境ではレート制限を無効化
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost'))) {
      return true;
    }
    
    const today = new Date();
    const count = getGenerationCount(today);
    
    if (count >= RATE_LIMIT.CLIENT_DAILY_GENERATIONS) {
      setError('1日あたりの生成回数上限に達しました。明日再度お試しください。');
      return false;
    }
    
    return true;
  };
  
  /**
   * クライアント側のレート制限を更新
   */
  const updateClientRateLimit = (increment: number = 1) => {
    updateGenerationCount(new Date(), increment);
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('入力してください');
      return;
    }
    
    // クライアント側レート制限チェック
    if (!checkClientRateLimit()) {
      return;
    }

    setGenerating(true);
    setError('');
    setResult(null);
    
        updateClientRateLimit();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        // JSONパースエラーの場合
        setError('サーバーからの応答を読み取れませんでした');
        updateClientRateLimit(-1);
        return;
      }

      if (!response.ok) {
        const errorMsg = data?.error || `生成に失敗しました（${response.status}）`;
        setError(errorMsg);
        
        if (response.status === 429 || response.status === 503) {
          updateClientRateLimit(-1);
        }
        
        console.error('Generate API error:', {
          status: response.status,
          error: data?.error,
          data,
        });
        
        return;
      }

      // レスポンスデータの検証
      if (!data || (!data.english && !data.translated)) {
        setError('生成されたデータが不正です');
        updateClientRateLimit(-1);
        return;
      }

      const generatedResult = {
        english: data.english || '',
        translated: data.translated || '',
      };
      
      setResult(generatedResult);
      
      // 自動保存（強制保存）
      try {
        console.log('=== 自動保存開始 ===');
        console.log('保存するデータ:', {
          original: input,
          english: generatedResult.english || undefined,
          translated: generatedResult.translated,
        });
        
        const saveResponse = await fetch('/api/quotes/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original: input,
            english: generatedResult.english || undefined,
            translated: generatedResult.translated,
          }),
        });

        console.log('保存レスポンスステータス:', saveResponse.status);
        
        if (!saveResponse.ok) {
          let errorMessage = `保存APIエラー: ${saveResponse.status}`;
          try {
            const errorData = await saveResponse.json();
            console.error('自動保存エラー（HTTP）:', saveResponse.status, errorData);
            errorMessage = errorData.error || errorMessage;
          } catch (parseErr) {
            const errorText = await saveResponse.text();
            console.error('自動保存エラー（HTTP、テキスト）:', saveResponse.status, errorText);
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const saveData = await saveResponse.json();
        console.log('保存レスポンスデータ:', saveData);

        if (saveData.success) {
          console.log('自動保存成功');
          // 保存成功時に語録一覧を再読み込み
          await loadQuotes();
        } else {
          console.error('自動保存に失敗しました:', saveData.error);
          // エラーメッセージを表示（ユーザーに通知）
          setError(`保存に失敗しました: ${saveData.error || '不明なエラー'}`);
        }
      } catch (saveErr) {
        console.error('=== 自動保存エラー ===');
        console.error('エラー詳細:', saveErr);
        console.error('=== 自動保存エラー終了 ===');
        // エラーメッセージを表示（ユーザーに通知）
        const errorMsg = saveErr instanceof Error ? saveErr.message : '保存中にエラーが発生しました';
        setError(`自動保存に失敗しました: ${errorMsg}`);
      }
    } catch (err) {
      // ネットワークエラーやその他の予期しないエラー
      const errorMsg = err instanceof Error 
        ? `ネットワークエラー: ${err.message}` 
        : '予期しないエラーが発生しました';
      
      setError(errorMsg);
      updateClientRateLimit(-1);
      
      console.error('Generate fetch error:', err);
    } finally {
      setGenerating(false);
    }
  };



  const handleLike = async (quoteId: number) => {
    const isLiked = likedQuotes.has(quoteId);

    try {
      const response = await fetch('/api/quotes/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, action: isLiked ? 'unlike' : 'like' }),
      });

      const data = await response.json();
      if (data.success) {
        const newLikedQuotes = new Set(likedQuotes);
        if (isLiked) {
          newLikedQuotes.delete(quoteId);
        } else {
          newLikedQuotes.add(quoteId);
        }
        setLikedQuotes(newLikedQuotes);
        saveLikedQuotes(newLikedQuotes);

        // いいね数を更新して再ソート
        setAllQuotes(prev => {
          const updated = prev.map(q => 
            q.id === quoteId ? { ...q, likes: data.data.likes } : q
          );
          updateQuotesByTab(updated, activeTab);
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to like quote:', error);
    }
  };

  /**
   * X（Twitter）に投稿
   */
  const handleTweet = (quote: Quote) => {
    const text = formatQuoteForTwitter(quote);
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const tweetUrl = createTweetUrl(text, url);
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * X（Twitter）で引用リツイート
   */
  const handleQuoteRetweet = (quote: Quote) => {
    const text = formatQuoteForTwitter(quote);
    const url = typeof window !== 'undefined' ? `${window.location.origin}?id=${quote.id}` : '';
    const tweetUrl = createTweetUrl(text, url);
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * ベストナイン用に語録をソート・ランダム化
   * 累計スコア順で、野手ポジションのみを取得して上位9位を取得し、日付ベースのシードでランダムに並び替え
   * 投手ポジション（先発、中継ぎ、抑え）は除外
   * ランダム化は1日1回（日付が変わるまで同じ順序）
   */
  const totalSortedQuotes = [...allQuotes].sort((a, b) => calculateScore(b) - calculateScore(a));
  // 野手ポジションのみをフィルタ
  const fieldPlayerQuotes = totalSortedQuotes.filter(quote => {
    if (!quote.position) return false;
    return FIELD_PLAYER_POSITIONS.includes(quote.position as any);
  });
  // 上位9位を取得
  const topNine = fieldPlayerQuotes.slice(0, DISPLAY_CONFIG.LINEUP_MAX);
  // 日付ベースのシードでランダムに並び替え（1日1回の集計）
  const todaySeed = getTodayString();
  const lineup = shuffleWithSeed(topNine, todaySeed);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* タイトル欄 */}
      <header className="sticky top-0 bg-white dark:bg-black/95 backdrop-blur-xl z-20 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-center py-3 sm:py-4 md:py-6 min-h-[60px] sm:min-h-[80px] md:min-h-[100px]">
            <div className="flex items-center justify-between w-full lg:col-span-2 lg:justify-start">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-normal">
                <span className="tracking-tighter font-extrabold">Bigma</span>
              </h1>
            </div>
            <div className="flex items-center justify-end lg:col-span-1 lg:justify-start">
              <a
                href="https://twitter.com/your_handle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-white hover:text-sky-500 dark:hover:text-sky-400 transition-colors group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div className="text-left hidden sm:block min-w-0 max-w-[140px]">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 mb-0.5 sm:mb-1 truncate">製作者</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">@your_handle</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 truncate">ひとこと</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-start">
          
          {/* 左側：生成欄と語録一覧 */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
            
            {/* 生成欄 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
                語録を増やす
              </h2>
              
              <section className="mt-4">
                <div className="space-y-4">
                  {/* AI生成フォーム */}
                  <>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleGenerate();
                        }}
                        className="flex gap-2 items-start max-w-xl"
                      >
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="本人になりきって謙虚な言葉を入力…"
                            maxLength={CHARACTER_LIMITS.INPUT_MAX}
                            className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-3 pr-16 text-base placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 dark:focus:border-sky-500"
                            disabled={generating}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
                            {input.length}/{CHARACTER_LIMITS.INPUT_MAX}
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={generating || !input.trim()}
                          style={{ backgroundColor: GENERATE_BUTTON_COLOR.PRIMARY }}
                          className="hover:opacity-90 text-white font-bold rounded-full px-4 py-3 text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0 w-[80px]"
                          onMouseEnter={(e) => {
                            if (!generating && input.trim()) {
                              e.currentTarget.style.backgroundColor = GENERATE_BUTTON_COLOR.HOVER;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = GENERATE_BUTTON_COLOR.PRIMARY;
                          }}
                        >
                          <span className="flex items-center justify-center gap-1.5 w-full">
                            {generating && <Spinner size="sm" />}
                            <span>{generating ? '生成中...' : '生成'}</span>
                          </span>
                        </button>
                      </form>
                      
                      {error && (
                        <div className="text-sm text-red-500 dark:text-red-400 px-2">{error}</div>
                      )}

                      {/* 生成中表示 */}
                      {generating && !result && (
                        <div className="mt-5 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3">
                          <Spinner size="md" />
                          <p className="text-base text-gray-600 dark:text-gray-400">生成中...</p>
                        </div>
                      )}

                      {/* 生成結果 */}
                      {result && (
                        <div className="mt-5 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                          {/* 警告メッセージ */}
                          <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-xs text-yellow-800 dark:text-yellow-200">
                              ⚠️ <strong>注意:</strong> 本サービスが生成するコンテンツは、実際の発言や事実を反映したものではありません。エンターテインメント目的のネタ・ジョークとしてお楽しみください。
                            </p>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">生成結果（自動保存済み）</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-base text-gray-900 dark:text-white leading-relaxed break-words">
                              本人「{input}」
                            </p>
                            {result.english && (
                              <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed break-words">
                                通訳「{result.english}」
                              </p>
                            )}
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-base text-gray-900 dark:text-white font-bold leading-relaxed break-words flex-1">
                                公式「{result.translated}」
                              </p>
                              {/* X投稿ボタン */}
                              <button
                                onClick={() => {
                                  const text = formatQuoteForTwitter({ original: input, english: result.english, translated: result.translated } as Quote);
                                  const url = typeof window !== 'undefined' ? window.location.origin : '';
                                  const tweetUrl = createTweetUrl(text, url);
                                  window.open(tweetUrl, '_blank', 'noopener,noreferrer');
                                }}
                                className="inline-flex items-center gap-1.5 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-normal rounded-full px-3 py-1.5 text-xs transition-colors bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex-shrink-0"
                              >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                                Xで投稿
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                  </>
                </div>
              </section>
            </div>

            {/* みんなの生成一覧 */}
            <section className="mt-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  みんなの語録一覧
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {allQuotes.length}件の語録（言っていない）
                </p>
              </div>
              
              {/* タブ */}
              <div className="flex gap-2 mt-4 mb-4 border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab('new')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === 'new'
                      ? 'text-sky-500 dark:text-sky-400 border-sky-500 dark:border-sky-400'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  新着
                </button>
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === 'monthly'
                      ? 'text-sky-500 dark:text-sky-400 border-sky-500 dark:border-sky-400'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  月間
                </button>
                <button
                  onClick={() => setActiveTab('total')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === 'total'
                      ? 'text-sky-500 dark:text-sky-400 border-sky-500 dark:border-sky-400'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  累計
                </button>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24 md:py-32 gap-4">
                  <Spinner size="lg" />
                  <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400">読み込み中...</p>
                </div>
              ) : displayedQuotes.length === 0 ? (
                <div className="flex items-center justify-center py-16 sm:py-24 md:py-32">
                  <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400">語録がまだ登録されていません</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                {displayedQuotes.map((quote) => {
                  const isLiked = likedQuotes.has(quote.id);
                  
                  return (
                    <div key={quote.id}>
                      <article className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 sm:p-6 hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors shadow-lg">
                        <div className="space-y-3">
                          <div className="space-y-2.5">
                            <p className="text-base text-gray-900 dark:text-white leading-relaxed break-words">
                              本人「{quote.original}」
                            </p>
                            {quote.english && (
                              <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed break-words">
                                通訳「{quote.english}」
                              </p>
                            )}
                            <p className="text-base text-gray-900 dark:text-white font-bold leading-relaxed break-words">
                              公式「{quote.translated}」
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(quote.id);
                              }}
                              className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
                                isLiked
                                  ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400'
                              }`}
                            >
                              <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span className="text-sm font-semibold">いいね</span>
                              <span className="text-sm font-bold">{quote.likes || 0}</span>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuoteRetweet(quote);
                              }}
                              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-500 dark:hover:text-green-400 rounded-full px-4 py-2 transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                              <span className="text-sm font-semibold">リツイート</span>
                              <span className="text-sm font-bold">{quote.retweets || 0}</span>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTweet(quote);
                              }}
                              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-500 dark:hover:text-sky-400 rounded-full px-4 py-2 transition-all"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                              <span className="text-sm font-semibold">引用リツイート</span>
                              <span className="text-sm font-bold">{quote.quoteRetweets || 0}</span>
                            </button>
                          </div>
                        </div>
                      </article>
                      
                    </div>
                  );
                })}
                
                {/* もっと見るボタン */}
                {displayedQuotes.length < quotes.length && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={handleLoadMore}
                      className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-full px-6 py-3 text-base transition-colors shadow-sm hover:shadow"
                    >
                      次の{DISPLAY_CONFIG.LOAD_MORE_INCREMENT}件を表示（あと{quotes.length - displayedQuotes.length}件）
                    </button>
                  </div>
                )}
                </div>
              )}
            </section>
          </div>

          {/* 右側：打線欄 */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-4 mt-6">
              {/* 打線欄 */}
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 shadow-xl">
                <div className="mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">打線</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">累計上位9位（ベストナイン）</p>
                </div>
                
                {lineup.length === 0 ? (
                  <p className="text-base text-gray-500 dark:text-gray-400">データがありません</p>
                ) : (
                  <div className="space-y-3">
                    {lineup.map((quote, idx) => {
                      const positionLabel = quote.position ? POSITION_MAP[quote.position] || `(${quote.position})` : '';
                      
                      return (
                        <div 
                          key={quote.id} 
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                              <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                                {idx + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="space-y-2 mb-3">
                              {positionLabel && (
                                <span className="inline-block text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full mb-1">
                                  {positionLabel}
                                </span>
                              )}
                                <p className="text-base text-gray-900 dark:text-white leading-relaxed break-words">
                                  本人「{quote.original}」
                                </p>
                                {quote.english && (
                                  <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed break-words">
                                    通訳「{quote.english}」
                                  </p>
                                )}
                                <p className="text-base text-gray-900 dark:text-white font-bold leading-relaxed break-words">
                                  公式「{quote.translated}」
                                </p>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                  onClick={() => handleLike(quote.id)}
                                  className={`flex items-center gap-1 hover:text-red-500 dark:hover:text-red-400 transition-colors ${
                                    likedQuotes.has(quote.id) ? 'text-red-500 dark:text-red-400' : ''
                                  }`}
                                  title={likedQuotes.has(quote.id) ? 'いいねを解除' : 'いいね'}
                                >
                                  <svg className="w-4 h-4" fill={likedQuotes.has(quote.id) ? 'currentColor' : 'none'} stroke={likedQuotes.has(quote.id) ? 'none' : 'currentColor'} viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeWidth={likedQuotes.has(quote.id) ? 0 : 2} />
                                  </svg>
                                  <span className="font-bold text-xs">{quote.likes || 0}</span>
                                </button>
                                <button
                                  onClick={() => handleQuoteRetweet(quote)}
                                  className="flex items-center gap-1 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                                  title="引用リツイート"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                  </svg>
                                  <span className="font-bold text-xs">{quote.quoteRetweets || 0}</span>
                                </button>
                                <button
                                  onClick={() => handleTweet(quote)}
                                  className="flex items-center gap-1 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                                  title="リツイート"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                  </svg>
                                  <span className="font-bold text-xs">{quote.retweets || 0}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
      
      {/* フッター */}
      <footer className="mt-12 py-6 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span>© 2025 Bigma</span>
              <span className="hidden sm:inline">|</span>
              <a 
                href="/legal" 
                className="hover:text-gray-700 dark:hover:text-gray-300 underline"
              >
                免責事項・利用規約
              </a>
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              ⚠️ 本サービスが生成するコンテンツは実際の発言ではありません
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
