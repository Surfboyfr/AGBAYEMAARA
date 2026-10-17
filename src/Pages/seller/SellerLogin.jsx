import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Package,
  Store,
  TrendingUp,
} from 'lucide-react'
import { signIn, apiFetch } from '../../lib/api'
import { useSeller } from '../../Context/SellerContext'
import { recordActivity } from '../../lib/activity'

// Selling points shown on the branded half of the split login screen.
const PERKS = [
  { icon: Package, title: 'Manage inventory', body: 'Search, filter and restock your catalog in one table.' },
  { icon: ClipboardList, title: 'Track every order', body: 'From pending to shipped — statuses at a glance.' },
  { icon: TrendingUp, title: 'Watch revenue grow', body: 'Headline numbers updated as your store moves.' },
]

const inputClass =
  'w-full rounded-lg border border-line bg-raised py-3 pl-10 pr-4 text-sm text-strong placeholder-faint transition-all duration-200 focus:border-line-strong focus:outline-none'

const SellerLogin = () => {
  const navigate = useNavigate()
  // The vendor-membership probe below doubles as the profile source: its
  // response is the signed-in seller's real record, seeded into the portal
  // so the dashboard greets them by name/business instead of the mock's.
  // refreshPortal() then pulls their real catalogue/orders/stats — the
  // provider's own mount hydration ran before this token existed.
  const { syncProfile, refreshPortal } = useSeller()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // ── REAL AUTHENTICATION ──────────────────────────────────────────────────
  // Signs in against the backend (POST /auth/login, token stored by the api
  // client), then probes GET /seller/profile: this portal is for vendors
  // only, so a non-vendor session (VENDOR_MEMBERSHIP_REQUIRED) is rejected
  // with the backend's own readable message instead of reaching the
  // dashboard. Route guards on /seller/* enforce the session on every load.
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setError('')
    setIsSubmitting(true)
    try {
      await signIn({ email, password })
      // Vendor-membership guard — and the real profile to seed the portal with.
      const remoteProfile = await apiFetch('/seller/profile')
      syncProfile(remoteProfile)
      // Hydrate the real catalogue/orders/stats in the background; the
      // dashboard's skeleton covers the gap.
      refreshPortal()
      // Tracked for /admin — only sessions that pass the vendor-membership
      // guard count as seller activity.
      recordActivity('seller', 'seller.login', `Seller signed in: ${email}`, '', { email })
      navigate('/seller/dashboard', { replace: true })
    } catch (err) {
      if (err?.code === 'VENDOR_MEMBERSHIP_REQUIRED') {
        // Backend message is already human-readable.
        setError(err.message)
      } else if (err?.status === 401 || err?.message === 'INVALID_LOGIN_CREDENTIALS') {
        setError('Email or password is incorrect.')
      } else if (err?.status === 0) {
        setError(err.message) // network — readable
      } else if (err?.message && !/^[A-Z0-9_]+$/.test(err.message)) {
        setError(err.message)
      } else {
        setError('Sign-in failed. Please try again.')
      }
      setIsSubmitting(false)
    }
  }

  return (
    <section className='min-h-screen w-full bg-surface text-strong lg:grid lg:grid-cols-2'>
      {/* Branded half — hidden on small screens */}
      <div className='relative hidden overflow-hidden border-r border-line bg-surface-alt lg:flex lg:flex-col lg:justify-between lg:p-10'>
        <div
          className='pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#ec5800]/20 blur-3xl'
          aria-hidden='true'
        />
        <div
          className='pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-[#ec5800]/10 blur-3xl'
          aria-hidden='true'
        />

        <Link to='/' className='relative text-xl font-bold tracking-wide text-strong'>
          Àgbáyémáarà
        </Link>

        <div className='relative max-w-md'>
          <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[#ec5800]'>
            Seller Center
          </p>
          <h1 className='mt-3 text-4xl font-black leading-tight tracking-tight text-strong'>
            Your storefront,
            <br />
            one dashboard away.
          </h1>
          <p className='mt-4 text-sm leading-relaxed text-muted'>
            Sign in to manage products, fulfil orders and keep your catalog
            sharp — all in one place.
          </p>

          <ul className='mt-8 space-y-4'>
            {PERKS.map(({ icon: Icon, title, body }) => (
              <li key={title} className='flex items-start gap-3.5'>
                <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ec5800]/10 text-[#ec5800]'>
                  <Icon size={18} aria-hidden='true' />
                </span>
                <div>
                  <p className='text-sm font-bold text-strong'>{title}</p>
                  <p className='mt-0.5 text-xs leading-relaxed text-muted'>{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className='relative text-xs text-faint'>
          © {new Date().getFullYear()} Àgbáyémáarà — seller portal preview
        </p>
      </div>

      {/* Form half */}
      <div className='flex min-h-screen flex-col px-5 py-8 sm:px-10'>
        <Link
          to='/'
          className='inline-flex w-fit items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-strong'
        >
          <ArrowLeft size={15} />
          Back to store
        </Link>

        <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10'>
          <div className='lg:hidden'>
            <p className='text-lg font-bold tracking-wide text-[#ec5800]'>
              Àgbáyémáarà
            </p>
          </div>

          <h2 className='mt-6 text-2xl font-bold tracking-tight text-strong lg:mt-0'>
            Welcome back
          </h2>
          <p className='mt-1.5 text-sm text-muted'>
            Sign in to your seller account to continue.
          </p>

          <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
            <div className='group'>
              <label
                htmlFor='seller-email'
                className='mb-2 block text-xs font-semibold uppercase tracking-wider text-muted'
              >
                Email
              </label>
              <div className='relative'>
                <Mail
                  size={15}
                  className='absolute left-3.5 top-1/2 -translate-y-1/2 text-faint transition-colors group-focus-within:text-muted'
                  aria-hidden='true'
                />
                <input
                  id='seller-email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='seller@example.com'
                  required
                  autoComplete='email'
                  className={inputClass}
                />
              </div>
            </div>

            <div className='group'>
              <label
                htmlFor='seller-password'
                className='mb-2 block text-xs font-semibold uppercase tracking-wider text-muted'
              >
                Password
              </label>
              <div className='relative'>
                <Lock
                  size={15}
                  className='absolute left-3.5 top-1/2 -translate-y-1/2 text-faint transition-colors group-focus-within:text-muted'
                  aria-hidden='true'
                />
                <input
                  id='seller-password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  required
                  autoComplete='current-password'
                  className={`${inputClass} pr-11`}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((v) => !v)}
                  className='absolute right-3.5 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-muted'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className='text-right'>
              <button
                type='button'
                className='text-xs font-medium text-muted transition-colors hover:text-[#ec5800]'
                title='Password reset ships with the backend'
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p role='alert' className='text-xs font-semibold text-red-400'>
                {error}
              </p>
            )}

            <button
              type='submit'
              disabled={isSubmitting}
              className='group flex w-full items-center justify-center gap-2 rounded-xl bg-[#ec5800] py-3.5 text-sm font-bold tracking-wide text-white transition-all duration-200 hover:bg-[#d04f00] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70'
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className='animate-spin' aria-hidden='true' />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    size={15}
                    className='transition-transform duration-200 group-hover:translate-x-1'
                    aria-hidden='true'
                  />
                </>
              )}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-muted'>
            Want to sell on Àgbáyémáarà?{' '}
            <Link
              to='/seller/register'
              className='font-semibold text-[#ec5800] transition-colors hover:text-[#ff7a33] hover:underline'
            >
              Become a seller
            </Link>
          </p>

          <p className='mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-faint'>
            <Store size={13} aria-hidden='true' />
            Secure sign-in — sessions are verified by the Àgbáyémáarà API.
          </p>
        </div>
      </div>
    </section>
  )
}

export default SellerLogin
