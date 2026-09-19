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

// Single order by reference (the reference doubles as the order id).
export const getOrder = (reference) =>
  getOrders().find((order) => order.reference === reference) ?? null

// ── Order lifecycle ──────────────────────────────────────────────────────────
// Matches the lifecycle the project records for orders: an order is placed,
// paid, handed to the brand, confirmed, worked on, shipped and delivered —
// with a failure branch that ends in a refund. When a backend exists this
// progression is server-driven; locally we advance it on demand so the
// status page has something truthful to render.
export const ORDER_STAGES = [
  'created',
  'paid',
  'brand_notified',
  'confirmed_by_brand',
  'in_progress',
  'shipped',
  'delivered',
]

export const FAILURE_STAGES = ['fulfilment_failed', 'refunded']

// Stepper display: the page shows four customer-facing milestones, each
// reached by an underlying lifecycle stage (or anything past it).
export const STEP_MILESTONES = [
  { id: 'ordered', labelKey: 'stepOrdered', stages: ['created', 'paid'] },
  {
    id: 'in_progress',
    labelKey: 'stepInProgress',
    stages: ['brand_notified', 'confirmed_by_brand', 'in_progress'],
  },
  { id: 'shipped', labelKey: 'stepShipped', stages: ['shipped'] },
  { id: 'delivered', labelKey: 'stepDelivered', stages: ['delivered'] },
]

const stageIndex = (stage) => ORDER_STAGES.indexOf(stage)

// Map a raw lifecycle stage to the visible step the shopper sees. Unknown /
// future stages clamp to the last step rather than falling off the track.
export const stepForStage = (stage) => {
  const failureStep = FAILURE_STAGES.indexOf(stage)
  if (failureStep !== -1) return -1

  const index = stageIndex(stage)
  if (index === -1) return STEP_MILESTONES.length - 1

  return STEP_MILESTONES.findIndex((step) => step.stages.includes(stage))
}

// Advance one lifecycle stage (never past delivered). Demo helper for the
// happy path — a backend replaces this. Returns the updated order or null.
export const advanceOrderStatus = (reference) => {
  const order = getOrder(reference)
  if (!order) return null

  const index = stageIndex(order.status)
  const nextStage = ORDER_STAGES[Math.min(index + 1, ORDER_STAGES.length - 1)]
  return patchOrder(reference, { status: nextStage })
}

// ── Failure branch ───────────────────────────────────────────────────────────
// The lifecycle branches to fulfilment_failed → refunded. In production the
// backend flips these; here they are driven by demo controls on the status
// page so the whole branch can be exercised without one.

// Fulfilment failed: the brand could not complete the order. The payment is
// still captured at this point — the refund comes next. `failedAt` records
// which stage the order was in when it failed so the status page can show
// where the track stopped.
export const failOrder = (reference) => {
  const order = getOrder(reference)
  if (!order) return null
  return patchOrder(reference, { status: 'fulfilment_failed', failedAt: order.status })
}

// Refund processed: money returned to the original payment method.
export const refundOrder = (reference) => patchOrder(reference, { status: 'refunded' })

// Demo reset: back to a fresh order so the flow can be replayed.
export const resetOrder = (reference) =>
  patchOrder(reference, {
    status: ORDER_STAGES[0],
    failedAt: undefined,
    placedAt: new Date().toISOString(),
  })

// Persisted-field update for one order. Internal helper — every mutator
// funnels through here so the store stays consistent.
const patchOrder = (reference, fields) => {
  const order = getOrder(reference)
  if (!order) return null

  const updated = { ...order, ...fields }
  write(
    ORDERS_KEY,
    getOrders().map((o) => (o.reference === reference ? updated : o))
  )
  return updated
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
