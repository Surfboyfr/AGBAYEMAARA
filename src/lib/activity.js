// ── Activity log (localStorage) ───────────────────────────────────────────────
// One shared event trail for both surfaces of the platform: shopper actions
// (cart, follows, orders, fulfilment updates) and seller actions (catalogue
// and profile edits) append here, and /admin reads it back to show what is
// happening across the site. Frontend-only like the rest of the app — when a
// backend lands this becomes an API-backed feed with the same shape.
//
//   recordActivity('customer', 'order.placed', 'Order REF-123 placed')
//
// Entries: { id, section: 'customer' | 'seller', type, label, detail, at }
const ACTIVITY_KEY = 'agbayemaara.activity'

// Keeps the stored trail small — the admin feed only renders the newest rows
// anyway, so old events age out instead of growing the key forever.
const MAX_EVENTS = 200

const read = () => {
  try {
    const raw = window.localStorage.getItem(ACTIVITY_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

// Newest-first list of tracked events. Empty when nothing has happened yet
// (or storage is unavailable) — callers render their own empty state.
export const getActivity = () => read()

// Append one event. Never throws: an action must succeed even when tracking
// cannot (private mode, quota, SSR-less environment).
export const recordActivity = (section, type, label, detail = '') => {
  const event = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    section,
    type,
    label,
    detail,
    at: new Date().toISOString(),
  }
  try {
    window.localStorage.setItem(
      ACTIVITY_KEY,
      JSON.stringify([event, ...read()].slice(0, MAX_EVENTS))
    )
  } catch {
    // Storage unavailable — the action still happens, it just isn't tracked.
  }
  return event
}
