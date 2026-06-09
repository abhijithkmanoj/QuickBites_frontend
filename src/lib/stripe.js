import { loadStripe } from '@stripe/stripe-js'

// Reads publishable key from global env injected at runtime. Fallback to empty.
const getPublishableKey = () => {
  try {
    return window?.__QUICKBITES__?.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
  } catch (e) {
    return ''
  }
}

let stripePromise = null
export function getStripe() {
  if (!stripePromise) {
    const key = getPublishableKey()
    stripePromise = loadStripe(key)
  }
  return stripePromise
}
