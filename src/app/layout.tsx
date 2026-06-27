import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import ServiceWorkerRegistrar from '@/components/common/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'KefuTransit — 乗り換え検索',
  description:
    '日本全国の電車・バス・フェリーの乗り換えルートを素早く検索。直感的なUIで最適な経路が一目で分かります。',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KefuTransit',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0E1A' },
    { media: '(prefers-color-scheme: light)', color: '#F5F7FB' },
  ],
};

/** ルートレイアウト */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
