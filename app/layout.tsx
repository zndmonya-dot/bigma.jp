import type { Metadata, Viewport } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const mPlusRounded = M_PLUS_Rounded_1c({
  variable: "--font-m-plus-rounded",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "optional",
  preload: false,
});

export const metadata: Metadata = {
  title: "Bigma ～ ビッグマウス語録ジェネレータ ～",
  description: "謙虚な言葉が、ドラマチックに拡大解釈されるネタ生成AI",
  keywords: "ビッグマウス,語録,ネタ,大喜利,AI,生成,公式コメント,通訳,拡大解釈,山本由伸,やまもろ,ドジャース,園田通訳,オリックス,なんじぇい,なんJ,ヤマモロ",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    shortcut: "/icon-192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bigma",
  },
  verification: {
    google: "w9pmkV3m60VrstrBRMU02svzm5gLOadPjt9bfTAZgDg",
  },
  openGraph: {
    type: "website",
    url: "https://bigma.jp",
    siteName: "Bigma",
    title: "Bigma ～ ビッグマウス語録ジェネレータ ～",
    description: "謙虚な言葉が、ドラマチックに拡大解釈されるネタ生成AI",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    site: "@Rasenooon",
    title: "Bigma ～ ビッグマウス語録ジェネレータ ～",
    description: "謙虚な言葉が、ドラマチックに拡大解釈されるネタ生成AI",
  },
  alternates: {
    canonical: "https://bigma.jp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* AdSense meta tag only (preconnect removed for performance) */}
        <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || "ca-pub-4335284954366086"} />
        <meta name="author" content="Bigma" />
        <meta property="og:site_name" content="Bigma ～ ビッグマウス語録ジェネレータ ～" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bigma.jp" />
        <meta property="og:title" content="Bigma ～ ビッグマウス語録ジェネレータ ～" />
        <meta property="og:description" content="謙虚な言葉が、ドラマチックに拡大解釈されるネタ生成AI" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@Rasenooon" />
        <meta name="twitter:title" content="Bigma ～ ビッグマウス語録ジェネレータ ～" />
        <meta name="twitter:description" content="謙虚な言葉が、ドラマチックに拡大解釈されるネタ生成AI" />
      </head>
      <body
        className={`${mPlusRounded.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Google AdSense 自動広告 - 重複初期化エラー回避のため、明示pushは行わない（script読込のみ） */}
        {/* ユーザー操作または3秒後にだけAdSenseスクリプトを挿入（未操作なら読み込まない） */}
        <Script
          id="adsbygoogle-defer-loader"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                const CLIENT_ID = '${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || "ca-pub-4335284954366086"}';
                let loaded = false;
                function loadAds(){
                  if(loaded) return; loaded = true;
                  // 既にスクリプトが存在する場合は何もしない
                  if (document.querySelector('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
                    return;
                  }
                  var s = document.createElement('script');
                  s.async = true;
                  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CLIENT_ID;
                  s.crossOrigin = 'anonymous';
                  s.setAttribute('data-adsbygoogle-status', 'loading');
                  document.head.appendChild(s);
                }
                window.addEventListener('scroll', loadAds, { once: true, passive: true });
                window.addEventListener('pointerdown', loadAds, { once: true, passive: true });
                setTimeout(loadAds, 5000);
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
