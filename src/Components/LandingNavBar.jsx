import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useLanguage } from '../Context/LanguageContext'

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const { t, language, setLanguage, languages } = useLanguage()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setLanguageMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-[#0A0B0F] text-white font-bold lg:fixed w-full z-50">
      <div className="flex justify-between items-center px-6 py-4 ">
        <div className="text-xl font-semibold">
          <p>Agbayemaara</p>
        </div>

        <div className="hidden md:flex gap-16 mr-9 items-center">
          <Link to="/" className="hover:text-gray-400 transition-colors duration-300">
            {t('landingNav', 'home')}
          </Link>

          <a href="#about" className="hover:text-gray-400 transition-colors duration-300">
            {t('landingNav', 'about')}
          </a>

          <a href="#contact" className="hover:text-gray-400 transition-colors duration-300">
            {t('landingNav', 'contact')}
          </a>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setLanguageMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:text-white"
            >
              <span>{languages.find((item) => item.code === language)?.label ?? 'English'}</span>
              <ChevronDown size={16} />
            </button>
            {languageMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-white/10 bg-[#12141A] p-2 shadow-xl">
                {languages.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLanguage(item.code)
                      setLanguageMenuOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${language === item.code ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-60 py-4' : 'max-h-0'}`}>
        <div className="flex flex-col items-center gap-4">
          <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-gray-400">
            {t('landingNav', 'home')}
          </Link>

          <a href="#about" onClick={() => setIsOpen(false)} className="hover:text-gray-400">
            {t('landingNav', 'about')}
          </a>

          <a href="#contact" onClick={() => setIsOpen(false)} className="hover:text-gray-400">
            {t('landingNav', 'contact')}
          </a>
        </div>
      </div>
    </nav>
  )
}

export default NavBar