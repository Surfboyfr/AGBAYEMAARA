import { useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '../Context/LanguageContext'
import { useClickOutside } from '../hooks/useClickOutside'

const LanguageSwitcher = ({ buttonClassName, dropdownWidth = 'w-36' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const { language, setLanguage, languages } = useLanguage()

  useClickOutside(menuRef, () => setIsOpen(false))

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={buttonClassName}
      >
        <span className="hidden md:inline">{languages.find((item) => item.code === language)?.label ?? 'English'}</span>
        <span className="md:hidden uppercase">{language.toUpperCase()}</span>
        <ChevronDown size={16} />
      </button>
      {isOpen && (
        <div className={`absolute right-0 mt-2 ${dropdownWidth} rounded-xl border border-line bg-surface-alt p-2 shadow-card`}>
          {languages.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                setLanguage(item.code)
                setIsOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                language === item.code
                  ? 'bg-raised-strong text-strong'
                  : 'text-muted hover:bg-raised hover:text-strong'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
