import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Store } from 'lucide-react'
import { useLanguage } from '../Context/LanguageContext'
import { useSession } from '../lib/session'
import AuthModal from './AuthModal'

// Navbar for the Welcome boot screen. Deliberately minimal — wordmark plus
// the two auth actions: Log in opens the AuthModal in sign-in mode, Sign up
// in sign-up mode, and Become a seller links to the vendor registration page
// (/seller/register).
const WelcomeNavBar = () => {
  const { t } = useLanguage()
  // A returning signed-in session (profile + token, see lib/session.js) sees
  // a greeting + Log out instead of the two auth actions.
  const { user, isLoggedIn, logout } = useSession()
  const firstName = (user?.name || user?.email || '').trim().split(/\s+/)[0]
  // AuthModal stays mounted (like every other navbar) — `mode` only applies
  // when it opens, so each button launches the right form.
  const [auth, setAuth] = useState({ open: false, mode: 'signin' })

  const openAuth = (mode) => setAuth({ open: true, mode })

  return (
    <>
      <nav className='sticky top-0 z-30 w-full border-b border-neutral-200/80 bg-white/85 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)] backdrop-blur-md supports-backdrop-filter:bg-white/70'>
        <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-5'>
          <Link
            to='/'
            className='text-xl font-bold tracking-wide text-neutral-900 transition-colors hover:text-[#ec5800]'
          >
            Àgbáyémáarà
          </Link>

          <div className='flex items-center gap-2 sm:gap-3'>
            <Link
              to='/seller/register'
              className='hidden sm:inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold tracking-wide text-neutral-800 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 hover:text-[#ec5800] active:scale-95'
            >
              <Store size={14} className='text-[#ec5800]' />
              <span>Become a seller</span>
            </Link>

            {isLoggedIn ? (
              <div className='flex items-center gap-2 sm:gap-3'>
                {firstName && (
                  <span className='hidden max-w-40 truncate text-sm font-bold text-neutral-800 sm:block'>
                    Hi, {firstName}
                  </span>
                )}
                <button
                  onClick={logout}
                  className='rounded-full border border-neutral-300 px-4 py-2 text-sm font-bold tracking-wide text-neutral-800 transition-all duration-200 hover:bg-neutral-100 active:scale-95'
                >
                  {t('auth', 'logOut')}
                </button>
              </div>
            ) : (
              <div className='flex items-center gap-2 sm:gap-3'>
                <button
                  onClick={() => openAuth('signin')}
                  className='rounded-full border border-neutral-300 px-4 py-2 text-sm font-bold tracking-wide text-neutral-800 transition-all duration-200 hover:bg-neutral-100 active:scale-95'
                >
                  {t('welcome', 'login')}
                </button>

                <button
                  onClick={() => openAuth('signup')}
                  className='rounded-full bg-neutral-900 px-5 py-2 text-sm font-bold tracking-wide text-white transition-all duration-200 hover:bg-neutral-800 active:scale-95'
                >
                  {t('welcome', 'signUp')}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={auth.open}
        mode={auth.mode}
        onModeChange={(mode) => setAuth((prev) => ({ ...prev, mode }))}
        onClose={() => setAuth((prev) => ({ ...prev, open: false }))}
      />
    </>
  )
}

export default WelcomeNavBar
