// ── Order store (localStorage) ───────────────────────────────────────────────
// Mock orders persisted client-side so the checkout receipt survives a refresh
// and the order history page has something to list. When a backend exists this
// becomes an API-backed store with the same shape.

const ORDERS_KEY = 'agbayemaara.orders'
const LAST_ORDER_KEY = 'agbayemaara.last-order'

const read = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable — orders just won't persist this session
  }
}

// All placed orders, newest first.
export const getOrders = () => {
  const orders = read(ORDERS_KEY, [])
  return Array.isArray(orders) ? orders : []
}

export const saveOrder = (order) => {
  const orders = [order, ...getOrders().filter((o) => o.reference !== order.reference)]
  write(ORDERS_KEY, orders)
  write(LAST_ORDER_KEY, order)
  return order
}

// The most recently placed order — used to restore the checkout receipt
// after a refresh. `clearLastOrder` dismisses it once the shopper moves on.
export const getLastOrder = () => read(LAST_ORDER_KEY, null)

export const clearLastOrder = () => {
  try {
    window.localStorage.removeItem(LAST_ORDER_KEY)
  } catch {
    // noop
  }
}
