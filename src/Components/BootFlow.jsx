import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ShoppingBag, Store } from 'lucide-react'
import { useLanguage } from '../Context/LanguageContext'

// Chosen role is stored for future brand-owner tooling. There is deliberately
// no "already booted" skip flag: the splash + role gate run on EVERY page load
// (first visit, refresh, or a brand-new session after the tab was closed).
const ROLE_KEY = 'agbayemaara.role'

// "About three seconds" of brand splash before the role gate appears.
const SPLASH_MS = 2800

// ── Boot experience (always on) ───────────────────────────────────────────────
// Wraps the whole app. On every load nothing behind it is mounted: a black
// splash with the wordmark and a spinner shows for ~3s, then a gate asks
// whether the visitor is a shopper or a brand owner. Shoppers continue to
// wherever they were headed (the landing/discovery surface by default); brand
// owners are routed to the brand hub.
const BootFlow = ({ children }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [phase, setPhase] = useState('splash')

  // Splash → gate after the brand beat. The app only mounts at 'app'.
  useEffect(() => {
    if (phase !== 'splash') return undefined
    const timer = setTimeout(() => setPhase('gate'), SPLASH_MS)
    return () => clearTimeout(timer)
  }, [phase])

  const chooseRole = (role) => {
    try {
      localStorage.setItem(ROLE_KEY, role)
    } catch {
      // Storage can be unavailable (private mode) — role choice still applies
      // for this visit.
    }
    if (role === 'brand') {
      navigate('/brand-owner', { replace: true })
    }
    setPhase('app')
  }

  if (phase === 'splash') {
    return (
      <div
        data-boot='splash'
        role='status'
        aria-live='polite'
        className='boot-splash fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-black text-white'
      >
        <div className='animate-pop-in text-center'>
          <h1 className='text-4xl font-bold tracking-wide sm:text-5xl'>
            Àgbáyémáarà
          </h1>
          <p className='mt-3 text-sm text-white/60'>
            {t('boot', 'splashTagline')}
          </p>
        </div>
        <Loader2
          size={28}
          aria-hidden='true'
          className='animate-spin text-[#ec5800]'
        />
      </div>
    )
  }

  if (phase === 'gate') {
    return (
      <div
        data-boot='gate'
        className='fixed inset-0 z-[100] flex items-center justify-center bg-surface px-5 text-strong'
      >
        <div className='animate-pop-in w-full max-w-md rounded-3xl border border-line bg-raised p-8 text-center shadow-card'>
          <p className='text-lg font-bold tracking-wide text-[#ec5800]'>
            Àgbáyémáarà
          </p>
          <h2 className='mt-4 text-2xl font-bold tracking-tight'>
            {t('boot', 'gateTitle')}
          </h2>
          <p className='mt-2 text-sm text-muted'>
            {t('boot', 'gateSubtitle')}
          </p>

          <div className='mt-7 space-y-3'>
            {/* Primary flow — shoppers go straight into the platform */}
            <button
              onClick={() => chooseRole('shopper')}
              className='group flex w-full items-center gap-4 rounded-2xl bg-[#ec5800] p-4 text-left text-white transition-all duration-200 hover:bg-[#d04f00] active:scale-[0.98]'
            >
              <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/15'>
                <ShoppingBag size={20} />
              </span>
              <span>
                <span className='block text-sm font-bold'>
                  {t('boot', 'shopperCta')}
                </span>
                <span className='block text-xs text-white/80'>
                  {t('boot', 'shopperDesc')}
                </span>
              </span>
            </button>

            {/* Brand owners are routed to the dedicated brand hub */}
            <button
              onClick={() => chooseRole('brand')}
              className='flex w-full items-center gap-4 rounded-2xl border border-line-strong p-4 text-left transition-all duration-200 hover:bg-raised-strong active:scale-[0.98]'
            >
              <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ec5800]/15 text-[#ec5800]'>
                <Store size={20} />
              </span>
              <span>
                <span className='block text-sm font-bold'>
                  {t('boot', 'brandCta')}
                </span>
                <span className='block text-xs text-muted'>
                  {t('boot', 'brandDesc')}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default BootFlow
