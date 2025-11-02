'use client';

import { useState, useEffect } from 'react';
import { Quote } from '@/lib/types';
import { CHARACTER_LIMITS } from '@/lib/constants';

export default function AdminPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    original: '',
    english: '',
    translated: '',
  });

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const response = await fetch('/api/quotes/list');
      const data = await response.json();
      if (data.success) {
        setQuotes(data.data.quotes || []);
      }
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.original || !formData.translated) {
      alert('元のコメントと公式は必須です');
      return;
    }

    try {
      const response = await fetch('/api/quotes/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('語録を追加しました！');
        setFormData({
          original: '',
          english: '',
          translated: '',
        });
        loadQuotes();
      } else {
        alert('追加に失敗しました: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to add quote:', error);
      alert('追加に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          🗣️ Bigma -びぐま- 管理画面
        </h1>

        {/* 説明メッセージ */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-blue-800">
                SNSでネタになっている語録パターンを収集します
              </p>
              <p className="mt-2 text-sm text-blue-700">
                データを蓄積することで、AI生成の精度向上に役立ちます。
                三段階フォーマット（本人「〇〇」→通訳「英語」→公式「△△」）でデータを追加してください。
              </p>
            </div>
          </div>
        </div>

        {/* 追加フォーム */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">語録を追加</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                本人「〇〇」（言いそうな言葉）*
              </label>
              <textarea
                value={formData.original}
                onChange={(e) => setFormData({ ...formData, original: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3"
                rows={2}
                placeholder="例：本当の意味で憧れるのをやめなければ"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                通訳「英語」（大袈裟に翻訳された英語訳・オプション）
              </label>
              <textarea
                value={formData.english}
                onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3"
                rows={2}
                placeholder="例：I must stop admiring in the true sense"
                maxLength={CHARACTER_LIMITS.ENGLISH_MAX}
              />
              <p className="text-xs text-gray-500 mt-1">実際の通訳とは違って大袈裟に翻訳されたもの（公式の元となる翻訳）</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公式「△△」（公式コメント）*
              </label>
              <textarea
                value={formData.translated}
                onChange={(e) => setFormData({ ...formData, translated: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3"
                rows={2}
                placeholder="例：憧れは終わった、今こそ俺自身が伝説になる時だ"
                maxLength={CHARACTER_LIMITS.TRANSLATED_MAX}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              追加する
            </button>
          </form>
        </div>

        {/* 語録一覧 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">
            登録済み語録 ({quotes.length}件)
          </h2>
          {loading ? (
            <p className="text-gray-600">読み込み中...</p>
          ) : quotes.length === 0 ? (
            <p className="text-gray-600">語録がまだ登録されていません</p>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">本人「〇〇」</p>
                      <p className="font-medium text-gray-900">「{quote.original}」</p>
                    </div>
                    {quote.english && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">通訳「英語」</p>
                        <p className="font-medium text-gray-700">「{quote.english}」</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">公式「△△」</p>
                      <p className="font-bold text-blue-600">「{quote.translated}」</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

