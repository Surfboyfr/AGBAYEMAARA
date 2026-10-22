// ── Àgbáyémáarà API client ──────────────────────────────────────────────────
// Fetch wrapper around the V1 backend (see docs/ Postman collection).
//
// Conventions enforced here, verified against the live API:
//   • Success: HTTP 2xx with { success: true, data: <payload> }  → returns data
//   • Failure: HTTP 4xx/5xx with { success: false, error: { code, message } }
//     → throws ApiError carrying status, code and a human-readable message
//   • Auth:   Authorization: Bearer <token> (token from /auth/login or
//     /auth/register, stored under TOKEN_KEY, 1h expiry + refresh token)
//   • Checkout accepts an Idempotency-Key header (see apiFetch options)
//
// No extra dependency — the browser fetch API is enough.

import { recordRegistration } from './activity'

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://agba-api-273038897334.us-central1.run.app/api/v1'
).replace(/\/+$/, '')

// The session token and refresh token live in localStorage next to the stored profile
// (agbayemaara.user) so a refresh keeps the visitor authenticated.
const TOKEN_KEY = 'agbayemaara.token'
const REFRESH_TOKEN_KEY = 'agbayemaara.refreshToken'

export class ApiError extends Error {
  constructor(message, { status = 0, code = null, payload = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.payload = payload
  }
}

export const getToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token) => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage unavailable (private mode) — session simply won't persist.
  }
}

export const getRefreshToken = () => {
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export const setRefreshToken = (token) => {
  try {
    if (token) window.localStorage.setItem(REFRESH_TOKEN_KEY, token)
    else window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    // Storage unavailable
  }
}

export const clearToken = () => {
  setToken(null)
  setRefreshToken(null)
}

// Core request helper.
//   apiFetch('/cart', { method: 'POST', body: { productId, quantity } })
// Options:
//   body            — plain object (JSON-encoded) or FormData (sent as-is)
//   auth            — attach Bearer token (default true)
//   idempotencyKey  — Idempotency-Key header (checkout)
//   preflight       — optional async (path, opts) => requestData hook. Runs
//                     BEFORE the HTTP call and may return a local/mock payload
//                     for write flows (checkout/payment) that are still
//                     simulated client-side. Returned data short-circuits the
//                     request so downstream modules keep their expected shape.
//   headers         — extra headers
//   raw             — return the full envelope instead of `data`
export const apiFetch = async (
  path,
  {
    method = 'GET',
    body,
    auth = true,
    idempotencyKey,
    preflight,
    headers = {},
    raw = false,
  } = {},
) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (typeof preflight === 'function') {
    // Background contract echo — if returned data is provided, short-circuit.
    try {
      const shortCircuit = await preflight(normalizedPath, { method, body, auth, idempotencyKey })
      if (shortCircuit !== undefined) return shortCircuit
    } catch {
      // Echo failures (offline, 4xx) are intentionally ignored.
    }
  }

  const finalHeaders = { ...headers }
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm) {
    finalHeaders['Content-Type'] = 'application/json'
  }
  if (auth) {
    const token = getToken()
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }
  if (idempotencyKey) finalHeaders['Idempotency-Key'] = idempotencyKey

  let response
  try {
    response = await fetch(`${API_BASE}${normalizedPath}`, {
      method,
      headers: finalHeaders,
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the server. Check your connection.', {
      status: 0,
    })
  }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    // Empty/non-JSON body — treat as null payload.
  }

  if (!response.ok) {
    const error = payload?.error
    const message =
      (typeof error?.message === 'string' && error.message) ||
      (typeof payload?.message === 'string' && payload.message) ||
      `Request failed (${response.status})`
    throw new ApiError(message, {
      status: response.status,
      code: error?.code ?? null,
      payload,
    })
  }

  if (raw) return payload
  return payload && payload.data !== undefined ? payload.data : payload
}

// ── Auth endpoints ──────────────────────────────────────────────────────────

// Registers an account and stores the returned tokens.
// Backend duplicate handling: if the email is taken (ALREADY_EXISTS-style
// error), callers may fall back to signIn with the same credentials.
// Note: The backend strictly requires a phone number with country code. If
// none is passed (e.g. standard buyer signup), a valid country-code default is used.
export const signUp = async ({
  email,
  password,
  displayName,
  name,
  role = 'buyer',
  phoneNumber,
  phone,
}) => {
  const resolvedDisplayName = (displayName || name || '').trim() || 'Àgbáyémáarà Member'
  const resolvedPhone = (phoneNumber || phone || '').trim() || '+2348000000000'

  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: {
      email: (email || '').trim(),
      password,
      displayName: resolvedDisplayName,
      phoneNumber: resolvedPhone,
      role,
    },
    auth: false,
  })

  if (data?.token) setToken(data.token)
  if (data?.refreshToken) setRefreshToken(data.refreshToken)

  // Tracked for /admin — this only runs when POST /auth/register actually
  // succeeded, so the login fallback in registerOrLogin never counts as a
  // new sign-up.
  recordRegistration('user', {
    name: resolvedDisplayName,
    email: (email || '').trim(),
    detail: role === 'brand' ? 'Brand-owner account' : 'Shopper account',
    meta: { role, phone: resolvedPhone },
  })

  return data
}

// Authenticates and stores the returned tokens.
export const signIn = async ({ email, password }) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: (email || '').trim(), password },
    auth: false,
  })
  if (data?.token) setToken(data.token)
  if (data?.refreshToken) setRefreshToken(data.refreshToken)
  return data
}

// Registers (or signs in an existing account) for the boot-flow sign-up step.
// Returns { user, token }. Throws ApiError on validation/network failure.
export const registerOrLogin = async ({
  email,
  password,
  displayName,
  name,
  role = 'buyer',
  phoneNumber,
  phone,
}) => {
  try {
    return await signUp({ email, password, displayName, name, role, phoneNumber, phone })
  } catch (error) {
    // Email already registered → sign in instead so returning test/real
    // users with the same credentials still pass the gate.
    const duplicate =
      error.status === 409 ||
      /ALREADY|EXISTS|TAKEN|DUPLICATE/i.test(error.code ?? '') ||
      /already|exists|taken|duplicate/i.test(error.message ?? '')
    if (!duplicate) throw error
    return signIn({ email, password })
  }
}

export const signOut = () => clearToken()

// ── Seller endpoints ────────────────────────────────────────────────────────

// Registers a seller/vendor account on the platform (POST /seller/register).
export const registerSeller = async ({
  businessName,
  contactEmail,
  contactPhone,
  phone,
  location,
  description,
  logoUrl,
  coverUrl,
}) => {
  const body = {
    businessName: (businessName || '').trim(),
    contactEmail: (contactEmail || '').trim(),
    contactPhone: (contactPhone || phone || '').trim(),
    location: (location || '').trim(),
    description: (description || '').trim(),
  }
  if (logoUrl) body.logoUrl = logoUrl
  if (coverUrl) body.coverUrl = coverUrl

  return apiFetch('/seller/register', {
    method: 'POST',
    body,
  })
}

// Retrieves the authenticated vendor's profile (GET /seller/profile).
export const getSellerProfile = () => apiFetch('/seller/profile')

// Updates the authenticated vendor's profile (PUT /seller/profile).
// Supports plain object ({ businessName, location, description }) or FormData.
export const updateSellerProfile = (data) =>
  apiFetch('/seller/profile', {
    method: 'PUT',
    body: data,
  })

// Lists the authenticated vendor's catalog/products (GET /seller/products).
export const getSellerProducts = () => apiFetch('/seller/products')

// Creates a product in the authenticated vendor's catalog (POST /seller/products).
export const createSellerProduct = async ({
  title,
  name,
  description = '',
  price = 0,
  inventoryQuantity,
  stock = 0,
  leadTime = '3-5 days',
  media,
  image,
}) => {
  const body = {
    title: (title || name || '').trim(),
    description: (description || '').trim(),
    price: Number(price) || 0,
    inventoryQuantity: Number(inventoryQuantity !== undefined ? inventoryQuantity : stock) || 0,
    leadTime: leadTime || '3-5 days',
  }
  if (Array.isArray(media)) {
    body.media = media
  } else if (image) {
    body.media = [{ url: image, isPrimary: true }]
  }

  return apiFetch('/seller/products', {
    method: 'POST',
    body,
  })
}

// Updates an existing seller product (PUT /seller/products/:id).
export const updateSellerProduct = async (id, fields = {}) => {
  const body = {}
  if (fields.title !== undefined || fields.name !== undefined) {
    body.title = (fields.title || fields.name || '').trim()
  }
  if (fields.description !== undefined) {
    body.description = String(fields.description).trim()
  }
  if (fields.price !== undefined) {
    body.price = Number(fields.price) || 0
  }
  if (fields.inventoryQuantity !== undefined || fields.stock !== undefined) {
    body.inventoryQuantity = Number(
      fields.inventoryQuantity !== undefined ? fields.inventoryQuantity : fields.stock,
    ) || 0
  }
  if (fields.leadTime !== undefined) {
    body.leadTime = fields.leadTime
  }
  if (fields.media !== undefined) {
    body.media = fields.media
  } else if (fields.image) {
    body.media = [{ url: fields.image, isPrimary: true }]
  }

  return apiFetch(`/seller/products/${id}`, {
    method: 'PUT',
    body,
  })
}

// Deletes or archives a seller product (DELETE /seller/products/:id).
export const deleteSellerProduct = (id) =>
  apiFetch(`/seller/products/${id}`, { method: 'DELETE' })

// Lists the authenticated vendor's orders (GET /seller/orders).
export const getSellerOrders = () => apiFetch('/seller/orders')

// Updates fulfillment status for an order line/item (PATCH /seller/orders/:id/status).
export const updateSellerOrderStatus = (id, status) =>
  apiFetch(`/seller/orders/${id}/status`, {
    method: 'PATCH',
    body: { status: String(status).toLowerCase() },
  })

// Retrieves seller dashboard aggregate statistics (GET /seller/stats).
export const getSellerStats = () => apiFetch('/seller/stats')

// Generates upload signature for seller brand logos/banners (POST /seller/media/sign).
export const signSellerMedia = ({ folder = 'agbayemaara/brands/logos' } = {}) =>
  apiFetch('/seller/media/sign', {
    method: 'POST',
    body: { folder },
  })

// ── Vendor Fulfilment Intent ────────────────────────────────────────────────

export const getVendorOrders = (vendorId) =>
  apiFetch(`/vendor/orders?vendorId=${encodeURIComponent(vendorId)}`)

export const respondToFulfilmentIntent = (vendorOrderId, { decision, note = '' }) =>
  apiFetch(`/vendor/orders/${vendorOrderId}/intent`, {
    method: 'POST',
    body: { decision, note },
  })

// ── Discovery & Catalog endpoints ───────────────────────────────────────────

export const getFeed = ({ surface = 'for_you' } = {}) =>
  apiFetch(`/feed?surface=${encodeURIComponent(surface)}`, { auth: false })

export const getFollowingFeed = () => apiFetch('/feed/following')

export const getProductsApi = ({ category, gender, limit = 20, cursor } = {}) => {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (gender) params.set('gender', gender)
  if (limit) params.set('limit', String(limit))
  if (cursor) params.set('cursor', cursor)
  const qs = params.toString()
  return apiFetch(`/products${qs ? `?${qs}` : ''}`, { auth: false })
}

export const getProductBySlug = (slug) =>
  apiFetch(`/products/${encodeURIComponent(slug)}`, { auth: false })

export const getBrandBySlug = (slug) =>
  apiFetch(`/brands/${encodeURIComponent(slug)}`, { auth: false })

export const followBrand = (brandId) =>
  apiFetch(`/brands/${encodeURIComponent(brandId)}/follow`, { method: 'POST' })

export const unfollowBrand = (brandId) =>
  apiFetch(`/brands/${encodeURIComponent(brandId)}/follow`, { method: 'DELETE' })

export const getContentStory = (slug) =>
  apiFetch(`/content/${encodeURIComponent(slug)}`, { auth: false })

// ── Cart endpoints ──────────────────────────────────────────────────────────

export const getCart = () => apiFetch('/cart')

export const addToCartApi = ({ productId, quantity = 1 }) =>
  apiFetch('/cart/items', {
    method: 'POST',
    body: { productId, quantity: Number(quantity) || 1 },
  })

export const updateCartItemApi = (itemId, { quantity }) =>
  apiFetch(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: { quantity: Number(quantity) },
  })

export const clearCartApi = () => apiFetch('/cart', { method: 'DELETE' })

// ── Checkout & Payment endpoints ────────────────────────────────────────────

export const createCheckout = async ({
  deliveryAddress = {},
  idempotencyKey = `idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
} = {}) => {
  const address = {
    recipientName: (
      deliveryAddress.recipientName ||
      deliveryAddress.name ||
      deliveryAddress.fullName ||
      ''
    ).trim(),
    phoneNumber: (deliveryAddress.phoneNumber || deliveryAddress.phone || '').trim(),
    streetAddress: (deliveryAddress.streetAddress || deliveryAddress.address || '').trim(),
    city: (deliveryAddress.city || '').trim(),
    state: (deliveryAddress.state || deliveryAddress.city || '').trim(),
    country: (deliveryAddress.country || 'Nigeria').trim(),
  }

  return apiFetch('/checkouts', {
    method: 'POST',
    idempotencyKey,
    body: { deliveryAddress: address },
  })
}

export const getCheckout = (checkoutId) => apiFetch(`/checkouts/${checkoutId}`)

export const initializeCheckoutPayment = (
  checkoutId,
  { callbackUrl = `${window.location.origin}/orders/confirmation` } = {},
) =>
  apiFetch(`/checkouts/${checkoutId}/payment`, {
    method: 'POST',
    body: { callbackUrl },
  })

// ── Orders (Buyer) ──────────────────────────────────────────────────────────

export const getBuyerOrders = () => apiFetch('/orders')

export const getBuyerOrderDetail = (orderId) => apiFetch(`/orders/${orderId}`)

// ── Media & Analytics ───────────────────────────────────────────────────────

export const signMedia = ({ folder = 'agbayemaara/brands' } = {}) =>
  apiFetch('/media/sign', {
    method: 'POST',
    body: { folder },
  })

export const uploadMedia = async (imageFile, { folder = 'agba/uploads' } = {}) => {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('folder', folder)
  return apiFetch('/media/upload', {
    method: 'POST',
    body: formData,
  })
}

export const trackEvent = ({ eventName, anonymousId = 'anon_user', properties = {} }) =>
  apiFetch('/events', {
    method: 'POST',
    auth: false,
    body: { eventName, anonymousId, properties },
  })

export default apiFetch
