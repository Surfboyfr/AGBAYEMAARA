// ── Activity log (localStorage) ───────────────────────────────────────────────
// One shared event trail for both surfaces of the platform: shopper actions
// (cart, follows, orders, fulfilment updates) and seller actions (catalogue
// and profile edits) append here, and /admin reads it back to show what is
// happening across the site. Frontend-only like the rest of the app — when a
// backend lands this becomes an API-backed feed with the same shape.
//
//   recordActivity('customer', 'order.placed', 'Order REF-123 placed')
//
// Entries: { id, section: 'customer' | 'seller', type, label, detail, meta, at }
// `meta` is optional structured data (role, reference, totals…) that the admin
// console can render without parsing the human-readable label.
const ACTIVITY_KEY = 'agbayemaara.activity'

// Sign-ups get their own store (same guarded pattern) because /admin lists
// every new user and vendor individually — the live feed alone is a rolling
// window and would age them out. Each registration is ALSO mirrored into the
// activity trail so the sign-up shows up in the feed the moment it happens.
// Entries: { id, kind: 'user' | 'vendor', name, email, detail, meta, at }
const REGISTRATIONS_KEY = 'agbayemaara.registrations'

// Keeps the stored trail small — the admin feed only renders the newest rows
// anyway, so old events age out instead of growing the key forever.
const MAX_EVENTS = 200

// Sign-up history matters more than raw events (it answers "who joined?"), but
// it is still capped so the key cannot grow forever.
const MAX_REGISTRATIONS = 200

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const read = (key) => {
  try {
    const raw = window.localStorage.getItem(key)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

const write = (key, list) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(list))
  } catch {
    // Storage unavailable — the action still happens, it just isn't tracked.
  }
}

// ── Activity trail ────────────────────────────────────────────────────────────

// Newest-first list of tracked events. Empty when nothing has happened yet
// (or storage is unavailable) — callers render their own empty state.
export const getActivity = () => read(ACTIVITY_KEY)

// Append one event. Never throws: an action must succeed even when tracking
// cannot (private mode, quota, SSR-less environment).
export const recordActivity = (section, type, label, detail = '', meta = null) => {
  const event = {
    id: newId(),
    section,
    type,
    label,
    detail,
    meta,
    at: new Date().toISOString(),
  }
  write(ACTIVITY_KEY, [event, ...read(ACTIVITY_KEY)].slice(0, MAX_EVENTS))
  return event
}

// ── Cart → purchase pipeline ───────────────────────────────────────────────────
// Every product a shopper drops in their cart is tracked as a pipeline entry
// that advances through the funnel: in_cart → checkout_started →
// payment_initialized → paid (with branches: payment_failed, removed). The
// admin console reads this back to show which products are progressing to
// purchase and payment — and where the ones that stalled stopped.
// Entries: { id, productId, name, brand, price, quantity, status,
//            reference?, at, updatedAt }
const CART_TRACKING_KEY = 'agbayemaara.cart-track'

// Cart items churn quickly (add/remove across sessions); cap well below the
// sign-up store so this key stays small.
const MAX_CART_TRACKING = 120

// Pipeline stages, in funnel order. 'removed' and 'payment_failed' are exits.
export const CART_STAGES = {
  IN_CART: 'in_cart',
  CHECKOUT_STARTED: 'checkout_started',
  PAYMENT_INITIALIZED: 'payment_initialized',
  PAID: 'paid',
  PAYMENT_FAILED: 'payment_failed',
  REMOVED: 'removed',
}

// Funnel ordering used to never regress an entry (a paid item cannot go back
// to in_cart when the cart is cleared after checkout).
const STAGE_ORDER = [
  CART_STAGES.IN_CART,
  CART_STAGES.CHECKOUT_STARTED,
  CART_STAGES.PAYMENT_INITIALIZED,
  CART_STAGES.PAID,
]

const stageRank = (status) => {
  const index = STAGE_ORDER.indexOf(status)
  return index === -1 ? -1 : index
}

export const getCartTracking = () => read(CART_TRACKING_KEY)

