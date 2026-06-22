import React from 'react'
import { X } from 'lucide-react'
import { useCart } from '../Context/CartContext'

const ProductModal = ({ product, onClose }) => {
  const { addToCart } = useCart()

  if (!product) return null

  const handleAddToCart = () => {
    addToCart(product)
  }

  return (
    // Backdrop â€” clicking outside the modal closes it
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()} // don't close when clicking inside the modal
        className="bg-[#0A0B0F] text-white rounded-lg max-w-lg w-full relative p-6 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-white hover:text-gray-400 transition-colors duration-200"
        >
          <X size={24} />
        </button>

        <img
          src={product.productImage}
          alt={product.productName}
          className="w-full h-64 object-cover rounded-md mb-5"
        />

        <h2 className="text-2xl font-bold mb-2">{product.productName}</h2>
        <p className="text-xl text-gray-300 mb-4">${product.productPrice.toFixed(2)}</p>

        {product.productDescription && (
          <p className="text-gray-400 mb-6">{product.productDescription}</p>
        )}

        <button
          onClick={handleAddToCart}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 w-full"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default ProductModal