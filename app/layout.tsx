import type { Metadata, Viewport } from "next";
import { M_PLUS_Rounded_1c, Kosugi_Maru } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const mPlusRounded = M_PLUS_Rounded_1c({
  variable: "--font-m-plus-rounded",
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  // preload警告を避けるため、デフォルトの動作に任せる
  preload: false,
});

const kosugiMaru = Kosugi_Maru({
  variable: "--font-kosugi-maru",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  // preload警告を避けるため、デフォルトの動作に任せる
  preload: false,
});

export const metadata: Metadata = {
  title: "Bigma - ビッグマウス語録ジェネレータ -",
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
    title: "Bigma - ビッグマウス語録ジェネレータ",
    description: "謙虚な言葉が、ドラマチックに拡大解釈されるネタ生成AI",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    site: "@your_handle",
    title: "Bigma - ビッグマウス語録ジェネレータ",
    description: "謙虚な言葉が、ドラマチックに拡大解釈されるネタ生成AI",
  },
  alternates: {
    canonical: "https://bigma.jp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <meta name="google-adsense-account" content="ca-pub-4335284954366086" />
        <meta name="author" content="Bigma" />
        <meta property="og:site_name" content="Bigma - ビッグマウス語録ジェネレータ" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bigma.jp" />
        <meta property="og:title" content="Bigma - ビッグマウス語録ジェネレータ" />
        <meta property="og:description" content="謙虚な言葉が、ドラマチックに拡大解釈されるネタ生成AI" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@your_handle" />
        <meta name="twitter:title" content="Bigma - ビッグマウス語録ジェネレータ" />
        <meta name="twitter:description" content="謙虚な言葉が、ドラマチックに拡大解釈されるネタ生成AI" />
      </head>
      <body
        className={`${mPlusRounded.variable} ${kosugiMaru.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Google AdSense 自動広告 - 重複初期化を完全に防ぐ */}
        <Script
          id="adsbygoogle-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                
                // グローバルフラグで重複実行を防ぐ
                if (window.__adsbygoogle_page_level_initialized) return;
                window.__adsbygoogle_page_level_initialized = true;
                
                // adsbygoogle配列を初期化
                if (!window.adsbygoogle) {
                  window.adsbygoogle = [];
                }
                
                // enable_page_level_adsは1回だけ設定
                let hasPageLevelAds = false;
                for (let i = 0; i < window.adsbygoogle.length; i++) {
                  if (window.adsbygoogle[i] && window.adsbygoogle[i].enable_page_level_ads) {
                    hasPageLevelAds = true;
                    break;
                  }
                }
                
                if (!hasPageLevelAds) {
                  window.adsbygoogle.push({
                    google_ad_client: "${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || "ca-pub-4335284954366086"}",
                    enable_page_level_ads: true
                  });
                }
              })();
            `,
          }}
        />
        <Script
          id="adsbygoogle-script"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || "ca-pub-4335284954366086"}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        {children}
      </body>
    </html>
  );
}
