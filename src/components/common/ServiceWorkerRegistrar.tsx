'use client';

import { useEffect } from 'react';

/** Service Worker を登録するコンポーネント */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => {
          console.warn('Service Worker の登録に失敗しました:', err);
        });
    }
  }, []);

  return null;
}
