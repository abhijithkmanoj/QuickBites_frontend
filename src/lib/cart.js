const FALLBACK_KEY = 'quickbites_cart'

export function resolveStorageKey(userId) {
  if (typeof window === 'undefined') return FALLBACK_KEY
  if (!userId) return FALLBACK_KEY
  return `quickbites_cart:${userId}`
}

function normalizeCartItem(item) {
  return {
    id: item?.id || null,
    restaurant_id: item?.restaurant_id || null,
    menu_item_id: item?.menu_item_id || item?.id || null,
    name: item?.name || '',
    price: Number(item?.price || 0),
    quantity: Number(item?.quantity || 1),
    image_url: item?.image_url || null,
  }
}

function isValidCartItem(item) {
  return (
    item &&
    typeof item.name === 'string' &&
    item.name.trim() !== '' &&
    typeof item.price === 'number' &&
    !Number.isNaN(item.price) &&
    item.price >= 0 &&
    typeof item.quantity === 'number' &&
    !Number.isNaN(item.quantity) &&
    item.quantity > 0
  )
}

export function getCartItems(userId) {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const raw = JSON.parse(window.localStorage.getItem(resolveStorageKey(userId)) || '[]')
    if (!Array.isArray(raw)) return []
    return raw.map(normalizeCartItem).filter(isValidCartItem)
  } catch (error) {
    return []
  }
}

export function saveCartItems(userId, items) {
  if (typeof window === 'undefined') {
    return
  }
  const sanitized = Array.isArray(items)
    ? items.map(normalizeCartItem).filter(isValidCartItem)
    : []
  window.localStorage.setItem(resolveStorageKey(userId), JSON.stringify(sanitized))
}

export function addToCart(userId, item) {
  const cartItems = getCartItems(userId)
  const existing = cartItems.find((entry) => 
    entry.id === item.id || 
    (entry.menu_item_id && entry.menu_item_id === item.id) ||
    (item.menu_item_id && entry.menu_item_id === item.menu_item_id)
  )

  if (existing) {
    existing.quantity = (existing.quantity || 1) + (item.quantity || 1)
  } else {
    cartItems.push({
      ...item,
      menu_item_id: item.menu_item_id || item.id,
      quantity: item.quantity || 1,
    })
  }

  saveCartItems(userId, cartItems)
  return cartItems
}

export function getCartCount(userId) {
  return getCartItems(userId).reduce((count, item) => count + (item.quantity || 1), 0)
}

export function clearCart(userId) {
  saveCartItems(userId, [])
}

export function removeFromCart(userId, itemId) {
  const items = getCartItems(userId).filter((i) => i.id !== itemId)
  saveCartItems(userId, items)
  return items
}

export function updateQuantity(userId, itemId, quantity) {
  const items = getCartItems(userId)
  const it = items.find((i) => i.id === itemId)
  if (it) it.quantity = quantity
  saveCartItems(userId, items)
  return items
}
