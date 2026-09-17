import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '../Context/CartContext'
import { useLanguage } from '../Context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
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

  const navLinks = [
    { label: t('nav', 'shop'), to: '/shop' },
    { label: t('nav', 'home'), to: '/' },
    { label: t('nav', 'brands'), to: '/brands' },
  ]

  return (
    <>
      <nav className="bg-[#0A0B0F] w-full sticky top-0 z-30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/shop" className="text-white text-xl font-bold tracking-wide hover:text-white/80 transition-colors">
            Àgbáyémáarà
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="relative text-white/60 hover:text-white text-sm font-medium transition-colors duration-200 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <LanguageSwitcher
              buttonClassName="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-white/70 hover:text-white"
              dropdownWidth="w-32"
            />

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              aria-label={t('auth', 'openCart')}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Profile - hidden on mobile, shown in the mobile menu below */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="hidden md:block p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              aria-label={t('auth', 'signInAction')}
            >
              <User size={20} />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 ml-1"
              aria-label={t('auth', 'toggleMenu')}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-white/5 ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-5 py-3 flex flex-col gap-1">
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="relative text-white/60 hover:text-white text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5 transition-all duration-200 after:absolute after:bottom-0 after:left-3 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-[calc(100%-24px)]"
              >
                {label}
              </Link>
            ))}
            <div className="px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-2">{t('nav', 'language')}</p>
              <div className="flex flex-wrap gap-2">
                {languages.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLanguage(item.code)
                      setMobileMenuOpen(false)
                    }}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${language === item.code ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false) }}
              className="text-white/60 hover:text-white text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5 transition-all duration-200 text-left flex items-center gap-2"
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