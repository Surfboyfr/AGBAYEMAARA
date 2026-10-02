import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  ORDER_STATUS,
  PRODUCT_STATUS,
  LOW_STOCK_THRESHOLD,
  getProductStatus,
  sellerOrders,
  sellerProducts,
  sellerProfile,
} from '../data/sellerMockData'

// ── Seller state (frontend-only) ─────────────────────────────────────────────
// Single source of truth for the seller portal: products, orders, profile and
// derived stats live here as local React state. Everything is seeded from
// src/data/sellerMockData.js — no backend, no database, no real auth.
//
// FUTURE BACKEND: this file is the single swap point. Each action below is
// annotated with the endpoint it will call; replace the setState call with a
// fetch and keep the same return shape so no component has to change:
//
//   addProduct    → POST   /api/seller/products
//   updateProduct → PUT    /api/seller/products/:id
//   deleteProduct → DELETE /api/seller/products/:id
//   updateProfile → PUT    /api/seller/profile
//   (initial load)→ GET    /api/seller/products | /orders | /profile | /stats
//
// Persistence follows the same guarded localStorage pattern as
// src/lib/orders.js so mock edits survive a refresh. Delete the three keys
// below when real APIs land.

const SellerContext = createContext(null)

const PRODUCTS_KEY = 'agbayemaara.seller.products'
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

export const SellerProvider = ({ children }) => {
  const [products, setProducts] = useState(() => readList(PRODUCTS_KEY, sellerProducts))
  const [orders] = useState(() => readList(ORDERS_KEY, sellerOrders))
  const [profile, setProfile] = useState(() => readObject(PROFILE_KEY, sellerProfile))
  const [isLoading, setIsLoading] = useState(true)

  // Mock initial load — replaces the future GET /api/seller/* fan-out.
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), MOCK_LOAD_MS)
    return () => clearTimeout(timer)
  }, [])

  // Persist mock state so edits survive refreshes (same pattern as lib/orders.js).
  useEffect(() => write(PRODUCTS_KEY, products), [products])
  useEffect(() => write(PROFILE_KEY, profile), [profile])

  // ── Product CRUD (local state today, API tomorrow) ─────────────────────────
  const addProduct = (product) => {
    // Future: const created = await api.post('/api/seller/products', product)
    setProducts((prev) => {
      const nextId = prev.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
      return [{ ...product, id: nextId, createdAt: new Date().toISOString() }, ...prev]
    })
  }

  const updateProduct = (id, fields) => {
    // Future: await api.put(`/api/seller/products/${id}`, fields)
    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, ...fields } : product))
    )
  }

  const deleteProduct = (id) => {
    // Future: await api.delete(`/api/seller/products/${id}`)
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }

  const updateProfile = (fields) => {
    // Future: await api.put('/api/seller/profile', fields)
    setProfile((prev) => ({ ...prev, ...fields }))
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  // Computed live so dashboard cards react to add/edit/delete immediately.
  // Future: GET /api/seller/stats returns the same object server-side.
  const stats = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== ORDER_STATUS.CANCELLED)
    return {
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
  }, [products, orders])

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
