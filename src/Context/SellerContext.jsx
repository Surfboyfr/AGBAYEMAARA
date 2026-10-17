import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { apiFetch, getToken } from '../lib/api'
import {
  ORDER_STATUS,
  PRODUCT_STATUS,
  LOW_STOCK_THRESHOLD,
  getProductStatus,
  sellerOrders,
  sellerProducts,
  sellerProfile,
  sellerStats,
} from '../data/sellerMockData'
import { recordActivity } from '../lib/activity'

// ── Seller state (real backend first, mock as offline fallback) ─────────────
// Single source of truth for the seller portal: products, orders, profile and
// derived stats live here as local React state. On every load with a session
// token, refreshPortal() hydrates them from the real V1 endpoints (GET
// /seller/products | /orders | /stats | /profile) so the portal shows the
// signed-in vendor's ACTUAL catalogue, orders and numbers. The seeded mock
// data in src/data/sellerMockData.js only renders while those fetches are
// unavailable (no session, network failure, mocked verify runs).
//
// FUTURE BACKEND: each write action is annotated with its endpoint; replace
// the setState call with a fetch and keep the same return shape so no
// component has to change:
//
//   addProduct    → POST   /api/seller/products
//   updateProduct → PUT    /api/seller/products/:id
//   deleteProduct → DELETE /api/seller/products/:id
//   updateProfile → PUT    /api/seller/profile
//
// Persistence follows the same guarded localStorage pattern as
// src/lib/orders.js so edits survive a refresh. An untouched seed (or a
// previously adopted API snapshot) is refreshed from the backend on load;
// once this seller edits locally, their copy wins until site data is cleared
// (same rule as the profile). Delete the stored keys when real APIs land.

const SellerContext = createContext(null)

const PRODUCTS_KEY = 'agbayemaara.seller.products'
// Snapshot of the last catalogue adopted from the API — while the stored
// list still matches it, the backend is free to refresh it; any local edit
// makes the stored copy win instead (see isRefreshableProducts).
const PRODUCTS_SYNCED_KEY = 'agbayemaara.seller.products.synced'
const ORDERS_KEY = 'agbayemaara.seller.orders'
const PROFILE_KEY = 'agbayemaara.seller.profile'

// Simulated fetch latency for the first load so loading/skeleton states are
// exercised. Drop this to 0 when a real API takes over.
const MOCK_LOAD_MS = 500

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
    // Storage unavailable — mock data just won't persist this session
  }
}

// Stored arrays/objects only count if they still parse as the right shape;
// a corrupt/old blob falls back to the mock data instead of crashing a page.
const readList = (key, fallback) => {
  const value = read(key, null)
  return Array.isArray(value) ? value : fallback
}

const readObject = (key, fallback) => {
  const value = read(key, null)
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback
}

// The identity fields of the profile — everything the signup form collects
// plus what GET /seller/profile returns. All strings.
const PROFILE_FIELDS = [
  'businessName',
  'ownerName',
  'email',
  'phone',
  'location',
  'description',
  'avatar',
  'joinedAt',
]

// Merges a profile payload (backend response or registration form values)
// over a base profile. Empty/missing fields are ignored so a partial payload
// — including the empty {} the mocked API returns in verify runs — never
// wipes what is already on screen.
const mergeProfileFields = (base, remote) => {
  if (!remote || typeof remote !== 'object') return base
  const next = { ...base }
  for (const field of PROFILE_FIELDS) {
    const value = remote[field]
    if (typeof value === 'string' && value.trim()) next[field] = value.trim()
  }
  return next
}

// True while the profile is still the untouched mock (every identity field
// identical) — the signal that this seller has no real/local data yet and
// the backend record should be adopted wholesale.
const isMockProfile = (profile) =>
  PROFILE_FIELDS.every((field) => profile[field] === sellerProfile[field])

