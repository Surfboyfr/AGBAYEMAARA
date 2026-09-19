import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ShoppingBag, User } from 'lucide-react'
import { useCart } from '../Context/CartContext'
import { useLanguage } from '../Context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import AuthModal from './AuthModal'

// Marketing/about surface navbar. Primary links follow the seven-surface IA
// (Discover, Following, Brands + Cart / Sign in); the in-page About/Contact
// anchors are demoted to a quieter secondary position on the right.
const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { cartCount, setIsCartOpen } = useCart()
  const { t } = useLanguage()

  // Seven-surface primary set — replaces the old Home/About/Contact trio.
  const navLinks = [
    { label: t('nav', 'discover'), to: '/', end: true },
    { label: t('nav', 'following'), to: '/following' },
    { label: t('nav', 'brands'), to: '/brands' },
  ]

  // Active surface: persistent orange underline + full-strength label. Shared
  // by desktop and mobile menus.
  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:rounded-full after:bg-[#ec5800] after:shadow-[0_0_8px_rgba(236,88,0,0.45)] after:transition-all after:duration-300 ${
      isActive
        ? 'text-strong after:w-full'
        : 'text-muted hover:text-strong after:w-0 hover:after:w-full'
    }`

  // Demoted secondary anchors (in-page sections of the about surface).
  const secondaryLinks = [
    { label: t('landingNav', 'about'), href: '#about' },
    { label: t('landingNav', 'contact'), href: '#contact' },
  ]

  return (
    <>
      {/* Glass bar: blur + soft shadow instead of a hard outline */}
      <nav className='w-full bg-surface/85 font-bold shadow-nav backdrop-blur-md supports-[backdrop-filter]:bg-surface/70 lg:fixed z-50 text-strong'>
        <div className='flex justify-between items-center px-6 py-4'>
          <div className='text-2xl lg:pl-5 font-bold tracking-wide'>
            <Link to='/'>Àgbáyémáarà</Link>
          </div>

          <div className='hidden md:flex gap-8 mr-9 items-center'>
            {navLinks.map(({ label, to, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                {label}
              </NavLink>
            ))}

            <ThemeToggle className='text-strong' />

            <LanguageSwitcher
              buttonClassName='flex items-center gap-1 rounded-full bg-raised px-3 py-1.5 text-sm text-muted transition-colors hover:bg-raised-strong hover:text-strong'
            />

            {/* Cart — opens the app-wide drawer */}
            <button
              onClick={() => setIsCartOpen(true)}
              className='relative p-2 text-muted transition-all duration-200 hover:bg-raised hover:text-strong active:scale-95 rounded-full'
              aria-label={t('auth', 'openCart')}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className='absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold leading-none text-white ring-2 ring-surface'>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setAuthOpen(true)}
              className='rounded-full bg-strong px-4 py-1.5 text-sm font-bold tracking-wide text-surface transition-all duration-200 hover:bg-strong/90 active:scale-95'
            >
              {t('auth', 'signInAction')}
            </button>

            {/* Demoted About/Contact anchors — quieter text on the right */}
            {secondaryLinks.map(({ label, href }) => (
              <a key={href} href={href} className='text-sm font-medium text-faint transition-colors hover:text-muted'>
                {label}
              </a>
            ))}
          </div>

          <button className='md:hidden p-2 text-muted hover:text-strong transition-colors' onClick={() => setIsOpen(!isOpen)} aria-label={t('auth', 'toggleMenu')}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 py-4' : 'max-h-0'}`}>
          <div className='flex flex-col items-center gap-4'>
            {navLinks.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setIsOpen(false)}
                className={navLinkClass}
              >
                {label}
              </NavLink>
            ))}

            <div className='flex items-center gap-4'>
              <button
                onClick={() => { setIsCartOpen(true); setIsOpen(false) }}
                className='relative p-2 text-muted transition-colors hover:text-strong'
                aria-label={t('auth', 'openCart')}
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className='absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold leading-none text-white ring-2 ring-surface'>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setAuthOpen(true); setIsOpen(false) }}
                className='flex items-center gap-2 rounded-full bg-strong px-4 py-1.5 text-sm font-bold text-surface'
              >
                <User size={15} />
                {t('nav', 'signIn')}
              </button>
              <ThemeToggle className='text-strong' />

              <LanguageSwitcher
                buttonClassName='flex items-center gap-1 rounded-full bg-raised px-3 py-1.5 text-sm text-muted transition-colors hover:bg-raised-strong hover:text-strong'
              />
            </div>

            <div className='flex items-center gap-6 pt-2'>
              {secondaryLinks.map(({ label, href }) => (
                <a key={href} href={href} onClick={() => setIsOpen(false)} className='text-sm font-medium text-faint transition-colors hover:text-muted'>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}

export default NavBar
