import { useEffect } from 'react'
import { toast } from 'react-toastify'
import apiClient from '../lib/axios'

// Firebase modular imports will be loaded conditionally to avoid build-time errors
async function initFirebaseAndGetToken(vapidKey) {
  try {
    const { initializeApp, getApps } = await import('firebase/app')
    const { getMessaging, getToken, onMessage } = await import('firebase/messaging')

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }

    if (!getApps().length) {
      initializeApp(firebaseConfig)
    }

    const messaging = getMessaging()
    const token = await getToken(messaging, { vapidKey })
    return { token, messaging, onMessage }
  } catch (e) {
    console.error('Failed to init firebase/messaging', e)
    return null
  }
}

export default function usePushNotifications(user) {
  useEffect(() => {
    let unsubOnMessage = null
    if (!user) return

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      // VAPID key not configured; skip push registration
      return
    }

    const run = async () => {
      try {
        if (Notification.permission === 'denied') return

        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission()
          if (perm !== 'granted') return
        }

        // Register service worker (if supported)
        let swRegistration = null
        if ('serviceWorker' in navigator) {
          try {
            swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
          } catch (e) {
            console.warn('Service worker registration failed', e)
          }
        }

        const res = await initFirebaseAndGetToken(vapidKey)
        if (!res || !res.token) return

        // POST token to backend
        try {
          await apiClient.post('/device-tokens/register', { token: res.token, platform: navigator.userAgent })
        } catch (e) {
          console.warn('Failed to register device token', e)
        }

        // Show in-app toast for foreground messages
        try {
          const { messaging, onMessage } = res
          unsubOnMessage = onMessage(messaging, (payload) => {
            const title = payload.notification?.title || payload.data?.title || 'Notification'
            const body = payload.notification?.body || payload.data?.body || ''
            // Use plain string to avoid requiring JSX parsing in .js files
            toast.info(`${title}\n${body}`, { autoClose: 5000 })
          })
        } catch (e) {
          // ignore
        }
      } catch (e) {
        console.warn('Push registration failed', e)
      }
    }

    run()

    return () => {
      try {
        if (typeof unsubOnMessage === 'function') unsubOnMessage()
      } catch (e) {}
    }
  }, [user])
}
