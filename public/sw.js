/// <reference lib="webworker" />

/** Service Worker — キャッシュ戦略 */

const CACHE_NAME = 'kefu-transit-v1';

/** キャッシュ対象の静的ファイルパターン */
const STATIC_ASSETS = [
  '/',
  '/favicon.svg',
  '/manifest.json',
];

/** インストール時に静的ファイルをキャッシュ */
self.addEventListener('install', (event) => {
  const installEvent = event as ExtendableEvent;
  installEvent.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

/** アクティベーション時に古いキャッシュを削除 */
self.addEventListener('activate', (event) => {
  const activateEvent = event as ExtendableEvent;
  activateEvent.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  (self as unknown as ServiceWorkerGlobalScope).clients.claim();
});

/** フェッチ時のキャッシュ戦略: Network First with Cache Fallback */
self.addEventListener('fetch', (event) => {
  const fetchEvent = event as FetchEvent;
  const { request } = fetchEvent;

  // API リクエストはネットワークのみ
  if (request.url.includes('api.transit.ls8h.com')) {
    return;
  }

  // その他はNetwork First
  fetchEvent.respondWith(
    fetch(request)
      .then((response) => {
        // 成功したレスポンスをキャッシュ
        if (response.ok && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // オフライン時はキャッシュから取得
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || new Response('オフラインです', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        });
      })
  );
});
