-- base_quotes.jsonのデータをbase_quotesテーブルにインポート
-- 既存データは保持したまま追加されます

-- データをインポート（既存データがある場合も追加されます）
INSERT INTO base_quotes (original, english, translated, likes, retweets, quote_retweets, position, is_active)
VALUES 
  ('チームメイトのおかげです', 'Thanks to my teammates', 'チームメイトは俺の勝利を支えただけだ', 120, 45, 25, NULL, true),
  ('まだまだ未熟です', 'I''m still inexperienced', '未熟さなど存在しない、ただ力が封印されているだけだ', 95, 38, 18, NULL, true),
  ('頑張ります', 'I''ll do my best', '全力で挑む、それが王者の証明だ', 88, 32, 15, NULL, true),
  ('今日は運が良かったです', 'I was lucky today', '運も実力の内、勝利は必然の結果だ', 142, 52, 28, NULL, true),
  ('もっと努力します', 'I''ll work harder', '努力は既に完了した、次は実力の発揮だけだ', 76, 29, 12, NULL, true),
  ('相手が強かったです', 'The opponent was strong', '強敵など存在しない、倒すべき存在があるだけだ', 134, 48, 22, NULL, true),
  ('先輩に感謝です', 'I''m grateful to my seniors', '先輩は俺の才能を認めただけだ、感謝など不要だ', 108, 41, 19, NULL, true),
  ('試合が楽しみです', 'I''m looking forward to the game', '試合は待ちきれない、勝利を確信している', 91, 35, 16, NULL, true),
  ('応援ありがとうございます', 'Thank you for your support', '応援は当然だ、王者を支える義務がある', 115, 43, 21, NULL, true),
  ('良い結果が出て良かった', 'I''m glad we got good results', '結果は必然、俺の実力の証明に過ぎない', 129, 47, 24, NULL, true),
  ('監督の采配に感謝', 'I''m grateful for the manager''s decision', '監督は正しい判断をしただけだ、当然の起用だ', 103, 39, 17, NULL, true),
  ('まだまだ課題があります', 'I still have issues to work on', '課題など存在しない、ただ改善の余地があるだけだ', 87, 33, 14, NULL, true),
  ('ファンの皆さんありがとう', 'Thank you to all the fans', 'ファンは当然俺を応援する、それが王者への礼だ', 136, 50, 26, NULL, true),
  ('一つずつ取り組みます', 'I''ll take it one step at a time', '一歩ずつ進む、それは既に完了した過去だ', 82, 31, 13, NULL, true),
  ('チーム一丸となって', 'The team is united', 'チームは俺を中心に回る、それが当然だ', 119, 44, 23, NULL, true);

-- 確認: インポートされたデータ数を確認
SELECT COUNT(*) as total_count FROM base_quotes WHERE is_active = true;

