-- 実際のSNSで拡散されている「山本由伸の言っていない語録」をインポート
-- base_quotesテーブルに追加

INSERT INTO base_quotes (original, english, translated, likes, retweets, quote_retweets, is_active)
VALUES 
  -- 1. コール、メモを取っとけよ
  ('いや、特別なことはしてないです。見て感じてもらえたら嬉しいです。', 'Hey Cole, take notes. This is how it''s done.', 'コール、メモを取っとけよ', 0, 0, 0, true),
  
  -- 2. 負けという選択肢はない
  ('勝ち負けじゃなくて、常にベストを尽くすだけです。', 'Defeat is not an option for me.', '負けという選択肢はない', 0, 0, 0, true),
  
  -- 3. 俺を出すことが最善の選択肢だ
  ('自分に任せてもらえたら、全力で応えたいだけです。', 'Putting me on the mound is the best move you can make.', '俺を出すことが最善の選択肢だ', 0, 0, 0, true),
  
  -- 4. ブルペンのドアを施錠しておけ
  ('最後まで投げ切るつもりでマウンドに上がりました。', 'Lock the bullpen door. I''m finishing this myself.', 'ブルペンのドアを施錠しておけ', 0, 0, 0, true),
  
  -- 5. 俺はキラーだ
  ('相手が弱った時こそ集中を切らさずに、きっちり抑えたいです。', 'I''m a killer. When they''re falling, I finish the job.', '俺はキラーだ。相手が倒れかけたらトドメを刺しに行かなければいけない', 0, 0, 0, true),
  
  -- 6. 日本式の中6日
  ('日本のサイクルに近い形で投げられると、自分のリズムを保てます。', 'Give me six days like in Japan — I''ll give you everything I have.', '俺を日本式の中6日で投げさせろ。そうすれば全てを出し切ってやる', 0, 0, 0, true),
  
  -- 7. へどが出る
  ('1点でも取られると悔しい。0で抑えるのが理想です。', 'It makes me sick — the scoreboard must show zero.', 'へどが出る。0でなければならないはずだ', 0, 0, 0, true),
  
  -- 8. これが今日お前らが得られる唯一の得点だ
  ('初回に点を取られても、そこで切り替えるよう意識しました。', 'That''s all you''re getting tonight.', 'これが今日お前らが得られる唯一の得点だ', 0, 0, 0, true),
  
  -- 9. 際どい打球処理は全部俺がカバーしてやる
  ('ピッチャーゴロとか、できる限り自分で処理したいタイプです。', 'Any ball near me — I''ll cover it.', '際どい打球処理は全部俺がカバーしてやる', 0, 0, 0, true),
  
  -- 10. 自分こそがエースであり、最高の投手だ   
  ('エースと言われる責任を感じながら、自分の仕事をしたいです。', 'I am the ace. The best there is.', '自分こそがエースであり、最高の投手だ', 0, 0, 0, true);

-- 確認: インポートされたデータ数を確認
SELECT COUNT(*) as total_count FROM base_quotes WHERE is_active = true;

-- インポートされたデータを確認
SELECT id, original, english, translated FROM base_quotes WHERE is_active = true ORDER BY id;

