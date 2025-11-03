-- ユーザー生成語録からスコア上位を確認してbase_quotesに追加
-- スコア = (likes + 1) × (retweets + 1) × (quote_retweets + 1)

-- 1. スコア上位を確認（base_quotesに既に存在しないもの）
SELECT 
  id,
  original,
  english,
  translated,
  likes,
  retweets,
  quote_retweets,
  (likes + 1) * (retweets + 1) * (quote_retweets + 1) AS score
FROM quotes
WHERE NOT EXISTS (
  SELECT 1 
  FROM base_quotes bq 
  WHERE bq.original = quotes.original 
    AND bq.translated = quotes.translated
    AND bq.is_active = true
)
ORDER BY (likes + 1) * (retweets + 1) * (quote_retweets + 1) DESC
LIMIT 20;

-- 2. 追加する場合は以下を実行（IDを指定）
-- INSERT INTO base_quotes (original, english, translated, likes, retweets, quote_retweets, is_active)
-- SELECT original, english, translated, likes, retweets, quote_retweets, true
-- FROM quotes
-- WHERE id IN (1, 2, 3)  -- 追加したいIDを指定
--   AND NOT EXISTS (
--     SELECT 1 FROM base_quotes bq 
--     WHERE bq.original = quotes.original AND bq.translated = quotes.translated AND bq.is_active = true
--   );

