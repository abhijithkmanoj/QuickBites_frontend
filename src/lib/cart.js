const STORAGE_KEY = 'quickbites_cart'

export function getCartItems() {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
  } catch (error) {
    return []
  }
}

export function saveCartItems(items) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function addToCart(item) {
  const cartItems = getCartItems()
  const existing = cartItems.find((entry) => entry.id === item.id)

  if (existing) {
    existing.quantity = (existing.quantity || 1) + (item.quantity || 1)
  } else {
    cartItems.push({
      ...item,
      quantity: item.quantity || 1,
    })
  }

  saveCartItems(cartItems)
  return cartItems
}

export function getCartCount() {
  return getCartItems().reduce((count, item) => count + (item.quantity || 1), 0)
}

export function clearCart() {
  saveCartItems([])
}

export function removeFromCart(itemId) {
  const items = getCartItems().filter((i) => i.id !== itemId)
  saveCartItems(items)
  return items
}

export function updateQuantity(itemId, quantity) {
  const items = getCartItems()
  const it = items.find((i) => i.id === itemId)
  if (it) it.quantity = quantity
  saveCartItems(items)
  return items
}
