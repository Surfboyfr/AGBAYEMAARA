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
  MapPin,
  Package,
  Phone,
  Store,
  TrendingUp,
  User,
} from 'lucide-react'
import { apiFetch, getToken, signOut } from '../../lib/api'
import { useSession } from '../../lib/session'
import { useSeller } from '../../Context/SellerContext'
import { recordRegistration } from '../../lib/activity'

// Selling points shown on the branded half of the split registration screen.
const PERKS = [
  { icon: Store, title: 'Open your storefront', body: 'Register your business once and your vendor profile goes live.' },
  { icon: ClipboardList, title: 'Track every order', body: 'From pending to shipped — statuses at a glance.' },
  { icon: TrendingUp, title: 'Watch revenue grow', body: 'Headline numbers updated as your store moves.' },
]

const inputClass =
  'w-full rounded-lg border border-line bg-raised py-3 pl-10 pr-4 text-sm text-strong placeholder-faint transition-all duration-200 focus:border-line-strong focus:outline-none'

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

// Turns an ApiError into something a person can act on; backend messages are
// readable, codes like INVALID_LOGIN_CREDENTIALS are not.
const readable = (err, fallback) => {
  if (err?.status === 0) return err.message // network — already readable
  if (err?.message && !/^[A-Z0-9_]+$/.test(err.message)) return err.message
  return fallback
}

// 409 / ALREADY_EXISTS-style answers from POST /seller/register mean the
// session is already onboarded as a vendor — take it straight to the portal.
const isAlreadyVendor = (err) =>
  err?.status === 409 ||
  /ALREADY|EXISTS|DUPLICATE/i.test(err?.code ?? '') ||
  /already (registered|exists|onboarded)|duplicate/i.test(err?.message ?? '')

// Label + icon wrapper reused by every left-padded input on the form.
const Field = ({ id, label, icon: Icon, children }) => (
  <div className='group'>
    <label
      htmlFor={id}
      className='mb-2 block text-xs font-semibold uppercase tracking-wider text-muted'
    >
      {label}
    </label>
    <div className='relative'>
      <Icon
        size={15}
        className='absolute left-3.5 top-1/2 -translate-y-1/2 text-faint transition-colors group-focus-within:text-muted'
        aria-hidden='true'
      />
      {children}
    </div>
  </div>
)

const sectionTitle = 'text-xs font-bold uppercase tracking-[0.2em] text-[#ec5800]'

