// ── Shopper session store ───────────────────────────────────────────────────
// Single source of truth for "who is logged in", shared by the AuthModal,
// the Welcome/Discovery navbars and the BootFlow sign-up step.
//
// Persistence follows the existing convention: the profile lives under
// `agbayemaara.user` (same key BootFlow and the verify scripts read) and the
// API token under `agbayemaara.token` (set by lib/api.js on login/register).
// A session is only "logged in" when BOTH exist — a profile without a token
// is a legacy pre-API mock signup and should offer Sign in again.
//
// Plain module + useSyncExternalStore — no Context provider needed, and any
// component can react to login/logout.
import { useSyncExternalStore } from 'react'
import { getToken, registerOrLogin, signIn, signOut } from './api'
import { recordActivity } from './activity'

const USER_KEY = 'agbayemaara.user'

const readUser = () => {
  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY) ?? 'null')
  } catch {
    return null
  }
}

const writeUser = (user) => {
  try {
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user))
    else window.localStorage.removeItem(USER_KEY)
  } catch {
    // Storage unavailable (private mode) — session won't persist.
  }
}

let state = { user: readUser() }
const listeners = new Set()

const setState = (next) => {
  state = next
  listeners.forEach((listener) => listener())
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => state

// Signs in via POST /auth/login and persists the profile alongside the token.
export const login = async ({ email, password }) => {
  const session = await signIn({ email, password })
  const profile = {
    ...state.user,
    id: session?.user?.id ?? state.user?.id ?? null,
    name: session?.user?.displayName || state.user?.name || '',
    email: session?.user?.email || email,
  }
  writeUser(profile)
  setState({ user: profile })
  // Tracked for /admin — every sign-in is part of the user activity trail.
  recordActivity('customer', 'user.login', `User signed in: ${profile.email}`, profile.name, {
    email: profile.email,
  })
  return session
}

// Registers via POST /auth/register (falls back to login on existing email)
// and persists the profile. `appRole` keeps the frontend shopper/brand split;
// the backend role is always 'buyer' — vendor onboarding is /seller/register.
export const signup = async ({ name, email, password, appRole = 'shopper' }) => {
  const session = await registerOrLogin({
    email,
    password,
    displayName: name,
    role: 'buyer',
  })
  const profile = {
    role: appRole,
    id: session?.user?.id ?? null,
    name: session?.user?.displayName || name,
    email: session?.user?.email || email,
  }
  writeUser(profile)
  setState({ user: profile })
  return session
}

// Clears the token and the stored profile.
export const logout = () => {
  signOut()
  writeUser(null)
  setState({ user: null })
}

// Reactive session: re-renders subscribers on login/logout and exposes the
// actions (login/signup/logout) so components can destructure them directly.
export const useSession = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  return {
    ...snapshot,
    isLoggedIn: Boolean(snapshot.user) && Boolean(getToken()),
    login,
    signup,
    logout,
  }
}

export default useSession
