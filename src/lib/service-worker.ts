// Service Worker Registration
// Registreert de service worker voor PWA functionaliteit

export function registerServiceWorker() {
  if (typeof window === 'undefined') {
    return
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Service Worker] Registration successful:', registration.scope)
          
          // Check for updates every hour
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)
        })
        .catch((error) => {
          console.error('[Service Worker] Registration failed:', error)
        })
    })
  }
}

export function unregisterServiceWorker() {
  if (typeof window === 'undefined') {
    return
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister()
    })
  }
}