const SellerRegister = () => {
  const navigate = useNavigate()
  const { user, signup } = useSession()
  // Seeding the portal profile with the details collected below so the
  // dashboard greets this seller by name/business instead of the mock's.
  // refreshPortal() then pulls their real catalogue/orders/stats — for a
  // brand-new vendor that is an empty catalogue, which is the truth.
  const { syncProfile, refreshPortal } = useSeller()
  // A stored session token skips the account step — the backend needs a
  // Bearer token for POST /seller/register, and we already have one.
  const [hasAccount, setHasAccount] = useState(() => Boolean(getToken()))

  // Account details (only used when there is no session yet).
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Business details — what POST /seller/register onboard with.
  const [businessName, setBusinessName] = useState('')
  const [contactInput, setContactInput] = useState(user?.email ?? '')
  const [contactTouched, setContactTouched] = useState(Boolean(user?.email))
  const [contactPhone, setContactPhone] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // The contact email follows the account email until it is edited by hand.
  const contactEmail = contactTouched
    ? contactInput
    : hasAccount
      ? user?.email ?? ''
      : email.trim()

  const useDifferentAccount = () => {
    signOut()
    setHasAccount(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setError('')

    // ── Validation ────────────────────────────────────────────────────────
    if (!hasAccount) {
      if (name.trim().length < 2) return setError('Enter your full name.')
      if (!isEmail(email)) return setError('Enter a valid email address.')
      if (password.length < 8) return setError('Password must be at least 8 characters.')
    }
    if (businessName.trim().length < 2) return setError('Enter your business name.')
    if (!isEmail(contactEmail)) return setError('Enter a valid contact email.')
    if (!contactPhone.trim()) return setError('Enter a phone number shoppers can reach.')
    if (!location.trim()) return setError('Enter where your business is based.')
    if (description.trim().length < 10)
      return setError('Tell shoppers what you sell — at least 10 characters.')

    setIsSubmitting(true)

    // ── 1. Make sure we hold a token (POST /auth/register, login fallback) ─
    // session.signup also persists the user profile (agbayemaara.user) next
    // to the token, so the rest of the app knows who is signed in.
    if (!hasAccount) {
      try {
        await signup({
          name: name.trim(),
          email: email.trim(),
          password,
          phoneNumber: contactPhone.trim(),
        })
        setHasAccount(true)
      } catch (err) {
        if (err?.status === 401 || err?.message === 'INVALID_LOGIN_CREDENTIALS') {
          setError(
            'That email is already registered with a different password — try your existing password.',
          )
        } else {
          setError(readable(err, 'Could not create your account. Please try again.'))
        }
        setIsSubmitting(false)
        return
      }
    }

    // ── 2. Onboard the session as a vendor (POST /seller/register) ────────
    try {
      await apiFetch('/seller/register', {
        method: 'POST',
        body: {
          businessName: businessName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          location: location.trim(),
          description: description.trim(),
        },
      })
      // Tracked for /admin — the vendor list records every onboarding. The
      // "already a vendor" fallback below deliberately skips this so a repeat
      // visit never counts as a new vendor.
      recordRegistration('vendor', {
        name: businessName.trim(),
        email: contactEmail.trim(),
        detail: `${location.trim()} · ${contactPhone.trim()}`,
        meta: { location: location.trim(), phone: contactPhone.trim() },
      })
      // Put the signup details straight into the portal profile — the
      // dashboard, header chip and profile page all render from it.
      syncProfile({
        ownerName: name.trim() || user?.name || '',
        businessName: businessName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        location: location.trim(),
        description: description.trim(),
      })
      // Hydrate the rest from the backend (empty catalogue/stats for a new
      // vendor) — runs in the background, the dashboard skeleton covers it.
      refreshPortal()
      navigate('/seller/dashboard', { replace: true })
    } catch (err) {
      if (isAlreadyVendor(err)) {
        // Already onboarded — the session is valid, straight to the portal.
        navigate('/seller/dashboard', { replace: true })
        return
      }
      if (err?.status === 401) {
        // Expired token — fall back to the account step so it can be renewed.
        signOut()
        setHasAccount(false)
        setError('Your session expired — re-enter your account details to continue.')
      } else {
        setError(readable(err, 'Registration failed. Please try again.'))
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

        <div className='relative max-w-md border border-line bg-raised p-8'>
          <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[#ec5800]'>
            Seller Center
          </p>
          <h1 className='mt-3 text-4xl font-black leading-tight tracking-tight text-strong'>
            Open your shop
            <br />
            to the world.
          </h1>
          <p className='mt-4 text-sm leading-relaxed text-muted'>
            Register your business once and start selling to shoppers across the
            marketplace — your storefront, one dashboard away.
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
            Become a seller
          </h2>
          <p className='mt-1.5 text-sm text-muted'>
            Register your business and open your storefront in a minute.
          </p>

          <form onSubmit={handleSubmit} className='mt-6 space-y-5'>
            {/* Existing session — no account fields needed */}
            {hasAccount && (
              <div className='flex items-center justify-between gap-3 rounded-xl border border-line bg-raised px-4 py-3'>
                <p className='text-xs text-muted'>
                  Continuing as{' '}
                  <span className='font-bold text-strong'>
                    {user?.email || 'your saved account'}
                  </span>
                </p>
                <button
                  type='button'
                  onClick={useDifferentAccount}
                  className='shrink-0 text-xs font-semibold text-[#ec5800] transition-colors hover:text-[#ff7a33] hover:underline'
                >
                  Use another account
                </button>
              </div>
            )}

            {/* ── Account ──────────────────────────────────────────────── */}
            {!hasAccount && (
              <div className='space-y-4'>
                <p className={sectionTitle}>Your account</p>

                <Field id='seller-name' label='Full name' icon={User}>
                  <input
                    id='seller-name'
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Adaeze Okafor'
                    required
                    autoComplete='name'
                    className={inputClass}
                  />
                </Field>

                <Field id='seller-email' label='Email' icon={Mail}>
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
                </Field>

                <Field id='seller-password' label='Password' icon={Lock}>
                  <input
                    id='seller-password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Min. 8 characters'
                    required
                    autoComplete='new-password'
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
                </Field>
              </div>
            )}

            {/* ── Business ─────────────────────────────────────────────── */}
            <div className='space-y-4'>
              <p className={sectionTitle}>About your business</p>

              <Field id='seller-business' label='Business name' icon={Store}>
                <input
                  id='seller-business'
                  type='text'
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder='Omolúàbí Atelier'
                  required
                  autoComplete='organization'
                  className={inputClass}
                />
              </Field>

              <Field id='seller-contact-email' label='Contact email' icon={Mail}>
                <input
                  id='seller-contact-email'
                  type='email'
                  value={contactEmail}
                  onChange={(e) => {
                    setContactInput(e.target.value)
                    setContactTouched(true)
                  }}
                  placeholder='hello@yourbrand.com'
                  required
                  autoComplete='email'
                  className={inputClass}
                />
              </Field>

              <Field id='seller-phone' label='Contact phone' icon={Phone}>
                <input
                  id='seller-phone'
                  type='tel'
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder='+234 802 345 6789'
                  required
                  autoComplete='tel'
                  className={inputClass}
                />
              </Field>

              <Field id='seller-location' label='Location' icon={MapPin}>
                <input
                  id='seller-location'
                  type='text'
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder='Lagos, Nigeria'
                  required
                  autoComplete='address-level2'
                  className={inputClass}
                />
              </Field>

              <div className='group'>
                <label
                  htmlFor='seller-description'
                  className='mb-2 block text-xs font-semibold uppercase tracking-wider text-muted'
                >
                  What do you sell?
                </label>
                <textarea
                  id='seller-description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                  required
                  placeholder='Contemporary Yoruba silhouettes and ancestral textile design.'
                  className='w-full resize-y rounded-lg border border-line bg-raised px-4 py-3 text-sm text-strong placeholder-faint transition-all duration-200 focus:border-line-strong focus:outline-none'
                />
                <p className='mt-1.5 text-right text-[11px] text-faint'>
                  {description.length}/500
                </p>
              </div>
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
                  Creating your shop…
                </>
              ) : (
                <>
                  Create seller account
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
            Already selling with us?{' '}
            <Link
              to='/seller/login'
              className='font-semibold text-[#ec5800] transition-colors hover:text-[#ff7a33] hover:underline'
            >
              Sign in
            </Link>
          </p>

          <p className='mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-faint'>
            <Package size={13} aria-hidden='true' />
            Secure onboarding — vendor profiles are created by the Àgbáyémáarà API.
          </p>
        </div>
      </div>
    </section>
  )
}

export default SellerRegister
