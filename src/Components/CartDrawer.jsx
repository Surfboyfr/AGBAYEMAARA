import { useEffect } from 'react'
import { useCart } from '../Context/CartContext'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useLanguage } from '../Context/LanguageContext'

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
  } = useCart()
  const { t } = useLanguage()

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false)
    }
    if (isCartOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isCartOpen, setIsCartOpen])

  return (
    <>
      {/* Full-page overlay */}
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-[#0A0B0F] transition-all duration-300 ease-in-out ${
          isCartOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Header */} 
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-white" />
            <h2 className="text-white text-lg font-bold tracking-wide">{t('cart', 'title')}</h2>
            {cartItems.length > 0 && (
              <span className="bg-red-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-white/60 hover:text-white transition-colors duration-200 p-2 rounded-md hover:bg-white/10"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        {/* Items - centered on page */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
                <div className="rounded-full bg-white/5 p-6">
                  <ShoppingBag size={56} className="text-white/20" />
                </div>
                <p className="text-white/40 text-base">{t('cart', 'empty')}</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-white text-sm underline underline-offset-4 hover:text-white/70 transition-colors"
                >
                  {t('cart', 'continueShopping')}
                </button>
              </div>
            ) : (
              cartItems.map(item => (
                <div
                  key={item.id}
                  className="flex gap-5 bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/15 transition-all duration-200 hover:bg-white/[0.07]"
                >
                  {/* Product image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-white/10">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-white text-base font-semibold truncate">{item.name}</p>
                        <p className="text-white/50 text-xs mt-0.5">{item.brand || t('cart', 'brandFallback')}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-white/30 hover:text-red-400 transition-colors shrink-0 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg px-3 py-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-white text-sm font-semibold w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className="text-white text-base font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-white/10 px-6 py-6">
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">{t('cart', 'subtotal')}</span>
                <span className="text-white font-bold text-xl">${cartTotal.toFixed(2)}</span>
              </div>
              <p className="text-white/30 text-xs">{t('cart', 'shipping')}</p>

              <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-colors duration-200 text-sm tracking-wide">
                {t('cart', 'checkout')}
              </button>

              <div className="flex items-center justify-between">
                <button
                  onClick={clearCart}
                  className="text-white/40 text-xs hover:text-white/70 transition-colors py-1"
                >
                  {t('cart', 'clearCart')}
                </button>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-white/40 text-xs hover:text-white/70 transition-colors py-1 underline underline-offset-2"
                >
                  {t('cart', 'continueShopping')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer