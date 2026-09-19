import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { User, ShoppingBag, Menu, X, Package } from 'lucide-react'
import { useCart } from '../Context/CartContext'
import { useLanguage } from '../Context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import AuthModal from './AuthModal'

const ShopNavbar = () => {
  const { cartCount, setIsCartOpen } = useCart()
  const { t, language, setLanguage, languages } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Seven-surface IA: Discover, Following, Brands + Cart / Sign in actions.
  // Shop stays reachable through Discover (product grid below the fold) and
  // orders through the package icon.
  const navLinks = [
    { label: t('nav', 'discover'), to: '/', end: true },
    { label: t('nav', 'following'), to: '/following' },
    { label: t('nav', 'brands'), to: '/brands' },
  ]

  // Active surface: persistent orange underline + full-white label.
  const desktopLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-colors duration-200 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-[#ec5800] after:transition-all after:duration-300 ${
      isActive
        ? 'text-strong after:w-full'
        : 'text-muted hover:text-strong after:w-0 hover:after:w-full'
    }`
  const mobileLinkClass = ({ isActive }) =>
    `relative text-sm font-medium py-2.5 px-3 rounded-lg transition-all duration-200 after:absolute after:bottom-0 after:left-3 after:h-[2px] after:bg-[#ec5800] after:transition-all after:duration-300 ${
      isActive
        ? 'text-strong bg-raised after:w-[calc(100%-24px)]'
        : 'text-muted hover:text-strong hover:bg-raised after:w-0 hover:after:w-[calc(100%-24px)]'
    }`

  return (
    <>
      {/* Glass bar: blur + soft shadow instead of a hard outline */}
      <nav className="w-full sticky top-0 z-30 border-b border-transparent bg-surface/85 shadow-nav backdrop-blur-md supports-[backdrop-filter]:bg-surface/70">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">

          {/* Logo — home is the Discover feed under the new IA */}
          <Link to="/" className="text-strong text-xl font-bold tracking-wide hover:text-strong transition-colors">
            Àgbáyémáarà
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, to, end }) => (
              <NavLink
                key={label}
                to={to}
                end={end}
                className={desktopLinkClass}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <ThemeToggle />

            <LanguageSwitcher
              buttonClassName="flex items-center gap-1 rounded-lg bg-raised px-2.5 py-2 text-sm text-muted transition-colors hover:bg-raised-strong hover:text-strong"
              dropdownWidth="w-32"
            />

            {/* Orders */}
            <Link
              to="/orders"
              className="hidden sm:block p-2.5 text-muted hover:text-strong hover:bg-raised-strong rounded-lg transition-all duration-200"
              aria-label={t('orders', 'navAriaLabel')}
            >
              <Package size={20} />
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-muted hover:text-strong hover:bg-raised-strong rounded-lg transition-all duration-200"
              aria-label={t('auth', 'openCart')}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none ring-2 ring-surface">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Profile - hidden on mobile, shown in the mobile menu below */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="hidden md:block p-2.5 text-muted hover:text-strong hover:bg-raised-strong rounded-lg transition-all duration-200"
              aria-label={t('auth', 'signInAction')}
            >
              <User size={20} />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-muted hover:text-strong hover:bg-raised-strong rounded-lg transition-all duration-200 ml-1"
              aria-label={t('auth', 'toggleMenu')}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-line ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-5 py-3 flex flex-col gap-1">
            {navLinks.map(({ label, to, end }) => (
              <NavLink
                key={label}
                to={to}
                end={end}
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass}
              >
                {label}
              </NavLink>
            ))}
            <div className="px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted mb-2">{t('nav', 'language')}</p>
              <div className="flex flex-wrap gap-2">
                {languages.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLanguage(item.code)
                      setMobileMenuOpen(false)
                    }}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${language === item.code ? 'bg-on-accent text-surface' : 'bg-raised-strong text-muted hover:bg-raised-strong hover:text-strong'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted hover:text-strong text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-raised transition-all duration-200 text-left flex items-center gap-2"
            >
              <Package size={15} />
              {t('orders', 'navLink')}
            </Link>
            <button
              onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false) }}
              className="text-muted hover:text-strong text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-raised transition-all duration-200 text-left flex items-center gap-2"
            >
              <User size={15} />
              {t('nav', 'signIn')}
            </button>
          </div>
        </div>
      </nav>

      {/* Auth modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}

export default ShopNavbar