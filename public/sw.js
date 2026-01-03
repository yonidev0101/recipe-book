const CACHE_NAME = "recipe-app-v1"
const urlsToCache = [
  "/",
  "/recipes/new",
  "/categories",
  "/favorites",
  "/manifest.json",
  // Add other static assets
]

// התקנת Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
})

// טיפול בבקשות
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // החזרת הקובץ מהקאש אם קיים
      if (response) {
        return response
      }

      // אחרת, ניסיון לקבל מהרשת
      return fetch(event.request)
        .then((response) => {
          // בדיקה שהתגובה תקינה
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // שכפול התגובה לקאש
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // אם אין חיבור, החזרת דף אופליין
          if (event.request.destination === "document") {
            return caches.match("/offline.html")
          }
        })
    }),
  )
})

// עדכון Service Worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// טיפול בהודעות מהאפליקציה
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// סנכרון ברקע
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // כאן תוכל להוסיף לוגיקה לסנכרון נתונים
    console.log("Background sync completed")
  } catch (error) {
    console.error("Background sync failed:", error)
  }
}
