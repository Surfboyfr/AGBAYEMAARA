import React, { useState } from 'react'
import { useCart } from '../Context/CartContext'
import { ShoppingBag, Check } from 'lucide-react'

const ProductCard = ({ id, productName, productPrice, productImage, brand }) => {
  const { addToCart, setIsCartOpen } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addToCart({
      id: id || productName,
      name: productName,
      price: productPrice,
      image: productImage,
      brand,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="group relative border border-gray-100 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={productImage}
          alt={productName}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Info */}
      <div className="p-4">
        {brand && <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">{brand}</p>}
        <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">{productName}</h3>
        <p className="text-gray-800 font-bold mb-3">${productPrice.toFixed(2)}</p>

        <button
          onClick={handleAddToCart}
          className={`w-full mt-5 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
            added
              ? 'bg-green-600 text-white'
              : 'bg-[#0A0B0F] text-white hover:bg-gray-800'
          }`}
        >
          {added ? (
            <>
              <Check size={15} />
              Added
            </>
          ) : (
            <>
              <ShoppingBag size={15} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
