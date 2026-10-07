import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react'
import { useLanguage } from '../Context/LanguageContext'
import { hasStoredCurrency } from '../Context/CurrencyContext'
import { useCurrency } from '../Context/CurrencyContext'
import Welcome from '../Pages/Welcome'

// Mock sign-up profile + last chosen role are stored for future brand-owner
// tooling. The splash runs on EVERY page load (first visit, refresh, or a
// brand-new session after the tab was closed). The sign-up step, however, is
// a first-visit requirement: a stored profile (from a completed sign-up)
// lets returning visitors pass straight through to the app.
const ROLE_KEY = 'agbayemaara.role'
const USER_KEY = 'agbayemaara.user'

// "About three seconds" of brand splash before the boot flow continues.
const SPLASH_MS = 2800

// Mock password rule — mirrors the AuthModal hint ("Min. 8 characters").
const MIN_PASSWORD_LENGTH = 8

// A stored profile means the visitor has completed sign-up before — on this
// load they pass straight through the gate without seeing the form again.
const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  } catch {
    return null
  }
}

// The shopper/brand-owner choice screen no longer exists — the stored choice
// (if any) still decides the path, so returning brand owners land on the
// brand hub; everyone else boots straight into the shopper experience.
const readStoredRole = () => {
  try {
    const stored = localStorage.getItem(ROLE_KEY)
    if (stored === 'brand' || stored === 'shopper') return stored
    if (readStoredUser()?.role === 'brand') return 'brand'
  } catch {
    // Storage can be unavailable (private mode) — default to shopper.
  }
  return 'shopper'
}

