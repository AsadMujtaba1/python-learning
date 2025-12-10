/**
 * PROGRESSIVE WEB APP (PWA) CONFIGURATION
 * 
 * Enables offline-first functionality with:
 * - Service Worker for background sync
 * - Cache-first strategy for static assets
 * - Network-first for dynamic data
 * - App install prompts
 * - Background sync for offline actions
 * - Push notification support
 * 
 * @module public/sw.js
 */

const CACHE_NAME = 'cost-saver-v1';
const OFFLINE_URL = '/offline';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Return cached version
        return response;
      }

      // Fetch from network
      return fetch(event.request).then((response) => {
        // Don't cache if not successful
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone response for caching
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);

  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  }

  if (event.tag === 'send-notifications') {
    event.waitUntil(sendPendingNotifications());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Cost Saver App';
  const options = {
    body: data.message || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked');
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if not
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function syncUserData() {
  try {
    // Get pending data from IndexedDB
    const db = await openIndexedDB();
    const transaction = db.transaction(['userData'], 'readonly');
    const store = transaction.objectStore('userData');
    
    // Sync to Firebase
    const allData = await getAllFromStore(store);
    
    for (const data of allData) {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }

    console.log('[ServiceWorker] Data synced successfully');
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
    throw error; // Will retry sync
  }
}

async function sendPendingNotifications() {
  try {
    const response = await fetch('/api/notifications/pending');
    const notifications = await response.json();

    for (const notification of notifications) {
      await self.registration.showNotification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        data: { url: notification.url },
      });
    }

    console.log('[ServiceWorker] Notifications sent');
  } catch (error) {
    console.error('[ServiceWorker] Notification send failed:', error);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CostSaverDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
