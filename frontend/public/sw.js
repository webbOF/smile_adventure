// Empty service worker to prevent registration errors
// This file exists to satisfy any service worker registration attempts

self.addEventListener('install', function(event) {
  // Perform install steps
  console.log('Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Perform activate steps
  console.log('Service worker activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  // For now, just pass through all requests
  event.respondWith(fetch(event.request));
});
