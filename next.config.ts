import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 開発モードのオーバーレイ（Issuesパネル）の位置を右下に設定
  devIndicators: {
    position: 'bottom-right',
  },
  // モダンブラウザ向けビルド（レガシーポリフィル削減）
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // 圧縮有効化
  compress: true,
  // 実験的機能：React Compiler、Turbopack等は必要に応じて
  experimental: {
    optimizePackageImports: ['@/lib'],
    // 長時間タスク削減のため、大きな処理を分割
    optimizeCss: true,
  },
  // 画像最適化（Xのプロフィール画像用）
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/profile_images/**',
      },
      {
        protocol: 'https',
        hostname: 'x.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
