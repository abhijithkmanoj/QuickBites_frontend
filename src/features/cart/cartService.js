import apiClient from '../../lib/axios'
import { getCartItems, saveCartItems } from '../../lib/cart'

export async function syncLocalCart(userId) {
  const local = getCartItems(userId)
  if (!local || local.length === 0) return

  try {
    // Post each item to server; server will create cart on first add
    for (const it of local) {
      await apiClient.post('/cart/add', {
        restaurant_id: it.restaurant_id,
        item: {
          menu_item_id: it.id || null,
          name: it.name,
          price: it.price,
          quantity: it.quantity || 1,
        },
      })
    }

    // replace local cache with server canonical cart
    const resp = await apiClient.get('/cart')
    saveCartItems(userId, resp.data.items.map((i) => ({
      id: i.id,
      restaurant_id: resp.data.restaurant_id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      menu_item_id: i.menu_item_id || null,
    })))
  } catch (err) {
    // If anything fails (auth or server), leave local cart intact
    return
  }
}

export async function addItem(userId, item) {
  try {
    const resp = await apiClient.post('/cart/add', {
      restaurant_id: item.restaurant_id,
      item: {
        menu_item_id: item.id || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
      },
    })
    const cart = resp.data
    // sync local storage to server
    saveCartItems(userId, cart.items.map((i) => ({ id: i.id, restaurant_id: cart.restaurant_id, name: i.name, price: i.price, quantity: i.quantity })))
    return cart
  } catch (err) {
    // on failure, caller should fallback to local
    throw err
  }
}

export async function updateItem(userId, itemId, quantity) {
  try {
    const resp = await apiClient.put(`/cart/item/${itemId}`, { quantity })
    // update local copy
    const updated = resp.data
    const cartResp = await apiClient.get('/cart')
    saveCartItems(userId, cartResp.data.items.map((i) => ({ id: i.id, restaurant_id: cartResp.data.restaurant_id, name: i.name, price: i.price, quantity: i.quantity })))
    return updated
  } catch (err) {
    throw err
  }
}

export async function removeItem(userId, itemId) {
  try {
    await apiClient.delete(`/cart/item/${itemId}`)
    const cartResp = await apiClient.get('/cart')
    saveCartItems(userId, cartResp.data.items.map((i) => ({ id: i.id, restaurant_id: cartResp.data.restaurant_id, name: i.name, price: i.price, quantity: i.quantity })))
  } catch (err) {
    throw err
  }
}

export async function clearCartServer(userId) {
  try {
    await apiClient.delete('/cart')
    saveCartItems(userId, [])
  } catch (err) {
    throw err
  }
}

export default {
  syncLocalCart,
  addItem,
  updateItem,
  removeItem,
  clearCartServer,
}
