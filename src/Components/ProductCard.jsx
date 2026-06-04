import React from 'react'

const ProductCard = ({productName, productPrice, productImage}) => {
  return (
    <div className="border rounded-lg p-4">
            <img src={productImage} alt={productName} className="w-full h-48 object-cover mb-4" />
            <h3 className="text-lg font-semibold mb-2">{productName}</h3>
            <p className="text-gray-600 mb-4">${productPrice.toFixed(2)}</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add to Cart</button>
          </div>
  )
}

export default ProductCard