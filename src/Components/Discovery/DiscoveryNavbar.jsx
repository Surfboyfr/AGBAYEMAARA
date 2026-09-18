import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
import { useLanguage } from '../../Context/LanguageContext'
import LanguageSwitcher from '../LanguageSwitcher'
import AuthModal from '../AuthModal'

// Shared discovery-area navbar (per the hi-fi mock: logo + links + SIGN IN).
// Used by the Discovery Feed and the Following Feed pages.
const DiscoveryNavbar = () => {
  const { t } = useLanguage()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-30 w-full border-b border-white/5 bg-[#0A0B0F]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link
            to="/"
            className="text-xl font-bold tracking-wide text-white transition-colors hover:text-white/80"
          >
            Àgbáyémáarà
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/brands"
              className="relative text-sm font-medium text-white/60 transition-colors hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full"
            >
              {t('nav', 'brands')}
            </Link>
            <Link
              to="/shop"
              className="relative text-sm font-medium text-white/60 transition-colors hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full"
            >
              {t('nav', 'shop')}
            </Link>
            <Link
              to="/following"
              className="relative text-sm font-medium text-white/60 transition-colors hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full"
            >
              {t('followingPage', 'navLink')}
            </Link>
            <Link
              to="/about"
              className="relative text-sm font-medium text-white/60 transition-colors hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full"
            >
              {t('landingNav', 'about')}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher
              buttonClassName="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-white/70 hover:text-white"
              dropdownWidth="w-32"
            />
            <button
              onClick={() => setAuthOpen(true)}
              className="hidden rounded-full bg-white px-5 py-2 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:bg-white/85 active:scale-95 md:block"
            >
              {t('auth', 'signInAction')}
            </button>
            <button
              onClick={() => setAuthOpen(true)}
              className="rounded-lg p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white md:hidden"
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
