import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
const THEME_KEY = 'agbayemaara.theme'

const readStoredTheme = () => {
  try {
    return window.localStorage.getItem(THEME_KEY)
  } catch {
    return null
  }
}

export const ThemeProvider = ({ children }) => {
  // Default follows the OS preference; persisted choice wins.
  const [theme, setTheme] = useState(() => {
    const stored = readStoredTheme()
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  // Reflect the theme on <html> so plain CSS (body background, pop-in
  // animation) and any future print/UA styles can key off it. A short-lived
  // .theme-fade class makes surfaces cross-fade instead of snapping — after
  // which per-element hover/active transitions work normally again.
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('theme-fade')
    root.classList.toggle('dark', theme === 'dark')
    root.classList.toggle('light', theme === 'light')
    const fadeTimer = window.setTimeout(() => root.classList.remove('theme-fade'), 300)
    try {
      window.localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Storage unavailable — theme just won't persist this session
    }
    return () => window.clearTimeout(fadeTimer)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
