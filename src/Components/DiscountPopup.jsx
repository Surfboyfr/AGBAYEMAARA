import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Timer } from 'lucide-react'
import { products } from '../data/products'
import { useLanguage } from '../Context/LanguageContext'

const DISCOUNT_PERCENT = 25

// Pick a curated set of products for the discount popup
const discountItems = products
  .filter((p) => p.id <= 5 || p.id === 14 || p.id === 20 || p.id === 38)
  .slice(0, 6)

const DiscountPopup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasBeenShown, setHasBeenShown] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    // Show popup once when the component mounts, with a short delay
    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        setHasBeenShown(true)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [hasBeenShown])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const currentItem = discountItems[currentIndex]
  const discountedPrice = currentItem
    ? (currentItem.productPrice * (1 - DISCOUNT_PERCENT / 100)).toFixed(2)
    : '0.00'

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % discountItems.length)
  }

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + discountItems.length) % discountItems.length)
  }

  const close = () => setIsOpen(false)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 transition-all duration-300"
      onClick={close}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Popup card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0D0E14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-pop-in"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-linear-to-r from-[#ec5800] via-[#f5873a] to-[#ec5800]" />

        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-all duration-200"
          aria-label="Close discount popup"
        >
          <X size={18} />
        </button>

        {/* Badge */}
        <div className="absolute -left-8 -top-2 z-10 rotate-[-35deg]">
          <div className="bg-[#ec5800] text-white text-sm font-extrabold px-10 py-1.5 shadow-lg">
            -{DISCOUNT_PERCENT}%
          </div>
        </div>

        <div className="px-6 pt-10 pb-6 sm:px-8 sm:pt-12 sm:pb-8">
          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {t('discountPopup', 'heading')}
            </h2>
            <p className="text-white/50 text-sm mt-1.5">
              {t('discountPopup', 'subheading')}
            </p>
          </div>

          {/* Product card */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-5">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Product image */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-zinc-800">
                <img
                  src={currentItem?.productImage}
                  alt={currentItem?.productName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-1 left-1 bg-[#ec5800] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  -{DISCOUNT_PERCENT}%
                </div>
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-1">
                  {currentItem?.brand}
                </p>
                <h3 className="text-white font-semibold text-base sm:text-lg truncate">
                  {currentItem?.productName}
                </h3>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-white font-bold text-xl sm:text-2xl">
                    ${discountedPrice}
                  </span>
                  <span className="text-white/30 line-through text-sm">
                    ${currentItem?.productPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#ec5800] font-semibold">
                  <Timer size={12} />
                  <span>{t('discountPopup', 'limitedOffer')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation dots + arrows */}
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={goPrev}
              className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-all duration-200"
              aria-label="Previous product"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1.5">
              {discountItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-6 h-2 bg-[#ec5800]'
                      : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to product ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-all duration-200"
              aria-label="Next product"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* CTA button */}
          <button
            onClick={close}
            className="mt-6 w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 text-sm tracking-wide"
          >
            {t('discountPopup', 'cta')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DiscountPopup
