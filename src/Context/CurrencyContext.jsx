import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CurrencyContext = createContext(null)

// ── Shop currency ─────────────────────────────────────────────────────────────
// Base amounts across the catalogue (products, cart lines, stored orders) are
// authored in USD. Every price display site converts through `formatPrice`, so
// switching the currency re-prices the whole site instantly. Rates are mock
// placeholders until a rates API lands — swap `rate` for live values then.
export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar', rate: 1 },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira', rate: 1650 },
  { code: 'GBP', symbol: '£', label: 'British Pound', rate: 0.79 },
  { code: 'EUR', symbol: '€', label: 'Euro', rate: 0.92 },
]

const CURRENCY_KEY = 'agbayemaara.currency'

const readStoredCode = () => {
  try {
    const stored = window.localStorage.getItem(CURRENCY_KEY)
    return CURRENCIES.some((c) => c.code === stored) ? stored : null
  } catch {
    return null
  }
}

// Shared with the boot flow: shoppers with a stored currency skip the currency
// onboarding step on later visits.
export const hasStoredCurrency = () => {
  try {
    return window.localStorage.getItem(CURRENCY_KEY) !== null
  } catch {
    return false
  }
}

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => readStoredCode() ?? 'USD')

  // Persist the choice so the onboarding step only ever shows once and the
  // selection survives refreshes.
  useEffect(() => {
    try {
      window.localStorage.setItem(CURRENCY_KEY, currency)
    } catch {
      // Storage unavailable — the choice just won't persist this session
    }
  }, [currency])

  const value = useMemo(() => {
    const meta = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]
    const metaFor = (code) => CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]

    // en-US grouping keeps prices stable across locales ("₦148,483.50").
    const formatAmount = (amount, currencyMeta) =>
      `${currencyMeta.symbol}${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`

    const convertPrice = (base) => base * meta.rate
    // Catalogue/cart prices: convert base USD → the selected currency.
    const formatPrice = (base) => formatAmount(convertPrice(base), meta)
    // Amounts already denominated in `code` — stored orders keep their
    // purchase-time currency, and legacy orders (no code) fall back to USD.
    const formatPriceWithCode = (amount, code) => formatAmount(amount, metaFor(code))

    return {
      currency: meta.code,
      setCurrency,
      currencies: CURRENCIES,
      convertPrice,
      formatPrice,
      formatPriceWithCode,
    }
  }, [currency])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
