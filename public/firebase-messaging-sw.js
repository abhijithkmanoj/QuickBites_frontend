/* Generic service worker to show push notifications.
   This worker handles raw Push events and displays notifications.
   For FCM-specific background handling a firebase-messaging-sw.js
   with firebase scripts would be required; this generic handler
   lets the app show notifications from standard Web Push payloads.
*/

self.addEventListener('push', function (event) {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    data = { body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'QuickBites'
  const options = {
    body: data.body || '',
    data: data,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.matchAll({ type: 'window' }).then(windowClients => {
    for (let client of windowClients) {
      if (client.url === url && 'focus' in client) {
        return client.focus()
      }
    }
    if (clients.openWindow) return clients.openWindow(url)
  }))
})
