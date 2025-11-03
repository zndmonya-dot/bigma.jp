'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ english: string; translated: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('new');

  useEffect(() => {
    setLikedQuotes(getLikedQuotes());
    loadQuotes();
  }, []);

  const loadQuotes = async (forceRefresh: boolean = false, cursor?: number | null) => {
    try {
      // キャッシュキー
      const cacheKey = 'quotes_cache';
      const cacheETagKey = 'quotes_etag';
      const cacheTimeKey = 'quotes_cache_time';
      const CACHE_DURATION = 60 * 1000; // 60秒キャッシュ
      
      // キャッシュから取得（強制リフレッシュでない場合）
      if (!forceRefresh && typeof window !== 'undefined') {
        const cachedData = localStorage.getItem(cacheKey);
        const cachedETag = localStorage.getItem(cacheETagKey);
        const cacheTime = localStorage.getItem(cacheTimeKey);
        
        if (cachedData && cacheTime && cachedETag) {
          const age = Date.now() - parseInt(cacheTime, 10);
          if (age < CACHE_DURATION) {
            // キャッシュが有効な場合、キャッシュから読み込む
            try {
              const quotesList = JSON.parse(cachedData).map((q: Quote) => ({
                ...q,
                likes: q.likes || 0,
                retweets: q.retweets || 0,
                // quoteRetweets: removed from UI usage
              }));
              setAllQuotes(quotesList);
              updateQuotesByTab(quotesList, activeTab);
              setLoading(false);
              
              // バックグラウンドで最新データを確認（ETag比較）
              checkForUpdates(cachedETag);
              return;
            } catch (parseError) {
              console.error('Cache parse error:', parseError);
              // キャッシュが壊れている場合は続行してサーバーから取得
            }
          }
        }
      }
      
      // サーバーから取得
      const headers: HeadersInit = {};
      if (!forceRefresh && typeof window !== 'undefined') {
        const cachedETag = localStorage.getItem(cacheETagKey);
        if (cachedETag) {
          headers['If-None-Match'] = cachedETag;
        }
      }
      
      const params = new URLSearchParams();
      params.set('limit', String(DISPLAY_CONFIG.LOAD_MORE_INCREMENT));
      if (cursor) params.set('cursor', String(cursor));
      const response = await fetch(`/api/quotes/list?${params.toString()}`, { headers });
      
      if (response.status === 304) {
        // 304 Not Modified: データは変更されていない（キャッシュを使用）
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData && typeof window !== 'undefined') {
          const quotesList = JSON.parse(cachedData).map((q: Quote) => ({
            ...q,
            likes: q.likes || 0,
            retweets: q.retweets || 0,
            // quoteRetweets: removed from UI usage
          }));
          setAllQuotes(quotesList);
          updateQuotesByTab(quotesList, activeTab);
        }
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        const quotesList = (data.data.quotes || []).map((q: Quote) => ({
          ...q,
          likes: q.likes || 0,
          retweets: q.retweets || 0,
          // quoteRetweets: removed from UI usage
        }));
        
        // キャッシュに保存
        if (typeof window !== 'undefined') {
          const etag = response.headers.get('ETag');
          if (etag) {
            localStorage.setItem(cacheETagKey, etag.replace(/"/g, ''));
          }
          localStorage.setItem(cacheKey, JSON.stringify(quotesList));
          localStorage.setItem(cacheTimeKey, Date.now().toString());
        }
        
        if (cursor) {
          setAllQuotes(prev => {
            const merged = [...prev, ...quotesList];
            updateQuotesByTab(merged, activeTab);
            return merged;
          });
        } else {
          setAllQuotes(quotesList);
          updateQuotesByTab(quotesList, activeTab);
        }

        setHasMore(Boolean(data.data.pageInfo?.hasMore));
        setNextCursor(data.data.pageInfo?.nextCursor ?? null);
      }
    } catch (error) {
      console.error('Failed to load quotes:', error);
      // エラー時はキャッシュから読み込む（フォールバック）
      if (typeof window !== 'undefined') {
        const cachedData = localStorage.getItem('quotes_cache');
        if (cachedData) {
          try {
            const quotesList = JSON.parse(cachedData).map((q: Quote) => ({
              ...q,
              likes: q.likes || 0,
              retweets: q.retweets || 0,
              // quoteRetweets: removed from UI usage
            }));
            setAllQuotes(quotesList);
            updateQuotesByTab(quotesList, activeTab);
          } catch (parseError) {
            console.error('Fallback cache parse error:', parseError);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 日次キャッシュされたランキング順を取得/保存
   */
  const getRankingCacheKey = (tab: 'weekly' | 'monthly', date: string) => `ranking_order_${tab}_${date}`;

  const readRankingOrder = (tab: 'weekly' | 'monthly', date: string): number[] | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(getRankingCacheKey(tab, date));
      if (!raw) return null;
      const ids: number[] = JSON.parse(raw);
      return Array.isArray(ids) ? ids : null;
    } catch {
      return null;
    }
  };

  const writeRankingOrder = (tab: 'weekly' | 'monthly', date: string, ids: number[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(getRankingCacheKey(tab, date), JSON.stringify(ids));
    } catch {}
  };

  /**
   * バックグラウンドでデータ更新をチェック（ETag比較）
   */
  const checkForUpdates = async (cachedETag: string) => {
    try {
      const response = await fetch('/api/quotes/list', {
        headers: {
          'If-None-Match': cachedETag,
        },
      });
      
      if (response.status === 200) {
        // データが更新されている場合は再読み込み
        const data = await response.json();
        if (data.success) {
          const quotesList = (data.data.quotes || []).map((q: Quote) => ({
            ...q,
            likes: q.likes || 0,
            retweets: q.retweets || 0,
            // quoteRetweets: removed from UI usage
          }));
          
          const etag = response.headers.get('ETag');
          if (etag && typeof window !== 'undefined') {
            localStorage.setItem('quotes_etag', etag.replace(/"/g, ''));
            localStorage.setItem('quotes_cache', JSON.stringify(quotesList));
            localStorage.setItem('quotes_cache_time', Date.now().toString());
          }
          
          setAllQuotes(quotesList);
          updateQuotesByTab(quotesList, activeTab);
        }
      }
      // 304の場合はデータ変更なし（何もしない）
    } catch (error) {
      // バックグラウンド更新のエラーは無視（メインの読み込みには影響しない）
      console.debug('Background update check failed:', error);
    }
  };

  const updateQuotesByTab = (quotesList: Quote[], tab: TabType) => {
    let sorted: Quote[] = [];
    
    switch (tab) {
      case 'new':
        // 新着：ID降順（最新から）→ 最新100件まで
        sorted = [...quotesList]
          .sort((a, b) => b.id - a.id)
          .slice(0, 100);
        break;
      case 'weekly':
        // 週間：一日一回の固定ランキング（JST日付でキャッシュ）
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklyQuotes = quotesList.filter(quote => {
          if (!quote.createdAt) return false;
          const createdDate = new Date(quote.createdAt);
          return createdDate >= sevenDaysAgo;
        });
        {
          const today = getTodayString();
          const cachedOrder = readRankingOrder('weekly', today);
          if (cachedOrder) {
            const map = new Map(weeklyQuotes.map(q => [q.id, q] as const));
            sorted = cachedOrder.map(id => map.get(id)).filter((q): q is Quote => Boolean(q));
          } else {
            const computed = [...weeklyQuotes].sort((a, b) => (b.likes || 0) - (a.likes || 0));
            sorted = computed;
            writeRankingOrder('weekly', today, computed.map(q => q.id));
          }
        }
        break;
      case 'monthly':
        // 月間：一日一回の固定ランキング（JST日付でキャッシュ）
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyQuotes = quotesList.filter(quote => {
          if (!quote.createdAt) return false;
          const createdDate = new Date(quote.createdAt);
          return createdDate >= thirtyDaysAgo;
        });
        {
          const today = getTodayString();
          const cachedOrder = readRankingOrder('monthly', today);
          if (cachedOrder) {
            const map = new Map(monthlyQuotes.map(q => [q.id, q] as const));
            sorted = cachedOrder.map(id => map.get(id)).filter((q): q is Quote => Boolean(q));
          } else {
            const computed = [...monthlyQuotes].sort((a, b) => (b.likes || 0) - (a.likes || 0));
            sorted = computed.slice(0, 100);
            writeRankingOrder('monthly', today, sorted.map(q => q.id));
          }
        }
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

  const handleLoadMore = async () => {
    if (hasMore && nextCursor) {
      await loadQuotes(false, nextCursor);
    }
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
      if (!data) {
        setError('サーバーからの応答がありません');
        updateClientRateLimit(-1);
        return;
      }
      
      // createSuccessResponseは { success: true, data: {...} } の形式で返す
      const resultData = data.data || data;
      
      // translatedは必須（englishは任意）
      if (!resultData.translated || typeof resultData.translated !== 'string' || resultData.translated.trim().length === 0) {
        console.error('生成データ検証失敗:', {
          hasTranslated: !!resultData.translated,
          translatedType: typeof resultData.translated,
          translatedLength: resultData.translated?.length,
          english: resultData.english?.substring(0, 50),
          translated: resultData.translated?.substring(0, 50),
          rawData: data,
        });
        setError('生成された公式コメントが不正です');
        updateClientRateLimit(-1);
        return;
      }

      const generatedResult = {
        english: resultData.english || '',
        translated: resultData.translated || '',
      };
      
      // 最終チェック: translatedは必須
      if (!generatedResult.translated || generatedResult.translated.trim().length === 0) {
        console.error('最終チェック失敗: translatedが空', {
          generatedResult,
          originalData: data,
        });
        setError('生成された公式コメントが不正です');
        updateClientRateLimit(-1);
        return;
      }
      
      setResult(generatedResult);
      
      // 自動保存（強制保存）
      try {
        console.log('=== 自動保存開始 ===');
        console.log('保存するデータ:', {
          original: input,
          originalLength: input.length,
          english: generatedResult.english || undefined,
          englishLength: generatedResult.english?.length || 0,
          translated: generatedResult.translated,
          translatedLength: generatedResult.translated.length,
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
          // 保存成功時に語録一覧を再読み込み（キャッシュを無効化して強制更新）
          await loadQuotes(true);
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
    
    // 楽観的更新：即座にUIを更新（サーバー応答を待たない）
    const newLikedQuotes = new Set(likedQuotes);
    if (isLiked) {
      newLikedQuotes.delete(quoteId);
    } else {
      newLikedQuotes.add(quoteId);
    }
    setLikedQuotes(newLikedQuotes);
    saveLikedQuotes(newLikedQuotes);

    // いいね数を楽観的に更新（即座に反映）
    const optimisticLikes = (() => {
      const currentQuote = allQuotes.find(q => q.id === quoteId);
      const currentLikes = currentQuote?.likes || 0;
      return isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
    })();

    // UIを即座に更新（一覧のみ、打線は固定のため更新しない）
    setAllQuotes(prev => {
      const updated = prev.map(q => 
        q.id === quoteId ? { ...q, likes: optimisticLikes } : q
      );
      // 打線を除く一覧のみ再ソート（打線はJST 0時に固定）
      updateQuotesByTab(updated, activeTab);
      return updated;
    });

    // バックグラウンドでサーバーに同期（エラー時はロールバック）
    try {
      const response = await fetch('/api/quotes/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, action: isLiked ? 'unlike' : 'like' }),
      });

      const data = await response.json();
      if (data.success) {
        // サーバーから返された実際のいいね数で更新
        setAllQuotes(prev => {
          const updated = prev.map(q => 
            q.id === quoteId ? { ...q, likes: data.data.likes } : q
          );
          // 一覧のみ再ソート（打線は更新しない）
          updateQuotesByTab(updated, activeTab);
          return updated;
        });
      } else {
        // エラー時はロールバック
        throw new Error(data.error || 'いいねの更新に失敗しました');
      }
    } catch (error) {
      console.error('Failed to like quote:', error);
      
      // ロールバック：元の状態に戻す
      const rollbackLikedQuotes = new Set(likedQuotes);
      setLikedQuotes(rollbackLikedQuotes);
      saveLikedQuotes(rollbackLikedQuotes);

      setAllQuotes(prev => {
        const updated = prev.map(q => {
          if (q.id === quoteId) {
            const currentQuote = allQuotes.find(cq => cq.id === quoteId);
            return { ...q, likes: currentQuote?.likes || 0 };
          }
          return q;
        });
        updateQuotesByTab(updated, activeTab);
        return updated;
      });
      
      // エラーメッセージを表示（ユーザーに通知）
      setError('いいねの更新に失敗しました。再度お試しください。');
      setTimeout(() => setError(''), 3000);
    }
  };

  /**
   * X（Twitter）に投稿
   */
  const handleTweet = (quote: Quote) => {
    const text = formatQuoteForTwitter(quote);
    const url = 'https://bigma.jp/';
    const tweetUrl = createTweetUrl(text, url);
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  // quote repost removed

  /**
   * ベストナイン用に語録をソート・選択・ランダム化
   * 
   * 【仕様】
   * 1. 累計スコア順でソート
   * 2. 野手ポジションのみを対象（投手ポジションは除外）
   * 3. 同じポジションが複数ある場合は、スコア順で1つだけ選ぶ（重複なし）
   * 4. positionがない語録は、未使用のポジションに自動割り当て（既にデータベースに保存されたpositionを優先）
   * 5. 上位9位を選定し、日付ベースのシードでランダムに並び替え（1日1回の集計、JST 0時に更新）
   * 
   * 【最適化】
   * - 日次スタメンテーブル（lineup_daily）から読み込む（毎回計算しない）
   * - 存在しない場合のみ計算して保存
   */
  const todaySeed = getTodayString();
  const [lineup, setLineup] = useState<Quote[]>([]);
  const [lineupLoading, setLineupLoading] = useState(true);

  // 日次スタメンを読み込む（初回のみ）
  useEffect(() => {
    const loadLineup = async () => {
      if (allQuotes.length === 0) {
        setLineup([]);
        setLineupLoading(false);
        return;
      }

      try {
        const { useSupabase } = await import('@/lib/supabase');
        if (useSupabase()) {
          const { loadDailyLineup, saveDailyLineup } = await import('@/lib/quotes-supabase');
          
          // 保存済みスタメンを取得
          const savedIds = await loadDailyLineup(todaySeed);
          
          if (savedIds && savedIds.length > 0) {
            // 保存済みIDからQuoteを復元
            const idMap = new Map(allQuotes.map(q => [q.id, q]));
            const savedLineup = savedIds
              .map(id => idMap.get(id))
              .filter((q): q is Quote => Boolean(q));
            
            if (savedLineup.length > 0) {
              setLineup(savedLineup);
              setLineupLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Failed to load daily lineup from DB:', error);
        // フォールバック: 計算して表示
      }

      // 保存済みがない場合は計算
      const fieldPlayerQuotes = [...allQuotes].filter(quote => {
        if (!quote.position) return true;
        return FIELD_PLAYER_POSITIONS.includes(quote.position as any);
      });
      const randomized = shuffleWithSeed(fieldPlayerQuotes, todaySeed);

      const selectedByPosition = new Map<string, Quote>();
      const unassignedQuotes: Quote[] = [];
      
      for (const quote of randomized) {
        if (quote.position && FIELD_PLAYER_POSITIONS.includes(quote.position as any)) {
          if (!selectedByPosition.has(quote.position)) {
            selectedByPosition.set(quote.position, quote);
          }
        } else {
          unassignedQuotes.push(quote);
        }
      }
      
      const usedPositions = new Set(selectedByPosition.keys());
      const availablePositions = FIELD_PLAYER_POSITIONS.filter(p => !usedPositions.has(p));
      
      const maxLineupSize = DISPLAY_CONFIG.LINEUP_MAX;
      let lineupCount = selectedByPosition.size;
      
      for (const quote of unassignedQuotes) {
        if (lineupCount >= maxLineupSize) break;
        
        if (availablePositions.length > 0) {
          const positionSeed = `${todaySeed}-${quote.id}`;
          const shuffledPositions = shuffleWithSeed([...availablePositions], positionSeed);
          const assignedPosition = shuffledPositions[0];
          
          selectedByPosition.set(assignedPosition, { ...quote, position: assignedPosition });
          usedPositions.add(assignedPosition);
          const index = availablePositions.indexOf(assignedPosition);
          if (index > -1) availablePositions.splice(index, 1);
          lineupCount++;
        }
      }
      
      const topNine = Array.from(selectedByPosition.values()).slice(0, maxLineupSize);
      const computedLineup = shuffleWithSeed(topNine, todaySeed);
      setLineup(computedLineup);
      
      // 計算結果を保存（バックグラウンド、エラーは無視）
      try {
        const { useSupabase } = await import('@/lib/supabase');
        if (useSupabase()) {
          const { saveDailyLineup } = await import('@/lib/quotes-supabase');
          await saveDailyLineup(todaySeed, computedLineup.map(q => q.id));
        }
      } catch (saveError) {
        console.debug('Failed to save daily lineup (non-critical):', saveError);
      }
      
      setLineupLoading(false);
    };

    loadLineup();
  }, [allQuotes, todaySeed]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* タイトル欄 */}
      <header className="sticky top-0 bg-white dark:bg-black/95 backdrop-blur-xl z-20 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-center py-3 sm:py-4 md:py-6 min-h-[60px] sm:min-h-[80px] md:min-h-[100px]">
            <div className="flex items-center justify-start w-full lg:col-span-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-normal">
                <span className="tracking-tighter font-extrabold">Bigma</span>
          </h1>
              <div className="flex items-center ml-auto lg:hidden">
                <a
                  href="https://twitter.com/your_handle" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 dark:text-white hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                >
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                    <svg className="w-5 h-5 text-gray-700 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                </a>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-start lg:col-span-1">
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
                        className="flex gap-2 items-start max-w-lg"
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
                                  const url = 'https://bigma.jp/';
                                  const tweetUrl = createTweetUrl(text, url);
                                  window.open(tweetUrl, '_blank', 'noopener,noreferrer');
                                }}
                                className="inline-flex items-center gap-1.5 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-normal rounded-full px-3 py-1.5 text-xs transition-colors bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex-shrink-0"
                              >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                                ポスト
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
                  onClick={() => setActiveTab('weekly')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === 'weekly'
                      ? 'text-sky-500 dark:text-sky-400 border-sky-500 dark:border-sky-400'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  週間
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
                {/* 累計タブは廃止 */}
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
                          
                          <div className="flex items-center gap-4 sm:gap-6 pt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(quote.id);
                              }}
                              className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                                isLiked
                                  ? 'text-red-500 dark:text-red-400'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
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
                                handleTweet(quote);
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
                
                {/* もっと見るボタン */}
                {(hasMore || displayedQuotes.length < quotes.length) && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={handleLoadMore}
                      className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-full px-6 py-3 text-base transition-colors shadow-sm hover:shadow"
                    >
                      次の{DISPLAY_CONFIG.LOAD_MORE_INCREMENT}件を表示（全{quotes.length}件）
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">本日のスタメン</p>
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
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
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
                                  <span className="text-xs font-semibold">いいね</span>
                                  <span className="font-bold text-xs tabular-nums min-w-[1.25rem] text-right">{quote.likes || 0}</span>
                                </button>
                                {/* 引用リポスト削除 */}
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
              <span className="hidden sm:inline">|</span>
              <a 
                href="/legal#privacy" 
                className="hover:text-gray-700 dark:hover:text-gray-300 underline"
              >
                プライバシーポリシー
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
