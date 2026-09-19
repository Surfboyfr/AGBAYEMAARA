import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { User, ShoppingBag } from 'lucide-react'
import { useCart } from '../../Context/CartContext'
import { useLanguage } from '../../Context/LanguageContext'
import LanguageSwitcher from '../LanguageSwitcher'
import ThemeToggle from '../ThemeToggle'
import AuthModal from '../AuthModal'

// Shared discovery-area navbar (per the hi-fi mock: logo + links + SIGN IN).
// Used by the Discovery Feed and the Following Feed pages.
// Links follow the seven-surface IA: Discover, Following, Brands + Cart /
// Sign in actions — Shop and About were dropped from the primary set.
const DiscoveryNavbar = () => {
  const { t } = useLanguage()
  const { cartCount, setIsCartOpen } = useCart()
  const [authOpen, setAuthOpen] = useState(false)

  const navLinks = [
    { label: t('nav', 'discover'), to: '/', end: true },
    { label: t('nav', 'following'), to: '/following' },
    { label: t('nav', 'brands'), to: '/brands' },
  ]

  // Active surface: persistent orange underline + full-white label.
  const linkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-[#ec5800] after:transition-all after:duration-300 ${
      isActive
        ? 'text-strong after:w-full'
        : 'text-muted hover:text-strong after:w-0 hover:after:w-full'
    }`

  return (
    <>
      {/* Glass bar: blur + soft shadow instead of a hard outline */}
      <nav className='sticky top-0 z-30 w-full border-b border-transparent bg-surface/85 shadow-nav backdrop-blur-md supports-[backdrop-filter]:bg-surface/70'>
        <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-5'>
          <Link
            to='/'
            className='text-xl font-bold tracking-wide text-strong transition-colors hover:text-strong'
          >
            Àgbáyémáarà
          </Link>

          <div className='hidden items-center gap-8 md:flex'>
            {navLinks.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={linkClass}
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className='flex items-center gap-2'>
            <ThemeToggle className='text-muted' />

            <LanguageSwitcher
              buttonClassName='flex items-center gap-1 rounded-lg bg-raised px-2.5 py-2 text-sm text-muted transition-colors hover:bg-raised-strong hover:text-strong'
              dropdownWidth='w-32'
            />

            {/* Cart — opens the app-wide drawer (badge like the shop navbar) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className='relative rounded-lg p-2 text-muted transition-all hover:bg-raised-strong hover:text-strong'
              aria-label={t('auth', 'openCart')}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className='absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold leading-none text-white ring-2 ring-surface'>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setAuthOpen(true)}
              className='hidden rounded-full bg-strong px-5 py-2 text-sm font-bold tracking-wide text-surface transition-all duration-200 hover:bg-strong/90 active:scale-95 md:block'
            >
              {t('auth', 'signInAction')}
            </button>
            <button
              onClick={() => setAuthOpen(true)}
              className='rounded-lg p-2 text-muted transition-all hover:bg-raised-strong hover:text-strong md:hidden'
              aria-label={t('auth', 'signInAction')}
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </nav>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}

export default DiscoveryNavbar
