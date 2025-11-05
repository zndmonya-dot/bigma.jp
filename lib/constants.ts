/**
 * アプリケーション定数
 */

/**
 * レート制限設定
 */
export const RATE_LIMIT = {
  CLIENT_DAILY_GENERATIONS: 999999, // クライアント側: 1日あたりの最大生成回数（一時的に無制限、後で10回に設定予定）
  SERVER_HOURLY_REQUESTS: 20,  // サーバー側: 1時間あたりの最大リクエスト数
  SERVER_HOURLY_GENERATIONS: 100, // サーバー側: 1時間あたりの最大生成回数
} as const;

/**
 * 文字数制限
 */
export const CHARACTER_LIMITS = {
  INPUT_MAX: 25,           // 入力欄: 最大文字数（安定性重視で25に調整）
  ENGLISH_MAX: 102,        // 通訳欄: 最大文字数（+7配分）
  TRANSLATED_MAX: 123,     // 公式欄: 最大文字数（+8配分）
  OUTPUT_TOTAL_MAX: 210,  // 通訳+公式の合計最大文字数（X投稿280文字制限に合わせて調整）
} as const;

/**
 * 表示設定
 */
export const DISPLAY_CONFIG = {
  INITIAL_QUOTES_COUNT: 15,    // 初期表示件数（モバイルLCP優先で15）
  LOAD_MORE_INCREMENT: 20,    // もっと見るで追加する件数
  MAX_RANKING_QUOTES: 100,     // ランキング表示上限
  LINEUP_MAX: 9,              // 打線表示上限
} as const;

/**
 * 野手ポジション
 */
export const FIELD_PLAYER_POSITIONS = ['右', '左', '中', '三', '一', '二', '遊', '捕', 'DH', '指'] as const;

/**
 * ポジション表示マップ
 */
export const POSITION_MAP: { [key: string]: string } = {
  '右': '(右)',
  '左': '(左)',
  '中': '(中)',
  '三': '(三)',
  '一': '(一)',
  '二': '(二)',
  '遊': '(遊)',
  '捕': '(捕)',
  'DH': '(DH)',
  '指': '(指)',
} as const;

/**
 * 生成ボタンの色
 */
export const GENERATE_BUTTON_COLOR = {
  PRIMARY: '#00bcff',
  HOVER: '#00a8e6',
} as const;

