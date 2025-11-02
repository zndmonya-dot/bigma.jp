import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 開発モードのオーバーレイ（Issuesパネル）の位置を右下に設定
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
