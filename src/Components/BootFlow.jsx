import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react'
import { useLanguage } from '../Context/LanguageContext'

// Chosen role + mock sign-up profile are stored for future brand-owner
// tooling. There is deliberately no "already booted" skip flag: the splash +
// role gate + sign-up run on EVERY page load (first visit, refresh, or a
// brand-new session after the tab was closed).
const ROLE_KEY = 'agbayemaara.role'
const USER_KEY = 'agbayemaara.user'

// "About three seconds" of brand splash before the role gate appears.
const SPLASH_MS = 2800

// Mock password rule — mirrors the AuthModal hint ("Min. 8 characters").
const MIN_PASSWORD_LENGTH = 8

// ── Boot experience (always on) ───────────────────────────────────────────────
// Wraps the whole app. On every load nothing behind it is mounted: a black
// splash with the wordmark and a spinner shows for ~3s, then a gate asks
// whether the visitor is a shopper or a brand owner. Either choice leads to a
// sign-up step (name, email, password) that must be completed before the app
// mounts: shoppers continue to the discovery feed; brand owners are routed to
// the brand hub.
const BootFlow = ({ children }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [phase, setPhase] = useState('splash')
  const [role, setRole] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '' })

  // Splash → gate after the brand beat. The app only mounts at 'app'.
  useEffect(() => {
    if (phase !== 'splash') return undefined
    const timer = setTimeout(() => setPhase('gate'), SPLASH_MS)
    return () => clearTimeout(timer)
  }, [phase])

  const chooseRole = (nextRole) => {
    try {
      localStorage.setItem(ROLE_KEY, nextRole)
    } catch {
      // Storage can be unavailable (private mode) — role choice still applies
      // for this visit.
    }
    setRole(nextRole)
    setError('')
    setPhase('signup')
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
            {/* Primary flow — shoppers sign up, then enter the platform */}
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

            {/* Brand owners sign up, then land in the dedicated brand hub */}
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
