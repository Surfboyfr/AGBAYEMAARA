import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useLanguage } from '../Context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <nav className="bg-[#0A0B0F] text-white font-bold lg:fixed w-full z-50">
      <div className="flex justify-between items-center px-6 py-4 ">
        <div className="text-2xl lg:pl-5 font-bold tracking-wide">
          <p>Àgbáyémáarà</p>
        </div>

        <div className="hidden md:flex gap-16 mr-9 items-center">
          <Link to="/" className="relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full hover:text-gray-400">
            {t('landingNav', 'home')}
          </Link>

          <a href="#about" className="relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full hover:text-gray-400">
            {t('landingNav', 'about')}
          </a>

          <a href="#contact" className="relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full hover:text-gray-400">
            {t('landingNav', 'contact')}
          </a>

          <LanguageSwitcher
            buttonClassName="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:text-white"
          />
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-60 py-4' : 'max-h-0'}`}>
        <div className="flex flex-col items-center gap-4">
          <Link to="/" onClick={() => setIsOpen(false)} className="relative hover:text-gray-400 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full">
            {t('landingNav', 'home')}
          </Link>

          <a href="#about" onClick={() => setIsOpen(false)} className="relative hover:text-gray-400 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full">
            {t('landingNav', 'about')}
          </a>

          <a href="#contact" onClick={() => setIsOpen(false)} className="relative hover:text-gray-400 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full">
            {t('landingNav', 'contact')}
          </a>
        </div>
      </div>
    </nav>
  )
}

export default NavBar