// One product entered the cart. Re-adding the same product while it is still
// in the cart bumps its quantity instead of opening a second pipeline row.
export const trackCartAdd = (product) => {
  const entries = read(CART_TRACKING_KEY)
  const existing = entries.find(
    (entry) => entry.productId === product.id && entry.status === CART_STAGES.IN_CART
  )
  if (existing) {
    existing.quantity = (Number(existing.quantity) || 1) + 1
    existing.updatedAt = new Date().toISOString()
    write(CART_TRACKING_KEY, entries)
    return existing
  }

  const entry = {
    id: newId(),
    productId: product.id,
    name: product.name ?? product.title ?? 'Item',
    brand: product.brand ?? '',
    price: Number(product.price) || 0,
    quantity: 1,
    status: CART_STAGES.IN_CART,
    reference: null,
    at: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  write(CART_TRACKING_KEY, [entry, ...entries].slice(0, MAX_CART_TRACKING))
  return entry
}

// Mark the given products as removed from their cart (single removal, or the
// manual "clear cart" — the post-payment clear in Checkout does nothing here
// because those entries have already advanced past in_cart).
export const trackCartRemoved = (productIds, all = false) => {
  const ids = new Set((Array.isArray(productIds) ? productIds : [productIds]).map(Number))
  const entries = read(CART_TRACKING_KEY).map((entry) => {
    const targeted = all || ids.has(Number(entry.productId))
    if (!targeted || entry.status !== CART_STAGES.IN_CART) return entry
    return { ...entry, status: CART_STAGES.REMOVED, updatedAt: new Date().toISOString() }
  })
  write(CART_TRACKING_KEY, entries)
}

// Advance tracked products to the next funnel stage. `productIds` limits the
// update to the products in the current cart; entries never regress (an entry
// already at a later stage keeps its status). `reference` records the payment
// reference once one exists.
export const advanceCartTracking = (productIds, status, { reference = null } = {}) => {
  const ids = new Set((Array.isArray(productIds) ? productIds : [productIds]).map(Number))
  const entries = read(CART_TRACKING_KEY).map((entry) => {
    if (!ids.has(Number(entry.productId))) return entry
    // Exit branches (failed, removed) always apply; funnel stages only move
    // an entry forward.
    const isExit = stageRank(entry.status) === -1 || status === CART_STAGES.REMOVED
    if (!isExit && stageRank(status) <= stageRank(entry.status)) return entry
    return {
      ...entry,
      status,
      reference: reference ?? entry.reference,
      updatedAt: new Date().toISOString(),
    }
  })
  write(CART_TRACKING_KEY, entries)
}

// ── Registrations (users + vendors) ───────────────────────────────────────────

// All recorded sign-ups, newest first. Optionally filtered to one kind:
//   getRegistrations('user')   — every new shopper/brand-owner account
//   getRegistrations('vendor') — every seller that onboarded via /seller/register
export const getRegistrations = (kind) => {
  const list = read(REGISTRATIONS_KEY)
  return kind ? list.filter((entry) => entry.kind === kind) : list
}

// Record one sign-up. `kind` is 'user' (a new account) or 'vendor' (a new
// seller onboarding). De-duplicates by kind + email: re-registering the same
// account (login fallback, replayed test runs) keeps the original row instead
// of counting the person twice. The event is also mirrored into the live
// activity feed. Never throws — same contract as recordActivity.
export const recordRegistration = (
  kind,
  { name = '', email = '', detail = '', meta = null } = {}
) => {
  const normalizedEmail = String(email).trim().toLowerCase()
  const existing = read(REGISTRATIONS_KEY).find(
    (entry) =>
      entry.kind === kind &&
      String(entry.email).trim().toLowerCase() === normalizedEmail
  )
  if (existing) return existing

  const registration = {
    id: newId(),
    kind,
    name,
    email,
    detail,
    meta,
    at: new Date().toISOString(),
  }
  write(
    REGISTRATIONS_KEY,
    [registration, ...read(REGISTRATIONS_KEY)].slice(0, MAX_REGISTRATIONS)
  )

  // Mirror into the live feed — the admin sees the sign-up immediately, not
  // only in the registrations list.
  const isVendor = kind === 'vendor'
  recordActivity(
    isVendor ? 'seller' : 'customer',
    isVendor ? 'vendor.registered' : 'user.registered',
    isVendor
      ? `New vendor registered: ${name || email}`
      : `New user registered: ${name || email}`,
    detail || email,
    meta
  )

  return registration
}