// ── Backend → portal mappers ────────────────────────────────────────────────
// GET /seller/products returns the vendor's real catalogue in the backend's
// own shape (title/inventoryQuantity/media…); these mappers translate it into
// the { name, category, price, stock, image } shape every portal screen
// renders. Field fallbacks keep a partial payload from crashing a page, and
// `currency` rides along so prices render in the right money (the live
// catalogue prices in Naira).
const mapApiProduct = (item) => ({
  id: item.id,
  name: item.title ?? item.name ?? 'Untitled product',
  category: Array.isArray(item.categories) && item.categories[0] ? item.categories[0] : 'Unisex',
  price: Number(item.price) || 0,
  currency: typeof item.currency === 'string' && item.currency ? item.currency : 'USD',
  stock: Number(item.inventoryQuantity ?? item.stock) || 0,
  description: item.description ?? '',
  image: item.media?.[0]?.secureUrl ?? item.image ?? '',
  createdAt: item.createdAt ?? new Date().toISOString(),
})

// GET /seller/orders — the contract (per the docs/ Postman collection:
// PATCH /seller/orders/:id/status takes lowercase statuses like "shipped")
// suggests the same lowercase status vocabulary as the portal's display
// values, so statuses are title-cased on the way in and unknown values get a
// neutral chip fallback in the components.
// NOTE: this endpoint currently answers 404 ORDER_NOT_FOUND for the demo
// vendor even though GET /seller/stats reports one order — a backend bug.
// The mapper is written against the documented contract and the portal
// degrades to the honest "No orders yet" state until it is fixed.
const mapApiOrder = (item) => ({
  id: item.id ?? item.orderNumber ?? 'ORDER',
  customer: {
    name: item.customer?.name ?? item.buyer?.displayName ?? item.customerName ?? 'Customer',
    email: item.customer?.email ?? item.buyer?.email ?? item.customerEmail ?? '',
  },
  items: (Array.isArray(item.items) ? item.items : []).map((line) => ({
    productId: line.productId ?? line.product?.id,
    name: line.name ?? line.product?.title ?? line.title ?? 'Item',
    quantity: Number(line.quantity ?? line.qty) || 1,
    price: Number(line.price ?? line.unitPrice ?? line.product?.price) || 0,
    image: line.image ?? line.product?.media?.[0]?.secureUrl ?? '',
  })),
  total: Number(item.total ?? item.totalAmount ?? item.grandTotal) || 0,
  currency: typeof item.currency === 'string' && item.currency ? item.currency : undefined,
  date: item.createdAt ?? item.placedAt ?? item.date ?? new Date().toISOString(),
  status:
    typeof item.status === 'string' && item.status
      ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
      : 'Pending',
})

// Structural equality good enough for seed/snapshot comparison — key order is
// stable because both sides come from JSON round-trips of the same shapes.
const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// A stored catalogue may be refreshed from the backend on load only while it
// is still the untouched seed or still exactly the snapshot we last adopted
// from the API — i.e. this seller hasn't edited it locally. Any local edit
// makes the stored copy win until site data is cleared.
const isRefreshableProducts = (list) =>
  sameJson(list, sellerProducts) || sameJson(list, read(PRODUCTS_SYNCED_KEY, null))

// Reads the four seller endpoints in parallel and returns their settled
// results — module scope so the mount effect can fetch without any setState
// in the effect body (results are applied in a .then callback / by
// refreshPortal for the login and register event handlers).
const fetchPortalSnapshot = () =>
  Promise.allSettled([
    apiFetch('/seller/profile'),
    apiFetch('/seller/products'),
    apiFetch('/seller/orders'),
    apiFetch('/seller/stats'),
  ]).then(([profile, products, orders, stats]) => ({ profile, products, orders, stats }))

