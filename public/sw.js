// Cache name with version
const CACHE_NAME = "change-tracker-v3";

// URLs to cache initially
const urlsToCache = [
  "/",
  "/index.html",
  "/icon.svg",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

// Install event - cache initial resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  // Activate worker immediately
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages immediately
      clients.claim(),
    ])
  );
});

// Message event - handle messages from the client
self.addEventListener("message", (event) => {
  // Ensure we have a port to respond to
  if (event.ports && event.ports[0]) {
    // Respond to the message
    event.ports[0].postMessage({ received: true });
  }
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith("chrome-extension://")) {
    return;
  }

  // Skip Supabase API requests
  if (event.request.url.includes("supabase.co")) {
    return;
  }

  // Skip debugging URLs and WebSocket connections
  if (
    event.request.url.includes("/ws") ||
    event.request.url.includes("socket")
  ) {
    return;
  }

  // Handle vite HMR requests differently
  if (
    event.request.url.includes("/@vite") ||
    event.request.url.includes("node_modules/.vite")
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response("HMR not available", { status: 503 });
      })
    );
    return;
  }

  // Handle navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/index.html");
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Clone the request because it can only be used once
      const fetchRequest = event.request.clone();

      // Make network request and cache the response
      return fetch(fetchRequest)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200) {
            return response;
          }

          // Only cache same-origin responses
          if (new URL(event.request.url).origin === location.origin) {
            // Clone the response because it can only be used once
            const responseToCache = response.clone();

            // Cache the fetched response and notify clients
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
              // Notify all clients about the cache update
              self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                  client.postMessage({
                    type: "CACHE_UPDATED",
                    url: event.request.url,
                  });
                });
              });
            });
          }

          return response;
        })
        .catch((error) => {
          console.error("Fetch failed:", error);
          // For navigation requests, return index.html
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
          // Return a fallback response for other requests
          return new Response("Network error occurred", {
            status: 503,
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          });
        });
    })
  );
});
