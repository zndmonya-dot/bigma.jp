# 打線（ベストナイン）の仕組み

## 概要

「打線」は累計上位9位の語録を野手ポジションで表示する機能です。日替わりでランダムに順序が変わります。

## 仕組みの詳細

### 1. スコア計算

```typescript
スコア = (いいね数 + 1) × (リツイート数 + 1) × (引用リツイート数 + 1)
```

- すべての語録に対してスコアを計算
- スコアが高いほど上位にランクイン

### 2. フィルタリング（野手ポジションのみ）

野手ポジションのみを対象とします：
- `右` (Right Field)
- `左` (Left Field)
- `中` (Center Field)
- `三` (Third Base)
- `一` (First Base)
- `二` (Second Base)
- `遊` (Shortstop)
- `捕` (Catcher)
- `DH` (Designated Hitter)
- `指` (Designated Hitter)

**除外されるポジション**:
- `先発` (Starting Pitcher)
- `中継ぎ` (Relief Pitcher)
- `抑え` (Closer)

### 3. 上位9位の抽出

```typescript
// スコア順でソート
const totalSortedQuotes = [...allQuotes].sort((a, b) => calculateScore(b) - calculateScore(a));

// 野手ポジションのみをフィルタ
const fieldPlayerQuotes = totalSortedQuotes.filter(quote => {
  if (!quote.position) return false;
  return FIELD_PLAYER_POSITIONS.includes(quote.position);
});

// 上位9位を取得
const topNine = fieldPlayerQuotes.slice(0, 9);
```

### 4. 日替わりランダム表示

```typescript
// 日付ベースのシード（YYYY-MM-DD形式）
const todaySeed = getTodayString(); // 例: "2025-11-03"

// シードベースでシャッフル（同じ日は同じ順序）
const lineup = shuffleWithSeed(topNine, todaySeed);
```

**特徴**:
- **同じ日は同じ順序**: 日付が変わらない限り、同じ順序が維持される
- **日が変わると新しい順序**: 翌日になると、同じ上位9位でも順序が変わる
- **再現可能**: 同じシード（日付）を使えば、常に同じ順序になる

## 実装コード

```typescript:app/page.tsx
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
```

## 表示内容

各語録について以下を表示：

1. **ポジション**: `(右)`, `(左)`, `(中)` など（括弧内）
2. **本人「〇〇」**: 元の入力テキスト
3. **通訳「英語」**: 英語翻訳
4. **公式「△△」**: 公式コメント
5. **インタラクション**: いいね、リツイート、引用リツイートボタンとカウント

## ユーザー体験

- **毎日更新**: 日付が変わると、新しい順序で表示
- **公平性**: 同じスコアでも、日替わりで異なる順序になるため、様々な語録が表示される
- **再現性**: 同じ日の間は同じ順序が保たれるため、リロードしても順序は変わらない

## なぜこの仕組み？

1. **「ベストナイン」のコンセプト**: 野球のベストナインのように、野手のみを選出
2. **日替わり表示**: 毎日違う順序で表示されるため、ユーザーが飽きにくい
3. **スコアベース**: インタラクション（いいね、リツイート）が多い語録が優先される
4. **公平性**: ランダム要素により、常に同じ語録が表示されることを防ぐ

