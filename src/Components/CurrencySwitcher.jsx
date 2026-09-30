import { useState, useRef } from 'react'
import { Banknote, Check, ChevronDown } from 'lucide-react'
import { useCurrency } from '../Context/CurrencyContext'
import { useClickOutside } from '../hooks/useClickOutside'

// Currency selector for the navbars — mirrors LanguageSwitcher's dropdown
// pattern. Selection flows through CurrencyProvider, which persists to
// localStorage and re-prices every display site site-wide.
const CurrencySwitcher = ({ buttonClassName, dropdownWidth = 'w-44' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const { currency, setCurrency, currencies } = useCurrency()

  useClickOutside(menuRef, () => setIsOpen(false))

  return (
    <div className='relative' ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={buttonClassName}
        aria-label='Change currency'
        aria-expanded={isOpen}
      >
        <Banknote size={16} />
        {/* Code only on small screens to keep the trigger compact */}
        <span className='hidden md:inline'>{currency}</span>
        <ChevronDown size={16} />
      </button>
      {isOpen && (
        <div className={`absolute right-0 mt-2 ${dropdownWidth} rounded-xl border border-line bg-surface-alt p-2 shadow-card`}>
          {currencies.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                setCurrency(item.code)
                setIsOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                currency === item.code
                  ? 'bg-raised-strong text-strong'
                  : 'text-muted hover:bg-raised hover:text-strong'
              }`}
            >
              <span className='flex items-center gap-2'>
                <span className='w-4 text-center font-semibold'>{item.symbol}</span>
                <span>{item.code}</span>
                <span className='hidden lg:inline text-xs text-faint'>{item.label}</span>
              </span>
              {currency === item.code && <Check size={16} className='text-[#ec5800]' />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CurrencySwitcher
