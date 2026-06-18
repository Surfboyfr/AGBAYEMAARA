import { useCart } from '../Context/CartContext'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

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

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-105 bg-[#0A0B0F] border-l border-white/10 z-50 flex flex-col transition-transform duration-400 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */} 
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-white" />
            <h2 className="text-white text-lg font-bold tracking-wide">Your Cart</h2>
            {cartItems.length > 0 && (
              <span className="bg-red-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-white/60 hover:text-white transition-colors duration-200 p-1 rounded-md hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} className="text-white/20" />
              <p className="text-white/40 text-sm">Your cart is empty</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-white text-sm underline underline-offset-4 hover:text-white/70 transition-colors"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div
                key={item.id}
                className="flex gap-4 bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors"
              >
                {/* Product image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-white/10">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-white/30 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-white/50 text-xs mt-0.5">{item.brand || 'Agbayemaara'}</p>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-white text-xs font-semibold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <p className="text-white text-sm font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-white/10 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Subtotal</span>
              <span className="text-white font-bold text-lg">${cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-white/30 text-xs">Shipping and taxes calculated at checkout</p>

            <button className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-white/90 transition-colors duration-200 text-sm tracking-wide">
              Checkout
            </button>

            <button
              onClick={clearCart}
              className="w-full text-white/40 text-xs hover:text-white/70 transition-colors py-1"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer