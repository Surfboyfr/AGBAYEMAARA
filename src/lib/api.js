// ── Àgbáyémáarà API client ──────────────────────────────────────────────────
// Thin fetch wrapper around the V1 backend (see docs/ Postman collection).
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

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://agba-api-273038897334.us-central1.run.app/api/v1'
).replace(/\/+$/, '')

// The session token lives in localStorage next to the stored profile
// (agbayemaara.user) so a refresh keeps the visitor authenticated.
const TOKEN_KEY = 'agbayemaara.token'

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

export const clearToken = () => setToken(null)

// Core request helper.
//   apiFetch('/cart', { method: 'POST', body: { productId, quantity } })
// Options:
//   body            — plain object (JSON-encoded) or FormData (sent as-is)
//   auth            — attach Bearer token (default true)
//   idempotencyKey  — Idempotency-Key header (checkout)
//   headers         — extra headers
//   raw             — return the full envelope instead of `data`
export const apiFetch = async (
  path,
  {
    method = 'GET',
    body,
    auth = true,
    idempotencyKey,
    headers = {},
    raw = false,
  } = {},
) => {
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
    response = await fetch(`${API_BASE}${path}`, {
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

// Registers an account and stores the returned token.
// Backend duplicate handling: if the email is taken (ALREADY_EXISTS-style
// error), callers may fall back to signIn with the same credentials — the
// boot-flow verify scripts reuse a fixed test email across runs.
export const signUp = async ({ email, password, displayName, role = 'buyer' }) => {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: { email, password, displayName, role },
    auth: false,
  })
  if (data?.token) setToken(data.token)
  return data
}

// Authenticates and stores the returned token.
export const signIn = async ({ email, password }) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
  if (data?.token) setToken(data.token)
  return data
}

// Registers (or signs in an existing account) for the boot-flow sign-up step.
// Returns { user, token }. Throws ApiError on validation/network failure.
export const registerOrLogin = async ({ email, password, displayName, role }) => {
  try {
    return await signUp({ email, password, displayName, role })
  } catch (error) {
    // Email already registered → sign in instead so returning test/real
    // users with the same credentials still pass the gate.
    const duplicate =
      error.status === 409 ||
      error.status === 400 ||
      /ALREADY|EXISTS|TAKEN|DUPLICATE/i.test(error.code ?? '') ||
      /already|exists|taken|duplicate/i.test(error.message)
    if (!duplicate) throw error
    return signIn({ email, password })
  }
}

export const signOut = () => clearToken()

export default apiFetch