// ── Boot experience (always on) ───────────────────────────────────────────────
// Wraps the whole app and owns the order of the entry experience:
//   loading splash (~3s) → Welcome page → Get Started → boot steps → app.
// The Welcome page shows on EVERY visit (first-timers and returning visitors
// alike) — it is the page that follows the loading screen. "Get Started" is
// what runs the steps behind it: the currency pick (once — the choice is
// stored) and, for first-time visitors, a sign-up step (name, email,
// password). A returning visitor with a stored profile passes straight
// through — shoppers to the discovery feed, brand owners to the brand hub.
const BootFlow = ({ children }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { setCurrency, currencies } = useCurrency()
  const [phase, setPhase] = useState('splash')
  const [role] = useState(readStoredRole)
  // A stored profile means this visitor has already signed up once — they
  // skip the sign-up form and pass straight through.
  const [hasSignedUp, setHasSignedUp] = useState(() => readStoredUser() !== null)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '' })

  // Splash → the Welcome page, once the brand beat is over. Nothing behind
  // the splash is mounted: the Welcome page IS the next page after the
  // loading screen, on every visit.
  useEffect(() => {
    if (phase !== 'splash') return undefined
    const timer = setTimeout(() => setPhase('welcome'), SPLASH_MS)
    return () => clearTimeout(timer)
  }, [phase])

  // Get Started — hand the visitor from the Welcome page into the boot steps:
  // the shopper currency pick if no choice is stored yet (CurrencyProvider
  // persists the default on mount, so this never blocks later visits), then
  // the sign-up form for first-timers, everyone else straight through —
  // shoppers to the discovery feed, brand owners to the brand hub.
  const handleGetStarted = () => {
    if (role === 'shopper' && !hasStoredCurrency()) {
      setPhase('currency')
      return
    }
    if (!hasSignedUp) {
      setError('')
      setPhase('signup')
      return
    }
    if (role === 'brand') {
      navigate('/brand-owner', { replace: true })
    }
    setPhase('app')
  }

  // Currency step confirmation: store the selection (CurrencyContext also
  // persists it) and continue into sign-up or straight into the app.
  const confirmCurrency = (code) => {
    setCurrency(code)
    if (!hasSignedUp) {
      setError('')
      setPhase('signup')
      return
    }
    if (role === 'brand') {
      navigate('/brand-owner', { replace: true })
    }
    setPhase('app')
  }

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  // Mock sign-up: validate the collected fields, store the profile locally,
  // then let the visitor through. Swap this for the real auth call when the
  // backend lands.
  const handleSignUp = (event) => {
    event.preventDefault()
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      password.length < MIN_PASSWORD_LENGTH
    ) {
      setError(t('boot', 'signUpError'))
      return
    }
    try {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify({
          role,
          name: form.name.trim(),
          email: form.email.trim(),
        })
      )
    } catch {
      // Storage can be unavailable — the visit continues without a stored
      // profile.
    }
    if (role === 'brand') {
      navigate('/brand-owner', { replace: true })
    }
    setHasSignedUp(true)
    setPhase('app')
  }

  if (phase === 'splash') {
    return (
      <div
        data-boot='splash'
        role='status'
        aria-live='polite'
        className='boot-splash fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-white text-black'
      >
        <div className='animate-pop-in text-center'>
          <h1 className='text-4xl font-bold tracking-wide sm:text-5xl'>
            Àgbáyémáarà
          </h1>
          <p className='mt-3 text-sm text-black/60'>
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

  // The page after the loading screen: Welcome, rendered alone (the app
  // behind it mounts only once Get Started has run the steps below).
  if (phase === 'welcome') {
    return <Welcome onGetStarted={handleGetStarted} />
  }

  if (phase === 'currency') {
    return (
      <div
        data-boot='currency'
        className='light fixed inset-0 z-[100] flex items-center justify-center bg-white px-5 text-strong'
      >
        <div className='animate-pop-in w-full max-w-md rounded-3xl border border-line bg-raised p-8 text-center shadow-card'>
          <p className='text-lg font-bold tracking-wide text-[#ec5800]'>
            Àgbáyémáarà
          </p>
          <h2 className='mt-4 text-2xl font-bold tracking-tight'>
            {t('boot', 'currencyTitle')}
          </h2>
          <p className='mt-2 text-sm text-muted'>
            {t('boot', 'currencySubtitle')}
          </p>

          <div className='mt-7 space-y-3'>
            {currencies.map((option) => (
              <button
                key={option.code}
                onClick={() => confirmCurrency(option.code)}
                className='group flex w-full items-center gap-4 rounded-2xl border border-line-strong p-4 text-left transition-all duration-200 hover:bg-raised-strong active:scale-[0.98]'
              >
                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ec5800]/15 text-lg font-bold text-[#ec5800]'>
                  {option.symbol}
                </span>
                <span>
                  <span className='block text-sm font-bold'>
                    {option.code} — {option.label}
                  </span>
                  <span className='block text-xs text-muted'>
                    {t('boot', 'currencyPricesIn')} {option.code}
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  aria-hidden='true'
                  className='ml-auto text-faint transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#ec5800]'
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'signup') {
    return (
      <div
        data-boot='signup'
        className='fixed inset-0 z-[100] flex items-center justify-center bg-surface px-5 text-strong'
      >
        <div className='animate-pop-in w-full max-w-md rounded-3xl border border-line bg-raised p-8 shadow-card'>
          <p className='text-lg font-bold tracking-wide text-[#ec5800]'>
            Àgbáyémáarà
          </p>
          <h2 className='mt-4 text-2xl font-bold tracking-tight'>
            {role === 'brand'
              ? t('boot', 'signUpBrandTitle')
              : t('boot', 'signUpTitle')}
          </h2>
          <p className='mt-2 text-sm text-muted'>
            {t('boot', 'signUpSubtitle')}
          </p>

          <form onSubmit={handleSignUp} className='mt-7 space-y-4'>
            <div>
              <label
                htmlFor='boot-name'
                className='mb-2 block text-xs font-semibold uppercase tracking-wider text-muted'
              >
                {t('boot', 'signUpName')}
              </label>
              <div className='relative'>
                <User
                  size={15}
                  aria-hidden='true'
                  className='absolute left-3.5 top-1/2 -translate-y-1/2 text-faint'
                />
                <input
                  id='boot-name'
                  type='text'
                  value={form.name}
                  onChange={updateField('name')}
                  placeholder={t('boot', 'signUpNamePlaceholder')}
                  autoComplete='name'
                  autoFocus
                  className='w-full rounded-lg border border-line bg-raised-strong py-3 pl-10 pr-4 text-sm text-strong placeholder-faint transition-colors focus:border-line-strong focus:outline-none'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='boot-email'
                className='mb-2 block text-xs font-semibold uppercase tracking-wider text-muted'
              >
                {t('boot', 'signUpEmail')}
              </label>
              <div className='relative'>
                <Mail
                  size={15}
                  aria-hidden='true'
                  className='absolute left-3.5 top-1/2 -translate-y-1/2 text-faint'
                />
                <input
                  id='boot-email'
                  type='email'
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder={t('boot', 'signUpEmailPlaceholder')}
                  autoComplete='email'
                  className='w-full rounded-lg border border-line bg-raised-strong py-3 pl-10 pr-4 text-sm text-strong placeholder-faint transition-colors focus:border-line-strong focus:outline-none'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='boot-password'
                className='mb-2 block text-xs font-semibold uppercase tracking-wider text-muted'
              >
                {t('boot', 'signUpPassword')}
              </label>
              <div className='relative'>
                <Lock
                  size={15}
                  aria-hidden='true'
                  className='absolute left-3.5 top-1/2 -translate-y-1/2 text-faint'
                />
                <input
                  id='boot-password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t('boot', 'signUpPasswordPlaceholder')}
                  autoComplete='new-password'
                  className='w-full rounded-lg border border-line bg-raised-strong py-3 pl-10 pr-11 text-sm text-strong placeholder-faint transition-colors focus:border-line-strong focus:outline-none'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={t('boot', 'signUpTogglePassword')}
                  className='absolute right-3.5 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-muted'
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p role='alert' className='text-xs font-semibold text-red-400'>
                {error}
              </p>
            )}

            <button
              type='submit'
              className='group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ec5800] py-3.5 text-sm font-bold tracking-wide text-white transition-all duration-200 hover:bg-[#d04f00] active:scale-[0.98]'
            >
              {t('boot', 'signUpContinue')}
              <ArrowRight
                size={15}
                aria-hidden='true'
                className='transition-transform duration-200 group-hover:translate-x-1'
              />
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default BootFlow