export const SellerProvider = ({ children }) => {
  const [products, setProducts] = useState(() => readList(PRODUCTS_KEY, sellerProducts))
  const [orders, setOrders] = useState(() => readList(ORDERS_KEY, sellerOrders))
  const [profile, setProfile] = useState(() => readObject(PROFILE_KEY, sellerProfile))
  // Real GET /seller/stats payload once hydrated; null → derive everything
  // from local state + the mock trend hints (offline/demo mode).
  const [remoteStats, setRemoteStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Live mirrors for the hydration callbacks (useCallback must stay stable).
  const productsRef = useRef(products)
  useEffect(() => {
    productsRef.current = products
  }, [products])
  // In-flight hydration count: while > 0 the skeleton must stay up so the
  // dashboard never flashes mock numbers on the way to real ones.
  const hydrationRuns = useRef(0)
  // Catalogue currency for locally added products — they should price in the
  // same money as the real catalogue around them (NGN for the live vendor).
  // Assigned from the stats memo below once it exists.
  const currencyRef = useRef('USD')

  // Mock initial load — the minimum skeleton time; the hydration below also
  // keeps isLoading up while real data is in flight (see hydrationRuns).
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hydrationRuns.current === 0) setIsLoading(false)
    }, MOCK_LOAD_MS)
    return () => clearTimeout(timer)
  }, [])

  // Persist mock state so edits survive refreshes (same pattern as lib/orders.js).
  useEffect(() => write(PRODUCTS_KEY, products), [products])
  useEffect(() => write(PROFILE_KEY, profile), [profile])

  // ── Catalogue/orders/stats hydration (real: GET /seller/*) ──────────────
  // Replaces the mock seeds with the vendor's real records whenever the API
  // answers with a list. Rules, per endpoint:
  //   • array payload   → adopt it wholesale (backend is the source of truth;
  //     an empty [] is real state — a new vendor's portal must say so)
  //   • anything else   → keep the local copy (the mocked verify runs answer {})
  //   • request failed  → keep the local copy for products/stats; ORDERS fall
  //     back to the empty list instead, because the current backend 404s the
  //     list endpoint (ORDER_NOT_FOUND) and inventing mock orders for a real
  //     vendor is exactly what this hydration exists to stop.
  // A locally edited catalogue outranks the fetch (see isRefreshableProducts)
  // so demo edits survive; clearing site data re-syncs from the backend.
  const applySnapshot = useCallback((snapshot) => {
    const profileData = snapshot.profile.status === 'fulfilled' ? snapshot.profile.value : null
    if (profileData && typeof profileData === 'object') {
      setProfile((prev) => (isMockProfile(prev) ? mergeProfileFields(prev, profileData) : prev))
    }

    const productData = snapshot.products.status === 'fulfilled' ? snapshot.products.value : null
    if (Array.isArray(productData)) {
      const mapped = productData.map(mapApiProduct)
      if (isRefreshableProducts(productsRef.current)) {
        setProducts(mapped)
        write(PRODUCTS_SYNCED_KEY, mapped)
      }
    }

    const orderData = snapshot.orders.status === 'fulfilled' ? snapshot.orders.value : null
    if (Array.isArray(orderData)) setOrders(orderData.map(mapApiOrder))
    else if (snapshot.orders.status === 'rejected' && snapshot.orders.reason?.status !== 0) {
      // Backend answered with an error (not a network miss) — no list to
      // show; never substitute fake orders for a real vendor.
      setOrders([])
    }

    const statsData = snapshot.stats.status === 'fulfilled' ? snapshot.stats.value : null
    // Require the real payload shape (has revenue) — the mocked verify runs
    // answer {} and must fall through to the locally derived stats.
    if (statsData && typeof statsData === 'object' && 'revenue' in statsData) {
      setRemoteStats(statsData)
    }

    setIsLoading(false)
  }, [])

  // Fetch + apply as one unit, counting in-flight runs so the skeleton timer
  // knows whether real data is still on its way.
  const runHydration = useCallback(() => {
    hydrationRuns.current += 1
    return fetchPortalSnapshot().then((snapshot) => {
      hydrationRuns.current = Math.max(0, hydrationRuns.current - 1)
      applySnapshot(snapshot)
    })
  }, [applySnapshot])

  // Explicit re-hydration for the login/register event handlers (the mount
  // effect below ran before those flows obtained a token). Raises the
  // skeleton first so the dashboard shows loaders, not mock numbers, while
  // the real catalogue/stats are fetched.
  const refreshPortal = useCallback(async () => {
    if (!getToken()) return
    setIsLoading(true)
    await runHydration()
  }, [runHydration])

  // Hydrate on every portal load with a session token (deep links included).
  // The fetch itself is an external-system read; results apply in the
  // .then() callback — never synchronously in the effect body.
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    hydrationRuns.current += 1
    fetchPortalSnapshot().then((snapshot) => {
      hydrationRuns.current = Math.max(0, hydrationRuns.current - 1)
      if (!cancelled) applySnapshot(snapshot)
    })
    return () => {
      cancelled = true
    }
  }, [applySnapshot])
  // ── Product CRUD (local state today, API tomorrow) ─────────────────────────
  const addProduct = (product) => {
    // Future: const created = await api.post('/api/seller/products', product)
    setProducts((prev) => {
      const nextId = prev.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
      return [
        {
          currency: currencyRef.current,
          ...product,
          id: nextId,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]
    })
    // Tracked for /admin — catalogue changes in the seller section.
    recordActivity('seller', 'product.added', `Added "${product.name}" to the catalogue`)
  }

  const updateProduct = (id, fields) => {
    // Future: await api.put(`/api/seller/products/${id}`, fields)
    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, ...fields } : product))
    )
    const name = products.find((product) => product.id === id)?.name ?? `#${id}`
    recordActivity(
      'seller',
      'product.updated',
      `Updated "${name}"`,
      Object.keys(fields).join(', ')
    )
  }

  const deleteProduct = (id) => {
    // Future: await api.delete(`/api/seller/products/${id}`)
    const name = products.find((product) => product.id === id)?.name ?? `#${id}`
    setProducts((prev) => prev.filter((product) => product.id !== id))
    recordActivity('seller', 'product.removed', `Removed "${name}" from the catalogue`)
  }

  const updateProfile = (fields) => {
    // Future: await api.put('/api/seller/profile', fields)
    setProfile((prev) => ({ ...prev, ...fields }))
    recordActivity('seller', 'profile.updated', 'Seller profile updated')
  }

  // Silent profile seeding — used by /seller/register after a successful
  // POST /seller/register to put the signup details (owner name, business
  // name, contact info) straight into the dashboard/header/profile views.
  // No activity entry: the registration itself is already tracked.
  const syncProfile = (fields) => {
    setProfile((prev) => mergeProfileFields(prev, fields))
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  // Computed live so dashboard cards react to add/edit/delete immediately;
  // once GET /seller/stats has answered, ITS totals/trends are authoritative
  // (the backend counts orders this portal can't always list, and its revenue
  // is in the vendor's own currency). Pending/active breakdowns stay derived
  // — the stats endpoint doesn't provide them.
  const stats = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== ORDER_STATUS.CANCELLED)
    const derived = {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: activeOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
      // Restock queue: everything at or below the low-stock threshold (0 included).
      lowStockProducts: products.filter(
        (product) => (Number(product.stock) || 0) <= LOW_STOCK_THRESHOLD
      ).length,
      pendingOrders: orders.filter((order) => order.status === ORDER_STATUS.PENDING).length,
      activeProducts: products.filter(
        (product) => getProductStatus(product.stock) === PRODUCT_STATUS.ACTIVE
      ).length,
    }
    const currency = products.find((product) => product.currency)?.currency ?? 'USD'
    if (!remoteStats) {
      return { ...derived, currency, trends: sellerStats, revenueSource: 'local' }
    }
    const pick = (value, fallback) =>
      Number.isFinite(Number(value)) && value !== null && value !== ''
        ? Number(value)
        : fallback
    return {
      totalProducts: pick(remoteStats.productsCount, derived.totalProducts),
      totalOrders: pick(remoteStats.ordersCount, derived.totalOrders),
      totalRevenue: pick(remoteStats.revenue, derived.totalRevenue),
      lowStockProducts: pick(remoteStats.lowStockCount, derived.lowStockProducts),
      pendingOrders: derived.pendingOrders,
      activeProducts: derived.activeProducts,
      currency,
      trends: {
        revenueTrendPercent: pick(remoteStats.revenueTrendPercent, sellerStats.revenueTrendPercent),
        ordersTrendPercent: pick(remoteStats.ordersTrendPercent, sellerStats.ordersTrendPercent),
        productsTrendPercent: pick(remoteStats.productsTrendPercent, sellerStats.productsTrendPercent),
        lowStockTrendPercent: pick(remoteStats.lowStockTrendPercent, sellerStats.lowStockTrendPercent),
      },
      revenueSource: 'api',
    }
  }, [products, orders, remoteStats])

  // Track the catalogue currency for locally added products (declared above
  // the stats memo only because hooks must run in a stable order).
  useEffect(() => {
    currencyRef.current = stats.currency
  }, [stats.currency])

  return (
    <SellerContext.Provider
      value={{
        products,
        orders,
        profile,
        stats,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProfile,
        syncProfile,
        refreshPortal,
      }}
    >
      {children}
    </SellerContext.Provider>
  )
}

export const useSeller = () => {
  const ctx = useContext(SellerContext)
  if (!ctx) throw new Error('useSeller must be used within SellerProvider')
  return ctx
}
