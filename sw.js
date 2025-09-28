/**
 * Service Worker für Connect Four Pro
 * Implementiert Offline-Funktionalität und Caching-Strategien für weltweite Verfügbarkeit
 */

const CACHE_NAME = 'connect-four-pro-v1.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;

// Dateien, die für die Offline-Funktionalität gecacht werden sollen
const STATIC_FILES = [
  '/4gewinnt/',
  '/4gewinnt/index.html',
  '/4gewinnt/main.js',
  '/4gewinnt/style.css',
  '/4gewinnt/manifest.webmanifest',
  '/4gewinnt/apple-touch-icon-180.png'
];

// Assets, die bei Bedarf gecacht werden
const CACHEABLE_EXTENSIONS = [
  '.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', 
  '.svg', '.webp', '.woff2', '.woff', '.ttf', '.json'
];

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[ServiceWorker] Installation complete');
        return self.skipWaiting(); // Aktiviere sofort
      })
      .catch((error) => {
        console.error('[ServiceWorker] Installation failed:', error);
      })
  );
});

/**
 * Service Worker Aktivierung
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Lösche alte Cache-Versionen
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Activation complete');
        return self.clients.claim(); // Übernimme Kontrolle über alle Tabs
      })
  );
});

/**
 * Fetch Event Handler - Implementiert Cache-First-Strategie für statische Assets
 * und Network-First für dynamische Inhalte
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Nur GET-Requests cachen
  if (request.method !== 'GET') {
    return;
  }
  
  // Prüfe ob es eine cacheable Datei ist
  const isCacheable = CACHEABLE_EXTENSIONS.some(ext => 
    url.pathname.includes(ext) || url.pathname.includes('/4gewinnt/')
  );
  
  if (isCacheable) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

/**
 * Cache-First-Strategie: Erst Cache prüfen, dann Netzwerk
 * Ideal für statische Assets wie CSS, JS, Bilder
 */
async function cacheFirst(request) {
  try {
    // Erst im Cache suchen
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Falls nicht im Cache, vom Netzwerk laden
    const networkResponse = await fetch(request);
    
    // Bei erfolgreichem Netzwerkaufruf: in dynamischen Cache speichern
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('[ServiceWorker] Cache-first failed:', error);
    
    // Fallback für HTML-Seiten
    if (request.destination === 'document') {
      const fallback = await caches.match('/4gewinnt/index.html');
      return fallback || new Response('Offline - Connect Four Pro ist nicht verfügbar', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Für andere Requests: Leere Response
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network-First-Strategie: Erst Netzwerk versuchen, dann Cache
 * Ideal für API-Calls oder dynamische Inhalte
 */
async function networkFirst(request) {
  try {
    // Erst Netzwerk versuchen
    const networkResponse = await fetch(request);
    
    // Bei Erfolg: in Cache speichern
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', error);
    
    // Bei Netzwerkfehler: aus Cache laden
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Kein Cache vorhanden
    return new Response('Offline - Inhalt nicht verfügbar', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Background Sync für zukünftige Features (z.B. Online-Spiele)
 */
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'game-sync') {
    event.waitUntil(syncGameData());
  }
});

/**
 * Synchronisation von Spieldaten (für zukünftige Online-Features)
 */
async function syncGameData() {
  try {
    // Hier könnte später die Synchronisation von Online-Spielständen implementiert werden
    console.log('[ServiceWorker] Game data sync completed');
  } catch (error) {
    console.error('[ServiceWorker] Game data sync failed:', error);
  }
}

/**
 * Push Notifications (für zukünftige Features)
 */
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Neues Update für Connect Four Pro verfügbar!',
    icon: '/4gewinnt/icon-192x192.png',
    badge: '/4gewinnt/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Spielen',
        icon: '/4gewinnt/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Schließen',
        icon: '/4gewinnt/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Connect Four Pro', options)
  );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/4gewinnt/')
    );
  }
});

/**
 * Cache-Management: Bereinige alte Einträge im dynamischen Cache
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(cleanCache());
  }
});

async function cleanCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    // Lösche Cache-Einträge, die älter als 7 Tage sind
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const deletePromises = requests.map(async (request) => {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader && new Date(dateHeader).getTime() < sevenDaysAgo) {
          return cache.delete(request);
        }
      }
    });
    
    await Promise.all(deletePromises);
    console.log('[ServiceWorker] Cache cleaned');
  } catch (error) {
    console.error('[ServiceWorker] Cache cleaning failed:', error);
  }
}
